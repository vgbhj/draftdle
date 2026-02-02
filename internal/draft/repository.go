package draft

import "github.com/vgbhj/draftdle/internal/models"

type Repository interface {
	GetDraftByMatchID(match_id int64) ([]*models.Draft, error)
}
