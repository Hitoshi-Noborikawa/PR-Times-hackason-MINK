package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/lambda"
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

func handler(event Event) (map[string]interface{}, error) {
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
