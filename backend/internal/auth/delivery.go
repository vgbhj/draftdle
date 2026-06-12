package auth

import "github.com/labstack/echo/v4"

type Handler interface {
	TelegramLogin() echo.HandlerFunc
	Logout() echo.HandlerFunc
	Me() echo.HandlerFunc
}
