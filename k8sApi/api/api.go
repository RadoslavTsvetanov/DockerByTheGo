package api

import (
	"fmt"
	. "k8s/db"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// GenerateToken generates a dummy token (replace with a secure implementation)
func GenerateToken(username string) string {
	return fmt.Sprintf("token_for_%s", username)
}

// API contains the UserRepo
type API struct {
	repo *UserRepo
}

// NewAPI creates a new API instance
func NewAPI(repo *UserRepo) *API {
	return &API{repo: repo}
}

// SignupHandler handles user registration
func (api *API) SignupHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required"})
		return
	}

	_, _, _, err := api.repo.GetUser(req.Username)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	token := GenerateToken(req.Username)
	if err := api.repo.CreateUser(req.Username, req.Password, token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "token": token})
}

// LoginHandler handles user login
func (api *API) LoginHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required"})
		return
	}

	username, password, token, err := api.repo.GetUser(req.Username)
	if err != nil || password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	issueTokenForUser(username)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": token})
}

func RequestLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		if(!strings.Contains(path, "/auth")){ 
			if(!TokenExists(c.GetHeader("Auth"))){
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			}
		}

		// Proceed to the next handler
		c.Next()

		status := c.Writer.Status()
		duration := time.Since(start)

		log.Printf("[GIN] %s %s - %d (%v)", method, path, status, duration)
	}
}

// SetupServer sets up and starts the Gin server
func SetupServer(repo *UserRepo) {
	// Initialize the API instance
	api := NewAPI(repo)

	// Create a Gin router
	router := gin.Default()

	// Enable CORS for all origins, methods, and headers
	router.Use(cors.Default())

	// Apply the logger middleware globally
	router.Use(RequestLoggerMiddleware())

	// API routes
	router.POST("/auth/signup", api.SignupHandler)
	router.POST("/auth/login", api.LoginHandler)

	// Placeholder routes for additional endpoints (if required)
	router.GET("/getK8sToken/:username", func(c *gin.Context) {
		
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
	})
	router.POST("/setK8sToken/:username", func(c *gin.Context) {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
	})

	fmt.Println("Server running on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
