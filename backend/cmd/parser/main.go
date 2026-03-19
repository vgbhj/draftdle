package main

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/pkg/parser"
	_ "modernc.org/sqlite"
)

func main() {
	parser.InitConfig()
	parser.InitClient(0, 0) 

	db, err := sqlx.Open("sqlite", "./data/dota.db")

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// обновление матчей у последних N лиг
	
	match, err := parser.FetchFirstLeagueMatch(19435)
	fmt.Println(match)

	// обновлять лиги → подсасываем все матчи

	newLeagues, err := parser.FetchNewLeagues(db)
	if err != nil {
		fmt.Println(err)
		return
	}


	fmt.Println(newLeagues)
	if err := parser.SaveLeagues(db, newLeagues); err != nil {
		fmt.Printf("Error saving leagues: %v\n", err)
	}

	matches, err := parser.FetchAllLeaguesMatches(newLeagues)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(len(matches))
	if err := parser.SaveMatches(db, matches); err != nil {
		fmt.Printf("Error saving matches: %v\n", err)
		return
	}
}
