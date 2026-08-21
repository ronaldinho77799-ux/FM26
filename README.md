# Football Manager (Web Prototype)

Этот репозиторий теперь содержит HTML‑прототип (веб‑версию) игры — быстрый просмотр и редактор базы данных (players/clubs/coaches/seasons). README обновлён, чтобы описывать запуск веб‑прототипа и работу с данными.

## Что внутри
- `index.html` — веб‑прототип (UI для просмотра базы, редактор DBEditor и прочее).
- `data/` — текущая база данных: per‑league папки (`data/eng_premier/`, `data/esp_laliga/` и т.д.) и объединённый `data/real_db.json`.
- `data/import_status.json` — статус массового импорта лиг (в процессе).
- `data/<league>/` — для каждой лиги: `players.csv`, `clubs.csv`, `coaches.csv`, `seasons.csv`, `real.json`.

## Быстрый запуск локально
1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/ronaldinho77799-ux/FM26.git
   cd FM26
   ```
2. Запустите лёгкий HTTP‑сервер (рекомендуется, чтобы fetch работал корректно):
   - Python 3: `python -m http.server 8000`
   - или, если есть Node: `npx serve .`
3. Откройте в браузере: `http://localhost:8000/` → `index.html`.

4. Чтобы подгрузить последнюю версию базы из репозитория (data/real_db.json) в прототип, откройте DevTools → Console и вставьте:
```javascript
fetch('https://raw.githubusercontent.com/ronaldinho77799-ux/FM26/main/data/real_db.json')
  .then(r => r.json())
  .then(d => { localStorage.setItem('fm26_db_v1', JSON.stringify(d)); location.reload(); });
```
После перезагрузки в интерфейсе откройте "Редактор БД" и ищите игрока/клуб по имени или id.

## GitHub Pages (публичный просмотр)
Если вы хотите публичную ссылку, можно включить GitHub Pages в настройках репозитория и служить `index.html` из ветки `main` (root). Сообщите, если нужно — помогу опубликовать.

## Формат данных
- Валюта: EUR (годовые суммы для wage/value). При желании можно перейти на "месяц" — опция на этапе импорта.
- Основные поля для игроков: `id, name, name_ru, birth_year, nationality, positions, current_club_id, ovr, pot, fifa_rating, attributes, value, wage, contract_end_year, status`.
- season rows: `player_id, season, club_id, appearances, goals, assists, minutes, yellow, red, avg_rating, awards`.

## Процесс импорта и актуальность данных
- Ведётся поэтапный импорт 12 лиг + топ‑40 сборных. Коммиты публикуются по лигам (в папке `data/<league>/`).
- Каждый коммит содержит метаданные и источники, а также пометки о полях, которые являются оценочными (например value/wage).
- Текущий статус импорта доступен в `data/import_status.json`.

## Внесение изменений / вклад
- Для правок README или данных можно открыть PR или править напрямую (если у вас есть доступ). Коммиты по импорту выполняются автоматически из рабочего процесса.

## Примечания
- Это веб‑MVP: интерфейс и данные могут меняться по мере импорта и улучшений. Если нужно, я могу:
  - опубликовать сайт на GitHub Pages; 
  - экспортировать данные в CSV/JSON для сторонних инструментов; 
  - подготовить пакеты для импорта в другие движки/редакторы.

---

Если нужно изменить формулировки, добавить информацию (например инструкции по использованию редактора в интерфейсе), напиши, и я обновлю README ещё раз.