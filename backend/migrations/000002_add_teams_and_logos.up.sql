PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY,
    name TEXT,
    tag TEXT,
    logo_url TEXT
);

CREATE TABLE matches_new (
    id INTEGER PRIMARY KEY,
    league_id INTEGER,
    radiant_team_id INTEGER,
    dire_team_id INTEGER,
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
    FOREIGN KEY (radiant_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (dire_team_id) REFERENCES teams(id) ON DELETE SET NULL
);

INSERT INTO matches_new (id, league_id) SELECT id, league_id FROM matches;

DROP TABLE matches;
ALTER TABLE matches_new RENAME TO matches;

PRAGMA foreign_keys = ON;