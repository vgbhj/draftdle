CREATE TABLE IF NOT EXISTS daily_drafts (
    date        TEXT    PRIMARY KEY,
    match_id    INTEGER NOT NULL REFERENCES matches(id)
);