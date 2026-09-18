const app = document.getElementById('app');
const KEY = 'myStarsV1';
const MODE_KEY = 'myStarsMode';
const PARENT_UNLOCK_KEY = 'myStarsParentUnlocked';
const MUSIC_KEY = 'myStarsMusic';
const PARENT_PIN = '0813';
const TODAY = () => new Date().toISOString().slice(0,10);

const defaultState = () => ({
  childName: 'Superstar',
  stars: 14,
  tasks: [
    {id:'bed', title:'Make my bed', emoji:'🛏️', points:2, active:true},
    {id:'teeth', title:'Brush my teeth', emoji:'🪥', points:2, active:true},
    {id:'toys', title:'Pick up toys', emoji:'🧸', points:3, active:true},
    {id:'dress', title:'Get dressed', emoji:'👕', points:2, active:true}
  ],
  rewards: [
    {id:'ice', title:'Ice Cream', emoji:'🍦', cost:20},
    {id:'movie', title:'Movie Night', emoji:'🍿', cost:35},
    {id:'toy', title:'Small Toy', emoji:'🧸', cost:50},
    {id:'big', title:'Big Surprise', emoji:'🎁', cost:75}
  ],
  completions: {},
  history: [],
  goalRewardId: 'ice'
});

let state = load();
let mode = localStorage.getItem(MODE_KEY) || null;
let parentUnlocked = sessionStorage.getItem(PARENT_UNLOCK_KEY) === 'yes';
let musicEnabled = localStorage.getItem(MUSIC_KEY) === 'on';
let audioCtx = null;
let musicTimer = null;
let musicStep = 0;

function load(){
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return defaultState();
    if (saved.day !== TODAY()) saved.completions = {};
    return {...defaultState(), ...saved, day:TODAY()};
  } catch { return {...defaultState(), day:TODAY()}; }
}
function save(){ state.day = TODAY(); localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function status(id){ return state.completions[id]?.status || 'todo'; }
function activeTasks(){ return state.tasks.filter(t=>t.active); }
function allApproved(){ const list=activeTasks(); return list.length>0 && list.every(t=>status(t.id)==='approved'); }
function approvedCount(){ return activeTasks().filter(t=>status(t.id)==='approved').length; }
function nextGoal(){ return state.rewards.find(r=>r.id===state.goalRewardId) || state.rewards.find(r=>state.stars<r.cost) || state.rewards.at(-1); }
function speak(text){ if(!('speechSynthesis' in window))return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.78;u.pitch=1.02;speechSynthesis.speak(u); }
function greeting(){ const h=new Date().getHours(); return h<12?'GOOD MORNING!':h<18?'GOOD AFTERNOON!':'GOOD EVENING!'; }

function ensureAudio(){
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return null;
  if(!audioCtx)audioCtx=new Ctx();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function tone(freq,duration=.18,delay=0,type='sine',volume=.045){
  const ctx=ensureAudio(); if(!ctx)return;
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.value=freq;
  const start=ctx.currentTime+delay, end=start+duration;
  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.02);
  gain.gain.exponentialRampToValueAtTime(0.0001,end);
  osc.connect(gain);gain.connect(ctx.destination);
  osc.start(start);osc.stop(end+.03);
}
function playSfx(name){
  if(name==='tap'){tone(660,.09,0,'sine',.035);tone(880,.12,.07,'sine',.03);return}
  if(name==='approve'){tone(523,.12,0,'sine',.05);tone(659,.12,.09,'sine',.05);tone(784,.18,.18,'sine',.055);return}
  if(name==='allDone'){[523,659,784,1047].forEach((n,i)=>tone(n,.2,i*.11,'triangle',.055));return}
  if(name==='redeem'){[523,659,784,1047,1319].forEach((n,i)=>tone(n,.22,i*.09,'triangle',.06));tone(784,.45,.48,'sine',.035);return}
  if(name==='wrong'){tone(240,.15,0,'sine',.035);tone(180,.2,.12,'sine',.03)}
}
function musicPulse(){
  const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
  tone(melody[musicStep%melody.length],.3,0,'sine',.014);
  if(musicStep%4===0)tone(melody[musicStep%melody.length]/2,.5,0,'triangle',.008);
  musicStep++;
}
function updateMusicButton(){
  const b=document.getElementById('musicToggle'); if(!b)return;
  b.textContent=musicTimer?'🔇':'🎵';
  b.setAttribute('aria-label',musicTimer?'Turn music off':'Turn music on');
  b.title=musicTimer?'Music on — tap to mute':'Tap for music';
  b.classList.toggle('music-on',!!musicTimer);
}
function startMusic(fromSaved=false){
  if(!fromSaved){musicEnabled=true;localStorage.setItem(MUSIC_KEY,'on')}
  if(!musicEnabled||musicTimer)return;
  const ctx=ensureAudio(); if(!ctx)return;
  musicPulse();
  musicTimer=setInterval(musicPulse,520);
  updateMusicButton();
}
function stopMusic(disable=true){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(disable){musicEnabled=false;localStorage.setItem(MUSIC_KEY,'off')}
  updateMusicButton();
}
function toggleMusic(){
  if(musicTimer){playSfx('tap');stopMusic(true)}
  else startMusic(false);
}

function roleChooser(){
  app.innerHTML = `<section class="card auth"><div class="mascot">🦄</div><h1>My Stars</h1><p class="sub">Choose this device.</p><div class="role-choices"><button id="kid" class="role-card"><strong>👧 Kid Tablet</strong><span>Tasks, stars and rewards.</span></button><button id="parent" class="role-card"><strong>👩‍👧 Parent Phone</strong><span>Approve tasks and manage stars.</span></button></div><p class="notice">Demo version: this device stores its own data. Cloud sync is the next step.</p></section>`;
  document.getElementById('kid').onclick=()=>setMode('kid');
  document.getElementById('parent').onclick=()=>setMode('parent');
}
function setMode(m){
  mode=m;
  localStorage.setItem(MODE_KEY,m);
  if(m==='parent'){
    parentUnlocked=false;
    sessionStorage.removeItem(PARENT_UNLOCK_KEY);
    renderParentPin();
    return;
  }
  renderKid();
}
function changeMode(){
  localStorage.removeItem(MODE_KEY);
  sessionStorage.removeItem(PARENT_UNLOCK_KEY);
  parentUnlocked=false;
  mode=null;
  roleChooser();
}
function render(){
  if(!mode){roleChooser();return}
  if(mode==='parent' && !parentUnlocked){renderParentPin();return}
  mode==='kid'?renderKid():renderParent();
}
function renderParentPin(){
  stopMusic(false);
  app.innerHTML=`<section class="card auth parent-lock">
    <div class="mascot">🔐</div>
    <div class="eyebrow">PARENT ACCESS</div>
    <h2>Enter Parent PIN</h2>
    <p class="sub">This area is for grown-ups.</p>
    <div class="field"><label>4-digit PIN</label><input id="parentPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="Parent PIN"></div>
    <button id="unlockParent" class="btn btn-primary w-full mt14">UNLOCK</button>
    <button id="backToKid" class="btn btn-soft w-full mt10">BACK TO KID MODE</button>
    <div id="pinError" class="notice error" aria-live="polite"></div>
  </section>`;
  const input=document.getElementById('parentPin');
  const unlock=()=>{
    if(input.value===PARENT_PIN){
      playSfx('approve');
      parentUnlocked=true;
      sessionStorage.setItem(PARENT_UNLOCK_KEY,'yes');
      renderParent();
    }else{
      playSfx('wrong');
      document.getElementById('pinError').textContent='Wrong PIN. Try again.';
      input.value='';
      input.focus();
    }
  };
  document.getElementById('unlockParent').onclick=unlock;
  document.getElementById('backToKid').onclick=()=>setMode('kid');
  input.addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});
  setTimeout(()=>input.focus(),50);
}

function renderKid(){
  const goal=nextGoal(), all=allApproved(), done=approvedCount(), total=activeTasks().length;
  const pct=Math.min(100, Math.round((state.stars/goal.cost)*100));
  const road = state.rewards.map(r=>`<div class="road-stop ${state.stars>=r.cost?'reached':''} ${goal.id===r.id?'goal':''}"><div class="road-icon">${r.emoji}</div><div class="road-cost">${r.cost}⭐</div></div>`).join('');
  app.innerHTML = `
    <div class="ambient-stars" aria-hidden="true"><span>✦</span><span>★</span><span>✧</span><span>★</span><span>✦</span></div>
    <div class="kid-shell">
      <div class="kid-left">
        <section class="card topbar kid-hero"><div class="mascot" aria-hidden="true">🦄</div><div class="grow"><div class="eyebrow">${greeting()}</div><h1>${esc(state.childName)} ✨</h1><p class="sub">You can do amazing things today!</p></div><div class="top-actions"><button id="musicToggle" class="icon-btn music-toggle" aria-label="Turn music on">🎵</button><button id="settings" class="icon-btn">⚙️</button></div></section>
        <div class="stats"><section class="card stat star-counter-card"><div class="emoji">⭐</div><div id="kidStarTotal" class="big-num">${state.stars}</div><div class="small">MY STARS</div></section><section class="card stat"><div class="emoji">🏅</div><div class="big-num">${Math.min(4,1+Math.floor(state.history.length/2))}</div><div class="small">MY STICKERS</div></section></div>
        <section class="card progress-card">
          <div class="progress-row"><div><div class="eyebrow">NEXT REWARD</div><h3>${esc(goal.title)} ${goal.emoji}</h3></div><span class="pill">${goal.cost} ⭐</span></div>
          <div class="progress"><div style="width:${pct}%"></div></div>
          <div class="progress-text">${state.stars>=goal.cost?'You have enough stars! 🎉':`${goal.cost-state.stars} more stars!`}</div>
          <div class="reward-roadmap" aria-label="Reward progress">${road}</div>
        </section>
        <section class="card reward-shop"><div class="eyebrow" style="text-align:center">REWARD SHOP</div><p class="sub" style="text-align:center">Finish all today's jobs, then choose.</p><div class="reward-list mt14">${state.rewards.map(r=>rewardHtml(r,all)).join('')}</div><div class="save-hint">Saving your stars can unlock a bigger prize ✨</div></section>
        <section class="card stickers"><h3>MY STICKERS 🏅</h3><div class="sticker-row"><span class="sticker">🌟 First Star</span><span class="sticker ${done>=3?'':'lock'}">🤝 Super Helper</span><span class="sticker ${state.stars>=35?'':'lock'}">🐷 Super Saver</span><span class="sticker ${state.stars>=50?'':'lock'}">🏆 Star Champion</span></div></section>
      </div>
      <div class="kid-right">
        <div class="section-head"><div><h2>TODAY ☀️</h2><p class="sub">Tap when you finish a job.</p></div><span class="pill done-pill">${done}/${total} DONE</span></div>
        ${all?'<section class="all-done-banner"><div class="all-done-emoji">🎉</div><div><strong>ALL DONE!</strong><span>You finished every job today!</span></div><div class="all-done-emoji">⭐</div></section>':''}
        <div class="task-list">${activeTasks().map(taskKidHtml).join('')}</div>
      </div>
    </div>`;
  document.querySelectorAll('.doneBtn').forEach(b=>b.onclick=()=>requestDone(b.dataset.id));
  document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.text));
  document.querySelectorAll('.redeemBtn').forEach(b=>b.onclick=()=>confirmRedeem(b.dataset.id));
  document.querySelectorAll('.saveBtn').forEach(b=>b.onclick=()=>saveTowardBigger(b.dataset.id));
  document.getElementById('settings').onclick=renderKidSettings;
  document.getElementById('musicToggle').onclick=toggleMusic;
  if(musicEnabled && audioCtx) startMusic(true); else updateMusicButton();
  if(state.lastApproved && Date.now()-state.lastApproved.at<15000){
    const info=state.lastApproved;
    delete state.lastApproved;
    save();
    setTimeout(()=>playApprovalAnimation(info),180);
  }
}

function taskKidHtml(t){
  const s=status(t.id); const label=s==='pending'?'WAITING FOR MOM':s==='approved'?'DONE ✓':s==='rejected'?'TRY AGAIN':'I DID IT!';
  return `<section class="card task task-${s}" data-task-card="${t.id}"><div class="task-main"><div class="task-emoji">${t.emoji}</div><div class="grow"><div class="task-title">${esc(t.title)}</div><div class="points">+${t.points} ⭐</div></div><button class="speak" data-text="${esc(t.title)}">🔊</button></div><button class="btn ${s==='approved'?'btn-good':'btn-soft'} w-full mt14 doneBtn" data-id="${t.id}" ${s==='pending'||s==='approved'?'disabled':''}>${label}</button></section>`;
}

function rewardHtml(r,all){
  const enough=state.stars>=r.cost, unlocked=all&&enough;
  const lock=!all?'FINISH JOBS':`${Math.max(0,r.cost-state.stars)} MORE ⭐`;
  return `<div class="reward ${unlocked?'ready':''}"><div class="reward-row"><div class="reward-emoji">${r.emoji}</div><div class="grow"><div class="reward-title">${esc(r.title)}</div><div class="points">${r.cost} ⭐</div></div>${unlocked?'<span class="ready-tag">READY!</span>':`<span class="locked">${lock}</span>`}</div>${unlocked?`<div class="reward-actions"><button class="btn btn-primary redeemBtn" data-id="${r.id}">REDEEM ${r.emoji}</button><button class="btn btn-soft saveBtn" data-id="${r.id}">SAVE MY STARS ⭐</button></div>`:''}</div>`;
}
function requestDone(id){
  const c=state.completions[id]; if(c?.status==='approved'||c?.status==='pending')return;
  const card=document.querySelector('[data-task-card="'+id+'"]');
  if(card) card.classList.add('task-tap');
  playSfx('tap');
  setTimeout(()=>{
    state.completions[id]={status:'pending'};
    save();
    renderKid();
    toast('Great job! Waiting for Mom ⭐');
  }, card?220:0);
}
function saveTowardBigger(id){ const current=state.rewards.find(r=>r.id===id); const bigger=state.rewards.find(r=>r.cost>current.cost); if(!bigger){toast('You reached the biggest prize! 🎉');return} state.goalRewardId=bigger.id; save(); toast(`Saving for ${bigger.title} ${bigger.emoji}`); renderKid(); }
function confirmRedeem(id){ const r=state.rewards.find(x=>x.id===id); if(!r)return; modal(`<div class="prize">${r.emoji}</div><h2>Get ${esc(r.title)}?</h2><p>Use ${r.cost} stars?</p>`,()=>redeem(id)); }
function redeem(id){ const r=state.rewards.find(x=>x.id===id); if(!r||!allApproved()||state.stars<r.cost)return; state.stars-=r.cost; state.history.unshift({title:r.title,emoji:r.emoji,cost:r.cost,date:new Date().toISOString()}); const bigger=state.rewards.find(x=>x.cost>r.cost); if(bigger)state.goalRewardId=bigger.id; save(); celebrate(r); }

function playApprovalAnimation(info){
  playSfx('approve');
  const card=document.querySelector('[data-task-card="'+info.id+'"]');
  const total=document.getElementById('kidStarTotal');
  if(card){
    card.classList.add('approved-burst');
    const fly=document.createElement('div');
    fly.className='flying-star';
    fly.textContent='+'+info.points+' ⭐';
    const r=card.getBoundingClientRect();
    fly.style.left=(r.left+r.width*.55)+'px';
    fly.style.top=(r.top+r.height*.35)+'px';
    document.body.appendChild(fly);
    requestAnimationFrame(()=>fly.classList.add('fly-now'));
    setTimeout(()=>fly.remove(),1000);
  }
  if(total){total.classList.remove('counter-pop');void total.offsetWidth;total.classList.add('counter-pop');}
  if(info.allDone) setTimeout(()=>allDoneCelebration(),450);
}
function allDoneCelebration(){
  playSfx('allDone');
  const layer=document.createElement('div');
  layer.className='mini-celebration';
  layer.innerHTML='<div class="mini-message"><div class="mini-emoji">🎉⭐🎉</div><strong>ALL DONE!</strong><span>Rewards unlocked!</span></div>';
  document.body.appendChild(layer);
  fx(layer);
  setTimeout(()=>layer.remove(),2200);
}

function renderParent(){
  stopMusic(false);
  const pending=activeTasks().filter(t=>status(t.id)==='pending');
  app.innerHTML=`<div class="parent-header"><button id="parentSettings" class="icon-btn">⚙️</button><div><div class="eyebrow">PARENT PHONE</div><h1>${esc(state.childName)}'s My Stars</h1><p class="sub">Approve tasks and manage stars.</p></div></div>
  <section class="card parent-section"><h3>Waiting for approval</h3><div class="pending-list mt10">${pending.length?pending.map(pendingHtml).join(''):'<div class="notice">Nothing waiting right now.</div>'}</div></section>
  <section class="card parent-section"><h3>Stars</h3><div class="grid2 mt10"><button id="minus" class="btn btn-soft">−1 ⭐</button><button id="plus" class="btn btn-soft">+1 ⭐</button></div><div style="text-align:center;font-size:34px;font-weight:950;margin-top:10px">${state.stars} ⭐</div></section>
  <section class="card parent-section"><h3>Add a job</h3><div class="field"><label>Job</label><input id="jobTitle" placeholder="Example: Eat my dinner"></div><div class="grid2"><div class="field"><label>Emoji</label><input id="jobEmoji" value="⭐" maxlength="4"></div><div class="field"><label>Stars</label><input id="jobPoints" type="number" min="1" max="20" value="2"></div></div><button id="addJob" class="btn btn-primary w-full mt14">ADD JOB</button></section>
  <section class="card parent-section"><h3>Reward history</h3><div class="history-list mt10">${historyHtml()}</div></section>
  <div class="status-line">📱 Demo mode · cloud sync coming next</div>`;
  document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>approve(b.dataset.id,true));
  document.querySelectorAll('.reject').forEach(b=>b.onclick=()=>approve(b.dataset.id,false));
  document.getElementById('plus').onclick=()=>{state.stars++;save();renderParent()};
  document.getElementById('minus').onclick=()=>{state.stars=Math.max(0,state.stars-1);save();renderParent()};
  document.getElementById('addJob').onclick=addJob;
  document.getElementById('parentSettings').onclick=renderParentSettings;
}
function pendingHtml(t){return `<div class="pending-item"><strong>${t.emoji} ${esc(t.title)}</strong><div class="small">+${t.points} stars</div><div class="grid2 mt10"><button class="btn btn-good approve" data-id="${t.id}">APPROVE ✓</button><button class="btn btn-warn reject" data-id="${t.id}">NOT YET</button></div></div>`}
function approve(id,yes){
  const t=state.tasks.find(x=>x.id===id); if(!t)return;
  if(yes && status(id)!=='approved') state.stars+=t.points;
  state.completions[id]={status:yes?'approved':'rejected'};
  if(yes) state.lastApproved={id,points:t.points,at:Date.now(),allDone:allApproved()};
  save();
  renderParent();
}
function addJob(){ const title=document.getElementById('jobTitle').value.trim(); const emoji=document.getElementById('jobEmoji').value.trim()||'⭐'; const points=Math.max(1,Math.min(20,Number(document.getElementById('jobPoints').value)||1)); if(!title)return; state.tasks.push({id:'t-'+Date.now(),title,emoji,points,active:true}); save(); renderParent(); }
function historyHtml(){ return state.history.length?state.history.slice(0,8).map(h=>`<div class="history-item"><strong>${h.emoji} ${esc(h.title)}</strong><div class="small">${h.cost} stars · ${new Date(h.date).toLocaleDateString()}</div></div>`).join(''):'<div class="notice">No prizes redeemed yet.</div>'; }

function renderKidSettings(){ app.innerHTML=`<section class="card auth"><div class="mascot">⚙️</div><h2>Tablet Settings</h2><button id="back" class="btn btn-primary w-full mt14">BACK TO MY STARS</button><button id="mode" class="btn btn-soft w-full mt10">CHANGE DEVICE MODE</button></section>`; document.getElementById('back').onclick=renderKid; document.getElementById('mode').onclick=changeMode; }
function renderParentSettings(){ app.innerHTML=`<section class="card auth"><div class="mascot">⚙️</div><h2>Parent Settings</h2><div class="field"><label>Child's name</label><input id="name" maxlength="30" value="${esc(state.childName)}"></div><button id="saveName" class="btn btn-primary w-full mt14">SAVE NAME</button><button id="back" class="btn btn-soft w-full mt10">BACK</button><button id="mode" class="btn btn-soft w-full mt10">CHANGE DEVICE MODE</button></section>`; document.getElementById('saveName').onclick=()=>{const n=document.getElementById('name').value.trim();if(n){state.childName=n;save();renderParent()}}; document.getElementById('back').onclick=renderParent;document.getElementById('mode').onclick=changeMode; }

function modal(body,onYes){ const w=document.createElement('div'); w.className='overlay'; w.innerHTML=`<div class="modal">${body}<div class="grid2 mt14"><button id="yes" class="btn btn-primary">YES!</button><button id="no" class="btn btn-soft">NOT YET</button></div></div>`; document.body.appendChild(w); w.querySelector('#no').onclick=()=>w.remove();w.querySelector('#yes').onclick=()=>{w.remove();onYes()}; }
function celebrate(r){ playSfx('redeem'); const w=document.createElement('div');w.className='overlay';w.innerHTML=`<div class="modal"><div id="fx"></div><div class="prize big-pop">${r.emoji}</div><h2>YOU GOT ${esc(r.title).toUpperCase()}!</h2><p>You worked hard and earned it! 🎉</p><button id="yay" class="btn btn-primary w-full mt14">YAY! 💖</button></div>`;document.body.appendChild(w);fx(w.querySelector('#fx'));w.querySelector('#yay').onclick=()=>{w.remove();renderKid()}; }
function fx(layer){const colors=['#ffd75e','#ff8ec7','#9a6cff','#6fd6a7','#7ac8ff'];for(let i=0;i<34;i++){const c=document.createElement('span');c.className='confetti';c.style.left=((i*29)%96)+'%';c.style.background=colors[i%colors.length];c.style.animationDelay=(i*.025)+'s';layer.appendChild(c)}for(let i=0;i<4;i++){const f=document.createElement('span');f.className='firework';f.style.left=(15+i*23)+'%';f.style.top=(18+(i%2)*18)+'%';f.style.color=colors[i];f.style.animationDelay=(i*.12)+'s';layer.appendChild(f)}for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%2?'⭐':'✨';s.style.left=(8+i*9)+'%';s.style.bottom=(10+(i%3)*8)+'%';s.style.animationDelay=(i*.07)+'s';layer.appendChild(s)}}
function toast(text){const t=document.createElement('div');t.textContent=text;t.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;background:#2e2540;color:white;padding:12px 16px;border-radius:999px;font-weight:850;box-shadow:0 8px 30px rgba(0,0,0,.2);max-width:90%;text-align:center';document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}

if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
render();
