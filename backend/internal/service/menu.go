package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"

	"cookplan/internal/models"
	"cookplan/pkg/db"
)

var ErrRecipeNotFound = errors.New("рецепт не найден")

type MenuService struct{}

func (s *MenuService) AddItem(ctx context.Context, userID, recipeID int, date time.Time, mealType string, portions int) (int, error) {
	if portions <= 0 {
		portions = 1
	}
	if mealType == "" {
		mealType = "dinner"
	}

	var exists bool
	err := db.DB.GetContext(ctx, &exists, "SELECT EXISTS(SELECT 1 FROM recipes WHERE id = $1)", recipeID)
	if err != nil || !exists {
		return 0, ErrRecipeNotFound
	}

	var id int

	query := `
		INSERT INTO menu_items (user_id, recipe_id, date, meal_type, portions)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id, recipe_id, date, meal_type) DO UPDATE 
		SET portions = menu_items.portions + EXCLUDED.portions
		RETURNING id`
	err = db.DB.QueryRowxContext(ctx, query, userID, recipeID, date.Format("2006-01-02"), mealType, portions).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (s *MenuService) GetMenu(ctx context.Context, userID int, from, to time.Time) ([]models.MenuDay, error) {
	query := `
		SELECT 
			mi.id AS menu_id, mi.date, mi.meal_type, mi.portions AS menu_portions,
			r.id AS recipe_id, r.title, r.portions AS recipe_portions,
			p.name AS ing_name, ri.amount AS ing_amount
		FROM menu_items mi
		JOIN recipes r ON r.id = mi.recipe_id
		LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
		LEFT JOIN products p ON p.id = ri.product_id
		WHERE mi.user_id = $1 AND mi.date BETWEEN $2 AND $3
		ORDER BY mi.date, mi.meal_type
	`

	rows, err := db.DB.QueryxContext(ctx, query, userID, from.Format("2006-01-02"), to.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type key struct {
		date     time.Time
		mealType string
		recipeID int
	}

	temp := make(map[key]*models.MenuItemDetailed)

	for rows.Next() {
		var (
			menuID         int
			date           time.Time
			mealType       string
			menuPortions   int
			recipeID       int
			title          string
			recipePortions int
			ingName        sql.NullString
			ingAmount      sql.NullString
		)

		err := rows.Scan(
			&menuID, &date, &mealType, &menuPortions,
			&recipeID, &title, &recipePortions,
			&ingName, &ingAmount,
		)
		if err != nil {
			return nil, err
		}

		k := key{
			date:     date.Truncate(24 * time.Hour),
			mealType: mealType,
			recipeID: recipeID,
		}

		if _, exists := temp[k]; !exists {
			temp[k] = &models.MenuItemDetailed{
				ID:             menuID,
				Portions:       menuPortions,
				Recipe:         models.Recipe{ID: recipeID, Title: title},
				RecipePortions: recipePortions,
				Ingredients:    []models.CalculatedIngredient{},
			}
		}

		if ingName.Valid && ingAmount.Valid {
			multiplier := float64(menuPortions) / float64(recipePortions)
			newAmount := recalculateAmount(ingAmount.String, multiplier)
			temp[k].Ingredients = append(temp[k].Ingredients, models.CalculatedIngredient{
				Name:   ingName.String,
				Amount: newAmount,
			})
		}
	}

	daysMap := make(map[time.Time]*models.MenuDay)
	for k, item := range temp {
		day := k.date
		if _, ok := daysMap[day]; !ok {
			daysMap[day] = &models.MenuDay{
				Date:  day,
				Meals: make(map[string][]models.MenuItemDetailed),
			}
		}
		daysMap[day].Meals[k.mealType] = append(daysMap[day].Meals[k.mealType], *item)
	}

	var result []models.MenuDay
	for _, day := range daysMap {
		result = append(result, *day)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Date.Before(result[j].Date)
	})

	return result, nil
}

func recalculateAmount(original string, multiplier float64) string {
	if multiplier == 1.0 {
		return original
	}
	num, unit := parseAmount(original)
	if num == 0 {
		return original
	}
	newNum := num * multiplier
	if strings.Contains(strings.ToLower(unit), "шт") {
		newNum = math.Ceil(newNum)
	} else {
		newNum = math.Round(newNum*10) / 10
	}
	return formatAmount(newNum, unit)
}

func parseAmount(s string) (float64, string) {
	parts := strings.Fields(s)
	if len(parts) < 2 {
		return 1, s
	}
	num, _ := strconv.ParseFloat(parts[0], 64)
	return num, parts[1]
}

func formatAmount(num float64, unit string) string {
	return fmt.Sprintf("%.1f %s", num, unit)
}
