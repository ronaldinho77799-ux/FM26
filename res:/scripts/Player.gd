extends Resource
class_name Player

@export var id: int = 0
@export var name: String = "Игрок"
@export var birth_year: int = 2004
@export var nationality: String = "Unknown"
@export var positions: Array = [] # ["ST","LW"]
@export var ovr: int = 50
@export var pot: int = 60
@export var attributes: Dictionary = {
	"pace": 50,
	"accel": 50,
	"shoot": 50,
	"pass": 50,
	"dribble": 50,
	"tech": 50,
	"vision": 50,
	"cross": 50,
	"long_pass": 50,
	"tackle": 50,
	"interception": 50,
	"strength": 50,
	"stamina": 50,
	"jump": 50,
	"reaction": 50,
	"gk_diving": 0,
	"gk_handling": 0,
	"gk_reflexes": 0
}
@export var value: int = 100000
@export var wage: int = 1000
@export var contract_end_year: int = 0
@export var club_id: int = -1
@export var status: String = "active" # injured, suspended, retired
@export var history: Array = []

func to_dict() -> Dictionary:
	return {
		"id": id,
		"name": name,
		"birth_year": birth_year,
		"nationality": nationality,
		"positions": positions,
		"ovr": ovr,
		"pot": pot,
		"attributes": attributes,
		"value": value,
		"wage": wage,
		"contract_end_year": contract_end_year,
		"club_id": club_id,
		"status": status,
		"history": history
	}

func from_dict(d: Dictionary) -> void:
	id = d.get("id", id)
	name = d.get("name", name)
	birth_year = d.get("birth_year", birth_year)
	nationality = d.get("nationality", nationality)
	positions = d.get("positions", positions)
	ovr = int(d.get("ovr", ovr))
	pot = int(d.get("pot", pot))
	attributes = d.get("attributes", attributes)
	value = int(d.get("value", value))
	wage = int(d.get("wage", wage))
	contract_end_year = int(d.get("contract_end_year", contract_end_year))
	club_id = int(d.get("club_id", club_id))
	status = d.get("status", status)
	history = d.get("history", history)
