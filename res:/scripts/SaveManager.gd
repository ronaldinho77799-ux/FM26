extends Node
class_name SaveManager

const SAVE_DIR := "user://saves/"
const SAVE_PREFIX := "career_"
const SAVE_EXT := ".json"

func _ready() -> void:
	_ensure_save_dir()

func _ensure_save_dir() -> void:
	var dir := DirAccess.open(SAVE_DIR)
	if dir == null:
		DirAccess.make_dir_recursive(SAVE_DIR)

func save_game(name: String, state: Dictionary) -> String:
	_ensure_save_dir()
	var filename := SAVE_DIR + SAVE_PREFIX + name + SAVE_EXT
	var meta := {
		"version": 1,
		"saved_at": OS.get_unix_time()
	}
	var root := {"meta": meta, "state": state}
	var txt := JSON.stringify(root, "\t")
	var f := FileAccess.open(filename, FileAccess.ModeFlags.WRITE)
	if f:
		f.store_string(txt)
		f.close()
		return filename
	return ""

func load_game(path: String) -> Dictionary:
	var f := FileAccess.open(path, FileAccess.ModeFlags.READ)
	if f:
		var txt := f.get_as_text()
		f.close()
		var parse := JSON.parse_string(txt)
		if parse.error == OK:
			return parse.result
	return {}
