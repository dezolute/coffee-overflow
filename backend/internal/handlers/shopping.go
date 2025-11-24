package handlers

import (
	"net/http"
	"time"

	"cookplan/internal/service"

	"github.com/gin-gonic/gin"
)

type ShoppingRequest struct {
	From string `json:"from"`
	To   string `json:"to"`
}

func GenerateShoppingList(c *gin.Context) {
	userID := c.GetInt("user_id")
	var req ShoppingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	from, _ := time.Parse("2006-01-02", req.From)
	to, _ := time.Parse("2006-01-02", req.To)

	service := service.ShoppingService{}
	list, err := service.Generate(c.Request.Context(), userID, from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"shopping_list": list})
}
