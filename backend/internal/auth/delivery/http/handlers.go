package http

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vgbhj/draftdle/internal/auth"
)

const SessionCookieName = "draftdle_session"

type AuthHandler struct {
	authUC auth.AuthUC
}

func NewAuthHandler(uc auth.AuthUC) auth.Handler {
	return &AuthHandler{
		authUC: uc,
	}
}

func (h *AuthHandler) TelegramLogin() echo.HandlerFunc {
	return func(c echo.Context) error {
		var data auth.TelegramAuthData
		if err := c.Bind(&data); err != nil {
			return c.JSON(http.StatusBadRequest, &ErrorResponse{
				Message: "Invalid request body",
				Status:  http.StatusBadRequest,
			})
		}

		user, session, err := h.authUC.LoginTelegram(data)
		if err != nil {
			log.Printf("TelegramLogin: %v", err)
			return c.JSON(http.StatusUnauthorized, &ErrorResponse{
				Message: "Telegram authorization failed",
				Status:  http.StatusUnauthorized,
			})
		}

		c.SetCookie(&http.Cookie{
			Name:     SessionCookieName,
			Value:    session.Token,
			Path:     "/",
			Expires:  session.ExpiresAt,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Secure:   c.Scheme() == "https",
		})

		return c.JSON(http.StatusOK, user)
	}
}

func (h *AuthHandler) Logout() echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(SessionCookieName)
		if err == nil && cookie.Value != "" {
			if err := h.authUC.Logout(cookie.Value); err != nil {
				log.Printf("Logout: %v", err)
			}
		}

		c.SetCookie(&http.Cookie{
			Name:     SessionCookieName,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})

		return c.NoContent(http.StatusNoContent)
	}
}

func (h *AuthHandler) Me() echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(SessionCookieName)
		if err != nil || cookie.Value == "" {
			return c.JSON(http.StatusUnauthorized, &ErrorResponse{
				Message: "Not authenticated",
				Status:  http.StatusUnauthorized,
			})
		}

		user, err := h.authUC.Me(cookie.Value)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, &ErrorResponse{
				Message: "Not authenticated",
				Status:  http.StatusUnauthorized,
			})
		}

		return c.JSON(http.StatusOK, user)
	}
}
