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
	match, err := u.repo.GetRandomMatchByLastPatch()

	if err != nil {
		return nil, err
	}

	drafts, err := u.repo.GetDraftByMatchID(match.ID)

	if err != nil {
		return nil, err
	}

	return drafts, nil
}
