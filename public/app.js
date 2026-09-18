const app = document.getElementById('app');
const KEY = 'myStarsV1';
const MODE_KEY = 'myStarsMode';
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

function roleChooser(){
  app.innerHTML = `<section class="card auth"><div class="mascot">🦄</div><h1>My Stars</h1><p class="sub">Choose this device.</p><div class="role-choices"><button id="kid" class="role-card"><strong>👧 Kid Tablet</strong><span>Tasks, stars and rewards.</span></button><button id="parent" class="role-card"><strong>👩‍👧 Parent Phone</strong><span>Approve tasks and manage stars.</span></button></div><p class="notice">Demo version: this device stores its own data. Cloud sync is the next step.</p></section>`;
  document.getElementById('kid').onclick=()=>setMode('kid');
  document.getElementById('parent').onclick=()=>setMode('parent');
}
function setMode(m){ mode=m; localStorage.setItem(MODE_KEY,m); render(); }
function changeMode(){ localStorage.removeItem(MODE_KEY); mode=null; roleChooser(); }
function render(){ if(!mode){roleChooser();return} mode==='kid'?renderKid():renderParent(); }

function renderKid(){
  const goal=nextGoal(), all=allApproved(), done=approvedCount(), total=activeTasks().length;
  const pct=Math.min(100, Math.round((state.stars/goal.cost)*100));
  app.innerHTML = `
    <section class="card topbar"><div class="mascot">🦄</div><div class="grow"><div class="eyebrow">${greeting()}</div><h1>${esc(state.childName)} ✨</h1><p class="sub">You can do amazing things today!</p></div><button id="settings" class="icon-btn">⚙️</button></section>
    <div class="stats"><section class="card stat"><div class="emoji">⭐</div><div class="big-num">${state.stars}</div><div class="small">MY STARS</div></section><section class="card stat"><div class="emoji">🏅</div><div class="big-num">${Math.min(4,1+Math.floor(state.history.length/2))}</div><div class="small">MY STICKERS</div></section></div>
    <section class="card progress-card"><div class="progress-row"><div><div class="eyebrow">NEXT REWARD</div><h3>${esc(goal.title)} ${goal.emoji}</h3></div><span class="pill">${goal.cost} ⭐</span></div><div class="progress"><div style="width:${pct}%"></div></div><div class="progress-text">${state.stars>=goal.cost?'You have enough stars! 🎉':`${goal.cost-state.stars} more stars!`}</div></section>
    <div class="section-head"><div><h2>TODAY ☀️</h2><p class="sub">Tap when you finish a job.</p></div><span class="pill">${done}/${total} DONE</span></div>
    <div class="task-list">${activeTasks().map(taskKidHtml).join('')}</div>
    <section class="card reward-shop"><div class="eyebrow" style="text-align:center">REWARD SHOP</div><p class="sub" style="text-align:center">Finish all today's jobs, then choose.</p><div class="reward-list mt14">${state.rewards.map(r=>rewardHtml(r,all)).join('')}</div><div class="save-hint">Saving your stars can unlock a bigger prize ✨</div></section>
    <section class="card stickers"><h3>MY STICKERS 🏅</h3><div class="sticker-row"><span class="sticker">🌟 First Star</span><span class="sticker ${done>=3?'':'lock'}">🤝 Super Helper</span><span class="sticker ${state.stars>=35?'':'lock'}">🐷 Super Saver</span><span class="sticker ${state.stars>=50?'':'lock'}">🏆 Star Champion</span></div></section>`;
  document.querySelectorAll('.doneBtn').forEach(b=>b.onclick=()=>requestDone(b.dataset.id));
  document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.text));
  document.querySelectorAll('.redeemBtn').forEach(b=>b.onclick=()=>confirmRedeem(b.dataset.id));
  document.querySelectorAll('.saveBtn').forEach(b=>b.onclick=()=>saveTowardBigger(b.dataset.id));
  document.getElementById('settings').onclick=renderKidSettings;
}
function taskKidHtml(t){
  const s=status(t.id); const label=s==='pending'?'WAITING FOR MOM':s==='approved'?'DONE ✓':s==='rejected'?'TRY AGAIN':'I DID IT!';
  return `<section class="card task"><div class="task-main"><div class="task-emoji">${t.emoji}</div><div class="grow"><div class="task-title">${esc(t.title)}</div><div class="points">+${t.points} ⭐</div></div><button class="speak" data-text="${esc(t.title)}">🔊</button></div><button class="btn ${s==='approved'?'btn-good':'btn-soft'} w-full mt14 doneBtn" data-id="${t.id}" ${s==='pending'||s==='approved'?'disabled':''}>${label}</button></section>`;
}
function rewardHtml(r,all){
  const enough=state.stars>=r.cost, unlocked=all&&enough;
  const lock=!all?'FINISH JOBS':`${Math.max(0,r.cost-state.stars)} MORE ⭐`;
  return `<div class="reward ${unlocked?'ready':''}"><div class="reward-row"><div class="reward-emoji">${r.emoji}</div><div class="grow"><div class="reward-title">${esc(r.title)}</div><div class="points">${r.cost} ⭐</div></div>${unlocked?'<span class="ready-tag">READY!</span>':`<span class="locked">${lock}</span>`}</div>${unlocked?`<div class="reward-actions"><button class="btn btn-primary redeemBtn" data-id="${r.id}">REDEEM ${r.emoji}</button><button class="btn btn-soft saveBtn" data-id="${r.id}">SAVE MY STARS ⭐</button></div>`:''}</div>`;
}
function requestDone(id){ const c=state.completions[id]; if(c?.status==='approved'||c?.status==='pending')return; state.completions[id]={status:'pending'}; save(); renderKid(); }
function saveTowardBigger(id){ const current=state.rewards.find(r=>r.id===id); const bigger=state.rewards.find(r=>r.cost>current.cost); if(!bigger){toast('You reached the biggest prize! 🎉');return} state.goalRewardId=bigger.id; save(); toast(`Saving for ${bigger.title} ${bigger.emoji}`); renderKid(); }
function confirmRedeem(id){ const r=state.rewards.find(x=>x.id===id); if(!r)return; modal(`<div class="prize">${r.emoji}</div><h2>Get ${esc(r.title)}?</h2><p>Use ${r.cost} stars?</p>`,()=>redeem(id)); }
function redeem(id){ const r=state.rewards.find(x=>x.id===id); if(!r||!allApproved()||state.stars<r.cost)return; state.stars-=r.cost; state.history.unshift({title:r.title,emoji:r.emoji,cost:r.cost,date:new Date().toISOString()}); const bigger=state.rewards.find(x=>x.cost>r.cost); if(bigger)state.goalRewardId=bigger.id; save(); celebrate(r); }

function renderParent(){
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
function approve(id,yes){ const t=state.tasks.find(x=>x.id===id); if(!t)return; if(yes && status(id)!=='approved') state.stars+=t.points; state.completions[id]={status:yes?'approved':'rejected'}; save(); renderParent(); }
function addJob(){ const title=document.getElementById('jobTitle').value.trim(); const emoji=document.getElementById('jobEmoji').value.trim()||'⭐'; const points=Math.max(1,Math.min(20,Number(document.getElementById('jobPoints').value)||1)); if(!title)return; state.tasks.push({id:'t-'+Date.now(),title,emoji,points,active:true}); save(); renderParent(); }
function historyHtml(){ return state.history.length?state.history.slice(0,8).map(h=>`<div class="history-item"><strong>${h.emoji} ${esc(h.title)}</strong><div class="small">${h.cost} stars · ${new Date(h.date).toLocaleDateString()}</div></div>`).join(''):'<div class="notice">No prizes redeemed yet.</div>'; }

function renderKidSettings(){ app.innerHTML=`<section class="card auth"><div class="mascot">⚙️</div><h2>Tablet Settings</h2><button id="back" class="btn btn-primary w-full mt14">BACK TO MY STARS</button><button id="mode" class="btn btn-soft w-full mt10">CHANGE DEVICE MODE</button></section>`; document.getElementById('back').onclick=renderKid; document.getElementById('mode').onclick=changeMode; }
function renderParentSettings(){ app.innerHTML=`<section class="card auth"><div class="mascot">⚙️</div><h2>Parent Settings</h2><div class="field"><label>Child's name</label><input id="name" maxlength="30" value="${esc(state.childName)}"></div><button id="saveName" class="btn btn-primary w-full mt14">SAVE NAME</button><button id="back" class="btn btn-soft w-full mt10">BACK</button><button id="mode" class="btn btn-soft w-full mt10">CHANGE DEVICE MODE</button></section>`; document.getElementById('saveName').onclick=()=>{const n=document.getElementById('name').value.trim();if(n){state.childName=n;save();renderParent()}}; document.getElementById('back').onclick=renderParent;document.getElementById('mode').onclick=changeMode; }

function modal(body,onYes){ const w=document.createElement('div'); w.className='overlay'; w.innerHTML=`<div class="modal">${body}<div class="grid2 mt14"><button id="yes" class="btn btn-primary">YES!</button><button id="no" class="btn btn-soft">NOT YET</button></div></div>`; document.body.appendChild(w); w.querySelector('#no').onclick=()=>w.remove();w.querySelector('#yes').onclick=()=>{w.remove();onYes()}; }
function celebrate(r){ const w=document.createElement('div');w.className='overlay';w.innerHTML=`<div class="modal"><div id="fx"></div><div class="prize big-pop">${r.emoji}</div><h2>YOU GOT ${esc(r.title).toUpperCase()}!</h2><p>You worked hard and earned it! 🎉</p><button id="yay" class="btn btn-primary w-full mt14">YAY! 💖</button></div>`;document.body.appendChild(w);fx(w.querySelector('#fx'));w.querySelector('#yay').onclick=()=>{w.remove();renderKid()}; }
function fx(layer){const colors=['#ffd75e','#ff8ec7','#9a6cff','#6fd6a7','#7ac8ff'];for(let i=0;i<34;i++){const c=document.createElement('span');c.className='confetti';c.style.left=((i*29)%96)+'%';c.style.background=colors[i%colors.length];c.style.animationDelay=(i*.025)+'s';layer.appendChild(c)}for(let i=0;i<4;i++){const f=document.createElement('span');f.className='firework';f.style.left=(15+i*23)+'%';f.style.top=(18+(i%2)*18)+'%';f.style.color=colors[i];f.style.animationDelay=(i*.12)+'s';layer.appendChild(f)}for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%2?'⭐':'✨';s.style.left=(8+i*9)+'%';s.style.bottom=(10+(i%3)*8)+'%';s.style.animationDelay=(i*.07)+'s';layer.appendChild(s)}}
function toast(text){const t=document.createElement('div');t.textContent=text;t.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;background:#2e2540;color:white;padding:12px 16px;border-radius:999px;font-weight:850;box-shadow:0 8px 30px rgba(0,0,0,.2);max-width:90%;text-align:center';document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}

if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
render();
