package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	sdklambda "github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/jackc/pgx/v4"
	"github.com/tdewolff/minify"
	"github.com/tdewolff/minify/html"
)

var (
	logger *slog.Logger
)

func init() {
	logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	os.Setenv("HOME", "/tmp")
}

type InputEvent struct {
	ScrapeURL string `json:"scrapeURL"`
}

func invokeLambda(ctx context.Context, client *sdklambda.Client, functionName string, payload []byte) (*sdklambda.InvokeOutput, error) {
	input := &sdklambda.InvokeInput{
		FunctionName:   aws.String(functionName),
		Payload:        payload,
		InvocationType: "Event",
	}

	// Invoke the Lambda function
	output, err := client.Invoke(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("error invoking Lambda: %w", err)
	}

	// Check for function errors
	if output.FunctionError != nil {
		log.Printf("Function Error: %s\n", *output.FunctionError)
	}

	return output, nil
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

func handleRequest(ctx context.Context, event InputEvent) error {
	// Get HTML from scraper api
	apiURL := os.Getenv("SCRAPERAPI_URL")
	params := url.Values{}
	params.Add("api_key", os.Getenv("SCRAPERAPI_KEY"))
	params.Add("url", event.ScrapeURL)
	params.Add("render", "true")
	params.Add("device_type", "desktop")

	reqURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	res, err := http.Get(reqURL)
	if err != nil {
		logger.Error("Failed to get URL: " + err.Error())
		return err
	}
	defer res.Body.Close()

	scrapeHTML, err := io.ReadAll(res.Body)
	if err != nil {
		logger.Error("Failed to read response body: " + err.Error())
		return err
	}

	// minified HTML
	m := minify.New()
	m.AddFunc("text/html", html.Minify)

	minified, err := m.Bytes("text/html", scrapeHTML)
	if err != nil {
		logger.Error("Failed to minify HTML: " + err.Error())
		return err
	}

	encodedMinifiedHTML := base64.StdEncoding.EncodeToString(minified)

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		logger.Error("Unable to load SDK config, " + err.Error())
		return err
	}

	lambdaClient := sdklambda.NewFromConfig(cfg)
	functionName := "auto-gen-press-release"
	payload := fmt.Sprintf(`{"site_url": "%s", "user_id": "%s", "html_base64": "%s"}`, event.ScrapeURL, os.Getenv("USER_ID"), encodedMinifiedHTML)

	_, err = invokeLambda(ctx, lambdaClient, functionName, []byte(payload))
	if err != nil {
		logger.Info("error occured when invoking lambda: " + err.Error())
		return err
	}
	return nil

}

func main() {
	lambda.Start(handleRequest)
}
