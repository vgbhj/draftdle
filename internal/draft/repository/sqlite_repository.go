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
	drafts := []*models.Draft{}

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

func (r *DraftRepository) GetLastPatch() (*models.Patch, error) {
	patch := &models.Patch{}

	query := `
		SELECT id, name, data
		FROM patches
		ORDER BY id DESC
		LIMIT 1
	`

	err := r.db.Get(&patch, query)
	if err != nil {
		return nil, err
	}

	return patch, nil
}

func (r *DraftRepository) GetLeaguesByPatch(patch_id int64) ([]*models.League, error) {
	return nil, nil
}

func (r *DraftRepository) GetMatchesByLeague(league_id int64) ([]*models.Match, error) {
	return nil, nil
}
