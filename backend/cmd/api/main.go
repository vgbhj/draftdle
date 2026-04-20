package main

import (
	"log"
	"time"

	"github.com/vgbhj/draftdle/internal/server"
	"github.com/vgbhj/draftdle/pkg/db/sqlite"
	"github.com/vgbhj/draftdle/pkg/parser"
	"golang.org/x/time/rate"
)

func main() {
	parser.InitClient(false, rate.Every(2*time.Second), 1)

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
