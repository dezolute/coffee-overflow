package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"cookplan/internal/service"
	"cookplan/pkg/db"

	"github.com/gin-gonic/gin"
)

type MenuRequest struct {
	RecipeID int    `json:"recipe_id" binding:"required"`
	Date     string `json:"date" binding:"required"`
	MealType string `json:"meal_type"`
	Portions int    `json:"portions"`
}

// --- helpers ---

func parseDate(dateStr string) (time.Time, error) {
	if d, err := time.Parse(time.RFC3339, dateStr); err == nil {
		return d, nil
	}
	if d, err := time.Parse("2006-01-02", dateStr); err == nil {
		return d, nil
	}
	return time.Time{}, ErrInvalidDate
}

var ErrInvalidDate = &gin.Error{
	Err:  errors.New("invalid date format"),
	Type: gin.ErrorTypeBind,
}

// --- handlers ---

func AddToMenu(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req MenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные запроса"})
		return
	}

	date, err := parseDate(req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат даты. Используй ISO или YYYY-MM-DD"})
		return
	}

	svm := service.MenuService{}
	mid, err := svm.AddItem(c.Request.Context(), userID, req.RecipeID, date, req.MealType, req.Portions)
	if err != nil {
		if err == service.ErrRecipeNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "added", "id": mid})
}

func RemoveFromMenu(c *gin.Context) {
	userID := c.GetInt("user_id")
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}

	// вариант 1: удаление по числовому ID
	if numID, err := strconv.Atoi(id); err == nil {
		res, err := db.DB.ExecContext(c.Request.Context(),
			"DELETE FROM menu_items WHERE id=$1 AND user_id=$2", numID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rows, _ := res.RowsAffected(); rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "deleted"})
		return
	}

	// вариант 2: составной ключ date__mealType__recipeID
	parts := strings.Split(id, "__")
	if len(parts) != 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	dateStr, mealType := parts[0], parts[1]
	recipeID, err := strconv.Atoi(parts[2])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recipe id"})
		return
	}

	date, err := parseDate(dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат даты. Ожидается YYYY-MM-DD или ISO"})
		return
	}

	res, err := db.DB.ExecContext(c.Request.Context(),
		"DELETE FROM menu_items WHERE user_id=$1 AND recipe_id=$2 AND date=$3 AND meal_type=$4",
		userID, recipeID, date.Format("2006-01-02"), mealType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rows, _ := res.RowsAffected(); rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func GetMenu(c *gin.Context) {
	userID := c.GetInt("user_id")

	from := time.Now()
	to := from.Add(30 * 24 * time.Hour)

	if f := c.Query("from"); f != "" {
		if parsed, err := parseDate(f); err == nil {
			from = parsed
		}
	}
	if t := c.Query("to"); t != "" {
		if parsed, err := parseDate(t); err == nil {
			to = parsed
		}
	}

	svm := service.MenuService{}
	menu, err := svm.GetMenu(c.Request.Context(), userID, from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menu)
}
