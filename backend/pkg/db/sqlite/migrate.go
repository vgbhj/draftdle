package sqlite

import (
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	migratesqlite "github.com/golang-migrate/migrate/v4/database/sqlite"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jmoiron/sqlx"
	"github.com/vgbhj/draftdle/migrations"
)

// RunMigrations применяет вшитые миграции к открытой БД.
// БД, накаченные вручную до появления автоматических миграций, не имеют
// таблицы schema_migrations — для них версия определяется по маркерным
// таблицам и фиксируется через Force, чтобы Up не пытался создать уже
// существующую схему.
func RunMigrations(db *sqlx.DB) error {
	baseline, err := detectBaseline(db)
	if err != nil {
		return fmt.Errorf("detect baseline: %w", err)
	}

	src, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return fmt.Errorf("load embedded migrations: %w", err)
	}

	driver, err := migratesqlite.WithInstance(db.DB, &migratesqlite.Config{})
	if err != nil {
		return fmt.Errorf("init migrate driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", src, "sqlite", driver)
	if err != nil {
		return fmt.Errorf("init migrate: %w", err)
	}

	if baseline > 0 {
		if err := m.Force(baseline); err != nil {
			return fmt.Errorf("force baseline %d: %w", baseline, err)
		}
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}

// detectBaseline возвращает версию схемы для БД без schema_migrations
// (0 — пустая или уже управляемая migrate'ом БД). Версия определяется по
// таблице, которую создаёт соответствующая миграция.
func detectBaseline(db *sqlx.DB) (int, error) {
	managed, err := tableExists(db, "schema_migrations")
	if err != nil || managed {
		return 0, err
	}

	markers := []struct {
		table   string
		version int
	}{
		{"users", 5},
		{"players", 4},
		{"daily_drafts", 3},
		{"teams", 2},
		{"patches", 1},
	}
	for _, mk := range markers {
		exists, err := tableExists(db, mk.table)
		if err != nil {
			return 0, err
		}
		if exists {
			return mk.version, nil
		}
	}
	return 0, nil
}

func tableExists(db *sqlx.DB, name string) (bool, error) {
	var n int
	err := db.Get(&n, `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?`, name)
	return n > 0, err
}
