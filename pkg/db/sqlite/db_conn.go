package sqlite

import (
	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func NewSqliteDB(dbPath string) (*sqlx.DB, error) {
	return sqlx.Connect("sqlite", dbPath)
}
