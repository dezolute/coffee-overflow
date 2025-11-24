package models

import "time"

type MenuItem struct {
	ID       int       `db:"id" json:"id"`
	UserID   int       `db:"user_id" json:"user_id"`
	RecipeID int       `db:"recipe_id" json:"recipe_id"`
	Date     time.Time `db:"date" json:"date"`
	MealType string    `db:"meal_type" json:"meal_type"`
	Portions int       `db:"portions" json:"portions"`
}

type MenuItemFull struct {
	Portions       int       `json:"portions"`
	RecipePortions int       `json:"recipe_portions"`
	Ingredients    []Product `json:"ingredients"`
}

type MenuItemDetailed struct {
	ID             int                    `json:"id,omitempty"`
	Portions       int                    `json:"portions"`
	Recipe         Recipe                 `json:"recipe"`
	RecipePortions int                    `json:"recipe_portions"`
	CookingTime    int                    `json:"cooking_time"`
	Ingredients    []CalculatedIngredient `json:"ingredients"`
}

type CalculatedIngredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
}

type MenuDay struct {
	Date  time.Time                     `json:"date"`
	Meals map[string][]MenuItemDetailed `json:"meals"`
}
