package server

import "github.com/labstack/echo/v4"

func (s *Server) MapHandlers(e *echo.Echo) error {
	v1 := e.Group("api/v1")
	draft := v1.Group("/draft")

	return nil
}
