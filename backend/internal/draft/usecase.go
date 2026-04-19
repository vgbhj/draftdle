package draft

import (
	"context"

	"github.com/vgbhj/draftdle/internal/models"
)

type DraftUC interface {
	GetRandomDraft() (*models.MatchFull, error)
	GetDailyDraft() (*models.MatchFull, error)
}

type PlayerFetcher interface {
	FetchPlayers(ctx context.Context, matchID int64) (map[int]string, error)
}
