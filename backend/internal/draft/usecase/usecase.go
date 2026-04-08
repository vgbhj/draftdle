package usecase

import (
	"database/sql"
	"errors"
	"sync"
	"time"

	"github.com/vgbhj/draftdle/internal/draft"
	"github.com/vgbhj/draftdle/internal/models"
)

type DraftUC struct {
	repo  draft.Repository
	daily dailyCache
}

type dailyCache struct {
	mu   sync.RWMutex
	date string
	full *models.MatchFull
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

func (u *DraftUC) GetDailyDraft() (*models.MatchFull, error) {
	today := time.Now().UTC().Format("2006-01-02")

	u.daily.mu.RLock()
	if u.daily.date == today && u.daily.full != nil {
		full := u.daily.full
		u.daily.mu.RUnlock()
		return full, nil
	}
	u.daily.mu.RUnlock()

	matchID, err := u.resolveDailyMatchID(today)
	if err != nil {
		return nil, err
	}

	full, err := u.repo.GetMatchFull(matchID)
	if err != nil {
		return nil, err
	}

	u.daily.mu.Lock()
	u.daily.date = today
	u.daily.full = full
	u.daily.mu.Unlock()

	return full, nil
}

func (u *DraftUC) resolveDailyMatchID(today string) (int64, error) {
	id, err := u.repo.GetDailyMatchID(today)
	if err == nil {
		return id, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return 0, err
	}

	candidate, err := u.repo.GetRandomMatchByLastPatch()
	if err != nil {
		return 0, err
	}
	if err := u.repo.SaveDailyMatchID(today, candidate.ID); err != nil {
		return 0, err
	}
	return u.repo.GetDailyMatchID(today)
}
