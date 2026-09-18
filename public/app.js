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

function iconSVG(name, cls='ui-icon'){
  const head=`<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">`;
  const tail='</svg>';
  const icons={
    star:`<path d="M32 5l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 43.8 16.8 51.8l2.9-16.9-12.3-12 17-2.5z" fill="currentColor"/>`,
    buddy:`<path d="M32 5l7.7 15.6 17.2 2.5-12.5 12.2 3 17.1L32 44.3 16.6 52.4l3-17.1L7.1 23.1l17.2-2.5z" fill="currentColor"/><circle cx="25" cy="30" r="2.5" fill="#3a284f"/><circle cx="39" cy="30" r="2.5" fill="#3a284f"/><path d="M25 36c4 4 10 4 14 0" fill="none" stroke="#3a284f" stroke-width="2.5" stroke-linecap="round"/><circle cx="19" cy="35" r="3" fill="#ff9fcf" opacity=".8"/><circle cx="45" cy="35" r="3" fill="#ff9fcf" opacity=".8"/>`,
    bed:`<path d="M10 40V23h5v9h39v16h-5v-5H15v5h-5z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M15 32h15V22H20a5 5 0 0 0-5 5z" fill="currentColor" opacity=".22"/><path d="M32 32h17a5 5 0 0 1 5 5v3H32z" fill="currentColor" opacity=".35"/>`,
    brush:`<path d="M14 46l28-28" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M40 15l9 9M44 11l9 9M48 8l8 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M11 49l7-2-5-5z" fill="currentColor"/>`,
    teddy:`<circle cx="20" cy="18" r="8" fill="currentColor" opacity=".35"/><circle cx="44" cy="18" r="8" fill="currentColor" opacity=".35"/><circle cx="32" cy="27" r="17" fill="currentColor" opacity=".55"/><circle cx="32" cy="46" r="12" fill="currentColor" opacity=".42"/><circle cx="26" cy="26" r="2.5" fill="#3a284f"/><circle cx="38" cy="26" r="2.5" fill="#3a284f"/><ellipse cx="32" cy="33" rx="6" ry="5" fill="#fff" opacity=".9"/><circle cx="32" cy="31" r="2.5" fill="#3a284f"/>`,
    shirt:`<path d="M23 12l9 6 9-6 13 8-7 10-6-3v26H23V27l-6 3-7-10z" fill="currentColor" opacity=".52"/><path d="M26 14c1 5 11 5 12 0" fill="none" stroke="currentColor" stroke-width="3"/>`,
    ice:`<path d="M20 25h24L32 56z" fill="#d59a62"/><path d="M18 24c0-7 5-12 11-12 2 0 4 .6 5.5 1.6A11 11 0 0 1 54 21c0 6-5 10-11 10H24c-6 0-11-3-11-7 0-3 2-6 5-7z" fill="currentColor"/><circle cx="26" cy="18" r="2" fill="#fff" opacity=".7"/>`,
    popcorn:`<path d="M17 24h30l-4 32H21z" fill="currentColor" opacity=".48"/><path d="M21 24h6l2 32h-6zM34 24h6l-2 32h-6z" fill="currentColor"/><g fill="#ffd75e"><circle cx="20" cy="19" r="8"/><circle cx="31" cy="15" r="9"/><circle cx="43" cy="19" r="8"/><circle cx="36" cy="22" r="7"/></g>`,
    gift:`<path d="M10 27h44v29H10z" fill="currentColor" opacity=".45"/><path d="M7 20h50v12H7zM29 20h6v36h-6z" fill="currentColor"/><path d="M31 20c-10 0-15-4-15-9 0-4 3-7 7-7 7 0 9 9 9 16zm2 0c10 0 15-4 15-9 0-4-3-7-7-7-7 0-9 9-9 16z" fill="none" stroke="currentColor" stroke-width="3"/>`,
    medal:`<path d="M19 6h11l2 19-10 5zm26 0H34l-2 19 10 5z" fill="currentColor" opacity=".35"/><circle cx="32" cy="40" r="16" fill="currentColor"/><path d="M32 29l3.3 6.7 7.4 1.1-5.3 5.2 1.2 7.3-6.6-3.5-6.6 3.5 1.2-7.3-5.3-5.2 7.4-1.1z" fill="#fff" opacity=".9"/>`,
    settings:`<path d="M32 22a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0-14 4 7 8-1 2 8 7 4-4 7 4 7-7 4-2 8-8-1-4 7-4-7-8 1-2-8-7-4 4-7-4-7 7-4 2-8 8 1z" fill="currentColor" fill-rule="evenodd" opacity=".75"/>`,
    music:`<path d="M24 14v31a8 8 0 1 1-5-7.4V19l31-7v27a8 8 0 1 1-5-7.4V8z" fill="currentColor"/>`,
    lock:`<rect x="13" y="27" width="38" height="30" rx="8" fill="currentColor" opacity=".5"/><path d="M22 27v-7a10 10 0 0 1 20 0v7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="41" r="4" fill="#fff"/><path d="M32 45v5" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    check:`<circle cx="32" cy="32" r="25" fill="currentColor" opacity=".2"/><path d="M18 33l9 9 20-21" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    clock:`<circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" stroke-width="5"/><path d="M32 17v16l11 7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
    plus:`<circle cx="32" cy="32" r="25" fill="currentColor" opacity=".16"/><path d="M32 19v26M19 32h26" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
    book:`<path d="M9 14c10-3 18-1 23 5v35c-5-6-13-8-23-5zm46 0c-10-3-18-1-23 5v35c5-6 13-8 23-5z" fill="currentColor" opacity=".38"/><path d="M32 19v35" stroke="currentColor" stroke-width="3"/>`,
    bath:`<path d="M10 34h44v7a13 13 0 0 1-13 13H23A13 13 0 0 1 10 41z" fill="currentColor" opacity=".35"/><path d="M8 34h48M18 54v4M46 54v4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="23" r="5" fill="currentColor" opacity=".45"/><circle cx="29" cy="16" r="4" fill="currentColor" opacity=".3"/>`,
    plate:`<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="11" fill="currentColor" opacity=".18"/><path d="M8 12v17m0-8h8m-4-9v17M54 12v42" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
    moon:`<path d="M46 46A23 23 0 0 1 20 10a24 24 0 1 0 26 36z" fill="currentColor"/>`
  };
  return head+(icons[name]||icons.star)+tail;
}
function taskIconName(t){
  const s=(t.id+' '+t.title).toLowerCase();
  if(s.includes('bed'))return 'bed';
  if(s.includes('teeth')||s.includes('brush'))return 'brush';
  if(s.includes('toy'))return 'teddy';
  if(s.includes('dress')||s.includes('shirt'))return 'shirt';
  if(s.includes('homework')||s.includes('read'))return 'book';
  if(s.includes('bath'))return 'bath';
  if(s.includes('dinner')||s.includes('eat'))return 'plate';
  if(s.includes('pajama')||s.includes('sleep'))return 'moon';
  return 'star';
}
function rewardIconName(r){
  if(r.id==='ice')return 'ice';
  if(r.id==='movie')return 'popcorn';
  if(r.id==='toy')return 'teddy';
  if(r.id==='big')return 'gift';
  return 'gift';
}

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
  const melody=[659.25,783.99,880,783.99,698.46,783.99,987.77,880,659.25,783.99,1046.5,987.77,880,783.99,698.46,783.99];
  const bass=[261.63,293.66,329.63,293.66];
  const step=musicStep%melody.length;
  tone(melody[step],.33,0,'triangle',.028);
  tone(melody[step]*2,.16,.02,'sine',.007);
  if(step%4===0){
    tone(bass[Math.floor(step/4)%bass.length],.7,0,'sine',.014);
    tone(bass[Math.floor(step/4)%bass.length]*1.5,.45,.03,'triangle',.006);
  }
  if(step===7||step===15)tone(melody[step]*1.5,.34,.08,'sine',.010);
  musicStep++;
}
function updateMusicButton(){
  const b=document.getElementById('musicToggle'); if(!b)return;
  b.innerHTML=iconSVG('music','button-icon');
  b.setAttribute('aria-label',musicTimer?'Turn music off':'Turn music on');
  b.title=musicTimer?'Music on — tap to mute':'Tap for music';
  b.classList.toggle('music-on',!!musicTimer);
}
function startMusic(fromSaved=false){
  if(!fromSaved){musicEnabled=true;localStorage.setItem(MUSIC_KEY,'on')}
  if(!musicEnabled||musicTimer)return;
  const ctx=ensureAudio(); if(!ctx)return;
  musicPulse();
  musicTimer=setInterval(musicPulse,430);
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
  app.innerHTML = `<section class="card auth role-screen"><div class="role-buddy">${iconSVG('buddy','buddy-icon')}</div><h1>My Stars</h1><p class="sub">Choose this device.</p><div class="role-choices"><button id="kid" class="role-card"><span class="role-icon kid-role">${iconSVG('star','role-svg')}</span><strong>Kid Tablet</strong><span>Tasks, stars and rewards.</span></button><button id="parent" class="role-card"><span class="role-icon parent-role">${iconSVG('lock','role-svg')}</span><strong>Parent Phone</strong><span>Approve tasks and manage stars.</span></button></div><p class="notice">Today resets automatically every new day.</p></section>`;
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
    <div class="lock-illustration">${iconSVG('lock','lock-icon')}</div>
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
  const road = state.rewards.map(r=>`<div class="road-stop ${state.stars>=r.cost?'reached':''} ${goal.id===r.id?'goal':''}"><div class="road-icon">${iconSVG(rewardIconName(r),'road-svg')}</div><div class="road-cost">${r.cost} STARS</div></div>`).join('');
  app.innerHTML = `
    <div class="ambient-stars" aria-hidden="true"><span>✦</span><span>★</span><span>✧</span><span>★</span><span>✦</span><span>✧</span><span>★</span><span>✦</span><span>✧</span><span>★</span><span>✦</span><span>✧</span></div>
    <div class="color-blob blob-one" aria-hidden="true"></div><div class="color-blob blob-two" aria-hidden="true"></div><div class="color-blob blob-three" aria-hidden="true"></div>
    <div class="kid-shell">
      <div class="kid-left">
        <section class="card topbar kid-hero"><div class="buddy-wrap" aria-hidden="true">${iconSVG('buddy','buddy-icon')}</div><div class="grow"><div class="eyebrow">${greeting()}</div><h1>${esc(state.childName)} <span class="twinkle">✦</span></h1><p class="sub">You can do amazing things today!</p></div><div class="top-actions"><button id="musicToggle" class="icon-btn music-toggle" aria-label="Turn music on"></button><button id="settings" class="icon-btn" aria-label="Settings">${iconSVG('settings','button-icon')}</button></div></section>
        <div class="stats"><section class="card stat star-counter-card"><div class="stat-icon star-stat">${iconSVG('star','stat-svg')}</div><div id="kidStarTotal" class="big-num">${state.stars}</div><div class="small">MY STARS</div></section><section class="card stat sticker-stat-card"><div class="stat-icon medal-stat">${iconSVG('medal','stat-svg')}</div><div class="big-num">${Math.min(4,1+Math.floor(state.history.length/2))}</div><div class="small">MY STICKERS</div></section></div>
        <section class="card progress-card">
          <div class="progress-row"><div><div class="eyebrow">NEXT REWARD</div><h3 class="next-reward-title"><span class="inline-reward-icon">${iconSVG(rewardIconName(goal),'inline-svg')}</span>${esc(goal.title)}</h3></div><span class="pill">${goal.cost} STARS</span></div>
          <div class="progress"><div style="width:${pct}%"></div></div>
          <div class="progress-text">${state.stars>=goal.cost?'You have enough stars! ✦':`${goal.cost-state.stars} more stars!`}</div>
          <div class="reward-roadmap" aria-label="Reward progress">${road}</div>
        </section>
        <section class="card reward-shop"><div class="eyebrow" style="text-align:center">REWARD SHOP</div><p class="sub" style="text-align:center">Finish all today's jobs, then choose.</p><div class="reward-list mt14">${state.rewards.map(r=>rewardHtml(r,all)).join('')}</div><div class="save-hint">Saving your stars can unlock a bigger prize ✦</div></section>
        <section class="card stickers"><h3>MY STICKERS</h3><div class="sticker-row"><span class="sticker first-sticker">★ First Star</span><span class="sticker ${done>=3?'':'lock'}">✦ Super Helper</span><span class="sticker ${state.stars>=35?'':'lock'}">♡ Super Saver</span><span class="sticker ${state.stars>=50?'':'lock'}">♛ Star Champion</span></div></section>
      </div>
      <div class="kid-right">
        <div class="section-head"><div><h2>TODAY <span class="sun-dot">☀</span></h2><p class="sub">Tap when you finish a job.</p></div><span class="pill done-pill">${done}/${total} DONE</span></div>
        ${all?'<section class="all-done-banner"><div class="all-done-vector">'+iconSVG('star','done-star-svg')+'</div><div><strong>ALL DONE!</strong><span>You finished every job today!</span></div><div class="all-done-vector">'+iconSVG('check','done-check-svg')+'</div></section>':''}
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
  const iconName=taskIconName(t);
  return `<section class="card task task-${s} task-color-${iconName}" data-task-card="${t.id}"><div class="task-main"><div class="task-emoji vector-task-icon">${iconSVG(iconName,'task-svg')}</div><div class="grow"><div class="task-title">${esc(t.title)}</div><div class="points">+${t.points} STARS</div></div><button class="speak" data-text="${esc(t.title)}" aria-label="Hear ${esc(t.title)}">▶</button></div><button class="btn ${s==='approved'?'btn-good':'btn-soft'} w-full mt14 doneBtn" data-id="${t.id}" ${s==='pending'||s==='approved'?'disabled':''}>${label}</button></section>`;
}

function rewardHtml(r,all){
  const enough=state.stars>=r.cost, unlocked=all&&enough;
  const lock=!all?'FINISH JOBS':`${Math.max(0,r.cost-state.stars)} MORE STARS`;
  return `<div class="reward reward-${r.id} ${unlocked?'ready':''}"><div class="reward-row"><div class="reward-emoji vector-reward-icon">${iconSVG(rewardIconName(r),'reward-svg')}</div><div class="grow"><div class="reward-title">${esc(r.title)}</div><div class="points">${r.cost} STARS</div></div>${unlocked?'<span class="ready-tag">READY!</span>':`<span class="locked">${lock}</span>`}</div>${unlocked?`<div class="reward-actions"><button class="btn btn-primary redeemBtn" data-id="${r.id}">REDEEM</button><button class="btn btn-soft saveBtn" data-id="${r.id}">SAVE MY STARS</button></div>`:''}</div>`;
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
  const done=approvedCount(), total=activeTasks().length;
  app.innerHTML=`
  <div class="parent-header card parent-hero">
    <div class="parent-hero-icon">${iconSVG('buddy','parent-buddy')}</div>
    <div class="grow"><div class="eyebrow">PARENT DASHBOARD</div><h1>${esc(state.childName)}'s My Stars</h1><p class="sub">Everything important is right here.</p></div>
    <button id="parentSettings" class="icon-btn" aria-label="Parent settings">${iconSVG('settings','button-icon')}</button>
  </div>
  <div class="parent-summary">
    <section class="card parent-summary-card waiting-card"><div class="summary-icon">${iconSVG('clock','summary-svg')}</div><div><strong>${pending.length}</strong><span>WAITING</span></div></section>
    <section class="card parent-summary-card stars-card"><div class="summary-icon">${iconSVG('star','summary-svg')}</div><div><strong>${state.stars}</strong><span>STARS</span></div></section>
    <section class="card parent-summary-card done-card"><div class="summary-icon">${iconSVG('check','summary-svg')}</div><div><strong>${done}/${total}</strong><span>DONE TODAY</span></div></section>
  </div>
  <div class="parent-grid">
    <div class="parent-column">
      <section class="card parent-section approval-section">
        <div class="parent-section-head"><div><div class="eyebrow">TODAY</div><h3>Waiting for approval</h3></div>${pending.length>1?'<button id="approveAll" class="btn btn-good compact-btn">APPROVE ALL ✓</button>':''}</div>
        <div class="pending-list mt10">${pending.length?pending.map(pendingHtml).join(''):'<div class="empty-parent-state"><div>'+iconSVG('check','empty-svg')+'</div><strong>All caught up!</strong><span>Nothing is waiting right now.</span></div>'}</div>
      </section>
      <section class="card parent-section">
        <div class="parent-section-head"><div><div class="eyebrow">DAILY ROUTINE</div><h3>Today's jobs</h3></div><span class="auto-badge">AUTO RESET DAILY</span></div>
        <div class="today-job-list mt10">${state.tasks.map(parentTaskRow).join('')}</div>
      </section>
    </div>
    <div class="parent-column">
      <section class="card parent-section quick-panel">
        <div class="eyebrow">QUICK CONTROLS</div><h3>Stars & bonuses</h3>
        <div class="bonus-grid mt10"><button class="btn btn-soft bonusBtn" data-bonus="1">+1 STAR</button><button class="btn btn-soft bonusBtn" data-bonus="2">+2 STARS</button><button class="btn btn-primary bonusBtn" data-bonus="5">BONUS +5</button></div>
      </section>
      <section class="card parent-section">
        <div class="eyebrow">ONE TAP</div><h3>Quick jobs</h3><p class="sub">Add common jobs without typing.</p>
        <div class="preset-grid mt10">
          <button class="presetJob" data-title="Homework" data-points="3">${iconSVG('book','preset-svg')}<span>Homework</span></button>
          <button class="presetJob" data-title="Eat my dinner" data-points="2">${iconSVG('plate','preset-svg')}<span>Dinner</span></button>
          <button class="presetJob" data-title="Bath time" data-points="2">${iconSVG('bath','preset-svg')}<span>Bath</span></button>
          <button class="presetJob" data-title="Put on pajamas" data-points="2">${iconSVG('moon','preset-svg')}<span>Pajamas</span></button>
        </div>
        <details class="custom-job-details"><summary>+ Custom job</summary><div class="field"><label>Job name</label><input id="jobTitle" placeholder="Example: Read a book"></div><div class="field"><label>Stars</label><input id="jobPoints" type="number" min="1" max="20" value="2"></div><button id="addJob" class="btn btn-primary w-full mt10">ADD JOB</button></details>
      </section>
      <section class="card parent-section"><div class="eyebrow">MEMORIES</div><h3>Reward history</h3><div class="history-list mt10">${historyHtml()}</div></section>
    </div>
  </div>
  <button id="backKidFromParent" class="btn btn-soft w-full parent-back">BACK TO KID MODE</button>
  <div class="status-line">Daily tasks reset automatically when a new day starts.</div>`;

  document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>approve(b.dataset.id,true));
  document.querySelectorAll('.reject').forEach(b=>b.onclick=()=>approve(b.dataset.id,false));
  document.querySelectorAll('.bonusBtn').forEach(b=>b.onclick=()=>addBonus(Number(b.dataset.bonus)));
  document.querySelectorAll('.presetJob').forEach(b=>b.onclick=()=>addPresetJob(b.dataset.title,Number(b.dataset.points)));
  document.querySelectorAll('.taskToggle').forEach(b=>b.onclick=()=>toggleTask(b.dataset.id));
  if(document.getElementById('approveAll'))document.getElementById('approveAll').onclick=approveAllWaiting;
  document.getElementById('addJob').onclick=addJob;
  document.getElementById('parentSettings').onclick=renderParentSettings;
  document.getElementById('backKidFromParent').onclick=()=>setMode('kid');
}
function pendingHtml(t){
  return `<div class="pending-item parent-pending-item"><div class="pending-main"><div class="pending-icon">${iconSVG(taskIconName(t),'pending-svg')}</div><div class="grow"><strong>${esc(t.title)}</strong><div class="small">+${t.points} stars</div></div></div><div class="grid2 mt10"><button class="btn btn-good approve" data-id="${t.id}">APPROVE ✓</button><button class="btn btn-warn reject" data-id="${t.id}">NOT YET</button></div></div>`;
}
function parentTaskRow(t){
  return `<div class="parent-task-row ${t.active?'active':'paused'}"><div class="parent-task-icon">${iconSVG(taskIconName(t),'parent-task-svg')}</div><div class="grow"><strong>${esc(t.title)}</strong><span>+${t.points} stars</span></div><button class="taskToggle mini-toggle" data-id="${t.id}">${t.active?'ON':'OFF'}</button></div>`;
}
function approveAllWaiting(){
  const waiting=activeTasks().filter(t=>status(t.id)==='pending');
  if(!waiting.length)return;
  let added=0;
  waiting.forEach(t=>{
    if(status(t.id)!=='approved'){state.stars+=t.points;added+=t.points}
    state.completions[t.id]={status:'approved'};
  });
  const last=waiting[waiting.length-1];
  state.lastApproved={id:last.id,points:added,at:Date.now(),allDone:allApproved()};
  save();playSfx('allDone');renderParent();
}
function addBonus(amount){
  state.stars=Math.max(0,state.stars+amount);
  save();playSfx('approve');toast(`+${amount} star${amount===1?'':'s'} added`);renderParent();
}
function addPresetJob(title,points){
  const existing=state.tasks.find(t=>t.title.toLowerCase()===title.toLowerCase());
  if(existing){existing.active=true;save();toast(title+' is already on the list');renderParent();return}
  state.tasks.push({id:'t-'+Date.now(),title,emoji:'⭐',points,active:true});
  save();playSfx('tap');toast(title+' added');renderParent();
}
function toggleTask(id){
  const t=state.tasks.find(x=>x.id===id);if(!t)return;
  t.active=!t.active;save();renderParent();
}
function approve(id,yes){
  const t=state.tasks.find(x=>x.id===id); if(!t)return;
  if(yes && status(id)!=='approved') state.stars+=t.points;
  state.completions[id]={status:yes?'approved':'rejected'};
  if(yes) state.lastApproved={id,points:t.points,at:Date.now(),allDone:allApproved()};
  save();
  playSfx(yes?'approve':'wrong');
  renderParent();
}
function addJob(){
  const title=document.getElementById('jobTitle').value.trim();
  const points=Math.max(1,Math.min(20,Number(document.getElementById('jobPoints').value)||1));
  if(!title)return;
  const existing=state.tasks.find(t=>t.title.toLowerCase()===title.toLowerCase());
  if(existing){existing.active=true;existing.points=points}else state.tasks.push({id:'t-'+Date.now(),title,emoji:'⭐',points,active:true});
  save();playSfx('tap');renderParent();
}
function historyHtml(){ return state.history.length?state.history.slice(0,8).map(h=>`<div class="history-item"><strong>${esc(h.title)}</strong><div class="small">${h.cost} stars · ${new Date(h.date).toLocaleDateString()}</div></div>`).join(''):'<div class="notice">No prizes redeemed yet.</div>'; }

function renderKidSettings(){
  app.innerHTML=`<section class="card auth settings-card"><div class="settings-illustration">${iconSVG('settings','settings-large')}</div><h2>Tablet Settings</h2><p class="sub">Music and grown-up controls.</p><button id="toggleMusicSettings" class="btn btn-soft w-full mt14">${musicEnabled?'TURN MUSIC OFF':'TURN MUSIC ON'}</button><button id="parentAccess" class="btn btn-primary w-full mt10">PARENT MODE 🔒</button><button id="back" class="btn btn-soft w-full mt10">BACK TO MY STARS</button><button id="mode" class="btn btn-soft w-full mt10">CHANGE DEVICE MODE</button></section>`;
  document.getElementById('toggleMusicSettings').onclick=()=>{toggleMusic();renderKidSettings()};
  document.getElementById('parentAccess').onclick=()=>setMode('parent');
  document.getElementById('back').onclick=renderKid;
  document.getElementById('mode').onclick=changeMode;
}
function renderParentSettings(){
  app.innerHTML=`<section class="card auth settings-card"><div class="settings-illustration">${iconSVG('settings','settings-large')}</div><h2>Parent Settings</h2><div class="field"><label>Child's name</label><input id="name" maxlength="30" value="${esc(state.childName)}"></div><button id="saveName" class="btn btn-primary w-full mt14">SAVE NAME</button><button id="back" class="btn btn-soft w-full mt10">BACK TO DASHBOARD</button><button id="lockParent" class="btn btn-soft w-full mt10">LOCK PARENT MODE</button></section>`;
  document.getElementById('saveName').onclick=()=>{const n=document.getElementById('name').value.trim();if(n){state.childName=n;save();renderParent()}};
  document.getElementById('back').onclick=renderParent;
  document.getElementById('lockParent').onclick=()=>{parentUnlocked=false;sessionStorage.removeItem(PARENT_UNLOCK_KEY);renderParentPin()};
}

function modal(body,onYes){ const w=document.createElement('div'); w.className='overlay'; w.innerHTML=`<div class="modal">${body}<div class="grid2 mt14"><button id="yes" class="btn btn-primary">YES!</button><button id="no" class="btn btn-soft">NOT YET</button></div></div>`; document.body.appendChild(w); w.querySelector('#no').onclick=()=>w.remove();w.querySelector('#yes').onclick=()=>{w.remove();onYes()}; }
function celebrate(r){
  playSfx('redeem');
  const w=document.createElement('div');w.className='overlay';
  w.innerHTML=`<div class="modal reward-celebration"><div id="fx"></div><div class="prize big-pop">${iconSVG(rewardIconName(r),'celebrate-reward-svg')}</div><h2>YOU GOT ${esc(r.title).toUpperCase()}!</h2><p>You worked hard and earned it!</p><div class="celebrate-balance">${r.cost} stars used · ${state.stars} stars left</div><button id="yay" class="btn btn-primary w-full mt14">YAY! ✦</button></div>`;
  document.body.appendChild(w);fx(w.querySelector('#fx'));w.querySelector('#yay').onclick=()=>{w.remove();renderKid()};
}
function fx(layer){const colors=['#ffd75e','#ff8ec7','#9a6cff','#6fd6a7','#7ac8ff'];for(let i=0;i<34;i++){const c=document.createElement('span');c.className='confetti';c.style.left=((i*29)%96)+'%';c.style.background=colors[i%colors.length];c.style.animationDelay=(i*.025)+'s';layer.appendChild(c)}for(let i=0;i<4;i++){const f=document.createElement('span');f.className='firework';f.style.left=(15+i*23)+'%';f.style.top=(18+(i%2)*18)+'%';f.style.color=colors[i];f.style.animationDelay=(i*.12)+'s';layer.appendChild(f)}for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%2?'⭐':'✨';s.style.left=(8+i*9)+'%';s.style.bottom=(10+(i%3)*8)+'%';s.style.animationDelay=(i*.07)+'s';layer.appendChild(s)}}
function toast(text){const t=document.createElement('div');t.textContent=text;t.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:50;background:#2e2540;color:white;padding:12px 16px;border-radius:999px;font-weight:850;box-shadow:0 8px 30px rgba(0,0,0,.2);max-width:90%;text-align:center';document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}

if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
render();
