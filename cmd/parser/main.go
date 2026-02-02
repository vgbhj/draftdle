package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/vgbhj/draftdle/pkg/parser"
	"golang.org/x/time/rate"
)

func main() {
	parser.InitConfig()
	parser.InitClient(rate.Every(time.Minute/3000), 50)

	db, err := sql.Open("sqlite", "dota.db")

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	parser.InitDB(db)

	patches, err := parser.FetchPatches()
	if err != nil {
		fmt.Println(err)
		return
	}
	if err := parser.SavePatches(db, patches); err != nil {
		fmt.Printf("Error saving patches: %v\n", err)
	}

	leagues, err := parser.FetchLeagues()
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(len(leagues))
	if len(leagues) > 0 {
		fmt.Println(leagues[:10])
	}

	if err := parser.SaveLeagues(db, leagues); err != nil {
		fmt.Printf("Error saving leagues: %v\n", err)
	}

	matches, err := parser.FetchAllLeaguesMatches(leagues)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(len(matches))
	if err := parser.SaveMatches(db, matches); err != nil {
		fmt.Printf("Error saving matches: %v\n", err)
		return
	}

	fmt.Println("Data saved successfully!")
}
