package models

type User struct {
	ID           int    `db:"id" json:"id"`
	Email        string `db:"email" json:"email"`
	PasswordHash string `db:"password_hash" json:"-"`
	Username     string `db:"username" json:"username"`
}
