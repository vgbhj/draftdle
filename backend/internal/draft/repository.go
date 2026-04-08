package draft

import "github.com/vgbhj/draftdle/internal/models"

type Repository interface {
	GetLastPatch() (*models.Patch, error)
	GetLeaguesByPatch(patchID int64) ([]*models.League, error)
	GetMatchesByLeague(leagueID int64) ([]*models.Match, error)
	GetDraftByMatchID(matchID int64) ([]models.Draft, error)
	GetRandomMatchByLastPatch() (*models.Match, error)
	GetMatchFull(matchID int64) (*models.MatchFull, error)
	GetDailyMatchID(date string) (int64, error)
	SaveDailyMatchID(date string, matchID int64) error
}
