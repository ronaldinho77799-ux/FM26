extends Node
class_name MatchEngine

signal match_finished(result: Dictionary)

func _ready() -> void:
	pass

func simulate_match(home: Dictionary, away: Dictionary, seed: int = 0) -> Dictionary:
	# home/away: {roster: [...], ovr_team: int}
	var rng := RandomNumberGenerator.new()
	if seed != 0:
		rng.seed = seed
	else:
		rng.randomize()
	# простой базовый коэффициент xG
	var home_adv := 0.12
	var base_home := max(0.1, float(home.get("ovr_team",50)) / 40.0) # примерно 0.5-2.0
	var base_away := max(0.1, float(away.get("ovr_team",50)) / 45.0)
	base_home *= 1.0 + home_adv
	var lambda_home := base_home
	var lambda_away := base_away
	var goals_home := _poisson_sample(lambda_home, rng)
	var goals_away := _poisson_sample(lambda_away, rng)
	var events := []
	var total_minutes := 90
	for i in range(goals_home):
		var minute := rng.randi_range(1, total_minutes)
		events.append({"minute": minute, "team": "home", "type": "goal", "player_id": _pick_scorer(home, rng)})
	for i in range(goals_away):
		var minute := rng.randi_range(1, total_minutes)
		events.append({"minute": minute, "team": "away", "type": "goal", "player_id": _pick_scorer(away, rng)})
	events.sort_custom(self, "_sort_events")
	var result := {
		"home_score": goals_home,
		"away_score": goals_away,
		"events": events
	}
	emit_signal("match_finished", result)
	return result

func _poisson_sample(lambda_val: float, rng: RandomNumberGenerator) -> int:
	var L := exp(-lambda_val)
	var k := 0
	var p := 1.0
	while p > L and k < 15:
		k += 1
		p *= rng.randf()
	return k - 1

func _pick_scorer(team: Dictionary, rng: RandomNumberGenerator) -> int:
	var roster := team.get("roster", [])
	if roster.size() == 0:
		return -1
	var weights := []
	var total := 0.0
	for p in roster:
		var w := float(p.get("attributes", {}).get("shoot", 50)) * max(1.0, float(p.get("ovr",50)) / 50.0)
		weights.append(w)
		total += w
	var r := rng.randf() * total
	var acc := 0.0
	for i in range(roster.size()):
		acc += weights[i]
		if r <= acc:
			return int(roster[i].get("id", -1))
	return int(roster[-1].get("id", -1))

func _sort_events(a: Dictionary, b: Dictionary) -> int:
	return int(a.get("minute",0)) - int(b.get("minute",0))
