package draft

import "github.com/labstack/echo/v4"

type Handler interface {
	Get() echo.HandlerFunc
	GetDaily() echo.HandlerFunc
}
