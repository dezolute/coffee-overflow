package service

import (
	"context"
	"strings"
	"time"

	"cookplan/internal/models"
	"cookplan/pkg/db"
)

type ShoppingService struct{}

func (s *ShoppingService) Generate(ctx context.Context, userID int, from, to time.Time) ([]models.ShoppingItem, error) {
	query := `
        SELECT mi.portions AS menu_portions,
               r.portions AS recipe_portions,
               p.name     AS product_name,
               ri.amount  AS ing_amount
        FROM menu_items mi
        JOIN recipes r ON r.id = mi.recipe_id
        JOIN recipe_ingredients ri ON ri.recipe_id = r.id
        JOIN products p ON p.id = ri.product_id
        WHERE mi.user_id = $1 AND mi.date BETWEEN $2 AND $3
    `

	rows, err := db.DB.QueryxContext(ctx, query,
		userID,
		from.Format("2006-01-02"),
		to.Format("2006-01-02"),
	)
	if err != nil {
		return []models.ShoppingItem{}, err
	}
	defer rows.Close()

	required := make(map[string]string)

	for rows.Next() {
		var menuPortions, recipePortions int
		var productName, ingAmount string

		if err := rows.Scan(&menuPortions, &recipePortions, &productName, &ingAmount); err != nil {
			continue // можно залогировать
		}

		if recipePortions == 0 {
			continue
		}

		multiplier := float64(menuPortions) / float64(recipePortions)
		newAmount := multiplyAmount(ingAmount, multiplier)

		key := strings.ToLower(strings.TrimSpace(productName))
		if old, exists := required[key]; exists {
			required[key] = addAmounts(old, newAmount)
		} else {
			required[key] = newAmount
		}
	}

	var pantry []models.PantryItem
	err = db.DB.SelectContext(ctx, &pantry,
		`SELECT name, amount
     	FROM pantry
     	WHERE user_id = $1`, userID)

	if err != nil {
		return []models.ShoppingItem{}, err
	}

	pantryMap := make(map[string]string)
	for _, p := range pantry {
		key := strings.ToLower(strings.TrimSpace(p.Name))
		pantryMap[key] = p.Amount
	}

	result := []models.ShoppingItem{}
	for name, needed := range required {
		if have, exists := pantryMap[name]; exists {
			remaining := subtractAmounts(needed, have)
			if remaining != "" && remaining != "0" {
				result = append(result, models.ShoppingItem{
					Name:   capitalize(name),
					Amount: remaining,
				})
			}
		} else {
			result = append(result, models.ShoppingItem{
				Name:   capitalize(name),
				Amount: needed,
			})
		}
	}

	return result, nil
}

func multiplyAmount(amount string, multiplier float64) string {
	num, unit := parseAmount(amount)
	return formatAmount(num*multiplier, unit)
}

func addAmounts(a, b string) string {
	na, ua := parseAmount(a)
	nb, ub := parseAmount(b)
	if ua == ub {
		return formatAmount(na+nb, ua)
	}
	return a + " + " + b
}

func subtractAmounts(needed, have string) string {
	nn, un := parseAmount(needed)
	nh, uh := parseAmount(have)
	if un == uh && nn > nh {
		return formatAmount(nn-nh, un)
	}
	return ""
}

func capitalize(s string) string {
	if s == "" {
		return ""
	}
	return strings.ToUpper(s[:1]) + s[1:]
}
