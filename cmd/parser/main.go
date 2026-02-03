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

	db, err := sql.Open("sqlite", "./data/dota.db")

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// parser.InitDB(db)

	// if err := parser.MigrateSchemaWithData(db); err != nil {
	// 	log.Fatal("Error migrating schema:", err)
	// }

	// fmt.Println("Schema migrated successfully!")

	// patches, err := parser.FetchPatches()
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }
	// if err := parser.SavePatches(db, patches); err != nil {
	// 	fmt.Printf("Error saving patches: %v\n", err)
	// }

	leagues, err := parser.FetchLeaguesForClean()
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(len(leagues))
	if len(leagues) > 0 {
		fmt.Println(leagues[:10])
	}

	leagueIDs := make([]int, len(leagues))
	for i, l := range leagues {
		leagueIDs[i] = l.LeagueID
	}

	if err := parser.DeleteLeaguesNotIn(db, leagueIDs); err != nil {
		fmt.Printf("Error deleting old leagues: %v\n", err)
		return
	}

	// for _, l := range leagues {
	// 	_, err := parser.GetLeagueByID(db, l.LeagueID)
	// 	if err != nil {
	// 		fmt.Printf("Error getting league %d: %v tier %d\n", l.LeagueID, err, l.Tier)
	// 		continue
	// 	}
	// fmt.Println(league.LeagueID, league.Name, league.PatchID)
	// }

	// if err := parser.SaveLeagues(db, leagues); err != nil {
	// 	fmt.Printf("Error saving leagues: %v\n", err)
	// }

	// matches, err := parser.FetchAllLeaguesMatches(leagues)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }

	// fmt.Println(len(matches))
	// if err := parser.SaveMatches(db, matches); err != nil {
	// 	fmt.Printf("Error saving matches: %v\n", err)
	// 	return
	// }

	// fmt.Println("Data saved successfully!")
}
