package http

import (
	"log"
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

			log.Printf("Error getting draft: %v", err)

			return c.JSON(http.StatusInternalServerError, &ErrorResponse{
				Message: "Failed to get draft",
				Status:  http.StatusInternalServerError,
			})
		}

		return c.JSON(http.StatusOK, draft)
	}
}
