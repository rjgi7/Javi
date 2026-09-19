/* My Stars: parent-only reward management and reversible local controls.
   No cloud sync. Does not alter task approvals or game scores. */
(() => {
'use strict';
if (window.__myStarsParentsV7) return;
window.__myStarsParentsV7 = true;
const KEY = 'myStarsV1', UNDO = 'myStarsParentsUndoV7', FLASH = 'myStarsParentsFlashV7';
const app = document.getElementById('app');
if (!app) return;
const choices = [['ice','Ice cream'],['popcorn','Movie'],['teddy','Toy'],['gift','Gift'],['book','Book'],['star','Star']];
const defaults = [
 {id:'ice',title:'Ice Cream',emoji:'🍦',cost:20},
 {id:'movie',title:'Movie Night',emoji:'🍿',cost:35},
 {id:'toy',title:'Small Toy',emoji:'🧸',cost:50},
 {id:'big',title:'Big Surprise',emoji:'🎁',cost:75}
];
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
function read(){try {return JSON.parse(localStorage.getItem(KEY)) || {stars:14,rewards:defaults};}catch(_){return {};}}
function parent(){return !!app.querySelector('.parent-grid') && sessionStorage.getItem('myStarsParentUnlocked') === 'yes';}
function pause(){const p=read().parentPauseV7;return p && Number.isFinite(p.until) && p.until > Date.now() ? p : null;}
function blocked(kind){const p=pause();return !!p && (p.scope===kind || p.scope==='both');}
function titleIcon(r){return r.iconV7 || ({ice:'ice',movie:'popcorn',toy:'teddy',big:'gift'}[r.id]) || 'gift';}
function icon(kind){
 const bodies={
  ice:'<path d="M22 31h20L32 58Z" fill="#dda260"/><path d="M16 28a11 11 0 0 1 7-17 11 11 0 0 1 19 0 11 11 0 0 1 7 17c4 10-6 15-12 9-4 5-8 5-12 0-8 6-15-1-9-9Z" fill="#f4a4c6" stroke="#d879a2" stroke-width="2"/><circle cx="26" cy="25" r="2" fill="#594063"/><circle cx="38" cy="25" r="2" fill="#594063"/>',
  popcorn:'<path d="M16 23h32l-5 35H21Z" fill="#fff0c4" stroke="#d6a344" stroke-width="2"/><path d="M24 23l2 33m12-33-2 33" stroke="#e68ba6" stroke-width="6"/><g fill="#ffdb75"><circle cx="20" cy="20" r="8"/><circle cx="31" cy="13" r="10"/><circle cx="43" cy="19" r="9"/></g>',
  teddy:'<g fill="#dfb080" stroke="#b78355" stroke-width="2"><circle cx="19" cy="16" r="8"/><circle cx="45" cy="16" r="8"/><ellipse cx="32" cy="46" rx="16" ry="14"/><circle cx="32" cy="28" r="19"/></g><circle cx="26" cy="26" r="2"/><circle cx="38" cy="26" r="2"/><ellipse cx="32" cy="35" rx="8" ry="6" fill="#fff0da"/>',
  gift:'<rect x="12" y="27" width="40" height="31" rx="5" fill="#bfa4e9"/><rect x="9" y="20" width="46" height="12" rx="4" fill="#cfbafa"/><path d="M29 21h6v37h-6Z" fill="#ffc5db"/><path d="M32 21C8 20 18-5 32 21c14-26 24-1 0 0Z" fill="#f4a9cb" stroke="#c88ab5" stroke-width="2"/>',
  book:'<path d="M7 14q14-5 25 4 11-9 25-4v39q-15-5-25 3-10-8-25-3Z" fill="#a9cbed" stroke="#779cbf" stroke-width="2"/><path d="M32 18v38" stroke="white" stroke-width="3"/>',
  star:'<path d="M32 5 41 22 59 25 46 38 49 57 32 48 15 57 18 38 5 25 23 22Z" fill="#ffd66b" stroke="#d6a345" stroke-width="2"/><circle cx="25" cy="32" r="2" fill="#745563"/><circle cx="39" cy="32" r="2" fill="#745563"/>'
 };
 return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+(bodies[kind]||bodies.star)+'</svg>';
}
let dialog=null, lastFocus=null, frame=0, refreshing=false;
function notify(message){let el=document.getElementById('pv7-notice');if(!el){el=document.createElement('div');el.id='pv7-notice';el.setAttribute('role','status');document.body.append(el);}el.textContent=message;clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.remove(),4200);}
function close(){if(dialog){dialog.remove();dialog=null;app.inert=false;}document.documentElement.classList.remove('pv7-dialog-open');lastFocus?.focus?.({preventScroll:true});}
function show(title,body){
 if(!parent()){close();return;}
 if(!dialog)lastFocus=document.activeElement;
 else dialog.remove();
 dialog=document.createElement('div');dialog.className='pv7-overlay';
 dialog.innerHTML='<section class="pv7-dialog" role="dialog" aria-modal="true" aria-labelledby="pv7-title"><header><div><span class="pv7-kicker">PARENTS ONLY</span><h2 id="pv7-title">'+esc(title)+'</h2></div><button type="button" class="pv7-close" aria-label="Close">×</button></header><div class="pv7-content">'+body+'</div><p class="pv7-local">Saved on this device only. Phone/tablet sync is not connected.</p></section>';
 app.inert=true;document.body.append(dialog);document.documentElement.classList.add('pv7-dialog-open');dialog.querySelector('.pv7-close').onclick=close;
 dialog.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key!=='Tab')return;
  const nodes=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(el=>el.getClientRects().length);
  const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 });
 dialog.querySelector('.pv7-close').focus({preventScroll:true});
}
const field=(label,id,html)=>'<label class="pv7-field" for="'+id+'"><span>'+label+'</span>'+html+'</label>';
const error=message=>{let el=dialog?.querySelector('.pv7-error');if(!el){el=document.createElement('p');el.className='pv7-error';el.setAttribute('role','alert');dialog?.querySelector('.pv7-content')?.append(el);}el.textContent=message;};
function reload(message){refreshing=true;if(message)sessionStorage.setItem(FLASH,message);location.reload();}
function commit(label,keys,edit){
 if(!parent()){close();return false;}
 try {
  window.MyStarsDay?.check();
  const stored=localStorage.getItem(KEY);
  const raw=stored || JSON.stringify({childName:'Superstar',stars:14,tasks:[{id:'bed',title:'Make my bed',emoji:'🛏️',points:2,active:true},{id:'teeth',title:'Brush my teeth',emoji:'🪥',points:2,active:true},{id:'toys',title:'Pick up toys',emoji:'🧸',points:3,active:true},{id:'dress',title:'Get dressed',emoji:'👕',points:2,active:true}],rewards:defaults,completions:{},history:[],goalRewardId:'ice',day:new Date().toISOString().slice(0,10)}),f=JSON.parse(raw);
  if(!f||!Array.isArray(f.tasks)||!Array.isArray(f.rewards))throw Error('Open Kid Mode once before changing rewards.');
  const next=JSON.parse(raw),before={};keys.forEach(k=>before[k]={exists:k in f,value:f[k]});
  edit(next);
  if(!Array.isArray(next.rewards)||!next.rewards.length)throw Error('Keep at least one active reward.');
  const after={};keys.forEach(k=>after[k]={exists:k in next,value:next[k]});
  if(same(before,after)){error('No changes to save.');return false;}
  if(localStorage.getItem(KEY)!==stored)throw Error('The data changed in another tab. Please reopen this control.');
  next.parentEventsV7=[{label,at:new Date().toISOString()},...(Array.isArray(f.parentEventsV7)?f.parentEventsV7:[])].slice(0,60);
  const oldUndo=localStorage.getItem(UNDO);
  const undo={label,before,after,at:Date.now()};
  localStorage.setItem(UNDO,JSON.stringify(undo));
  try{localStorage.setItem(KEY,JSON.stringify(next));}catch(e){if(oldUndo===null)localStorage.removeItem(UNDO);else localStorage.setItem(UNDO,oldUndo);throw e;}
  reload(label+' Saved.');return true;
 }catch(e){error(e.name==='QuotaExceededError'?'Storage is full. Nothing was changed.':e.message||'Could not save. Nothing was changed.');return false;}
}
function confirm(title,message,action){
 show(title,'<p class="pv7-confirm">'+message+'</p><div class="pv7-actions"><button id="pv7-confirm" class="pv7-button pv7-primary">Confirm</button><button id="pv7-cancel" class="pv7-button">Cancel</button></div>');
 const yes=dialog?.querySelector('#pv7-confirm');if(!yes)return;
 yes.onclick=()=>{yes.disabled=true;action();if(yes.isConnected)yes.disabled=false;};dialog.querySelector('#pv7-cancel').onclick=close;
}
function undoLast(){
 let u;try{u=JSON.parse(localStorage.getItem(UNDO));}catch(_){}
 if(!u){notify('No saved parent change to undo.');return;}
 confirm('Undo last change?',esc(u.label)+'<br>This restores only the fields from this change, not today’s tasks.',()=>{
  if(!parent())return;
  try{
   const f=read();
   for(const k of Object.keys(u.after)){if(!same({exists:k in f,value:f[k]},u.after[k]))throw Error('Those values changed again. Undo was stopped to protect newer progress.');}
   Object.entries(u.before).forEach(([k,v])=>{if(v.exists)f[k]=v.value;else delete f[k];});
   f.parentEventsV7=[{label:'Undid: '+u.label,at:new Date().toISOString()},...(f.parentEventsV7||[])].slice(0,60);
   localStorage.setItem(KEY,JSON.stringify(f));localStorage.removeItem(UNDO);reload('Last parent change undone.');
  }catch(e){error(e.message||'Could not undo.');}
 });
}
function rewards(){
 const f=read(),archived=Array.isArray(f.archivedRewardsV7)?f.archivedRewardsV7:[];
 const row=(r,off)=>'<article class="pv7-reward"><span class="pv7-art">'+icon(titleIcon(r))+'</span><div class="pv7-grow"><strong>'+esc(r.title)+'</strong><small>'+esc(r.cost)+' stars'+(off?' · hidden':'')+'</small></div><div class="pv7-row-actions">'+(off?'<button class="pv7-button pv7-restore" data-id="'+esc(r.id)+'">Restore</button>':'<button class="pv7-button pv7-edit" data-id="'+esc(r.id)+'">Edit</button><button class="pv7-button pv7-archive" data-id="'+esc(r.id)+'">Hide</button>')+'</div></article>';
 show('Manage rewards','<p>Choose the name, picture and star cost. Short English names are easiest to read in the app.</p><button id="pv7-add-reward" class="pv7-button pv7-primary pv7-wide">+ Add a reward</button><div class="pv7-list">'+(f.rewards||[]).map(r=>row(r,false)).join('')+'</div>'+(archived.length?'<details class="pv7-details"><summary>Hidden rewards ('+archived.length+')</summary><div class="pv7-list">'+archived.map(r=>row(r,true)).join('')+'</div></details>':'')+'<p class="pv7-help">Hiding a reward does not erase its past claims or refund stars.</p>');
 if(!dialog)return;
 dialog.querySelector('#pv7-add-reward').onclick=()=>editReward();
 dialog.querySelectorAll('.pv7-edit').forEach(b=>b.onclick=()=>editReward(b.dataset.id));
 dialog.querySelectorAll('.pv7-archive').forEach(b=>b.onclick=()=>{
  const r=f.rewards.find(x=>x.id===b.dataset.id);if(!r)return;
  confirm('Hide this reward?',esc(r.title)+' will disappear from the shop. You can restore it later.',()=>commit('Reward hidden',['rewards','archivedRewardsV7','goalRewardId'],n=>{
   if(n.rewards.length<=1)throw Error('Keep at least one active reward.');
   const at=n.rewards.findIndex(x=>x.id===r.id);if(at<0)throw Error('Reward already changed.');
   const [item]=n.rewards.splice(at,1);n.archivedRewardsV7=[...(n.archivedRewardsV7||[]),item];
   if(n.goalRewardId===r.id)n.goalRewardId=n.rewards[0].id;
  }));
 });
 dialog.querySelectorAll('.pv7-restore').forEach(b=>b.onclick=()=>commit('Reward restored',['rewards','archivedRewardsV7'],n=>{
  const list=n.archivedRewardsV7||[],at=list.findIndex(r=>r.id===b.dataset.id);if(at<0)throw Error('Reward already changed.');
  if(n.rewards.length>=20)throw Error('Keep the shop to 20 active rewards or fewer.');
  n.rewards.push(list.splice(at,1)[0]);n.rewards.sort((a,b)=>a.cost-b.cost);
 }));
}
function editReward(id){
 const r=id?read().rewards.find(x=>x.id===id):{title:'',cost:20,iconV7:'gift'};if(!r)return;
 show(id?'Edit reward':'New reward','<form id="pv7-reward-form">'+field('Name in English','pv7-name','<input id="pv7-name" maxlength="40" required value="'+esc(r.title)+'" placeholder="Pick a bedtime story">')+field('Stars needed','pv7-cost','<input id="pv7-cost" type="number" inputmode="numeric" min="1" max="9999" step="1" required value="'+esc(r.cost)+'">')+field('Picture','pv7-icon','<select id="pv7-icon">'+choices.map(([key,label])=>'<option value="'+key+'" '+(key===titleIcon(r)?'selected':'')+'>'+label+'</option>').join('')+'</select>')+'<div id="pv7-picture-preview" class="pv7-picture-preview">'+icon(titleIcon(r))+'</div><button class="pv7-button pv7-primary pv7-wide" type="submit">Save reward</button><p class="pv7-help">Only future claims use the new price. Past claims and stars already spent are unchanged.</p></form>');
 if(!dialog)return;
 dialog.querySelector('#pv7-icon').onchange=e=>{dialog.querySelector('#pv7-picture-preview').innerHTML=icon(e.target.value);};
 dialog.querySelector('#pv7-reward-form').onsubmit=e=>{
  e.preventDefault();const title=dialog.querySelector('#pv7-name').value.trim(),cost=Number(dialog.querySelector('#pv7-cost').value),picture=dialog.querySelector('#pv7-icon').value;
  if(!title||title.length>40||!Number.isInteger(cost)||cost<1||cost>9999||!choices.some(c=>c[0]===picture)){error('Enter a name and a whole star cost from 1 to 9999.');return;}
  commit(id?'Reward updated':'Reward added',['rewards','goalRewardId'],n=>{
   if(!id&&n.rewards.length>=20)throw Error('Keep the shop to 20 active rewards or fewer.');
   if(n.rewards.some(x=>x.id!==id&&x.title.toLowerCase()===title.toLowerCase()))throw Error('A reward with this name already exists.');
   if(id){const existing=n.rewards.find(x=>x.id===id);if(!existing)throw Error('This reward changed. Reopen the editor.');Object.assign(existing,{title,cost,iconV7:picture});}
   else n.rewards.push({id:'reward-'+(crypto.randomUUID?.()||Date.now().toString(36)),title,cost,emoji:'🎁',iconV7:picture});
   n.rewards.sort((a,b)=>a.cost-b.cost);if(!n.rewards.some(x=>x.id===n.goalRewardId))n.goalRewardId=n.rewards[0].id;
  });
 };
}
function adjust(){
 const stars=Number(read().stars)||0;
 show('Adjust stars','<div class="pv7-balance">'+icon('star')+'<strong>'+stars+'</strong><span>current stars</span></div><form id="pv7-adjust-form">'+field('Action','pv7-direction','<select id="pv7-direction"><option value="remove">Remove stars</option><option value="add">Add stars</option></select>')+field('How many?','pv7-amount','<input id="pv7-amount" type="number" inputmode="numeric" min="1" max="9999" step="1" required value="1">')+field('Parent note (not shown to your child)','pv7-reason','<input id="pv7-reason" maxlength="80" required placeholder="Example: Correct a duplicate bonus">')+'<p class="pv7-help">No automatic deductions. A brief pause is available separately and keeps earned stars safe.</p><button type="submit" class="pv7-button pv7-primary pv7-wide">Review change</button></form>');
 if(!dialog)return;
 dialog.querySelector('#pv7-adjust-form').onsubmit=e=>{
  e.preventDefault();const sign=dialog.querySelector('#pv7-direction').value==='remove'?-1:1,amount=Number(dialog.querySelector('#pv7-amount').value),reason=dialog.querySelector('#pv7-reason').value.trim();
  if(!Number.isInteger(amount)||amount<1||amount>9999||!reason){error('Enter a whole number and a brief note.');return;}
  const from=Number(read().stars)||0,to=from+sign*amount;if(to<0){error('There are only '+from+' stars. The balance cannot go below zero.');return;}
  confirm('Confirm star change',from+' → <strong>'+to+' stars</strong><br>'+esc(reason),()=>commit('Stars '+(sign<0?'removed':'added')+': '+reason,['stars'],n=>{if(Number(n.stars)!==from)throw Error('The balance changed. Please review the amount again.');n.stars=to;}));
 };
}
function freshStart(){
 const p=pause();
 show('A fresh start','<p>A short pause for games, claiming prizes, or both. Tasks stay available and earned stars stay safe.</p>'+(p?'<div class="pv7-soft">A pause is active. It ends automatically at '+esc(new Date(p.until).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}))+'.</div><button id="pv7-resume" class="pv7-button pv7-primary pv7-wide">Give a fresh start now</button>':'')+'<form id="pv7-pause-form">'+field('Pause','pv7-scope','<select id="pv7-scope"><option value="games">Games only</option><option value="rewards">Claiming prizes only</option><option value="both">Games and claiming prizes</option></select>')+field('Duration','pv7-duration','<select id="pv7-duration"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select>')+field('A small next step','pv7-step','<select id="pv7-step"><option>Talk with Mom</option><option>Use kind words</option><option>Help tidy up</option></select>')+'<p class="pv7-help">Explain the specific rule calmly. Being upset is okay; this is not a label or a score for being “good.”</p><button type="submit" class="pv7-button pv7-wide">Review pause</button></form>');
 if(!dialog)return;
 const resume=dialog.querySelector('#pv7-resume');if(resume)resume.onclick=()=>commit('Fresh start given',['parentPauseV7'],n=>{delete n.parentPauseV7;});
 dialog.querySelector('#pv7-pause-form').onsubmit=e=>{
  e.preventDefault();const scope=dialog.querySelector('#pv7-scope').value,minutes=Number(dialog.querySelector('#pv7-duration').value),step=dialog.querySelector('#pv7-step').value;
  if(!['games','rewards','both'].includes(scope)||![5,10,15].includes(minutes))return;
  confirm('Start a brief pause?',minutes+' minutes. Stars will not be removed.<br>Next step: '+esc(step),()=>commit('Brief pause started',['parentPauseV7'],n=>{n.parentPauseV7={scope,step,until:Date.now()+minutes*60000};}));
 };
}
function resetRewards(){
 show('Reset test rewards','<p>Nothing is erased until you choose an option and confirm. Daily tasks and game scores are not reset.</p><section class="pv7-soft"><h3>Clear reward claims</h3><p>Empty the claimed-prize history. This does not refund spent stars. Stickers based on this history may change.</p><label class="pv7-check"><input type="checkbox" id="pv7-zero"> Also set reward stars to 0</label><button id="pv7-clear" class="pv7-button pv7-wide">Review history reset</button></section><section class="pv7-soft"><h3>Restore example rewards</h3><p>Restore Ice Cream, Movie Night, Small Toy and Big Surprise. Custom rewards are kept under Hidden rewards. Stars and claims stay unchanged.</p><button id="pv7-defaults" class="pv7-button pv7-wide">Review example rewards</button></section>');
 if(!dialog)return;
 dialog.querySelector('#pv7-clear').onclick=()=>{
  const zero=dialog.querySelector('#pv7-zero').checked;
  confirm('Clear claimed rewards?',zero?'The prize history will be cleared and reward stars set to 0. Tasks and game records stay unchanged.':'The prize history will be cleared. The star balance and tasks stay unchanged.',()=>commit('Reward claims reset',zero?['history','stars']:['history'],n=>{n.history=[];if(zero)n.stars=0;}));
 };
 dialog.querySelector('#pv7-defaults').onclick=()=>confirm('Restore example rewards?','Four example prizes will be restored. Custom prizes stay saved under Hidden rewards. No stars are removed.',()=>commit('Example rewards restored',['rewards','archivedRewardsV7','goalRewardId'],n=>{
  const all=[...n.rewards,...(n.archivedRewardsV7||[])],old=new Map();
  all.forEach(r=>{if(!defaults.some(d=>d.id===r.id))old.set(r.id,r);});
  n.archivedRewardsV7=[...old.values()];n.rewards=JSON.parse(JSON.stringify(defaults));n.goalRewardId='ice';
 }));
}
const controlled=new Map(),readyBadges=new Map();
function disable(el,on){
 if(on){if(!controlled.has(el))controlled.set(el,el.disabled);el.disabled=true;el.classList.add('pv7-blocked');}
 else if(controlled.has(el)){el.disabled=controlled.get(el);controlled.delete(el);el.classList.remove('pv7-blocked');}
}
function install(){
 frame=0;
 if(refreshing)return;
 const dashboard=app.querySelector('.parent-grid');
 if(dashboard&&parent()&&!document.getElementById('pv7-controls')){
  const card=document.createElement('section');card.id='pv7-controls';card.className='card parent-section pv7-controls';
  card.innerHTML='<div class="eyebrow">REWARDS & GUIDANCE</div><h3>Make it your own</h3><p>Simple controls. No automatic penalties.</p><div class="pv7-shortcuts"><button id="pv7-manage" class="pv7-button">'+icon('gift')+'<span>Manage rewards</span></button><button id="pv7-adjust" class="pv7-button">'+icon('star')+'<span>Adjust stars</span></button><button id="pv7-fresh" class="pv7-button">'+icon('book')+'<span>A fresh start</span></button><button id="pv7-reset" class="pv7-button">'+icon('popcorn')+'<span>Reset test rewards</span></button></div><button id="pv7-undo" class="pv7-button pv7-wide">Undo last parent change</button><p class="pv7-local">Controls on this device only.</p>';
  dashboard.querySelector('.parent-column')?.prepend(card);
  card.querySelector('#pv7-manage').onclick=rewards;card.querySelector('#pv7-adjust').onclick=adjust;card.querySelector('#pv7-fresh').onclick=freshStart;card.querySelector('#pv7-reset').onclick=resetRewards;card.querySelector('#pv7-undo').onclick=undoLast;
 }
 if(dialog&&!parent())close();
 const p=pause(),kid=app.querySelector('.kid-right');let notice=app.querySelector('#pv7-kid-pause');
 if(kid&&p&&!notice){notice=document.createElement('section');notice.id='pv7-kid-pause';notice.className='pv7-kid-pause';notice.innerHTML='<span class="pv7-art">'+icon('star')+'</span><div><strong>Let’s try again</strong><p></p><small>Your stars are safe.</small></div>';kid.prepend(notice);}
 if(notice){if(!p)notice.remove();else {const text=notice.querySelector('p');if(text.textContent!==p.step)text.textContent=p.step;}}
 const gateGames=blocked('games'),gateRewards=blocked('rewards');
 const entryText=app.querySelector('#sc-entry-status');
 if(entryText){
  if(gateGames){if(!entryText.dataset.pv7Previous)entryText.dataset.pv7Previous=entryText.textContent;if(entryText.textContent!=='Play time is taking a little break.')entryText.textContent='Play time is taking a little break.';}
  else if(entryText.dataset.pv7Previous){entryText.textContent=entryText.dataset.pv7Previous;delete entryText.dataset.pv7Previous;}
 }
 let gameNote=document.getElementById('pv7-game-pause');
 const gamePanel=document.querySelector('#sc-root .sc-panel');
 if(gateGames&&gamePanel&&!gameNote){gameNote=document.createElement('p');gameNote.id='pv7-game-pause';gameNote.className='pv7-help';gameNote.textContent='Play time is paused. Ask Mom for a fresh start.';gamePanel.append(gameNote);}
 if(gameNote&&!gateGames)gameNote.remove();
 // Use the game's existing pause control; never touch its score or time ledger.
 const game=document.getElementById('sc-root');
 if(game&&gateGames&&['playing','question','countdown'].includes(game.dataset.phase))game.querySelector('.sc-pause')?.click();
 document.querySelectorAll('.redeemBtn').forEach(b=>disable(b,gateRewards));
 document.querySelectorAll('#sc-play-button,#sc-start,#sc-resume,#sc-again').forEach(b=>disable(b,gateGames));
 for(const [el] of controlled)if(!el.isConnected)controlled.delete(el);
 app.querySelectorAll('.reward .ready-tag').forEach(el=>{if(gateRewards){if(!readyBadges.has(el))readyBadges.set(el,el.textContent);if(el.textContent!=='PAUSED')el.textContent='PAUSED';}else if(readyBadges.has(el)){el.textContent=readyBadges.get(el);readyBadges.delete(el);}});
 for(const [el] of readyBadges)if(!el.isConnected)readyBadges.delete(el);
 // Custom illustrations never rely on the tablet's emoji font.
 const f=read();
 (f.rewards||[]).filter(r=>r.iconV7).forEach(r=>{
  const row=[...app.querySelectorAll('.reward')].find(el=>el.classList.contains('reward-'+r.id));
  const images=[row?.querySelector('.vector-reward-icon'),[...app.querySelectorAll('.road-stop')][f.rewards.indexOf(r)]?.querySelector('.road-icon')];
  if(f.goalRewardId===r.id)images.push(app.querySelector('.inline-reward-icon'));
  document.querySelectorAll('.overlay .modal').forEach(m=>{if(m.querySelector('h2')?.textContent.toLowerCase().includes(r.title.toLowerCase()))images.push(m.querySelector('.prize'));});
  images.filter(Boolean).forEach(image=>{if(image.dataset.pv7!==r.iconV7||!image.querySelector('svg')){image.innerHTML=icon(r.iconV7);image.dataset.pv7=r.iconV7;}});
 });
}
function schedule(){if(!frame)frame=requestAnimationFrame(install);}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
new MutationObserver(schedule).observe(document.body,{childList:true});
// Capture phase blocks touch, keyboard-generated clicks, and stale open confirmations.
for(const type of ['click','pointerdown'])document.addEventListener(type,e=>{
 const target=e.target instanceof Element?e.target.closest('button'):null;if(!target)return;
 const gameButton=target.matches('#sc-play-button,#sc-start,#sc-resume,#sc-again');
 const claimButton=target.matches('.redeemBtn')||(target.id==='yes'&&target.closest('.overlay .modal')&&!dialog);
 if((gameButton&&blocked('games'))||(claimButton&&blocked('rewards'))){e.preventDefault();e.stopImmediatePropagation();notify('A little pause. Ask Mom for a fresh start.');}
},true);
window.addEventListener('storage',e=>{if(e.key===KEY&&!refreshing)reload();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
setInterval(()=>{if(!document.hidden)schedule();},1000);
install();
try{const message=sessionStorage.getItem(FLASH);if(message){sessionStorage.removeItem(FLASH);notify(message);}}catch(_){}
})();
