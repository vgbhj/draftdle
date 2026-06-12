package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vgbhj/draftdle/internal/auth"
)

// UserContextKey is where RequireAuth stores the *models.User in echo.Context.
const UserContextKey = "user"

// RequireAuth protects a route group: it resolves the session cookie into a
// user and rejects the request with 401 otherwise.
func RequireAuth(uc auth.AuthUC) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cookie, err := c.Cookie(SessionCookieName)
			if err != nil || cookie.Value == "" {
				return c.JSON(http.StatusUnauthorized, &ErrorResponse{
					Message: "Not authenticated",
					Status:  http.StatusUnauthorized,
				})
			}

			user, err := uc.Me(cookie.Value)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, &ErrorResponse{
					Message: "Not authenticated",
					Status:  http.StatusUnauthorized,
				})
			}

			c.Set(UserContextKey, user)
			return next(c)
		}
	}
}
