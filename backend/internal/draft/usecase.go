package draft

import "github.com/vgbhj/draftdle/internal/models"

type DraftUC interface {
	GetRandomDraft() ([]*models.Draft, error)
}
