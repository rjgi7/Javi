/* Star Catch · My Stars. Local-first minigame. Reward-star balance is READ ONLY.
 * All game writes use their own storage keys; parent approval unlocks play.
 * No ads, analytics, network dependencies, purchases or background gameplay.
 */
(() => {
'use strict';
if(window.__starCatchV6) return; window.__starCatchV6=true;
const app=document.getElementById('app'); if(!app)return;
const KEY='myStarsPlayV1', LEASE='myStarsPlayLeaseV1';
const day=()=>window.MyStarsDay?.today() || new Date().toLocaleDateString('en-CA');
const reduced=()=>typeof Element.prototype.animate!=='function' || matchMedia('(prefers-reduced-motion: reduce)').matches || localStorage.getItem('myStarsCalmMotion')==='on';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function store(){
  let v={};try{v=JSON.parse(localStorage.getItem(KEY))||{};}catch(_){}
  return {enabled:v.enabled!==false,limitSeconds:[60,180,300,600].includes(v.limitSeconds)?v.limitSeconds:300,day:day(),usedSeconds:v.day===day()?Math.max(0,Math.floor(Number(v.usedSeconds)||0)):0,best:Math.max(0,Math.floor(Number(v.best)||0)),rounds:Array.isArray(v.rounds)?v.rounds.slice(0,20):[]};
}
function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));return true;}catch(_){notify('Storage is full. Ask a grown-up for help.');return false;}}
function family(){try{return JSON.parse(localStorage.getItem('myStarsV1'))||{};}catch(_){return {};}}
function eligibility(){
  window.MyStarsDay?.check();
  const f=family(), tasks=(Array.isArray(f.tasks)?f.tasks:[]).filter(t=>t.active);
  const calendar=localStorage.getItem('myStarsCalendarDayV6')||f.calendarDayV6;
  const approved=calendar===day() && tasks.length>0 && tasks.every(t=>f.completions?.[t.id]?.status==='approved');
  const s=store(),left=Math.max(0,s.limitSeconds-s.usedSeconds);
  return {approved,enabled:s.enabled,left,can:approved&&s.enabled&&left>0,stars:Math.max(0,Number(f.stars)||0)};
}
const star='M60 8 Q63 7 66 14 L78 39 107 43 Q113 44 108 50 L87 70 92 100 Q92 106 85 102 L60 89 35 102 Q28 106 29 100 L33 70 12 50 Q7 44 14 43 L42 39 54 14 Q57 7 60 8Z';
let artId=0;
function art(kind){
 const id='sc-art-'+(++artId);let body;
 if(kind==='buddy'||kind==='star'||kind==='gold'){
  const purple=kind==='buddy', c=purple?'#af7ae4':kind==='gold'?'#ffbb25':'#ffd467', edge=purple?'#8652c5':'#d6a13b';
  body=`<defs><linearGradient id="${id}" x2="0.7" y2="1"><stop stop-color="${purple?'#d1b0ff':'#ffeaa8'}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><path d="${star}" fill="url(#${id})" stroke="${edge}" stroke-width="2.2"/><path d="M49 26l-8 19-18 3" fill="none" stroke="#fff9ea" opacity=".65" stroke-width="5" stroke-linecap="round"/><g class="sc-eyes"><ellipse cx="46" cy="59" rx="4" ry="5.5" fill="#533064"/><ellipse cx="74" cy="59" rx="4" ry="5.5" fill="#533064"/><circle cx="47" cy="57" r="1.3" fill="white"/><circle cx="75" cy="57" r="1.3" fill="white"/></g><ellipse cx="36" cy="71" rx="6" ry="3" fill="#f494bc"/><ellipse cx="84" cy="71" rx="6" ry="3" fill="#f494bc"/><path d="M52 71q8 12 16 0" fill="none" stroke="#533064" stroke-width="2.6" stroke-linecap="round"/>`;
 }else if(kind==='heart')body='<path d="M60 103C49 95 12 68 12 39c0-28 35-39 48-13 15-26 48-15 48 13 0 29-37 56-48 64Z" fill="#f6a0cb" stroke="#df78ad" stroke-width="2"/><path d="M27 37q1-10 11-10" fill="none" stroke="#fff2fa" stroke-width="5" stroke-linecap="round"/>';
 else if(kind==='rainbow')body='<g fill="none" stroke-width="11" stroke-linecap="round"><path d="M12 89a48 48 0 0 1 96 0" stroke="#eaa2c8"/><path d="M24 89a36 36 0 0 1 72 0" stroke="#f2d174"/><path d="M36 89a24 24 0 0 1 48 0" stroke="#8bd3c2"/><path d="M48 89a12 12 0 0 1 24 0" stroke="#b9a2ec"/></g><g fill="#fff"><ellipse cx="21" cy="90" rx="19" ry="12"/><circle cx="19" cy="81" r="11"/><ellipse cx="99" cy="90" rx="19" ry="12"/><circle cx="101" cy="81" r="11"/></g>';
 else if(kind==='apple')body='<path d="M60 30C25 4 5 45 19 80c10 26 24 30 41 22 17 8 31 4 41-22C115 45 95 4 60 30Z" fill="#ee839e" stroke="#cf547c" stroke-width="2"/><path d="M60 32q-5-15 2-25" stroke="#966742" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M65 18q7-22 32-11-11 21-32 11Z" fill="#82bc8c"/><path d="M31 42q-10 9-7 24" stroke="#ffc8d2" stroke-width="6" fill="none" stroke-linecap="round"/>';
 else if(kind==='sun')body='<g stroke="#e6b444" stroke-width="5" stroke-linecap="round"><path d="M60 8v12m0 80v12M8 60h12m80 0h12M23 23l9 9m56 56 9 9M97 23l-9 9M32 88l-9 9"/></g><circle cx="60" cy="60" r="29" fill="#ffda6d" stroke="#eab342" stroke-width="2"/><circle cx="51" cy="58" r="3" fill="#85623d"/><circle cx="69" cy="58" r="3" fill="#85623d"/><path d="M53 68q7 7 14 0" stroke="#85623d" fill="none" stroke-width="2.5" stroke-linecap="round"/>';
 else if(kind==='dog')body='<path d="M26 21Q-1 48 12 77l26-22m56-34q27 27 14 56L82 55" fill="#bc855e" stroke="#9d6747" stroke-width="2"/><rect x="24" y="22" width="72" height="82" rx="31" fill="#eac49a" stroke="#b58864" stroke-width="2"/><ellipse cx="60" cy="77" rx="21" ry="18" fill="#fff0da"/><circle cx="43" cy="57" r="4" fill="#5d4438"/><circle cx="77" cy="57" r="4" fill="#5d4438"/><path d="M52 74q8-7 16 0l-8 9Z" fill="#5d4438"/><path d="M60 83v9m-10-3q10 7 20 0" fill="none" stroke="#5d4438" stroke-width="2.5" stroke-linecap="round"/>';
 else if(kind==='medal')body='<path d="M27 7h23l10 39-24 5ZM93 7H70L60 46l24 5Z" fill="#b898e1"/><circle cx="60" cy="74" r="34" fill="#ffdf87" stroke="#dcb355" stroke-width="3"/><path d="M60 51l7 14 16 3-12 11 3 16-14-7-14 7 3-16-12-11 16-3Z" fill="#ecb942"/>';
 else body=`<path d="${star}" fill="#ffdc75"/>`;
 return `<svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">${body}</svg>`;
}
function buttonIcon(type){const paths={back:'M15 5l-7 7 7 7',pause:'M8 5v14M16 5v14',play:'M8 5l11 7-11 7Z',sound:'M4 9v6h4l5 4V5L8 9ZM17 8q6 4 0 8',mute:'M4 9v6h4l5 4V5L8 9ZM17 9l5 6m0-6-5 6'};return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[type]||paths.play}"/></svg>`;}
let noticeTimer;
function notify(text){let el=document.getElementById('sc-notice');if(!el){el=document.createElement('div');el.id='sc-notice';el.setAttribute('role','status');document.body.append(el);}el.textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.remove(),3000);}
let active=null, scheduled=0, renderSignature='';
function install(){
 scheduled=0;
 const kid=app.querySelector('.kid-right');
 if(kid&&!kid.querySelector('#sc-entry')){
  const card=document.createElement('section');card.id='sc-entry';card.className='sc-entry';
  card.innerHTML=`<div class="sc-entry-art">${art('buddy')}<span>${art('star')}</span></div><div class="sc-entry-copy"><div class="sc-eyebrow">PLAY TIME</div><h3>Star Catch</h3><p id="sc-entry-status"></p></div><button type="button" id="sc-play-button" class="sc-button sc-primary">PLAY ${buttonIcon('play')}</button><div class="sc-entry-foot">Game score and reward stars are separate.</div>`;
  kid.append(card);card.querySelector('button').onclick=()=>{const gate=eligibility();if(!gate.can){notify(gate.approved?'Ask a grown-up about play time.':'Finish your jobs. Mom will check them!');return;}openGame();};
  renderSignature='';
 }
 const parent=app.querySelector('.parent-grid .parent-column:last-child');
 if(parent&&!parent.querySelector('#sc-parent')){
  const section=document.createElement('section');section.className='card parent-section';section.id='sc-parent';
  const settings=store();
  section.innerHTML=`<div class="sc-parent-heading"><div><div class="eyebrow">AFTER TODAY'S JOBS</div><h3>Play Time</h3></div><label class="sc-switch"><input id="sc-enabled" type="checkbox" ${settings.enabled?'checked':''}><span>Allow games</span></label></div><label class="sc-limit-label" for="sc-limit">Daily play time</label><select id="sc-limit">${[1,3,5,10].map(n=>`<option value="${n*60}" ${settings.limitSeconds===n*60?'selected':''}>${n} minute${n===1?'':'s'}</option>`).join('')}</select><p class="sc-parent-note" id="sc-time-note"></p><p class="sc-parent-note">Unlocks after you approve every active job. Games never award or spend reward stars.</p><p class="sc-local-note">Saved on this device only. Phone/tablet sync is not connected yet.</p>`;
  parent.prepend(section);
  const saveSettings=()=>{
   // Same local PIN gate as the existing demo. This is not server authentication.
   if(sessionStorage.getItem('myStarsParentUnlocked')!=='yes')return;
   const s=store();s.enabled=section.querySelector('#sc-enabled').checked;s.limitSeconds=Number(section.querySelector('#sc-limit').value);
   if(write(s)){updateEntry();notify('Play time saved.');}
  };
  section.querySelector('#sc-enabled').onchange=saveSettings;section.querySelector('#sc-limit').onchange=saveSettings;
 }
 updateEntry();
}
function updateEntry(){
 const g=eligibility(),s=store();
 const signature=[g.approved,g.enabled,g.left,day()].join(':');
 const card=app.querySelector('#sc-entry');
 if(card&&signature!==renderSignature){
  renderSignature=signature;
  const text=!g.enabled?'Play time is resting.':!g.approved?'Finish your jobs. Mom will check them!':g.left<=0?'All played for today. See you tomorrow!':'All done! Your game is ready.';
  card.querySelector('#sc-entry-status').textContent=text;
  card.querySelector('button').disabled=!g.can;
  card.classList.toggle('sc-unlocked',g.can);
 }
 const note=app.querySelector('#sc-time-note');
 const value=`${Math.max(0,s.limitSeconds-s.usedSeconds)} seconds left today · renews after midnight.`;
 if(note&&note.textContent!==value)note.textContent=value;
}
new MutationObserver(()=>{if(!scheduled)scheduled=requestAnimationFrame(install);}).observe(app,{childList:true,subtree:true});
window.addEventListener('storage',e=>{if([KEY,'myStarsV1'].includes(e.key)){renderSignature='';updateEntry();if(active&&!eligibility().enabled)active.pause('Play time is off.');}});
install();

// A small original music-box score, scheduled on the audio clock.
class Sound {
 constructor(){this.ctx=null;this.on=localStorage.getItem('myStarsGameSoundV1')!=='off';this.next=0;this.step=0;this.music=null;this.voices=[];}
 unlock(){if(!this.on)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!this.ctx){this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.7;this.master.connect(this.ctx.destination);}this.ctx.resume().catch(()=>{});}catch(_){}}
 note(freq,t=.2,delay=0,volume=.07,type='sine'){
  if(!this.on||!this.ctx||this.ctx.state!=='running')return;
  const c=this.ctx,o=c.createOscillator(),g=c.createGain(),at=c.currentTime+delay;
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+t);
  o.connect(g);g.connect(this.master);o.start(at);o.stop(at+t+.04);this.voices.push(o);
  o.onended=()=>{o.disconnect();g.disconnect();this.voices=this.voices.filter(x=>x!==o);};
 }
 effect(kind){this.unlock();const notes=kind==='finish'?[523,659,784,1047,1319]:kind==='right'?[659,784,1047]:kind==='rainbow'?[784,1047,1319]:[784,1047];notes.forEach((n,i)=>this.note(n,.22,i*.07,.05));}
 start(){this.unlock();if(this.music||!this.on)return;this.next=(this.ctx?.currentTime||0)+.08;this.music=setInterval(()=>this.schedule(),100);this.schedule();}
 schedule(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx;const tune=[659,0,784,880,784,659,587,0,523,659,784,0,880,784,659,0,698,0,880,1047,880,784,698,0,587,698,784,0,659,587,523,0];while(this.next<c.currentTime+.2){const n=tune[this.step%32],d=Math.max(0,this.next-c.currentTime);if(n)this.note(n,.32,d,.018,'triangle');if(this.step%8===0){this.note([261.63,220,174.61,196][Math.floor(this.step/8)%4],.8,d,.014);this.note([392,330,261.63,293.66][Math.floor(this.step/8)%4],.6,d+.02,.008);}this.step++;this.next+=.3;}}
 stop(){clearInterval(this.music);this.music=null;this.voices.forEach(o=>{try{o.stop();}catch(_){}});this.voices=[];window.speechSynthesis?.cancel();}
 say(text){if(!this.on||!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.83;const voice=speechSynthesis.getVoices().find(v=>v.lang==='en-US');if(voice)u.voice=voice;if(this.master)this.master.gain.setTargetAtTime(.3,this.ctx.currentTime,.1);const restore=()=>{if(this.master&&this.ctx&&this.ctx.state!=='closed')this.master.gain.setTargetAtTime(.7,this.ctx.currentTime,.15);};u.onend=restore;u.onerror=restore;speechSynthesis.speak(u);}
 toggle(){this.on=!this.on;localStorage.setItem('myStarsGameSoundV1',this.on?'on':'off');if(!this.on)this.stop();else this.start();}
 destroy(){this.stop();if(this.ctx)this.ctx.close().catch(()=>{});}
}
function openGame(){
 if(active||!eligibility().can)return;
 active=new StarCatch();active.open();
}
class StarCatch {
 constructor(){this.root=null;this.sound=new Sound();this.phase='lobby';this.items=[];this.elapsed=0;this.score=0;this.credit=0;this.spawnAt=0;this.last=0;this.countdown=3;this.questionIndex=0;this.roundSaved=false;this.roundId='r'+Date.now().toString(36)+Math.random().toString(36).slice(2);this.lease=null;this.release=null;this.frame=0;this.timers=new Set();this.buddyX=50;this.lastX=50;this.effects=0;this.originalFocus=document.activeElement;this.originalInert=app.inert;this.roundDay=day();this.onHidden=()=>{if(document.hidden)this.pause('Take a little break.');};this.onDay=()=>this.close(false);this.onPage=()=>this.close(false);this.onKey=e=>this.key(e);this.heartbeat=null;}
 later(fn,delay){const id=setTimeout(()=>{this.timers.delete(id);if(this.root?.isConnected)fn();},delay);this.timers.add(id);return id;}
 open(){
  this.originalMusic=app.querySelector('#musicToggle')?.classList.contains('music-on');
  if(this.originalMusic){app.querySelector('#musicToggle').click();localStorage.setItem('myStarsMusic','on');}
  this.scrollY=scrollY;app.inert=true;app.setAttribute('aria-hidden','true');document.documentElement.classList.add('sc-game-open');
  this.root=document.createElement('section');this.root.id='sc-root';this.root.className='sc-root';this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-label','Star Catch game');
  this.root.innerHTML=`<div class="sc-sky" aria-hidden="true"><div class="sc-rainbow">${art('rainbow')}</div><div class="sc-cloud sc-cloud-a"></div><div class="sc-cloud sc-cloud-b"></div><div class="sc-hill sc-hill-a"></div><div class="sc-hill sc-hill-b"></div>${Array.from({length:23},(_,i)=>`<span class="sc-sky-star" style="--x:${(i*37+4)%97}%;--y:${(i*23+8)%87}%;--d:${10+i%7}s;--delay:-${i*.8}s;--size:${12+(i%4)*5}px">${art('star')}</span>`).join('')}</div><header class="sc-header"><button class="sc-icon sc-back" aria-label="Exit game">${buttonIcon('back')}</button><div class="sc-title"><span>MY STARS · PLAY TIME</span><strong>Star Catch</strong></div><div class="sc-round-progress"><span id="sc-time">1:00</span><div><i id="sc-fill"></i></div></div><div class="sc-score-card"><span>GAME SCORE</span><strong id="sc-score">0</strong></div><button class="sc-icon sc-audio" aria-label="${this.sound.on?'Turn sound off':'Turn sound on'}">${buttonIcon(this.sound.on?'sound':'mute')}</button><button class="sc-icon sc-pause" aria-label="Pause game">${buttonIcon('pause')}</button></header><div class="sc-stage" aria-label="Tap falling stars"></div><div class="sc-buddy-position"><div class="sc-buddy-shadow"></div><button class="sc-buddy" aria-label="Say hello to Star Buddy">${art('buddy')}</button></div><footer class="sc-footer"><span id="sc-hint">Tap a star. Watch it sparkle!</span><span class="sc-safe-stars">Reward stars: <b>${eligibility().stars}</b> · not spent</span></footer><div class="sc-effects" aria-hidden="true"></div><div class="sc-panels"></div><div class="sc-screenreader" role="status" aria-live="polite"></div>`;
  document.body.append(this.root);
  this.stage=this.root.querySelector('.sc-stage');this.panels=this.root.querySelector('.sc-panels');this.fx=this.root.querySelector('.sc-effects');this.buddy=this.root.querySelector('.sc-buddy');
  this.root.querySelector('.sc-back').onclick=()=>this.exitPrompt();
  this.root.querySelector('.sc-pause').onclick=()=>this.pause();
  this.root.querySelector('.sc-audio').onclick=()=>{this.sound.toggle();const b=this.root.querySelector('.sc-audio');b.innerHTML=buttonIcon(this.sound.on?'sound':'mute');b.setAttribute('aria-label',this.sound.on?'Turn sound off':'Turn sound on');if(this.phase!=='playing'&&this.phase!=='question')this.sound.stop();};
  this.buddy.onclick=()=>{const r=this.buddy.getBoundingClientRect();this.burst(r.x+r.width/2,r.y+r.height/2,9);this.wiggleBuddy();this.sound.effect('tap');this.announce('You can do it!');};
  document.addEventListener('visibilitychange',this.onHidden);document.addEventListener('mystars:daychange',this.onDay);window.addEventListener('pagehide',this.onPage);document.addEventListener('keydown',this.onKey,true);
  this.heartbeat=setInterval(()=>{
   if(this.lease&&!this.release){try{const held=JSON.parse(localStorage.getItem(LEASE));if(held?.token!==this.lease){notify('A game is open in another tab.');this.close();return;}localStorage.setItem(LEASE,JSON.stringify({token:this.lease,until:Date.now()+120000}));}catch(_){this.pause('Ask a grown-up for help.');}}
  },8000);
  this.lobby();this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 announce(text){if(this.root)this.root.querySelector('.sc-screenreader').textContent=text;}
 panel(html){this.panels.innerHTML=`<div class="sc-panel">${html}</div>`;const focus=this.panels.querySelector('button');if(focus)focus.focus({preventScroll:true});}
 lobby(){this.phase='lobby';this.root.dataset.phase='lobby';this.panel(`<div class="sc-kicker">YOUR LITTLE STAR WORLD</div><div class="sc-lobby-art">${art('buddy')}<span>${art('star')}</span><i>${art('heart')}</i></div><h1>Ready to sparkle?</h1><p>Tap the falling stars.<br>Find a word. Have fun!</p><div class="sc-round-note">1-minute rounds · no lost stars</div><button class="sc-button sc-primary" id="sc-start">LET'S PLAY ${buttonIcon('play')}</button><button class="sc-button sc-subtle" id="sc-home">BACK HOME</button>`);this.panels.querySelector('#sc-start').onclick=()=>this.start();this.panels.querySelector('#sc-home').onclick=()=>this.close();}
 async acquire(){
  if(this.lease)return true;
  const token=this.roundId;
  if(navigator.locks?.request){
   const acquired=await new Promise(resolve=>{navigator.locks.request('myStarsStarCatch',{ifAvailable:true},lock=>{if(!lock){resolve(false);return;}return new Promise(release=>{this.release=release;this.lease=token;resolve(true);});}).catch(()=>resolve(false));});return acquired;
  }
  try{const old=JSON.parse(localStorage.getItem(LEASE));if(old&&old.until>Date.now())return false;localStorage.setItem(LEASE,JSON.stringify({token,until:Date.now()+120000}));this.lease=token;return true;}catch(_){return false;}
 }
 async start(){
  if(this.starting||!['lobby','results'].includes(this.phase))return;this.starting=true;
  if(!eligibility().can){this.starting=false;notify('Play time is not available.');return;}
  if(!await this.acquire()){this.starting=false;notify('Star Catch is already open in another tab.');return;}
  if(!this.root?.isConnected){this.releaseLease();return;}
  this.starting=false;this.items.forEach(x=>x.el.remove());this.items=[];this.elapsed=0;this.score=0;this.credit=0;this.questionIndex=0;this.roundSaved=false;this.roundDay=day();this.roundId='r'+Date.now().toString(36)+Math.random().toString(36).slice(2);this.spawnAt=.2;this.countdown=3;this.phase='countdown';this.root.dataset.phase='countdown';this.sound.unlock();
  this.panel('<div class="sc-count-number">3</div><h2>Here we go!</h2>');this.updateHUD();this.last=performance.now();this.sound.effect('tap');
 }
 reserve(dt){
  if(this.roundDay!==day())return false;
  if(this.credit>=dt){this.credit-=dt;return true;}
  const s=store();if(!s.enabled||!eligibility().approved)return false;
  const needed=Math.ceil(dt-this.credit), grant=Math.min(needed,s.limitSeconds-s.usedSeconds);
  if(grant>0){s.usedSeconds+=grant;if(!write(s))return false;this.credit+=grant;}
  if(this.credit<dt)return false;this.credit-=dt;return true;
 }
 tick(t){
  if(!this.root?.isConnected)return;
  const dt=this.last?Math.max(0,(t-this.last)/1000):0;this.last=t;
  if(this.phase==='countdown'){
   const prev=Math.ceil(this.countdown);this.countdown-=Math.min(dt,.25);
   if(this.countdown<=0){this.phase='playing';this.root.dataset.phase='playing';this.panels.replaceChildren();this.sound.start();this.announce('Tap the falling stars!');}
   else if(Math.ceil(this.countdown)!==prev){const el=this.panels.querySelector('.sc-count-number');if(el)el.textContent=Math.ceil(this.countdown);this.sound.effect('tap');}
  }
  if(['playing','question'].includes(this.phase)){
   if(!this.reserve(dt)){this.finish('All played for today!');}
   else{
    this.elapsed+=dt;this.updateHUD();
    if(this.elapsed>=60)this.finish();
    else if(this.phase==='playing'){
     if(this.elapsed>=this.spawnAt){this.spawn();this.spawnAt=this.elapsed+1.45;}
     if((this.questionIndex===0&&this.elapsed>=18)||(this.questionIndex===1&&this.elapsed>=40))this.question();
     this.moveItems(Math.min(dt,.1));
    }
   }
  }
  // Character follows the most recently caught star, with a soft delayed glide.
  this.buddyX+=(this.lastX-this.buddyX)*Math.min(1,dt*3);
  this.root.querySelector('.sc-buddy-position').style.left=this.buddyX+'%';
  this.frame=requestAnimationFrame(n=>this.tick(n));
 }
 updateHUD(){const remaining=Math.max(0,60-Math.floor(this.elapsed));this.root.querySelector('#sc-time').textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;this.root.querySelector('#sc-fill').style.width=Math.min(100,this.elapsed/60*100)+'%';this.root.querySelector('#sc-score').textContent=this.score;}
 spawn(){
  if(this.items.length>=5)return;
  const r=Math.random(),kind=r<.07?'rainbow':r<.20?'heart':r<.27?'gold':'star';
  const item={x:12+Math.random()*76,y:reduced()?15+Math.random()*52:-12,life:0,kind,points:kind==='rainbow'?3:kind==='heart'||kind==='gold'?2:1,phase:Math.random()*6.28,speed:9+Math.random()*3,el:document.createElement('button')};
  item.el.className=`sc-target sc-target-${kind}`;item.el.type='button';item.el.innerHTML=art(kind);item.el.setAttribute('aria-label',`Catch ${kind==='gold'?'golden star':kind}`);
  item.el.style.left=item.x+'%';item.el.style.top=item.y+'%';
  // Large hit areas; pointerdown catches taps without scrolling or click delay.
  const catchIt=e=>{if(e.type==='pointerdown')e.preventDefault();this.catch(item);};
  item.el.addEventListener('pointerdown',catchIt);item.el.addEventListener('click',catchIt);
  this.stage.append(item.el);this.items.push(item);
 }
 moveItems(dt){
  this.items=this.items.filter(item=>{
   item.life+=dt;
   const focused=document.activeElement===item.el;
   if(!reduced()&&!focused)item.y+=item.speed*dt;
   item.el.style.top=item.y+'%';
   const wave=reduced()?0:Math.sin(item.phase+item.life*1.1)*13;
   item.el.style.transform=`translateX(${wave}px) rotate(${reduced()?0:Math.sin(item.life*1.6+item.phase)*9}deg)`;
   if(item.y>88 || (reduced()&&!focused&&item.life>8)){item.el.remove();return false;}return true;
  });
 }
 catch(item){
  if(this.phase!=='playing'||!this.items.includes(item)||item.caught)return;
  item.caught=true;const rect=item.el.getBoundingClientRect();this.items=this.items.filter(i=>i!==item);
  this.score+=item.points;this.updateHUD();this.lastX=Math.max(15,Math.min(85,rect.x/innerWidth*100));
  this.burst(rect.x+rect.width/2,rect.y+rect.height/2,kindCount(item.kind));this.flyScore(rect.x+rect.width/2,rect.y+rect.height/2,item.points);
  this.sound.effect(item.kind==='rainbow'?'rainbow':'tap');this.wiggleBuddy();
  if(item.kind==='rainbow'){this.root.classList.add('sc-rainbow-party');this.later(()=>this.root.classList.remove('sc-rainbow-party'),1400);this.root.querySelector('#sc-hint').textContent='Rainbow magic!';}
  else if(item.kind==='gold')this.root.querySelector('#sc-hint').textContent='Super star!';
  else this.root.querySelector('#sc-hint').textContent=['Nice catch!','Look at you shine!','Sparkle, sparkle!'][this.score%3];
  if(reduced()){item.el.remove();return;}
  const a=item.el.animate([{opacity:1,scale:1},{opacity:1,scale:1.22,offset:.4},{opacity:0,scale:.3}],{duration:280,easing:'ease-out'});a.onfinish=()=>item.el.remove();this.later(()=>item.el.remove(),350);
 }
 wiggleBuddy(){if(reduced())return;this.buddy.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(4px) scale(1.12,.88)',offset:.18},{transform:'translateY(-22px) rotate(-7deg) scale(.96,1.06)',offset:.55},{transform:'translateY(0) scale(1)'}],{duration:630,easing:'cubic-bezier(.2,.8,.3,1)'});}
 burst(x,y,count=14){
  if(reduced())return;
  for(let i=0;i<count&&this.effects<70;i++){
   const el=document.createElement('span');el.className='sc-particle';el.innerHTML=i%4===0?art('heart'):art('star');el.style.left=x+'px';el.style.top=y+'px';el.style.width=(9+i%3*5)+'px';this.fx.append(el);this.effects++;
   const angle=i/count*Math.PI*2,distance=35+Math.random()*65;
   const a=el.animate([{transform:'translate(-50%,-50%) scale(.7)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(angle)*distance}px),calc(-50% + ${Math.sin(angle)*distance+24}px)) rotate(${i*43}deg) scale(.25)`,opacity:0}],{duration:650+Math.random()*400,easing:'cubic-bezier(.15,.7,.25,1)'});
   let done=false;const clean=()=>{if(done)return;done=true;el.remove();this.effects--;};a.onfinish=clean;this.later(clean,1150);
  }
 }
 flyScore(x,y,value){
  const label=document.createElement('span');label.className='sc-float-score';label.textContent='+'+value;label.style.left=x+'px';label.style.top=y+'px';this.fx.append(label);
  if(!reduced())label.animate([{transform:'translate(-50%,0) scale(.7)',opacity:1},{transform:'translate(-50%,-65px) scale(1.1)',opacity:0}],{duration:1000,easing:'ease-out'});this.later(()=>label.remove(),1050);
  const score=this.root.querySelector('.sc-score-card');if(!reduced())score.animate([{transform:'scale(1)'},{transform:'scale(1.09)'},{transform:'scale(1)'}],{duration:400});
 }
 question(){
  this.phase='question';this.root.dataset.phase='question';this.questionIndex++;
  this.targetWord=this.questionIndex===1?'apple':'sun';this.questionAnswered=false;
  const word=this.targetWord;
  this.panel(`<div class="sc-kicker">LITTLE WORD BREAK</div><h2>Find the ${word}!</h2><button class="sc-button sc-listen" id="sc-listen">${buttonIcon('sound')} LISTEN</button><div class="sc-word-choices">${['apple','dog','sun'].sort(()=>Math.random()-.5).map(k=>`<button class="sc-word-choice" data-word="${k}"><span>${art(k)}</span><strong>${k[0].toUpperCase()+k.slice(1)}</strong></button>`).join('')}</div><p class="sc-word-feedback">Tap a picture.</p>`);
  this.panels.querySelector('#sc-listen').onclick=()=>this.sound.say('Find the '+word);
  this.panels.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{
   if(this.questionAnswered||this.phase!=='question')return;
   if(b.dataset.word!==word){this.panels.querySelector('.sc-word-feedback').textContent='Try another picture.';if(!reduced())b.animate([{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:320});return;}
   this.questionAnswered=true;this.panels.querySelectorAll('[data-word]').forEach(x=>{x.disabled=true;});b.classList.add('sc-word-right');this.panels.querySelector('.sc-word-feedback').textContent='Yes! '+word[0].toUpperCase()+word.slice(1)+'!';
   this.score+=2;this.updateHUD();this.sound.effect('right');this.sound.say('Yes! '+word);const r=b.getBoundingClientRect();this.burst(r.x+r.width/2,r.y+r.height/2,18);
   this.later(()=>{if(this.phase==='question'){this.phase='playing';this.root.dataset.phase='playing';this.panels.replaceChildren();this.spawnAt=this.elapsed+.5;}},1400);
  });
  this.sound.say('Find the '+word);
 }
 pause(message='A little break.'){
  if(!['playing','question','countdown'].includes(this.phase))return;
  this.beforePause=this.phase;this.phase='paused';this.root.dataset.phase='paused';this.savedPanel=this.panels.firstElementChild;this.panels.replaceChildren();this.sound.stop();
  this.panel(`<div class="sc-pause-art">${art('buddy')}</div><h2>${esc(message)}</h2><p>Your game is waiting.</p><button id="sc-resume" class="sc-button sc-primary">KEEP PLAYING ${buttonIcon('play')}</button><button id="sc-quit" class="sc-button sc-subtle">BACK HOME</button>`);
  this.panels.querySelector('#sc-resume').onclick=()=>this.resume();this.panels.querySelector('#sc-quit').onclick=()=>this.close();
 }
 resume(){
  const g=eligibility();if(!g.approved||!g.enabled||this.roundDay!==day()){this.finish('All played for now.');return;}
  this.panels.replaceChildren();if(this.savedPanel)this.panels.append(this.savedPanel);this.savedPanel=null;
  this.phase=this.beforePause||'playing';this.root.dataset.phase=this.phase;this.last=performance.now();this.sound.start();
  // An answered word break may have completed while paused. Do not trap it.
  if(this.phase==='question'&&this.questionAnswered){this.phase='playing';this.root.dataset.phase='playing';this.panels.replaceChildren();}
 }
 exitPrompt(){if(['lobby','results'].includes(this.phase)){this.close();return;}if(this.phase==='paused'){this.close();return;}this.pause('Ready to go home?');}
 saveRound(completed){
  if(this.roundSaved)return;this.roundSaved=true;
  const s=store();s.best=Math.max(s.best,this.score);s.rounds.unshift({id:this.roundId,game:'star-catch',score:this.score,seconds:Math.floor(this.elapsed),completed,date:new Date().toISOString()});s.rounds=s.rounds.slice(0,20);write(s);
 }
 finish(title='You did it!'){
  if(this.phase==='results')return;this.phase='results';this.root.dataset.phase='results';this.sound.stop();this.saveRound(true);this.releaseLease();this.items.forEach(i=>i.el.remove());this.items=[];
  const g=eligibility(),s=store();
  this.panel(`<div class="sc-kicker">STAR CATCHER</div><div class="sc-result-medal">${art('medal')}</div><h2>${esc(title)}</h2><p>Look at you shine!</p><div class="sc-result-score"><strong>${this.score}</strong><span>GAME POINTS</span></div><div class="sc-best">Your best: ${s.best}</div><div class="sc-safe-card">${art('star')}<span><b>${g.stars} reward stars</b><br>Still safe for your prizes.</span></div><button id="sc-again" class="sc-button sc-primary" ${g.can?'':'disabled'}>${g.can?'PLAY AGAIN':'ALL PLAYED TODAY'}</button><button id="sc-finish-home" class="sc-button sc-subtle">BACK HOME</button>`);
  this.panels.querySelector('#sc-again').onclick=()=>this.start();this.panels.querySelector('#sc-finish-home').onclick=()=>this.close();
  this.sound.effect('finish');this.announce(`${title} ${this.score} game points. Your reward stars have not changed.`);
  if(!reduced())for(let i=0;i<5;i++)this.later(()=>{const bounds=this.root.getBoundingClientRect();this.burst(bounds.width*(.18+i*.16),bounds.height*(.22+(i%2)*.3),16);},i*240);
 }
 releaseLease(){if(this.release){this.release();this.release=null;}if(this.lease){try{const lease=JSON.parse(localStorage.getItem(LEASE));if(lease?.token===this.lease)localStorage.removeItem(LEASE);}catch(_){}this.lease=null;}}
 key(e){
  if(!this.root?.isConnected)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.exitPrompt();return;}
  if(e.key==='Tab'){
   const buttons=[...this.root.querySelectorAll('button:not(:disabled),select')].filter(el=>el.offsetWidth&&el.offsetHeight&&(!this.panels.children.length||this.panels.contains(el)||el.closest('.sc-header')));
   if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];
   if(e.shiftKey&&(document.activeElement===first||!this.root.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }
 close(restore=true){
  if(!this.root?.isConnected)return;
  if(this.elapsed>0&&!this.roundSaved)this.saveRound(false);
  cancelAnimationFrame(this.frame);clearInterval(this.heartbeat);this.timers.forEach(clearTimeout);this.timers.clear();this.sound.destroy();this.releaseLease();
  document.removeEventListener('visibilitychange',this.onHidden);document.removeEventListener('mystars:daychange',this.onDay);window.removeEventListener('pagehide',this.onPage);document.removeEventListener('keydown',this.onKey,true);
  this.root.remove();app.inert=this.originalInert;app.removeAttribute('aria-hidden');document.documentElement.classList.remove('sc-game-open');active=null;renderSignature='';updateEntry();
  if(restore){scrollTo(0,this.scrollY);this.originalFocus?.focus?.({preventScroll:true});if(this.originalMusic&&!app.querySelector('#musicToggle')?.classList.contains('music-on'))app.querySelector('#musicToggle')?.click();}
 }
}
function kindCount(kind){return kind==='rainbow'?24:kind==='gold'?20:12;}
})();
