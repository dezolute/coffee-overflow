package handlers

import (
	"net/http"

	"cookplan/internal/models"
	"cookplan/pkg/db"
	"cookplan/pkg/jwt"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=4"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	var exists bool
	err := db.DB.Get(&exists, "SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", req.Email)
	if err != nil || exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email уже зарегистрирован"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка шифрования"})
		return
	}

	_, err = db.DB.Exec("INSERT INTO users (email, password_hash) VALUES ($1, $2)", req.Email, string(hash))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Регистрация успешна!"})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	var user models.User
	err := db.DB.Get(&user, "SELECT id, password_hash FROM users WHERE email=$1", req.Email)
	if err != nil || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	token, err := jwt.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка токена"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user_id": user.ID, "email": req.Email})
}
