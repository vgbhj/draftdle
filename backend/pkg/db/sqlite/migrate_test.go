package sqlite

import (
	"io/fs"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"github.com/vgbhj/draftdle/migrations"
)

func TestRunMigrationsFreshDB(t *testing.T) {
	db, err := NewSqliteDB(filepath.Join(t.TempDir(), "fresh.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	if err := RunMigrations(db); err != nil {
		t.Fatalf("RunMigrations on fresh DB: %v", err)
	}

	for _, table := range []string{"patches", "teams", "daily_drafts", "players", "users", "sessions"} {
		exists, err := tableExists(db, table)
		if err != nil {
			t.Fatal(err)
		}
		if !exists {
			t.Errorf("table %q not created", table)
		}
	}

	// Повторный запуск не должен ничего ломать.
	if err := RunMigrations(db); err != nil {
		t.Fatalf("RunMigrations second run: %v", err)
	}
}

// Имитирует прод-БД, накаченную вручную: схема есть, schema_migrations нет.
func TestRunMigrationsBaselinesManualDB(t *testing.T) {
	db, err := NewSqliteDB(filepath.Join(t.TempDir(), "manual.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	var ups []string
	if err := fs.WalkDir(migrations.FS, ".", func(path string, d fs.DirEntry, err error) error {
		if err == nil && strings.HasSuffix(path, ".up.sql") {
			ups = append(ups, path)
		}
		return err
	}); err != nil {
		t.Fatal(err)
	}
	sort.Strings(ups)
	for _, path := range ups {
		sql, err := fs.ReadFile(migrations.FS, path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := db.Exec(string(sql)); err != nil {
			t.Fatalf("apply %s manually: %v", path, err)
		}
	}

	if err := RunMigrations(db); err != nil {
		t.Fatalf("RunMigrations on manually migrated DB: %v", err)
	}

	var version int
	var dirty bool
	if err := db.QueryRow(`SELECT version, dirty FROM schema_migrations`).Scan(&version, &dirty); err != nil {
		t.Fatal(err)
	}
	if version != 5 || dirty {
		t.Errorf("got version=%d dirty=%v, want version=5 dirty=false", version, dirty)
	}
}
