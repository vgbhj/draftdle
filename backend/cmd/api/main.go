package main

import (
	"log"

	"github.com/vgbhj/draftdle/internal/server"
	"github.com/vgbhj/draftdle/pkg/db/sqlite"
)

func main() {
	db, err := sqlite.NewSqliteDB("./data/dota.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	s := server.NewServer(":8080", db)

	if err := s.Run(); err != nil {
		log.Fatalf("Server could not be ran: %v", err)
	}
}
