extends Node
class_name UIManager

func change_scene(path: String) -> void:
	var tree := get_tree()
	if tree:
		var err := tree.change_scene_to_file(path)
		if err != OK:
			push_error("Failed to change scene to %s (err %s)" % [path, str(err)])
