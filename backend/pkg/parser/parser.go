package parser

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"golang.org/x/time/rate"

	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

var apiKey string
var requestCount atomic.Int64
var mu sync.Mutex

type DotaClient struct {
	http    *http.Client
	apiKey  string
	limiter *rate.Limiter
}

var client *DotaClient

type TierInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type LeagueResponse struct {
	Data []League `json:"data"`
}

type League struct {
	LeagueID int      `json:"leagueid"`
	Name     string   `json:"name"`
	Tier     TierInfo `json:"tier"`
}

type LeagueDB struct {
	LeagueID int
	Name     string
	Tier     int
	PatchID  int
}

type PicksBan struct {
	IsPick bool `json:"is_pick"`
	HeroID int  `json:"hero_id"`
	Team   int  `json:"team"`
	Order  int  `json:"order"`
}

type Match struct {
	MatchID  int64      `json:"match_id"`
	LeagueID int        `json:"leagueid"`
	Patch    int        `json:"patch"`
	PicksBan []PicksBan `json:"picks_bans"`
}

type Patch struct {
	ID   int       `json:"id"`
	Name string    `json:"name"`
	Date time.Time `json:"date"`
}

func tierToInt(tier string) int {
	switch tier {
	case "premium":
		return 1

	case "professional":
		return 2
	default:
		return 0
	}
}

func FetchLeaguesForClean() ([]LeagueDB, error) {
	req, err := http.NewRequest("GET", "https://www.datdota.com/api/leagues", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var leagues []League
	var response LeagueResponse

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	leagues = response.Data

	results := make(chan LeagueDB, len(leagues))
	var wg sync.WaitGroup

	semaphore := make(chan struct{}, 10)

	// for inx, league := range leagues {
	for i := 0; i < len(leagues); i++ {
		tierCode := leagues[i].Tier.ID
		if tierCode < 3 {
			wg.Add(1)

			go func(l League, tc int) {
				defer wg.Done()

				semaphore <- struct{}{}

				defer func() { <-semaphore }()

				patchID := 0

				results <- LeagueDB{
					LeagueID: l.LeagueID,
					Name:     l.Name,
					Tier:     tc,
					PatchID:  patchID,
				}
				fmt.Println(i, len(leagues))
			}(leagues[i], tierCode)
		}
	}
	go func() {
		wg.Wait()
		close(results)
	}()

	var filtered []LeagueDB
	for leagueDB := range results {
		filtered = append(filtered, leagueDB)
	}

	return filtered, nil
}

func FetchLeagues() ([]LeagueDB, error) {
	req, err := http.NewRequest("GET", "https://www.datdota.com/api/leagues", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var leagues []League
	var response LeagueResponse

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	leagues = response.Data

	results := make(chan LeagueDB, len(leagues))
	var wg sync.WaitGroup

	semaphore := make(chan struct{}, 10)

	// for inx, league := range leagues {
	for i := 0; i < len(leagues); i++ {
		tierCode := leagues[i].Tier.ID
		if tierCode > 0 {
			wg.Add(1)

			go func(l League, tc int) {
				defer wg.Done()

				semaphore <- struct{}{}

				defer func() { <-semaphore }()

				match, err := FetchFirstLeagueMatch(l.LeagueID)
				patchID := 0
				if err == nil && match != nil {
					patchID = match.Patch
				}

				results <- LeagueDB{
					LeagueID: l.LeagueID,
					Name:     l.Name,
					Tier:     tc,
					PatchID:  patchID,
				}
				fmt.Println(i, len(leagues))
			}(leagues[i], tierCode)
		}
	}
	go func() {
		wg.Wait()
		close(results)
	}()

	var filtered []LeagueDB
	for leagueDB := range results {
		filtered = append(filtered, leagueDB)
	}

	return filtered, nil
}

func FetchMatches(matchID int64) (*Match, error) {
	url := fmt.Sprintf("https://api.opendota.com/api/matches/%d", matchID)
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var match Match
	if err := json.NewDecoder(resp.Body).Decode(&match); err != nil {
		return nil, err
	}

	return &match, nil
}

func FetchLeagueMatches(leagueID int) ([]Match, error) {
	url := fmt.Sprintf("https://api.opendota.com/api/leagues/%d/matches", leagueID)
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var matches []Match
	if err := json.NewDecoder(resp.Body).Decode(&matches); err != nil {
		return nil, err
	}

	results := make(chan *Match, len(matches))
	var wg sync.WaitGroup

	semaphore := make(chan struct{}, 10)

	for _, m := range matches {
		wg.Add(1)
		go func(matchID int64) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			tmpMatch, err := FetchMatches(matchID)
			if err != nil {
				fmt.Printf("Error fetching match %d: %v\n", matchID, err)
				return
			}
			if tmpMatch != nil && len(tmpMatch.PicksBan) > 0 {
				results <- tmpMatch
			}
		}(m.MatchID)
	}

	wg.Wait()
	close(results)

	var trueMatches []Match
	for match := range results {
		trueMatches = append(trueMatches, *match)
	}

	return trueMatches, nil
}

func FetchFirstLeagueMatch(leagueID int) (*Match, error) {
	url := fmt.Sprintf("https://api.opendota.com/api/leagues/%d/matches", leagueID)
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var matches []Match
	if err := json.NewDecoder(resp.Body).Decode(&matches); err != nil {
		return nil, err
	}

	if len(matches) == 0 {
		return nil, fmt.Errorf("no matches found for league %d", leagueID)
	}

	tmpMatch, err := FetchMatches(matches[0].MatchID)
	if err != nil {
		return nil, fmt.Errorf("error fetching match %d: %v", matches[0].MatchID, err)
	}

	return tmpMatch, nil
}

func FetchAllLeaguesMatches(leagues []LeagueDB) ([]Match, error) {
	results := make(chan []Match, len(leagues))
	var wg sync.WaitGroup

	semaphore := make(chan struct{}, 3)

	// for _, league := range leagues {
	for i := 0; i < len(leagues); i++ {
		wg.Add(1)
		go func(league LeagueDB) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			matches, err := FetchLeagueMatches(league.LeagueID)
			if err != nil {
				fmt.Printf("Error fetching matches for league %d: %v\n", league.LeagueID, err)
				results <- []Match{}
				return
			}
			results <- matches
			fmt.Println(i, len(matches), len(leagues))
		}(leagues[i])
	}

	wg.Wait()
	close(results)

	var allMatches []Match
	for matches := range results {
		allMatches = append(allMatches, matches...)
	}

	return allMatches, nil
}

func FetchPatches() ([]Patch, error) {
	resp, err := client.Get("https://api.opendota.com/api/constants/patch")
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	var patches []Patch
	if err := json.NewDecoder(resp.Body).Decode(&patches); err != nil {
		return nil, err
	}

	return patches, nil
}

const createShema = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patches (
	id INTEGER PRIMARY KEY,
	name TEXT,
	data DATETIME
);

CREATE TABLE IF NOT EXISTS leagues (
	id INTEGER PRIMARY KEY,
	name TEXT,
	tier INTEGER,
	patch_id INTEGER,
	FOREIGN KEY (patch_id) REFERENCES patches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
	id INTEGER PRIMARY KEY,
	league_id INTEGER,
	FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS picks_bans (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id INTEGER,
	is_pick BOOLEAN,
	hero_id INTEGER,
	team INTEGER,
	"order" INTEGER,
	FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
)
`

func MigrateSchemaWithData(db *sql.DB) error {
	if _, err := db.Exec("PRAGMA foreign_keys = OFF"); err != nil {
		return err
	}
	defer db.Exec("PRAGMA foreign_keys = ON")

	tempSchema := `
    CREATE TABLE patches_new (
        id INTEGER PRIMARY KEY,
        name TEXT,
        data DATETIME
    );

    CREATE TABLE leagues_new (
        id INTEGER PRIMARY KEY,
        name TEXT,
        tier INTEGER,
        patch_id INTEGER,
        FOREIGN KEY (patch_id) REFERENCES patches_new(id) ON DELETE CASCADE
    );

    CREATE TABLE matches_new (
        id INTEGER PRIMARY KEY,
        league_id INTEGER,
        FOREIGN KEY (league_id) REFERENCES leagues_new(id) ON DELETE CASCADE
    );

    CREATE TABLE picks_bans_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        is_pick BOOLEAN,
        hero_id INTEGER,
        team INTEGER,
        "order" INTEGER,
        FOREIGN KEY (match_id) REFERENCES matches_new(id) ON DELETE CASCADE
    );
    `

	if _, err := db.Exec(tempSchema); err != nil {
		return err
	}

	copyQueries := []string{
		"INSERT INTO patches_new SELECT * FROM patches",
		"INSERT INTO leagues_new SELECT * FROM leagues",
		"INSERT INTO matches_new SELECT * FROM matches",
		"INSERT INTO picks_bans_new SELECT * FROM picks_bans",
	}

	for _, query := range copyQueries {
		if _, err := db.Exec(query); err != nil {
			if !strings.Contains(err.Error(), "no such table") {
				return err
			}
		}
	}

	oldTables := []string{"picks_bans", "matches", "leagues", "patches"}
	for _, table := range oldTables {
		if _, err := db.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s", table)); err != nil {
			return err
		}
	}

	renameQueries := []string{
		"ALTER TABLE patches_new RENAME TO patches",
		"ALTER TABLE leagues_new RENAME TO leagues",
		"ALTER TABLE matches_new RENAME TO matches",
		"ALTER TABLE picks_bans_new RENAME TO picks_bans",
	}

	for _, query := range renameQueries {
		if _, err := db.Exec(query); err != nil {
			return err
		}
	}

	return nil
}

func InitDB(db *sql.DB) {
	_, err := db.Exec(createShema)
	if err != nil {
		log.Fatal("Error create tables:", err)
	}
}

func DeleteLeaguesNotIn(db *sql.DB, leagueIDs []int) error {
	if len(leagueIDs) == 0 {
		return nil
	}

	placeholders := make([]string, len(leagueIDs))
	args := make([]interface{}, len(leagueIDs))

	for i, id := range leagueIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(`
        DELETE FROM leagues
        WHERE id NOT IN (%s)
    `, strings.Join(placeholders, ","))

	log.Printf("Starting deletion of leagues not in list (keeping %d leagues)", len(leagueIDs))

	result, err := db.Exec(query, args...)
	if err != nil {
		log.Printf("Error deleting leagues: %v", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting rows affected: %v", err)
		return err
	}

	log.Printf("Successfully deleted %d leagues", rowsAffected)
	return err
}

func SavePatches(db *sql.DB, patches []Patch) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := tx.Prepare("INSERT OR IGNORE INTO patches (id, name, data) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, p := range patches {
		_, err := stmt.Exec(p.ID, p.Name, p.Date)
		if err != nil {
			fmt.Printf("Error inserting patch %d: %v\n", p.ID, err)
			continue
		}
	}
	return tx.Commit()
}

func SaveLeagues(db *sql.DB, leagues []LeagueDB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := tx.Prepare("INSERT OR IGNORE INTO leagues (id, name, tier, patch_id) VALUES (?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, l := range leagues {
		_, err := stmt.Exec(l.LeagueID, l.Name, l.Tier, l.PatchID)
		if err != nil {
			fmt.Printf("Error inserting league %d: %v\n", l.LeagueID, err)
			continue
		}
	}

	return tx.Commit()
}

func SavePicksBans(picksBans []PicksBan, matchID int64, tx *sql.Tx) error {
	stmt, err := tx.Prepare("INSERT INTO picks_bans (match_id, is_pick, hero_id, team, \"order\") VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, pb := range picksBans {
		_, err := stmt.Exec(matchID, pb.IsPick, pb.HeroID, pb.Team, pb.Order)
		if err != nil {
			fmt.Printf("Error inserting pick_ban for match %d: %v\n", matchID, err)
			continue
		}
	}

	return nil
}

func GetLeagueByID(db *sql.DB, leagueID int) (*LeagueDB, error) {
	league := &LeagueDB{}

	query := `
        SELECT id, name, tier, patch_id
        FROM leagues
        WHERE id = ?
    `

	err := db.QueryRow(query, leagueID).Scan(&league.LeagueID, &league.Name, &league.Tier, &league.PatchID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("league not found: %d", leagueID)
		}
		return nil, err
	}

	return league, nil
}

func SaveMatches(db *sql.DB, matches []Match) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	stmt, err := tx.Prepare("INSERT OR IGNORE INTO matches (id, league_id) VALUES (?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, m := range matches {
		_, err := stmt.Exec(m.MatchID, m.LeagueID)
		if err != nil {
			fmt.Printf("Error inserting match %d: %v\n", m.MatchID, err)
			continue
		}

		if err := SavePicksBans(m.PicksBan, m.MatchID, tx); err != nil {
			fmt.Printf("Error saving picks_bans for match %d: %v\n", m.MatchID, err)
		}
	}

	return tx.Commit()
}

func InitConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	apiKey = os.Getenv("API_KEY")
	if apiKey == "" {
		log.Fatal("API_KEY not found in .env file")
	}
}

func InitClient(r rate.Limit, burst int) {
	client = NewDotaClient(apiKey, r, burst)
}

func NewDotaClient(apiKey string, r rate.Limit, burst int) *DotaClient {
	return &DotaClient{
		http: &http.Client{
			Timeout: 10 * time.Second,
		},
		apiKey:  apiKey,
		limiter: rate.NewLimiter(r, burst),
	}
}

func (c *DotaClient) Get(urlStr string) (*http.Response, error) {
	if err := c.limiter.Wait(context.Background()); err != nil {
		return nil, err
	}

	requestCount.Add(1)

	u, err := url.Parse(urlStr)
	if err != nil {
		return nil, err
	}
	q := u.Query()
	if strings.Contains(u.Host, "opendota.com") {
		q.Set("api_key", c.apiKey)
	}
	u.RawQuery = q.Encode()

	// log.Printf("GET %s", u.String())

	return c.http.Get(u.String())
}
