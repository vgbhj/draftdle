package main

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/pkg/parser"
	"golang.org/x/time/rate"
	_ "modernc.org/sqlite"
)

func main() {
	parser.InitConfig()
	parser.InitClient(rate.Every(time.Minute/3000), 50)
	// parser.InitClient(rate.Every(time.Second), 1)
	// parser.InitClient(0, 0) 


	db, err := sqlx.Open("sqlite", "./data/dota.db")

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// обновлять лиги → подсасываем все матчи

	newLeagues, err := parser.FetchNewLeagues(db)
	if err != nil {
		log.Println(err)
		return
	}


	fmt.Println(newLeagues)
	if err := parser.SaveLeagues(db, newLeagues); err != nil {
		log.Printf("Error saving leagues: %v\n", err)
	}

	matches, err := parser.FetchAllLeaguesMatches(newLeagues)
	if err != nil {
		log.Println(err)
		return
	}

	fmt.Println(len(matches))
	if err := parser.SaveMatches(db, matches); err != nil {
		fmt.Printf("Error saving matches: %v\n", err)
		return
	}

	// обновление матчей у последних N лиг
	
	updateLeaguesIDs, err := parser.GetLastNLeagues(db, 5)
	if err != nil {
		log.Println(err)
		return
	}
	var updateMatches []parser.Match
	for id := range updateLeaguesIDs {
		matches, err := parser.FetchLeagueMatches(id)
		if err != nil {
			log.Println(err)
			return
		}
		updateMatches = append(updateMatches, matches...)
	}

	fmt.Println(len(matches))
	if err := parser.SaveMatches(db, updateMatches); err != nil {
		fmt.Printf("Error saving matches: %v\n", err)
		return
	}
}
