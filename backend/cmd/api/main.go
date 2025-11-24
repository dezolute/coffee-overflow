package main

import (
	"cookplan/internal/handlers"
	"cookplan/pkg/db"
	"cookplan/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	db.Init()

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	r.POST("/api/register", handlers.Register)
	r.POST("/api/login", handlers.Login)
	api := r.Group("/api")
	api.Use(middleware.AuthRequired())
	{
		api.GET("/recipes", handlers.GetRecipes)
		api.POST("/recipes", handlers.CreateRecipe)
		api.POST("/menu", handlers.AddToMenu)
		api.GET("/menu", handlers.GetMenu)
		api.DELETE("/menu/:id", handlers.RemoveFromMenu)
		api.POST("/pantry", handlers.AddToPantry)
		api.GET("/pantry", handlers.GetPantry)
		api.DELETE("/pantry/:id", handlers.DeletePantry)
		api.POST("/shopping-list", handlers.GenerateShoppingList)
		api.GET("/suggest-recipes", handlers.SuggestRecipes)
	}

	r.Run(":8080")
}
