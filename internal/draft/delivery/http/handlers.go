package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vgbhj/draftdle/internal/draft"
)

type DraftHandler struct {
	draftUC draft.DraftUC
}

func NewDraftHandler(uc draft.DraftUC) draft.Handler {
	return &DraftHandler{
		draftUC: uc,
	}
}

func (d *DraftHandler) Get() echo.HandlerFunc {
	return func(c echo.Context) error {
		draft, err := d.draftUC.GetRandomDraft()
		if err != nil {

			return c.JSON(http.StatusInternalServerError, struct {
				Message string `json:"message"`
				Status  int    `json:"status"`
			}{
				Message: "Cant get draft",
				Status:  http.StatusInternalServerError,
			})
		}

		return c.JSON(http.StatusOK, draft)
	}
}
