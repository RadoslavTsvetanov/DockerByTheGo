package db

import (
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

var Repo, err = NewUserRepo("users.db")
