# Добро пожаловать — Football Manager (MVP) для Godot 4.x

## Требования
- Godot 4.x (рекомендуется 4.1+)

## Установка
1. Склонируйте или скачайте ZIP этого репозитория.
2. Откройте Godot 4.x и выберите "Open Project" -> папку проекта.
3. В Project -> Project Settings -> AutoLoad добавьте следующие автозагрузки (путь — относительно проекта):
   - `res://scripts/Database.gd`  как имя: `Database`
   - `res://scripts/SaveManager.gd` как имя: `SaveManager`
   - `res://scripts/GameState.gd`  как имя: `GameState`
   - `res://scripts/MatchEngine.gd` as name: `MatchEngine`
   - `res://scripts/UIManager.gd`  as name: `UIManager`

## Запуск
- Откройте сцену `res://scenes/MainMenu.tscn` и нажмите Play.
- Нажмите "Новая игра" — создастся тестовая карьера и откроется Office.

## Содержание репозитория
- `res://scripts/` — основные GDScript-файлы (singletons и сущности)
- `res://scenes/` — простые UI-сцены: MainMenu, Office, DBEditor
- `res://data/db_template.json` — тестовая база данных игроков/клубов/лиг

## Примечания
- Это MVP: базовая архитектура. После проверки запуска я могу расширить функционал (трансферы, улучшенный матч-движок, UI и т.д.).
