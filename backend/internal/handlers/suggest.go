package handlers

import (
	"net/http"

	"cookplan/internal/service"

	"github.com/gin-gonic/gin"
)

func SuggestRecipes(c *gin.Context) {
	userID := c.GetInt("user_id")
	service := service.RecipeSuggestService{}
	suggestions, err := service.Suggest(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
}
