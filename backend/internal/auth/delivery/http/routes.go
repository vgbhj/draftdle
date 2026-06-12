package http

import (
	"github.com/labstack/echo/v4"
	"github.com/vgbhj/draftdle/internal/auth"
)

func MapRoutes(g *echo.Group, h auth.Handler) {
	g.POST("/telegram", h.TelegramLogin())
	g.POST("/logout", h.Logout())
	g.GET("/me", h.Me())
}
