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

func (u *DraftUC) GetRandomDraft() (*models.MatchFull, error) {
	match, err := u.repo.GetRandomMatchByLastPatch()

	if err != nil {
		return nil, err
	}

	matchFull, err := u.repo.GetMatchFull(match.ID)

	if err != nil {
		return nil, err
	}

	return matchFull, nil
}
