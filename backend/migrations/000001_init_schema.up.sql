CREATE TABLE IF NOT EXISTS patches (
    id INTEGER PRIMARY KEY,
    name TEXT,
    data DATETIME
);

CREATE TABLE IF NOT EXISTS leagues (
    id INTEGER PRIMARY KEY,
    name TEXT,
    tier INTEGER,
    patch_id INTEGER,
    FOREIGN KEY (patch_id) REFERENCES patches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,
    league_id INTEGER,
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS picks_bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    is_pick BOOLEAN,
    hero_id INTEGER,
    team INTEGER,
    "order" INTEGER,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);