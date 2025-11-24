package models

type PantryItem struct {
	ID     int    `db:"id" json:"id"`
	UserID int    `db:"user_id" json:"user_id"`
	Name   string `db:"name" json:"name"`
	Amount string `db:"amount" json:"amount"`
}
