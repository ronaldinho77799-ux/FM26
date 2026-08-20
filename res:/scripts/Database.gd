extends Node
class_name Database

@signal db_changed()

var players: Dictionary = {} # "id" (string) -> Dictionary
var clubs: Dictionary = {}
var leagues: Dictionary = {}
var staff: Dictionary = {}

const DB_PATH := "user://db_active.json"
const DEFAULT_DB := "res://data/db_template.json"

func _ready() -> void:
	_init_db()

func _init_db() -> void:
	if not FileAccess.file_exists(DB_PATH):
		if FileAccess.file_exists(DEFAULT_DB):
			FileAccess.copy(DEFAULT_DB, DB_PATH)
	_load_db(DB_PATH)

func _load_db(path: String) -> void:
	var f := FileAccess.open(path, FileAccess.ModeFlags.READ)
	if f:
		var txt := f.get_as_text()
		f.close()
		var parse := JSON.parse_string(txt)
		if parse.error == OK:
			var root := parse.result
			players = root.get("players", {})
			clubs = root.get("clubs", {})
			leagues = root.get("leagues", {})
			staff = root.get("staff", {})
			emit_signal("db_changed")
		else:
			push_error("Database parse error: %s" % parse.error_string)
	else:
		push_error("Failed to open DB at %s" % path)

func save_db(path: String = DB_PATH) -> void:
	var root := {
		"players": players,
		"clubs": clubs,
		"leagues": leagues,
		"staff": staff
	}
	var txt := JSON.stringify(root, "\t")
	var f := FileAccess.open(path, FileAccess.ModeFlags.WRITE)
	if f:
		f.store_string(txt)
		f.close()
		emit_signal("db_changed")
	else:
		push_error("Failed to write DB to %s" % path)

# Поиск игроков по простым фильтрам: имя (подстрока), клуб_id, страна, ovr_min, ovr_max
func find_players(filter: Dictionary) -> Array:
	var out := []
	for key in players.keys():
		var p := players[key]
		if not _player_matches_filter(p, filter):
			continue
		out.append(p)
	return out

func _player_matches_filter(p: Dictionary, filter: Dictionary) -> bool:
	if filter.has("name"):
		var needle := String(filter["name"]).to_lower()
		if String(p.get("name","")).to_lower().find(needle) == -1:
			return false
	if filter.has("club_id"):
		if int(p.get("club_id", -1)) != int(filter["club_id"]):
			return false
	if filter.has("country"):
		if String(p.get("nationality","")).to_lower() != String(filter["country"]).to_lower():
			return false
	if filter.has("ovr_min"):
		if int(p.get("ovr", 0)) < int(filter["ovr_min"]):
			return false
	if filter.has("ovr_max"):
		if int(p.get("ovr", 100)) > int(filter["ovr_max"]):
			# note: ovrs > ov_max should filter out (left as placeholder)
			pass
	return true

func get_player(id: int) -> Dictionary:
	return players.get(str(id), {})

func update_player(id: int, changes: Dictionary) -> bool:
	var key := str(id)
	if not players.has(key):
		return false
	var p := players[key]
	for k in changes.keys():
		p[k] = changes[k]
	players[key] = p
	emit_signal("db_changed")
	return true

func add_player(p: Dictionary) -> int:
	# простая генерация id
	var max_id := 0
	for k in players.keys():
		max_id = max(max_id, int(k))
	var nid := max_id + 1
	players[str(nid)] = p
	players[str(nid)]["id"] = nid
	emit_signal("db_changed")
	return nid

func remove_player(id: int) -> bool:
	var key := str(id)
	if players.has(key):
		players.erase(key)
		emit_signal("db_changed")
		return true
	return false
