package db

import (
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

var DB *sqlx.DB
var Redis *redis.Client

func Init() {
	connStr := "postgres://postgres:1234@localhost:5432/coffee_api?sslmode=disable"
	var err error
	DB, err = sqlx.Open("pgx", connStr)
	if err != nil {
		panic(err)
	}
	if err = DB.Ping(); err != nil {
		panic(err)
	}
}
