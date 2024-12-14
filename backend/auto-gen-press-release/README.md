# プレスリリース自動生成 Lambda関数

## デプロイ方法

### 1. Build

```sh
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
```

### 2. Zip化

```sh
zip function.zip bootstrap
```

### 3. function.zipをLambda関数にアップロード
