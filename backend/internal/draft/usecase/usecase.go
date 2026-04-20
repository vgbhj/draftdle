package usecase

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/vgbhj/draftdle/internal/draft"
	"github.com/vgbhj/draftdle/internal/models"
)

type DraftUC struct {
	repo    draft.Repository
	fetcher draft.PlayerFetcher
	daily   dailyCache
}

type dailyCache struct {
	mu   sync.RWMutex
	date string
	full *models.MatchFull
}

func NewDraftUseCase(repo draft.Repository, fetcher draft.PlayerFetcher) draft.DraftUC {
	return &DraftUC{
		repo:    repo,
		fetcher: fetcher,
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

	u.enrichWithTeams(matchFull)
	u.enrichWithPlayers(matchFull)
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

	u.enrichWithTeams(full)
	u.enrichWithPlayers(full)

	u.daily.mu.Lock()
	u.daily.date = today
	u.daily.full = full
	u.daily.mu.Unlock()

	return full, nil
}

func (u *DraftUC) enrichWithTeams(full *models.MatchFull) {
	hasRadiant := full.RadiantTeam != nil && full.RadiantTeam.Name != ""
	hasDire := full.DireTeam != nil && full.DireTeam.Name != ""
	if hasRadiant && hasDire {
		return
	}

	radiant, dire, err := u.fetcher.FetchMatchTeams(context.Background(), full.MatchID)
	if err != nil {
		log.Printf("Error fetching teams for match %d: %v", full.MatchID, err)
		return
	}

	if !hasRadiant && radiant != nil {
		full.RadiantTeam = radiant
		if err := u.repo.SaveTeamForMatch(full.MatchID, radiant, "radiant"); err != nil {
			log.Printf("Error saving radiant team for match %d: %v", full.MatchID, err)
		}
	}
	if !hasDire && dire != nil {
		full.DireTeam = dire
		if err := u.repo.SaveTeamForMatch(full.MatchID, dire, "dire"); err != nil {
			log.Printf("Error saving dire team for match %d: %v", full.MatchID, err)
		}
	}
}

func (u *DraftUC) enrichWithPlayers(full *models.MatchFull) {
	players, err := u.repo.GetPlayersByMatchID(full.MatchID)
	if err != nil {
		log.Printf("Error getting players for match %d: %v", full.MatchID, err)
		return
	}
	if len(players) > 0 {
		full.Players = players
		return
	}

	players, err = u.fetcher.FetchPlayers(context.Background(), full.MatchID)
	if err != nil {
		log.Printf("Error fetching players for match %d: %v", full.MatchID, err)
		return
	}
	if err := u.repo.SavePlayersForMatch(full.MatchID, players); err != nil {
		log.Printf("Error saving players for match %d: %v", full.MatchID, err)
	}
	full.Players = players
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
