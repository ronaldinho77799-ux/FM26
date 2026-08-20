# Importer helper (Python) - simple CSV -> JSON merger
# Usage: python3 import_players.py players.csv clubs.csv output.json

import csv
import json
import sys

if len(sys.argv) < 4:
    print('Usage: import_players.py players.csv clubs.csv output.json')
    sys.exit(1)

players_csv = sys.argv[1]
clubs_csv = sys.argv[2]
output = sys.argv[3]

data = { 'players': {}, 'clubs': {}, 'coaches': {} }

with open(players_csv, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        pid = row['id']
        positions = row.get('positions','').split('|') if row.get('positions') else []
        data['players'][pid] = {
            'id': int(pid),
            'name': row.get('name',''),
            'name_ru': row.get('name_ru',''),
            'birth_year': int(row.get('birth_year') or 0),
            'nationality': row.get('nationality',''),
            'positions': positions,
            'current_club_id': int(row.get('current_club_id') or 0),
            'ovr': int(row.get('ovr') or 0),
            'pot': int(row.get('pot') or 0),
            'fifa_rating': int(row.get('fifa_rating') or 0),
            'contract_end_year': int(row.get('contract_end_year') or 0),
            'value': int(row.get('value') or 0),
            'wage': int(row.get('wage') or 0)
        }

with open(clubs_csv, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cid = row['id']
        roster = [int(x) for x in row.get('roster','').split('|') if x.strip()]
        data['clubs'][cid] = {
            'id': int(cid),
            'name': row.get('name',''),
            'country': row.get('country',''),
            'league_id': int(row.get('league_id') or 0),
            'stadium': row.get('stadium',''),
            'budget': int(row.get('budget') or 0),
            'wage_budget': int(row.get('wage_budget') or 0),
            'prestige': int(row.get('prestige') or 0),
            'roster': roster,
            'coach_id': int(row.get('coach_id') or 0)
        }

with open(output, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
