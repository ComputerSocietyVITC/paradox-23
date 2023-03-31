CREATE TABLE
    IF NOT EXISTS questions (
        level INTEGER PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        image TEXT,
        answer TEXT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS users (
        username TEXT PRIMARY KEY NOT NULL CHECK(
            LENGTH(username) BETWEEN 3 AND 20
        ),
        avatar TEXT NOT NULL,
        password TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        reachedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS attempts (
        username TEXT NOT NULL REFERENCES users(username),
        level INTEGER NOT NULL REFERENCES questions(level),
        attempt TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX
    IF NOT EXISTS leaderboard ON users(level DESC, reachedAt ASC);