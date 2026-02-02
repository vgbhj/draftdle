package usecase

import (
	"github.com/vgbhj/draftdle/internal/draft"
	"github.com/vgbhj/draftdle/internal/models"
)

type DraftUC struct {
	repo draft.Repository
}

func NewDraftUseCase(repo draft.Repository) draft.DraftUC {
	return &DraftUC{
		repo: repo,
	}
}

func (u *DraftUC) GetRandomDraft() ([]*models.Draft, error) {
	patch, err := u.repo.GetLastPatch()

	leagues, err := u.repo.GetLeaguesByPatch(patch.ID)

	matches, err := u.repo.GetMatchesByLeague(league)

	drafts, err := u.repo.GetDraftByMatchID(match)

	return drafts, nil
}
