// bootstrap.js - module entry
import * as DB from './db.js';
import * as Store from './store.js';
import * as UI from './ui-router.js';

window.App = { DB, Store, UI };

async function init(){
  await DB.init();
  UI.init();
  bindShell();
  updateHeader();
  loadSavesList();
}

function bindShell(){
  document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click', (e)=>{
    const v = e.target.dataset.view; if(v) UI.showView(v);
  }));
  document.getElementById('startNewBtn').addEventListener('click', ()=> UI.showView('newgame'));
  document.getElementById('openLoadBtn').addEventListener('click', ()=> UI.showView('load'));
  document.getElementById('openSettingsBtn').addEventListener('click', ()=> UI.showView('settings'));

  document.getElementById('createCareerBtn').addEventListener('click', async ()=>{
    const leagueId = document.getElementById('selectLeague').value;
    const clubId = document.getElementById('selectClub').value;
    const manager = document.getElementById('managerName').value || 'Manager';
    const diff = document.getElementById('selectDifficulty').value;
    await UI.createCareer({ leagueId, clubId, manager, diff });
  });

  document.getElementById('cancelNewBtn').addEventListener('click', ()=> UI.showView('menu'));
  document.getElementById('saveBtn').addEventListener('click', ()=> Store.autoSave());
  document.getElementById('manualSaveBtn').addEventListener('click', ()=> Store.saveNow());
  document.getElementById('exportBtn')?.addEventListener('click', ()=> Store.exportSave());
  document.getElementById('importFile')?.addEventListener('change', (e)=> Store.importFile(e));
  document.getElementById('exitBtn')?.addEventListener('click', ()=> { if(confirm('Выйти из игры?')) window.location.reload(); });
}

function updateHeader(){
  const dateEl = document.getElementById('currentDate');
  const seasonEl = document.getElementById('currentSeason');
  const save = Store.getActiveSave();
  if(save && save.meta){
    dateEl.textContent = 'Дата: ' + save.meta.date;
    seasonEl.textContent = 'Сезон: ' + save.meta.season;
  } else {
    dateEl.textContent = 'Дата: —'; seasonEl.textContent = 'Сезон: —';
  }
}

async function loadSavesList(){
  const listEl = document.getElementById('savesList');
  const list = Store.listSaves();
  if(!list.length){ listEl.textContent = 'Сохранений нет'; return; }
  listEl.innerHTML = '';
  list.forEach(s=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div><strong>${s.name}</strong> — ${s.meta.date} <div class="row" style="margin-top:6px"><button class="btn load" data-id="${s.id}">Загрузить</button><button class="btn del" data-id="${s.id}">Удалить</button></div></div>`;
    listEl.appendChild(div);
  });
  listEl.querySelectorAll('.load').forEach(b=>b.addEventListener('click', (e)=>{ Store.loadById(e.target.dataset.id); UI.showView('office'); updateHeader(); }));
  listEl.querySelectorAll('.del').forEach(b=>b.addEventListener('click', (e)=>{ if(confirm('Удалить сохранение?')){ Store.deleteById(e.target.dataset.id); loadSavesList(); } }));
}

window.addEventListener('load', init);
