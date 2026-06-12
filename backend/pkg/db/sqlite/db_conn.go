package sqlite

import (
	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func NewSqliteDB(dbPath string) (*sqlx.DB, error) {
	// SQLite не применяет FOREIGN KEY (в т.ч. ON DELETE CASCADE) без этой прагмы.
	return sqlx.Connect("sqlite", dbPath+"?_pragma=foreign_keys(1)")
}
