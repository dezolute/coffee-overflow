-- +goose Up
SET client_encoding TO 'UTF8';

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    username TEXT
);

CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    portions INT DEFAULT 1,
    steps TEXT DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'dinner',
    portions INT NOT NULL DEFAULT 1,
    UNIQUE(user_id, recipe_id, date, meal_type)
);

CREATE TABLE IF NOT EXISTS pantry (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount TEXT
);

CREATE INDEX IF NOT EXISTS idx_menu_user_date ON menu_items(user_id, date);
CREATE INDEX IF NOT EXISTS idx_pantry_user ON pantry(user_id);

-- +goose Down
DROP TABLE IF EXISTS pantry;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;
