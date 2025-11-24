package service

import (
	"context"
	"math"
	"sort"
	"strings"

	"cookplan/internal/models"
	"cookplan/pkg/db"
)

type RecipeSuggestService struct{}

func (s *RecipeSuggestService) Suggest(ctx context.Context, userID int) ([]models.SuggestedRecipe, error) {

	var pantry []models.PantryItem
	err := db.DB.SelectContext(ctx, &pantry,
		`SELECT id, name, amount
         FROM pantry
         WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}

	pantrySet := make(map[string]bool)
	for _, p := range pantry {
		pantrySet[strings.ToLower(strings.TrimSpace(p.Name))] = true
	}

	var recipes []models.Recipe
	err = db.DB.SelectContext(ctx, &recipes,
		`SELECT id, title, portions, steps, is_public
         FROM recipes`)
	if err != nil {
		return nil, err
	}

	result := []models.SuggestedRecipe{}

	for _, recipe := range recipes {
		var ings []struct {
			Name   string `db:"name"`
			Amount string `db:"amount"`
		}
		err = db.DB.SelectContext(ctx, &ings,
			`SELECT p.name, ri.amount
             FROM recipe_ingredients ri
             JOIN products p ON ri.product_id = p.id
             WHERE ri.recipe_id = $1`, recipe.ID)
		if err != nil {
			continue
		}
		if len(ings) == 0 {
			continue
		}

		matched := 0
		var missing []string
		for _, ing := range ings {
			key := strings.ToLower(strings.TrimSpace(ing.Name))
			if pantrySet[key] {
				matched++
			} else {
				missing = append(missing, capitalizeFirst(key))
			}
		}

		matchPercent := float64(matched) / float64(len(ings)) * 100
		canCook := matchPercent >= 95

		result = append(result, models.SuggestedRecipe{
			Recipe:             recipe,
			MatchPercent:       math.Round(matchPercent*10) / 10,
			MissingIngredients: missing,
			CanCook:            canCook,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].CanCook != result[j].CanCook {
			return result[i].CanCook
		}
		return result[i].MatchPercent > result[j].MatchPercent
	})
	if len(result) > 10 {
		result = result[:10]
	}

	return result, nil
}

func capitalizeFirst(s string) string {
	if s == "" {
		return ""
	}
	return strings.ToUpper(s[:1]) + s[1:]
}
