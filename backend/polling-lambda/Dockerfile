# Stage 1: Modules caching
FROM golang:1.23.4 as modules
# Copy dependencies list
COPY go.mod go.sum /modules/
WORKDIR /modules
RUN go mod download

# Stage 2: Build
FROM golang:1.23.4 as builder
COPY . /workdir
COPY --from=modules /go/pkg /go/pkg 
COPY . .
# Build your app
RUN GOOS=linux GOARCH=arm64 go build -o /bin/app

# Stage 3: Final
FROM debian:bookworm
COPY --from=builder /bin/app /
RUN apt-get update && apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*
ENTRYPOINT [ "/app" ]
