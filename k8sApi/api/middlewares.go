package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func authenticationMiddleware(c *gin.Context) {
	if strings.Contains(c.Request.URL.Path, "auth") {
		c.Next()
	}
	if TokenExists(c.Request.Header.Get("Authorization")) {
		c.Next()
	} else {
		c.AbortWithError(http.StatusUnauthorized, gin.Error{Meta: map[string]interface{}{"message": "not authorized, mising auth token"}})
	}
}


