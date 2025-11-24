package handlers

import (
	"net/http"
	"strconv"

	"cookplan/internal/models"
	"cookplan/pkg/db"

	"github.com/gin-gonic/gin"
)

type PantryRequest struct {
	Name   string `json:"name" binding:"required"`
	Amount string `json:"amount"`
}

func AddToPantry(c *gin.Context) {
	userID := c.GetInt("user_id")
	var req PantryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.ExecContext(c, "INSERT INTO pantry (user_id, name, amount) VALUES ($1, $2, $3)", userID, req.Name, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "added"})
}

func GetPantry(c *gin.Context) {
	userID := c.GetInt("user_id")
	var items []models.PantryItem
	err := db.DB.SelectContext(c, &items, "SELECT * FROM pantry WHERE user_id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"pantry": items})
}

func DeletePantry(c *gin.Context) {
	userID := c.GetInt("user_id")
	id, _ := strconv.Atoi(c.Param("id"))
	_, err := db.DB.ExecContext(c, "DELETE FROM pantry WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}
