package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

type Server struct {
	addr string
	echo *echo.Echo
	db   *sqlx.DB
}

func NewServer(addr string, db *sqlx.DB) *Server {
	return &Server{
		addr: addr,
		echo: echo.New(),
		db:   db,
	}
}

func (s *Server) Run() error {
	if err := s.MapHandlers(s.echo); err != nil {
		return err
	}

	server := &http.Server{
		Addr:    s.addr,
		Handler: s.echo,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT)

	go func() {
		if err := s.echo.StartServer(server); err != nil && err != http.ErrServerClosed {
			log.Printf("Server force closed: %v", err)
		}
	}()

	<-quit

	log.Println("Server is stopping...")

	ctx, shutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdown()

	return s.echo.Shutdown(ctx)
}
