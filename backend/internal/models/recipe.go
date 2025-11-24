package models

import "github.com/jmoiron/sqlx/types"

type Recipe struct {
	ID       int            `db:"id" json:"id"`
	Title    string         `db:"title" json:"title"`
	Portions int            `db:"portions" json:"portions"`
	Steps    types.JSONText `db:"steps" json:"steps"`
	IsPublic bool           `db:"is_public" json:"is_public,omitempty"`
	UserID   int            `db:"user_id" json:"user_id"`
}

type RecipeFull struct {
	Recipe      Recipe    `json:"recipe"`
	Ingredients []Product `json:"ingredients"`
}

type SuggestedRecipe struct {
	Recipe             Recipe   `json:"recipe"`
	MatchPercent       float64  `json:"match_percent"`
	MissingIngredients []string `json:"missing_ingredients"`
	ExtraIngredients   []string `json:"extra_ingredients,omitempty"`
	CanCook            bool     `json:"can_cook"`
}
