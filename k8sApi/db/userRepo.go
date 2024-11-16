package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

// UserRepo manages database operations for users
type UserRepo struct {
	db *sql.DB
}

// NewUserRepo creates a new UserRepo instance
func NewUserRepo(dbPath string) (*UserRepo, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	// Create the users table if it doesn't exist
	schema := `
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        token TEXT
    );`
	if _, err := db.Exec(schema); err != nil {
		return nil, err
	}

	return &UserRepo{db: db}, nil
}

// CreateUser adds a new user to the database
func (repo *UserRepo) CreateUser(username, password, token string) error {
	query := `INSERT INTO users (username, password, token) VALUES (?, ?, ?)`
	_, err := repo.db.Exec(query, username, password, token)
	return err
}

// GetUser retrieves a user's details by username
func (repo *UserRepo) GetUser(username string) (string, string, string, error) {
	query := `SELECT username, password, token FROM users WHERE username = ?`
	row := repo.db.QueryRow(query, username)

	var uName, password, token string
	if err := row.Scan(&uName, &password, &token); err != nil {
		return "", "", "", err
	}

	return uName, password, token, nil
}

func (repo *UserRepo) GetToken(username string) (string, error) {
	query := `SELECT token FROM users WHERE username = ?`
	row := repo.db.QueryRow(query, username)

	var token string
	if err := row.Scan(&token); err != nil {
		return "", err
	}

	return token, nil
}
