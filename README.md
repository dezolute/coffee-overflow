# Cookplan – Culinary Assistant

Приложение для планирования меню и управления продуктами.  
Бэкенд написан на **Go (Gin + PostgreSQL)**, фронтенд на **React**.  
Есть миграции базы данных через **goose** и тестовый пользователь для демонстрации.

---

## 📌 Структура проекта

- **backend/** – исходный код Go API
- **frontend/** – React-приложение
- **backend/migrations/** – SQL-миграции для базы данных

---

## 🧑‍💻 Тестовый пользователь

- **Email:** `demo@cookplan.ru`  
- **Пароль:** `12345`  

Пользователь создаётся автоматически при применении миграций.

---

## ⚙️ Требования

- **Go** 1.22+
- **PostgreSQL** 16+
- **Node.js** 18+ и npm/yarn
- Установленный инструмент миграций **goose**

---

## 🚀 Запуск проекта

### 1. Настройка базы данных

1. Запустите PostgreSQL локально.  
2. Создайте базу данных:
   ```bash
   createdb coffee_api
   ```

---

### 2. Применение миграций

1. Установите goose:
   ```bash
   go install github.com/pressly/goose/v3/cmd/goose@latest
   ```
2. Перейдите в папку backend:
   ```bash
   cd backend
   ```
3. Примените миграции:
   ```bash
   goose -dir ./migrations postgres "postgres://postgres:1234@localhost:5432/coffee_api?sslmode=disable" up
   ```

---

### 3. Запуск бэкенда

1. Соберите и запустите API:
   ```bash
   cd backend
   go build -o cookplan-api ./cmd/api
   ./cookplan-api
   ```
2. Сервер будет доступен по адресу:
   ```
   http://localhost:8080/
   ```

---

### 4. Запуск фронтенда

1. Установите зависимости:
   ```bash
   cd frontend
   npm install
   ```
2. Запустите dev-сервер:
   ```bash
   npm start
   ```
3. Откройте приложение:
   ```
   http://localhost:3000
   ```

---

## 📚 API маршруты

- **Recipes**
  - `GET /api/recipes`
  - `POST /api/recipes`
- **Menu**
  - `GET /api/menu`
  - `POST /api/menu`
- **Pantry**
  - `POST /api/pantry`
- **Shopping list**
  - `POST /api/shopping-list`
- **Suggestions**
  - `GET /api/suggest-recipes`

---