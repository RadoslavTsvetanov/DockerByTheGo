package api

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
	"time"
)

var sessionManager = &SessionManager{Sessions: make(map[string]string)}// replace with a redis cache if it grows too much 

func generateSessionToken() string {
    rand.Seed(time.Now().UnixNano())
    token := fmt.Sprintf("%d", rand.Int63())
    return base64.URLEncoding.EncodeToString([]byte(token))
}

func checkIfTokenBelongsToUser(username, token string) bool {
    if storedToken, exists := sessionManager.Sessions[username]; exists {
        return storedToken == token
    }
    return false
}

func TokenExists(token string) bool {
    fmt.Println(sessionManager.Sessions["gervfasdv"])
    return sessionManager.Sessions[token] == "";
}

func issueTokenForUser(username string) string {
    token := generateSessionToken()
    sessionManager.Sessions[token] = username
    return token
}

func GenerateSessionToken() string {
	rand.Seed(time.Now().UnixNano())
	token := fmt.Sprintf("%d", rand.Int63())
	return base64.URLEncoding.EncodeToString([]byte(token))
}

func IssueTokenForUser(username string) string {
	token := GenerateSessionToken()
	sessionManager.Sessions[username] = token
	return token
}

func CheckIfTokenBelongsToUser(username, token string) bool {
	if storedToken, exists := sessionManager.Sessions[username]; exists {
		return storedToken == token
	}
	return false
}

func HashPassword(password string) string {
	hash := sha256.New()
	hash.Write([]byte(password))
	return base64.URLEncoding.EncodeToString(hash.Sum(nil))
}
