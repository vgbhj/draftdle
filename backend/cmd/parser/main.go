package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/pkg/parser"
	"golang.org/x/time/rate"
	_ "modernc.org/sqlite"
)

func main() {
	// parser.InitConfig(false, rate.Every(time.Second), 1)
	parser.InitConfig(true, rate.Every(time.Second/25), 50)
	// parser.InitConfig(true, 0, 0)

	db, err := sqlx.Open("sqlite", "./data/dota.db")

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		runUpdater(ctx, db)
	}()

	log.Println("Service started. Press Ctrl+C to stop.")
	<-ctx.Done()
	log.Println("Shutting down gracefully...")

	wg.Wait()
	log.Println("Service stopped.")
}

func runUpdater(ctx context.Context, db *sqlx.DB) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	log.Println("Running initial update...")
	updateDatabase(ctx, db)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			log.Println("Running scheduled update...")
			updateDatabase(ctx, db)
		}
	}
}

func updateDatabase(ctx context.Context, db *sqlx.DB) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Recovered from panic in updateDatabase: %v", r)
		}
	}()

	if err := syncNewLeagues(ctx, db); err != nil {
		log.Printf("Failed to sync new leagues: %v", err)
	}

	if err := refreshRecentLeaguesMatches(ctx, db, 5); err != nil {
		log.Printf("Failed to refresh recent matches: %v", err)
	}
}

func syncNewLeagues(ctx context.Context, db *sqlx.DB) error {
	newLeagues, err := parser.FetchNewLeagues(db)
	if err != nil {
		return fmt.Errorf("fetch new leagues: %w", err)
	}

	if len(newLeagues) == 0 {
		log.Println("No new leagues to sync.")
		return nil
	}

	if err := parser.SaveLeagues(db, newLeagues); err != nil {
		return fmt.Errorf("save leagues: %w", err)
	}

	matches, err := parser.FetchAllLeaguesMatches(newLeagues)
	if err != nil {
		return fmt.Errorf("fetch all leagues matches: %w", err)
	}

	if err := parser.SaveMatches(db, matches); err != nil {
		return fmt.Errorf("save matches: %w", err)
	}

	log.Printf("Successfully synced %d new leagues and their matches", len(newLeagues))
	return nil
}

func refreshRecentLeaguesMatches(ctx context.Context, db *sqlx.DB, n int) error {
	updateLeagues, err := parser.GetLastNLeagues(db, n)
	if err != nil {
		return fmt.Errorf("get last N leagues: %w", err)
	}

	var allMatches []parser.Match
	for _, l := range updateLeagues {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}
		matches, err := parser.FetchLeagueMatches(l.LeagueID)
		if err != nil {
			log.Printf("Warning: failed to fetch matches for league %d: %v", l.LeagueID, err)
			continue
		}
		allMatches = append(allMatches, matches...)
	}

	if len(allMatches) > 0 {
		if err := parser.SaveMatches(db, allMatches); err != nil {
			return fmt.Errorf("save updated matches: %w", err)
		}
	}

	log.Printf("Successfully refreshed matches for %d leagues", len(updateLeagues))
	return nil
}
