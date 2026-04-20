# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend . 
RUN npm run build

# Stage 2: Build backend
FROM golang:1.25-alpine AS backend-builder
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend . 
RUN CGO_ENABLED=1 GOOS=linux go build -o backend ./cmd/api/main.go

# Stage 3: Production image
FROM alpine:latest
RUN apk --no-cache add ca-certificates libc6-compat sqlite-libs
WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /app/backend/backend .

# Copy frontend dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8080
CMD ["./backend"]