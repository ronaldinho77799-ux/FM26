// ui-router.js - simple view management + new game flow
import * as DB from './db.js';
import * as Store from './store.js';

export function init(){
  // populate league select
  const leagues = DB.getLeagues();
  const sel = document.getElementById('selectLeague');
  sel.innerHTML = '';
  leagues.forEach(l=>{ const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; sel.appendChild(o); });
  sel.addEventListener('change', onLeagueChange);
  onLeagueChange();
}

function onLeagueChange(){
  const lid = document.getElementById('selectLeague').value;
  const clubs = DB.getClubsByLeague(lid);
  const sel = document.getElementById('selectClub'); sel.innerHTML = '';
  clubs.forEach(c=>{ const o = document.createElement('option'); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
}

export async function createCareer({ leagueId, clubId, manager, diff }){
  // minimal career creation: save meta and active save
  const save = await Store.saveNow(manager+'_'+Date.now());
  localStorage.setItem('fm_active_save', save.meta.id);
  // set up initial state - basic
  const payload = { meta: { id: save.meta.id, name: manager+' career', date: (new Date()).toISOString().slice(0,10), season:'2026' }, db: save.db, state: { clubId, leagueId, manager: { name: manager }, difficulty: diff } };
  localStorage.setItem('fm_m1_save_'+save.meta.id, JSON.stringify(payload));
  alert('Карьера создана');
  showView('office');
  renderOffice(payload);
}

export function showView(name){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); const el = document.getElementById('view-'+name) || document.getElementById('view-'+name) || document.getElementById('view-'+name); const viewId = 'view-'+name; const target = document.getElementById(viewId); if(target) target.classList.add('active'); 
}

export function renderOffice(payload){ const el = document.getElementById('officeSummary'); const active = payload || Store.getActiveSave(); if(!active){ el.innerHTML = 'Карьера не запущена'; return; } const meta = active.meta || {}; const state = active.state || {}; const club = DB.getClub(state.clubId) || { name:'—' };
  el.innerHTML = `<div><strong>Клуб:</strong> ${club.name}</div><div><strong>Менеджер:</strong> ${state.manager?state.manager.name:'—'}</div><div><strong>Сезон:</strong> ${meta.season||'—'}</div>`;
}

