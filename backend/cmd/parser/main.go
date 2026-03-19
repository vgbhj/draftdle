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

	// обновление матчей у последних N лиг

	
}
