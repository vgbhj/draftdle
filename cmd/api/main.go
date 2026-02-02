package main

import "github.com/vgbhj/draftdle/pkg/db/sqlite"

func main() {
	db, err := sqlite.NewSqliteDB("./data/dota.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()
}
