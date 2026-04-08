CREATE TABLE daily_drafts (
    date        TEXT    PRIMARY KEY,
    match_id    INTEGER NOT NULL REFERENCES matches(id)
);