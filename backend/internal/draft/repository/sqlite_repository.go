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

func (r *DraftRepository) GetMatchFull(matchID int64) (*models.MatchFull, error) {
    var result struct {
        models.Match
        RadiantName string `db:"r_name"`
        RadiantTag  string `db:"r_tag"`
        RadiantLogo string `db:"r_logo"`
        DireName    string `db:"d_name"`
        DireTag     string `db:"d_tag"`
        DireLogo    string `db:"d_logo"`
        LeagueName  string `db:"l_name"`
    }

    queryMatch := `
    SELECT 
        m.id, m.league_id, m.radiant_team_id, m.dire_team_id,
        COALESCE(rt.name, '') as r_name, 
        COALESCE(rt.tag, '') as r_tag, 
        COALESCE(rt.logo_url, '') as r_logo,
        COALESCE(dt.name, '') as d_name, 
        COALESCE(dt.tag, '') as d_tag, 
        COALESCE(dt.logo_url, '') as d_logo,
        COALESCE(l.name, '') as l_name
    FROM matches m
    LEFT JOIN teams rt ON m.radiant_team_id = rt.id
    LEFT JOIN teams dt ON m.dire_team_id = dt.id
    LEFT JOIN leagues l ON m.league_id = l.id
    WHERE m.id = $1`

    err := r.db.Get(&result, queryMatch, matchID)
    if err != nil {
        return nil, err
    }

	slots, err := r.GetDraftByMatchID(matchID)
    if err != nil {
        return nil, err
    }

    return &models.MatchFull{
        MatchID: result.ID,
        Slots:   slots,
        RadiantTeam: &models.Team{
            Name:    result.RadiantName,
            Tag:     result.RadiantTag,
            LogoURL: result.RadiantLogo,
        },
        DireTeam: &models.Team{
            Name:    result.DireName,
            Tag:     result.DireTag,
            LogoURL: result.DireLogo,
        },
        League: &models.League{
            ID:   result.LeagueID,
            Name: result.LeagueName,
        },
    }, nil
}

func (r *DraftRepository) GetDraftByMatchID(match_id int64) ([]models.Draft, error) {
	var drafts []models.Draft

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

func (r *DraftRepository) GetRandomMatchByLastPatch() (*models.Match, error) {
	match := &models.Match{}

	query := `
		SELECT m.id, m.league_id
		FROM matches m
		INNER JOIN leagues l ON m.league_id = l.id
		INNER JOIN patches p ON l.patch_id = p.id
		WHERE p.id = (
			SELECT id FROM patches ORDER BY id DESC LIMIT 1
		)
		ORDER BY RANDOM()
		LIMIT 1
	`

	err := r.db.Get(match, query)
	if err != nil {
		return nil, err
	}

	return match, nil
}

func (r *DraftRepository) GetDailyMatchID(date string) (int64, error) {
	var id int64
	err := r.db.Get(&id, `SELECT match_id FROM daily_drafts WHERE date = ?`, date)
	return id, err
}

func (r *DraftRepository) SaveDailyMatchID(date string, matchID int64) error {
	_, err := r.db.Exec(
		`INSERT OR IGNORE INTO daily_drafts (date, match_id) VALUES (?, ?)`,
		date, matchID,
	)
	return err
}

func (r *DraftRepository) GetPlayersByMatchID(matchID int64) (map[int]string, error) {
	var rows []struct {
		HeroID     int    `db:"hero_id"`
		PlayerName string `db:"player_name"`
	}
	err := r.db.Select(&rows, `SELECT hero_id, player_name FROM players WHERE match_id = ?`, matchID)
	if err != nil {
		return nil, err
	}
	m := make(map[int]string, len(rows))
	for _, row := range rows {
		m[row.HeroID] = row.PlayerName
	}
	return m, nil
}

func (r *DraftRepository) SaveTeamForMatch(matchID int64, team *models.Team, side string) error {
	if team == nil || team.TeamID == 0 {
		return nil
	}
	_, err := r.db.Exec(`INSERT OR IGNORE INTO teams (id, name, tag, logo_url) VALUES (?, ?, ?, ?)`,
		team.TeamID, team.Name, team.Tag, team.LogoURL)
	if err != nil {
		return err
	}
	col := "radiant_team_id"
	if side == "dire" {
		col = "dire_team_id"
	}
	_, err = r.db.Exec(`UPDATE matches SET `+col+` = ? WHERE id = ?`, team.TeamID, matchID)
	return err
}

func (r *DraftRepository) SavePlayersForMatch(matchID int64, players map[int]string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	stmt, err := tx.Preparex(`INSERT OR IGNORE INTO players (match_id, hero_id, player_name, team) VALUES (?, ?, ?, 0)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()
	for heroID, name := range players {
		if _, err := stmt.Exec(matchID, heroID, name); err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}