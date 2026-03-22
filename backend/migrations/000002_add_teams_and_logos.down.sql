PRAGMA foreign_keys = OFF;

CREATE TABLE matches_old (
    id INTEGER PRIMARY KEY,
    league_id INTEGER NOT NULL,
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

INSERT INTO matches_old (id, league_id)
SELECT id, league_id FROM matches;

DROP TABLE matches;
ALTER TABLE matches_old RENAME TO matches;

DROP TABLE IF EXISTS teams;

PRAGMA foreign_keys = ON;