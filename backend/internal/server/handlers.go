package server

import (
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/vgbhj/draftdle/internal/draft/repository"
	"github.com/vgbhj/draftdle/internal/draft/usecase"
	"github.com/vgbhj/draftdle/pkg/parser"

	authHttp "github.com/vgbhj/draftdle/internal/auth/delivery/http"
	authRepository "github.com/vgbhj/draftdle/internal/auth/repository"
	authUsecase "github.com/vgbhj/draftdle/internal/auth/usecase"
	draftHttp "github.com/vgbhj/draftdle/internal/draft/delivery/http"
)

func (s *Server) MapHandlers(e *echo.Echo) error {
	v1 := e.Group("api/v1")
	draft := v1.Group("/draft")

	draftRepo := repository.NewDraftReposiroty(s.db)

	draftUC := usecase.NewDraftUseCase(draftRepo, parser.NewPlayerFetcher())

	draftHandler := draftHttp.NewDraftHandler(draftUC)

	draftHttp.MapRoutes(draft, draftHandler)

	auth := v1.Group("/auth")

	authRepo := authRepository.NewAuthRepository(s.db)

	authUC := authUsecase.NewAuthUseCase(authRepo, os.Getenv("TELEGRAM_BOT_TOKEN"))

	authHandler := authHttp.NewAuthHandler(authUC)

	authHttp.MapRoutes(auth, authHandler)

    e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
        Root:   staticRoot(),
        Index:  "index.html",
        HTML5:  true,           
        Browse: false,
    }))

	return nil
}

func staticRoot() string {
	if v := os.Getenv("STATIC_ROOT"); v != "" {
		return v
	}
	if _, err := os.Stat("frontend/dist"); err == nil {
		return "frontend/dist"
	}
	return "../frontend/dist"
}