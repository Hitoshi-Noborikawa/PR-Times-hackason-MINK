package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
	"github.com/jackc/pgx/v4"
)

type Event struct {
	HTMLBase64 string `json:"html_base64"`
	UserID string `json:"user_id"`
	SiteURL string `json:"site_url"`
}

type OpenAIResponse struct {
	Choices []struct{
		Message struct{
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func main() {
	lambda.Start(handler)
}

func handler(ctx context.Context, event Event) (map[string]interface{}, error) {
	decodedHTML, err := base64.StdEncoding.DecodeString(event.HTMLBase64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode HTML: %w", err)
	}

	// HTMLから記事タイトルと本文を抽出
	title, content, err := extractContent(string(decodedHTML))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}
	fmt.Printf("Title: %s\n", title)
	fmt.Printf("Content: %s\n", content)

	pressRelease, err := generatePressRelease(title, content)
	if err != nil {
		return nil, fmt.Errorf("failed to generate press release: %w", err)
	}

	conn, err := connectDB()
	defer conn.Close(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to connect DB: %w", err)
	}

	userID := event.UserID
	siteURL := event.SiteURL
	articleID, err := insertPressRelease(conn, title, pressRelease, userID, siteURL)
	if err != nil || articleID == 0 {
		return nil, fmt.Errorf("failed to insert press release: %w", err)
	}

	err = sendEmail(conn, ctx, userID, articleID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"press_release": pressRelease,
	}, nil
}

func extractContent(html string) (string, string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return "", "", err
	}

	// 記事タイトルを取得
	title := doc.Find("title").Text()
	if title == "" {
		title = doc.Find("h1").Text()
	}

	// 記事本文を取得
	content := doc.Find("article").Text()
	if content == "" {
		content = doc.Text() // フォールバックとしてページ全体のテキストを取得
	}

	return title, content, nil
}

func generatePressRelease(title, content string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY environment variable not set")
	}

	prompt := fmt.Sprintf(`
以下の記事を基に、簡潔で読みやすいプレスリリースをMarkdown形式で生成してください。

記事タイトル: %s
記事内容:
%s
`, title, content)

	requestBody, _ := json.Marshal(map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []map[string]string{
			{"role": "system", "content": "You are an expert press release writer."},
			{"role": "user", "content": prompt},
		},
	})

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenAI API error: %s", string(body))
	}

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return "", err
	}

	return openAIResp.Choices[0].Message.Content, nil
}

func connectDB() (*pgx.Conn, error) {
	// NOTE: DBのパスワードに # が含まれており、エスケープする必要があります
	connString := strings.ReplaceAll(os.Getenv("SUPABASE_DB_URL"), "#", "%23")
	if connString == "" {
		fmt.Println("Supabase connection URL not set")
	}

	conn, err := pgx.Connect(context.Background(), connString)
	if err != nil {
		fmt.Println("Unable to connect to database:", err)
		return nil, err
	}

	return conn, nil
}

func insertPressRelease(conn *pgx.Conn, title string, content string, userID string, siteURL string) (int, error) {
	var articleID int
	err := conn.QueryRow(
			context.Background(),
			`INSERT INTO public."Articles" (title, content, user_id, source, approved) VALUES ($1, $2, $3, $4, false) RETURNING id`,
			title, content, userID, siteURL,
	).Scan(&articleID)
	if err != nil {
		fmt.Println("Error inserting data:", err)
		return 0, err
	}

	fmt.Println("Data inserted successfully!!!!")
	return articleID, nil
}

func sendEmail(conn *pgx.Conn, ctx context.Context, userID string, articleID int) error {
	rows, err := conn.Query(context.Background(), "SELECT notification_email FROM public.\"Jobs\" WHERE user_id = $1;", userID)
	if err != nil {
		return fmt.Errorf("failed to select email: %w", err)
	}
	defer rows.Close()
	var emails []string
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			fmt.Printf("failed to scan row: %v", err)
			continue
		}
		emails = append(emails, email)
	}

	for _, email := range emails {
		fmt.Printf("Notification Email: %s\n", email)
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return fmt.Errorf("failed to load AWS config: %w", err)
	}
	sesClient := ses.NewFromConfig(cfg)
	url := fmt.Sprintf("%s/article/%d", os.Getenv("APP_URL"), articleID)
	sender := os.Getenv("SES_SENDER")
	subject := "プレスリリースの自動生成が完了しました"
	body := fmt.Sprintf(`
プレスリリースの自動生成が完了しました。
以下のURLからご確認ください。
%s
`, url)
	input := &ses.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: emails,
		},
		Message: &types.Message{
			Body: &types.Body{
				Text: &types.Content{
					Charset: aws.String("UTF-8"),
					Data: aws.String(body),
				},
			},
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data: aws.String(subject),
			},
		},
		Source: aws.String(sender),
	}
	_, err = sesClient.SendEmail(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}