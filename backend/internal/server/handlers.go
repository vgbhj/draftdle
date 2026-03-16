package server

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/vgbhj/draftdle/internal/draft/repository"
	"github.com/vgbhj/draftdle/internal/draft/usecase"

	draftHttp "github.com/vgbhj/draftdle/internal/draft/delivery/http"
)

func (s *Server) MapHandlers(e *echo.Echo) error {
	v1 := e.Group("api/v1")
	draft := v1.Group("/draft")

	draftRepo := repository.NewDraftReposiroty(s.db)

	draftUC := usecase.NewDraftUseCase(draftRepo)

	draftHandler := draftHttp.NewDraftHandler(draftUC)

	draftHttp.MapRoutes(draft, draftHandler)

    e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
        Root:   "frontend/dist", 
        Index:  "index.html",
        HTML5:  true,           
        Browse: false,
    }))

	return nil
}