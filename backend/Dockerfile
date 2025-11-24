FROM golang:1.22-alpine AS builder
WORKDIR /app

# зависимости
COPY ./go.mod ./go.sum ./
RUN go mod download

# код
COPY . .

# сборка бинаря
RUN CGO_ENABLED=0 GOOS=linux go build -o cookplan-api ./cmd/api

# установка goose
ENV GOBIN=/app/bin
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# финальный образ
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# копируем бинарь приложения
COPY --from=builder /app/cookplan-api .
# копируем goose
COPY --from=builder /app/bin/goose /usr/local/bin/goose
# миграции
COPY migrations ./migrations

EXPOSE 8080
CMD ["/cookplan-api"]  # переопределяется в docker-compose