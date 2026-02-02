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

func (r *DraftRepository) GetLeaguesByPatch(patchID int64) ([]*models.League, error) {
	var leagues []*models.League

	query := `
		SELECT id, name, tier, patch_id
		FROM leagues
		WHERE patch_id = ?
	`

	err := r.db.Select(&leagues, query, patchID)
	if err != nil {
		return nil, err
	}

	return leagues, nil
}

func (r *DraftRepository) GetMatchesByLeague(leagueID int64) ([]*models.Match, error) {
	var matches []*models.Match

	query := `
		SELECT id, league_id
		FROM matches
		WHERE league_id = ?
	`

	err := r.db.Select(&matches, query, leagueID)
	if err != nil {
		return nil, err
	}

	return matches, nil
}
