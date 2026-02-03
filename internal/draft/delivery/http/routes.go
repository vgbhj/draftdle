package http

import (
	"github.com/labstack/echo/v4"
	"github.com/vgbhj/draftdle/internal/draft"
)

func MapRoutes(g *echo.Group, h draft.Handler) {
	g.GET("", h.Get())
}
