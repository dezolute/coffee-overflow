package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"cookplan/internal/models"
	"cookplan/pkg/db"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx/types"
)

type RecipeWithDetails struct {
	ID          int                 `json:"id"`
	Title       string              `json:"title"`
	Portions    int                 `json:"portions"`
	Steps       []string            `json:"steps"`
	Ingredients []models.Ingredient `json:"ingredients"`
}

type IngredientInput struct {
	Name   string `json:"name" binding:"required"`
	Amount string `json:"amount" binding:"required"`
}

type CreateRecipeRequest struct {
	Title       string            `json:"title" binding:"required"`
	Portions    int               `json:"portions"`
	Steps       []string          `json:"steps"`
	Ingredients []IngredientInput `json:"ingredients"`
}

func GetRecipes(c *gin.Context) {
	userID := c.GetInt("user_id")

	query := `
		SELECT 
			r.id, r.title, r.portions, r.steps,
			p.name AS ing_name, ri.amount AS ing_amount
		FROM recipes r
		LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
		LEFT JOIN products p ON p.id = ri.product_id
		WHERE r.user_id = $1 OR r.is_public = true
		ORDER BY r.is_public DESC, r.id DESC
	`

	rows, err := db.DB.QueryxContext(c, query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	recipesMap := make(map[int]*RecipeWithDetails)
	var order []int

	for rows.Next() {
		var r RecipeWithDetails
		var stepsJSON types.JSONText
		var ingName, ingAmount sql.NullString

		err := rows.Scan(
			&r.ID, &r.Title, &r.Portions,
			&stepsJSON, &ingName, &ingAmount,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var steps []string
		if err := stepsJSON.Unmarshal(&steps); err != nil {
			steps = []string{}
		}
		r.Steps = steps

		if _, exists := recipesMap[r.ID]; !exists {
			recipesMap[r.ID] = &RecipeWithDetails{
				ID:          r.ID,
				Title:       r.Title,
				Portions:    r.Portions,
				Steps:       steps,
				Ingredients: []models.Ingredient{},
			}
			order = append(order, r.ID)
		}

		if ingName.Valid && ingAmount.Valid {
			recipesMap[r.ID].Ingredients = append(recipesMap[r.ID].Ingredients, models.Ingredient{
				Name:   ingName.String,
				Amount: ingAmount.String,
			})
		}
	}

	var result []RecipeWithDetails
	for _, id := range order {
		result = append(result, *recipesMap[id])
	}

	c.JSON(http.StatusOK, gin.H{"recipes": result})
}

func CreateRecipe(c *gin.Context) {
	userID := c.GetInt("user_id")
	var req CreateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.Ingredients) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Укажите хотя бы один ингредиент"})
		return
	}

	if req.Portions <= 0 {
		req.Portions = 1
	}

	stepsJSON, _ := json.Marshal(req.Steps)

	tx, err := db.DB.BeginTxx(c, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка транзакции"})
		return
	}

	var recipeID int
	err = tx.QueryRow(`
		INSERT INTO recipes (user_id, title, portions, steps, is_public)
		VALUES ($1, $2, $3, $4, false) RETURNING id
	`, userID, req.Title, req.Portions, stepsJSON).Scan(&recipeID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, ing := range req.Ingredients {
		var productID int

		err := tx.Get(&productID, "SELECT id FROM products WHERE LOWER(name) = LOWER($1)", ing.Name)
		if err != nil {

			err = tx.QueryRow("INSERT INTO products (name) VALUES ($1) RETURNING id", ing.Name).Scan(&productID)
			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать ингредиент: " + ing.Name})
				return
			}
		}

		_, err = tx.Exec(`
			INSERT INTO recipe_ingredients (recipe_id, product_id, amount)
			VALUES ($1, $2, $3)
			ON CONFLICT (recipe_id, product_id) DO UPDATE SET amount = EXCLUDED.amount
		`, recipeID, productID, ing.Amount)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{
		"message": "Рецепт успешно создан!",
		"id":      recipeID,
	})
}
