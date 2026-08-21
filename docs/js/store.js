// store.js - save/load/export simple JSON saves into localStorage
const SAVE_PREFIX = 'fm_m1_save_';

export function saveNow(name="Save"){
  const id = 's'+Date.now();
  const meta = { id, name, date: (new Date()).toISOString().slice(0,10), season: '2026' };
  // minimal save: DB + meta + empty game state
  return getFullSave().then(full=>{
    const payload = { meta, db: full.db, state: full.state };
    localStorage.setItem(SAVE_PREFIX+id, JSON.stringify(payload));
    alert('Сохранено: '+name);
    return payload;
  });
}

export function autoSave(){ // overwrite quickslot
  const id = 'autosave';
  const meta = { id, name:'Autosave', date:(new Date()).toISOString().slice(0,10), season:'2026' };
  return getFullSave().then(full=>{
    const payload = { meta, db: full.db, state: full.state };
    localStorage.setItem(SAVE_PREFIX+id, JSON.stringify(payload));
    document.getElementById('autosaveState').textContent = new Date().toLocaleTimeString();
    return payload;
  });
}

async function getFullSave(){
  // read DB from db module
  const dbModule = await import('./db.js');
  return { db: dbModule.getDB(), state: { /* game state placeholder */ } };
}

export function listSaves(){
  const keys = Object.keys(localStorage).filter(k=>k.startsWith(SAVE_PREFIX) && k!==SAVE_PREFIX+'autosave');
  return keys.map(k=>{ const v = JSON.parse(localStorage.getItem(k)); return { id: v.meta.id, name: v.meta.name, meta: v.meta }; }).reverse();
}

export function loadById(id){ const key = SAVE_PREFIX+id; const raw = localStorage.getItem(key); if(!raw) { alert('Сохранение не найдено'); return null; } const payload = JSON.parse(raw); // apply into DB & state
  // naive: overwrite db module - in real project use API
  import('./db.js').then(db=>{ const D = db.getDB(); Object.assign(D, payload.db); });
  localStorage.setItem('fm_active_save', id);
  alert('Загружено: '+payload.meta.name);
  return payload;
}

export function deleteById(id){ localStorage.removeItem(SAVE_PREFIX+id); }

export function getActiveSave(){ const id = localStorage.getItem('fm_active_save'); if(!id) return null; const raw = localStorage.getItem(SAVE_PREFIX+id); if(!raw) return null; return JSON.parse(raw); }

export function exportSave(){ const active = getActiveSave(); if(!active){ alert('Нет активного сохранения'); return; } const data = JSON.stringify(active); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = (active.meta.name || 'fm_save')+'.json'; a.click(); URL.revokeObjectURL(url); }

export function importFile(e){ const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = function(){ try{ const json = JSON.parse(reader.result); const id = json.meta && json.meta.id ? json.meta.id : 'imp'+Date.now(); localStorage.setItem(SAVE_PREFIX+id, JSON.stringify(json)); alert('Импортировано'); }catch(err){ alert('Ошибка импорта: '+err.message); } }; reader.readAsText(f); }

