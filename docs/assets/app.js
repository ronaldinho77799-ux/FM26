(function(){
  const DB_KEY = 'fm_mvp_db_v1';
  const SAVE_KEY = 'fm_mvp_save_v1';

  // State
  let DB = { players: {}, clubs: {} };
  let SAVE = { league: null };

  // Elements
  const views = {
    menu: document.getElementById('view-menu'),
    editor: document.getElementById('view-editor'),
    league: document.getElementById('view-league'),
    sim: document.getElementById('view-sim')
  };

  const btnNew = document.getElementById('btnNew');
  const btnLoad = document.getElementById('btnLoad');
  const btnEditor = document.getElementById('btnEditor');
  const btnLeague = document.getElementById('btnLeague');
  const btnSim = document.getElementById('btnSim');

  const playersList = document.getElementById('playersList');
  const btnAddPlayer = document.getElementById('btnAddPlayer');
  const btnSaveDb = document.getElementById('btnSaveDb');

  const selectHome = document.getElementById('selectHome');
  const selectAway = document.getElementById('selectAway');
  const btnRunMatch = document.getElementById('btnRunMatch');
  const matchLog = document.getElementById('matchLog');

  const leagueTableEl = document.getElementById('leagueTable');

  // Navigation
  function show(view){
    Object.values(views).forEach(v=>v.style.display='none');
    views[view].style.display = '';
  }

  btnEditor.addEventListener('click', ()=>{ renderEditor(); show('editor'); });
  btnNew.addEventListener('click', ()=>{ newGame(); show('league'); renderLeague(); });
  btnLoad.addEventListener('click', ()=>{ loadSave(); });
  btnLeague.addEventListener('click', ()=>{ renderLeague(); show('league'); });
  btnSim.addEventListener('click', ()=>{ prepareSim(); show('sim'); });

  // Load sample DB if none
  async function ensureDB(){
    const stored = localStorage.getItem(DB_KEY);
    if(stored){ DB = JSON.parse(stored); return; }
    try{
      const r = await fetch('data/sample_db.json');
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      DB = d;
      localStorage.setItem(DB_KEY, JSON.stringify(DB));
    }catch(e){
      console.error('Не удалось загрузить sample_db.json', e);
      // fallback minimal data
      DB = { players: {
        "1":{id:1,name:'Ivan Petrov',ovr:65,positions:['CM'],current_club_id:101},
        "2":{id:2,name:'Alex Smith',ovr:72,positions:['ST'],current_club_id:102}
      }, clubs: {
        101:{id:101,name:'FC Red'},102:{id:102,name:'FC Blue'}
      }};
    }
  }

  function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); alert('База сохранена в localStorage'); }

  // Editor
  function renderEditor(){
    playersList.innerHTML = '';
    const players = Object.values(DB.players || {}).sort((a,b)=>a.id-b.id);
    players.forEach(p=>{
      const el = document.createElement('div'); el.className='player';
      el.innerHTML = `<input data-id="${p.id}" class="pname" value="${p.name}" /><input type="number" class="povr" value="${p.ovr}" style="width:72px" /> <button class="del" data-id="${p.id}">Удалить</button>`;
      playersList.appendChild(el);
    });

    // bind
    playersList.querySelectorAll('.pname').forEach(inp=>{
      inp.addEventListener('change', (e)=>{ const id=e.target.dataset.id; DB.players[id].name = e.target.value; });
    });
    playersList.querySelectorAll('.povr').forEach(inp=>{
      inp.addEventListener('change', (e)=>{ const id=e.target.previousSibling ? e.target.previousSibling.dataset.id : e.target.dataset.id; const iid = inp.previousElementSibling && inp.previousElementSibling.dataset.id || inp.dataset.id; DB.players[iid].ovr = parseInt(inp.value) || 1; });
    });
    playersList.querySelectorAll('.del').forEach(btn=>{ btn.addEventListener('click', (e)=>{ const id=e.target.dataset.id; delete DB.players[id]; renderEditor(); }); });
  }

  btnAddPlayer.addEventListener('click', ()=>{
    const ids = Object.keys(DB.players||{}).map(x=>parseInt(x));
    const newId = ids.length? (Math.max(...ids)+1):1;
    DB.players[newId] = { id:newId, name:'New Player '+newId, ovr:50, positions:['CM'], current_club_id:101 };
    renderEditor();
  });
  btnSaveDb.addEventListener('click', ()=>{ saveDB(); });

  // Simple league / schedule
  function newGame(){
    // create league from clubs
    const clubs = Object.values(DB.clubs);
    const table = clubs.map(c=>({ id:c.id, name:c.name, pts:0, w:0,d:0,l:0, gf:0,ga:0 }));
    SAVE.league = { table, round:0 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));
    alert('Создана новая карьера.');
  }

  function renderLeague(){
    if(!SAVE.league){ leagueTableEl.innerHTML = '<div class="muted">Нет созданной карьеры. Нажмите "Новая игра"</div>'; return; }
    const table = SAVE.league.table.slice().sort((a,b)=>b.pts-a.pts || b.gf-a.gf);
    let html = '<table><thead><tr><th>Клуб</th><th>И</th><th>W</th><th>D</th><th>L</th><th>Г</th><th>П</th><th>Очки</th></tr></thead><tbody>';
    table.forEach(r=>{ const played = r.w+r.d+r.l; html += `<tr><td>${r.name}</td><td>${played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.pts}</td></tr>`; });
    html += '</tbody></table>';
    leagueTableEl.innerHTML = html;
  }

  // Match simulation (very simple)
  function prepareSim(){
    selectHome.innerHTML=''; selectAway.innerHTML='';
    const clubs = Object.values(DB.clubs || {});
    clubs.forEach(c=>{
      const opt1 = document.createElement('option'); opt1.value=c.id; opt1.textContent = c.name; selectHome.appendChild(opt1);
      const opt2 = document.createElement('option'); opt2.value=c.id; opt2.textContent = c.name; selectAway.appendChild(opt2);
    });
    if(clubs.length>=2){ selectAway.selectedIndex = 1; }
    matchLog.innerHTML = '';
  }

  function runMatch(homeId, awayId){
    const homePlayers = Object.values(DB.players || {}).filter(p=>p.current_club_id==homeId);
    const awayPlayers = Object.values(DB.players || {}).filter(p=>p.current_club_id==awayId);
    const sum = arr => arr.reduce((s,p)=>s+(p.ovr||50),0);
    const hScoreBase = sum(homePlayers);
    const aScoreBase = sum(awayPlayers);
    // simple RNG
    const hRand = Math.random()*30;
    const aRand = Math.random()*30;
    const hGoals = Math.max(0, Math.round((hScoreBase/100) + hRand/10 - 1));
    const aGoals = Math.max(0, Math.round((aScoreBase/100) + aRand/10 - 1));

    // update league
    if(SAVE.league){
      const t = SAVE.league.table;
      const homeRow = t.find(r=>r.id==homeId);
      const awayRow = t.find(r=>r.id==awayId);
      homeRow.gf += hGoals; homeRow.ga += aGoals;
      awayRow.gf += aGoals; awayRow.ga += hGoals;
      if(hGoals> aGoals){ homeRow.w++; homeRow.pts +=3; awayRow.l++; }
      else if(hGoals< aGoals){ awayRow.w++; awayRow.pts +=3; homeRow.l++; }
      else { homeRow.d++; awayRow.d++; homeRow.pts +=1; awayRow.pts +=1; }
      localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));
    }

    const log = `<div><strong>${DB.clubs[homeId].name}</strong> ${hGoals} : ${aGoals} <strong>${DB.clubs[awayId].name}</strong></div>`;
    matchLog.innerHTML = log;
    renderLeague();
  }

  btnRunMatch.addEventListener('click', ()=>{
    const h = parseInt(selectHome.value); const a = parseInt(selectAway.value);
    if(h===a){ alert('Выберите разные клубы'); return; }
    runMatch(h,a);
  });

  // Save/load career
  function loadSave(){ const s = localStorage.getItem(SAVE_KEY); if(!s){ alert('Сохранений нет'); return; } SAVE = JSON.parse(s); alert('Игра загружена'); renderLeague(); show('league'); }

  // init
  window.addEventListener('load', async ()=>{ await ensureDB(); // ensure clubs map exists
    // make clubs map if players refer to club ids
    if(!DB.clubs || Object.keys(DB.clubs).length===0){ // try to auto-generate clubs from players
      DB.clubs = {};
      Object.values(DB.players||{}).forEach(p=>{ const cid = p.current_club_id || (100 + (p.id%2)); if(!DB.clubs[cid]) DB.clubs[cid] = { id:cid, name:'Club '+cid }; });
    }
    // normalize
    Object.values(DB.clubs).forEach(c=>{ /* ok */ });
    // attach clubs into DB for quick access
    // render
    prepareSim();
    show('menu');
  });

})();
