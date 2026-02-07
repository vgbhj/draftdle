FROM golang:1.25.6-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev sqlite-dev

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o api ./cmd/api

FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates sqlite-libs

COPY --from=builder /app/api .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./api"]