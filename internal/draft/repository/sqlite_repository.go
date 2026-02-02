package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/internal/draft"
	"github.com/vgbhj/draftdle/internal/models"
)

type DraftRepository struct {
	db *sqlx.DB
}

func NewDraftReposiroty(db *sqlx.DB) draft.Repository {
	return &DraftRepository{
		db: db,
	}
}

func (r *DraftRepository) GetDraftByMatchID(match_id int64) ([]*models.Draft, error) {
	var drafts []*models.Draft

	query := `
		SELECT id, match_id, is_pick, hero_id, team, "order"
		FROM picks_bans
		WHERE match_id = ?
		ORDER BY "order" ASC
	`

	err := r.db.Select(&drafts, query, match_id)
	if err != nil {
		return nil, err
	}
	return drafts, nil
}
