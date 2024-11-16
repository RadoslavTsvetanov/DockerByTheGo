package api
import (
	"encoding/base64"
	"crypto/sha256"
)
func hashPassword(password string) string {
	hash := sha256.New()
	hash.Write([]byte(password))
	return base64.URLEncoding.EncodeToString(hash.Sum(nil))
}
