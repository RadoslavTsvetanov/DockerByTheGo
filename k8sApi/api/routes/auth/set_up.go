package api

import (
	"github.com/gin-gonic/gin"
)

func setupAuthRouter() *gin.Engine {
	// Create a Gin router
	router := gin.Default()

	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/login", func(c* gin.Context){})
		authRoutes.POST("/register", func(c* gin.Context){})
	}

	return router
}
