-- +goose Up

-- 1. Разрешаем user_id быть NULL для общих рецептов
ALTER TABLE recipes ALTER COLUMN user_id DROP NOT NULL;

-- 2. Создаём таблицу продуктов
CREATE TABLE IF NOT EXISTS products (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 3. Связующая таблица рецепт ↔ продукт
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id  INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount     TEXT NOT NULL,
    PRIMARY KEY (recipe_id, product_id)
);

-- 4. Демопользователь
INSERT INTO users (id, email, password_hash, username)
VALUES (
    1,
    'demo@cookplan.ru',
    '$2a$10$Ch9QiEzm40Pa0Es4R2rrl.goxW0pZn6FdIfcUs2v/iUN4X/oiG.uK', -- пароль 12345
    'Демо-повар'
)
ON CONFLICT (email) DO NOTHING;

-- 5. Рецепты
INSERT INTO recipes (user_id, title, portions, steps, is_public) VALUES
(NULL, 'Овсянка с ягодами', 1, '["Вскипятить молоко", "Залить овсянку", "Добавить мёд"]', true),
(NULL, 'Греческий салат', 2, '["Нарезать овощи", "Добавить фету и оливки"]', true),
(NULL, 'Паста карбонара', 2, '["Обжарить бекон", "Смешать с пастой"]', true),
(NULL, 'Куриный суп', 4, '["Сварить курицу", "Добавить лапшу"]', true),
(NULL, 'Кекс в кружке', 1, '["Смешать всё", "Микроволновка 90 сек"]', true),
(1, 'Борщ', 6, '["Обжарить свёклу", "Сварить говядину"]', false),
(1, 'Тирамису', 8, '["Собрать слоями", "Охладить"]', false),
(1, 'Шаурма', 4, '["Замариновать курицу", "Завернуть в лаваш"]', false)
ON CONFLICT DO NOTHING;

-- 6. Продукты
INSERT INTO products (name) VALUES
('Овсяные хлопья'), ('Молоко'), ('Мёд'), ('Ягоды'),
('Огурцы'), ('Помидоры'), ('Фета'), ('Оливки'),
('Спагетти'), ('Бекон'), ('Яйца'), ('Пармезан'),
('Куриное филе'), ('Лапша'), ('Морковь'),
('Мука'), ('Сахар'), ('Какао'),
('Свёкла'), ('Капуста'), ('Картофель'), ('Говядина'),
('Маскарпоне'), ('Савоярди'), ('Кофе'),
('Лаваш'), ('Курица'), ('Соус')
ON CONFLICT DO NOTHING;

-- 7. Ингредиенты
INSERT INTO recipe_ingredients (recipe_id, product_id, amount)
SELECT r.id, p.id, v.amount
FROM recipes r
JOIN (VALUES
    (1, 'Овсяные хлопья', '100 г'), (1, 'Молоко', '200 мл'), (1, 'Мёд', '1 ст.л.'),
    (2, 'Огурцы', '2 шт'), (2, 'Помидоры', '3 шт'), (2, 'Фета', '150 г'), (2, 'Оливки', '100 г'),
    (3, 'Спагетти', '200 г'), (3, 'Бекон', '150 г'), (3, 'Яйца', '2 шт'), (3, 'Пармезан', '50 г'),
    (4, 'Куриное филе', '300 г'), (4, 'Лапша', '100 г'), (4, 'Морковь', '1 шт'),
    (5, 'Мука', '4 ст.л.'), (5, 'Сахар', '3 ст.л.'), (5, 'Какао', '2 ст.л.'),
    (6, 'Свёкла', '2 шт'), (6, 'Капуста', '300 г'), (6, 'Картофель', '4 шт'), (6, 'Говядина', '500 г'),
    (7, 'Маскарпоне', '500 г'), (7, 'Савоярди', '300 г'), (7, 'Кофе', '200 мл'),
    (8, 'Лаваш', '2 шт'), (8, 'Курица', '400 г'), (8, 'Огурцы', '2 шт'), (8, 'Соус', '100 г')
) AS v(recipe_order, product_name, amount) ON r.id = v.recipe_order
JOIN products p ON p.name = v.product_name
ON CONFLICT DO NOTHING;

-- 8. Pantry
INSERT INTO pantry (user_id, name, amount) VALUES
(1, 'Молоко', '1 л'), (1, 'Яйца', '10 шт'), (1, 'Овсяные хлопья', '500 г'),
(1, 'Помидоры', '1 кг'), (1, 'Картофель', '2 кг')
ON CONFLICT DO NOTHING;

-- 9. Меню
INSERT INTO menu_items (user_id, recipe_id, date, meal_type, portions) VALUES
(1, 1, CURRENT_DATE, 'breakfast', 1),
(1, 4, CURRENT_DATE, 'lunch', 2),
(1, 6, CURRENT_DATE, 'dinner', 3),
(1, 1, CURRENT_DATE + 1, 'breakfast', 1),
(1, 3, CURRENT_DATE + 1, 'dinner', 2),
(1, 2, CURRENT_DATE + 2, 'lunch', 2),
(1, 8, CURRENT_DATE + 2, 'dinner', 2)
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM menu_items WHERE user_id = 1;
DELETE FROM pantry WHERE user_id = 1;
DELETE FROM recipe_ingredients;
DELETE FROM recipes;
DELETE FROM users WHERE id = 1;
TRUNCATE products RESTART IDENTITY;
