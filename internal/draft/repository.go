package draft

import "github.com/vgbhj/draftdle/internal/models"

type Repository interface {
	GetLastPatch() (*models.Patch, error)
	GetLeaguesByPatch(patch_id int64) ([]*models.League, error)
	GetMatchesByLeague(league_id int64) ([]*models.Match, error)
	GetDraftByMatchID(match_id int64) ([]*models.Draft, error)
}
