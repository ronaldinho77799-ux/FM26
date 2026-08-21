// db.js - data layer: load sample DB and provide basic API
let DB = { players: {}, clubs: {}, leagues: {} };

export async function init(){
  try{
    const r = await fetch('/data/sample_db.json');
    if(!r.ok) throw new Error('HTTP ' + r.status);
    DB = await r.json();
    console.log('DB loaded', DB);
  }catch(e){
    console.warn('Failed load sample DB, using minimal dataset', e);
    DB = {
      players: { '1': { id:1, name:'Ivan Petrov', age:24, nationality:'Russia', pos:'CM', ovr:66, pot:72, club:101 } },
      clubs: { '101': { id:101, name:'FC Red', country:'Russia', league:201, budget:1000000, wage_budget:50000, prestige:40 } },
      leagues: { '201': { id:201, name:'Premier Demo', country:'Demo', division:1, teams:10 } }
    };
  }
}

export function getLeagues(){ return Object.values(DB.leagues); }
export function getClubsByLeague(leagueId){ return Object.values(DB.clubs).filter(c=>String(c.league) === String(leagueId)); }
export function getClub(id){ return DB.clubs[String(id)]; }
export function getPlayer(id){ return DB.players[String(id)]; }
export function searchPlayers(q){
  const s = String(q).toLowerCase();
  return Object.values(DB.players).filter(p=> (p.name && p.name.toLowerCase().includes(s)) || (p.nationality && p.nationality.toLowerCase().includes(s)) );
}

export function createPlayer(p){ const id = String(Math.max(0, ...Object.keys(DB.players).map(x=>parseInt(x)))+1); p.id = parseInt(id); DB.players[id]=p; return p; }
export function updatePlayer(id, patch){ Object.assign(DB.players[String(id)], patch); }
export function getDB(){ return DB; }

