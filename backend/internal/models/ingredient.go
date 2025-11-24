package models

type Product struct {
	ID   int    `db:"id" json:"id,omitempty"`
	Name string `db:"name" json:"name"`
}

// Ingredient represents a recipe ingredient with optional amount.
type Ingredient struct {
	Name   string `db:"name" json:"name"`
	Amount string `db:"amount,omitempty" json:"amount,omitempty"`
}
