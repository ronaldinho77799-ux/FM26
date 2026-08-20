extends Node
class_name GameState

@signal date_changed(new_date : Dictionary)
@signal career_started()

var current_year: int = 2025
var current_month: int = 7
var current_day: int = 1

var season_start_year: int = 2025
var season_end_year: int = 2026

var active_club_id: int = -1
var fixtures: Array = [] # список матчей как {date: {...}, home: club_id, away: club_id, competition: id}
var history: Dictionary = {} # хранит результаты, таблицы и т.д.

func _ready() -> void:
	pass

func start_career(club_id: int, start_date: Dictionary = {"year":2025,"month":7,"day":1}) -> void:
	active_club_id = int(club_id)
	current_year = int(start_date.get("year", current_year))
	current_month = int(start_date.get("month", current_month))
	current_day = int(start_date.get("day", current_day))
	season_start_year = current_year
	season_end_year = current_year + 1
	_generate_sample_fixtures()
	emit_signal("career_started")
	_emit_date_changed()

func _generate_sample_fixtures() -> void:
	# Для MVP: создаём несколько фиктивных матчей с другими клубами из Database
	fixtures.clear()
	var clubs := Database.clubs.values()
	if clubs.size() < 2:
		return
	var opponents := []
	for c in clubs:
		if int(c.get("id", -1)) != active_club_id:
			opponents.append(int(c.get("id", -1)))
	var day_offset := 3
	for opp_id in opponents:
		var d := {"year": current_year, "month": current_month, "day": current_day + day_offset}
		fixtures.append({"date": d, "home": active_club_id, "away": opp_id, "competition": "league"})
		day_offset += 7

func get_next_match() -> Dictionary:
	if fixtures.size() == 0:
		return {}
	# return first future match
	return fixtures[0]

func advance_day(days: int = 1) -> void:
	# упрощённо увеличиваем день, не делаем реалистичную календарную арифметику
	current_day += days
	_emit_date_changed()
	_process_matches_on_date()

func _emit_date_changed() -> void:
	var d := {"year": current_year, "month": current_month, "day": current_day}
	emit_signal("date_changed", d)

func _process_matches_on_date() -> void:
	# проверяем, есть ли матчи в fixtures на текущую дату
	var remaining := []
	for m in fixtures:
		var md := m.get("date", {})
		if int(md.get("year",0)) == current_year and int(md.get("day",0)) == current_day and int(md.get("month",0)) == current_month:
			# симулируем матч
			var home_club := Database.clubs.get(str(m.get("home")), {})
			var away_club := Database.clubs.get(str(m.get("away")), {})
			var home := _club_to_match_team(home_club)
			var away := _club_to_match_team(away_club)
			var res := MatchEngine.simulate_match(home, away)
			# сохраняем результат в history
			if not history.has("matches"):
				history["matches"] = []
			history["matches"].append({"fixture": m, "result": res})
		else:
			remaining.append(m)
	fixtures = remaining

func _club_to_match_team(club: Dictionary) -> Dictionary:
	# Возвращает упрощённые данные: roster (player dicts), ovr_team
	var roster := []
	var team_ovr := 50.0
	var roster_ids := club.get("roster", [])
	if roster_ids == null:
		roster_ids = []
	for pid_key in roster_ids:
		var p := Database.players.get(str(pid_key), null)
		if p != null:
			roster.append(p)
			team_ovr += float(int(p.get("ovr",50))) / max(1, float(roster_ids.size()))
	# fallback
	return {"roster": roster, "ovr_team": int(team_ovr)}

func get_state_snapshot() -> Dictionary:
	return {
		"date": {"year": current_year, "month": current_month, "day": current_day},
		"active_club_id": active_club_id,
		"fixtures": fixtures,
		"history": history
	}
