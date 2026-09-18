/* My Stars — Little Star World. Presentation only: never changes points, approvals,
   PIN, rewards or history. No network, third-party assets or dependencies. */
(() => {
  'use strict';
  if (window.__myStarsDelightV5) return;
  window.__myStarsDelightV5 = true;
  const root = document.documentElement;
  const app = document.getElementById('app');
  if (!app) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionKey = 'myStarsCalmMotion';
  let calm = false;
  try { calm = localStorage.getItem(motionKey) === 'on'; } catch (_) {}
  const still = () => calm || reduced.matches || document.hidden;
  const read = () => { try { return JSON.parse(localStorage.getItem('myStarsV1')) || {}; } catch (_) { return {}; } };
  let svgId = 0, frame = 0, lastBalance = null, gain = 0, helloIndex = 0;
  let chosenReward = null, lastGoal = null, announcedAll = false, helloTime = 0;
  const colors = ['#f2ba35', '#b791ed', '#ed8cb6', '#6abbcc', '#86c3a9'];
  const starPath = 'M60 9 Q63 8 65 14 L77 39 105 43 Q112 44 107 50 L87 70 91 99 Q92 105 85 102 L60 89 35 102 Q28 105 29 99 L33 70 13 50 Q8 44 15 43 L43 39 55 14 Q57 9 60 9Z';
  const smallStar = '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><path d="'+starPath+'" fill="currentColor"/></svg>';
  function art(kind) {
    const id = 'dl-'+(++svgId);
    let body;
    if (kind === 'buddy') {
      body = `<defs><linearGradient id="${id}" x2=".9" y2="1"><stop stop-color="#c3a0ff"/><stop offset="1" stop-color="#8d5ace"/></linearGradient></defs><ellipse cx="60" cy="111" rx="28" ry="4" fill="#dfc9ec" opacity=".5"/><path d="${starPath}" fill="url(#${id})" stroke="#8754b9" stroke-width="1.6"/><path d="M54 22L45 43 22 48" stroke="#ecdcff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/><g class="dl-eyes"><ellipse cx="45" cy="59" rx="4.1" ry="5.5" fill="#382348"/><ellipse cx="75" cy="59" rx="4.1" ry="5.5" fill="#382348"/><circle cx="46" cy="57" r="1.2" fill="white"/><circle cx="76" cy="57" r="1.2" fill="white"/></g><ellipse cx="36" cy="70" rx="6.5" ry="3.5" fill="#fda7cd"/><ellipse cx="84" cy="70" rx="6.5" ry="3.5" fill="#fda7cd"/><path d="M51 71q9 10 18 0" fill="#5d316d" stroke="#5d316d" stroke-width="2.4" stroke-linecap="round"/><path d="M56 77q4-3 8 0" stroke="#ffb4d5" stroke-width="3" stroke-linecap="round"/>`;
    } else if (kind === 'medal') {
      body = '<path d="M33 8h21l6 36-21 6ZM87 8H66l-6 36 21 6Z" fill="#e89bbb" stroke="#cb80a7" stroke-width="2"/><circle cx="60" cy="76" r="32" fill="#f6d276" stroke="#dbaa4d" stroke-width="2"/><circle cx="60" cy="76" r="25" fill="#ffe7a6" stroke="#e7bf61" stroke-width="2"/><path d="M60 57l6 12 14 2-10 9 3 14-13-6-13 6 3-14-10-9 14-2Z" fill="#deac44"/>';
    } else if (kind === 'bed') {
      body = '<rect x="15" y="31" width="13" height="66" rx="5" fill="#879fd4"/><path d="M27 59h73v29H27Z" fill="#a3b5e8"/><path d="M31 56c0-9 12-10 18-6l4 10H31Z" fill="#fffdf8" stroke="#bdcae5" stroke-width="1.5"/><path d="M54 57h35c12 0 16 8 16 17v7H54Z" fill="#d4c3ed" stroke="#b199d3" stroke-width="1.5"/><path d="M17 81h89v12H17Z" fill="#8295c8"/><rect x="96" y="85" width="9" height="18" rx="3" fill="#8295c8"/><path d="M72 66l2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1Z" fill="#fff3b5"/><path d="M43 21l2 5 6 1-4 4 1 5-5-3-5 3 1-5-4-4 6-1Z" fill="#e5bd67"/>';
    } else if (kind === 'brush') {
      body = '<g transform="rotate(35 60 60)"><rect x="47" y="41" width="19" height="68" rx="9" fill="#87c6bc" stroke="#5faaa2" stroke-width="1.8"/><rect x="52" y="55" width="9" height="40" rx="4" fill="#c8ece0"/><rect x="48" y="17" width="22" height="33" rx="7" fill="#f9eee1" stroke="#d7c9bb" stroke-width="1.5"/><path d="M57 21v22m5-22v22m5-22v22" stroke="#94c1d8" stroke-width="3" stroke-linecap="round"/><path d="M48 13q-5-7 3-9 9-2 13 8" fill="#dbb0df" stroke="#b886c3" stroke-width="1.6"/></g><path d="M91 21l3 7 8 2-8 2-3 7-2-7-8-2 8-2Z" fill="#f5c962"/><circle cx="20" cy="57" r="4" fill="none" stroke="#a3d4d6" stroke-width="2"/>';
    } else if (kind === 'shirt') {
      body = '<path d="M43 24l17 8 17-8 27 19-13 20-14-8v51H43V55l-14 8-13-20Z" fill="#9fcfba" stroke="#72ac93" stroke-width="2" stroke-linejoin="round"/><path d="M47 26q13 18 26 0" fill="#f5fffa" stroke="#72ac93" stroke-width="2"/><path d="M49 94h23" stroke="#cbe6d6" stroke-width="3" stroke-linecap="round"/><path d="M60 56l5 11 13 2-9 9 2 13-11-6-11 6 2-13-9-9 13-2Z" fill="#fff0bf" stroke="#dfc07b" stroke-width="1.5"/>';
    } else if (kind === 'ice') {
      body = `<path d="M38 59l22 52 23-52" fill="#ebae68" stroke="#cd8b48" stroke-width="2" stroke-linejoin="round"/><path d="M42 73l28 17M49 91l28-16M48 62l28 17M42 82l28-20" stroke="#d09150" stroke-width="2"/><path d="M30 45c-7-13 3-29 15-27C48 3 73 3 80 19c15 0 24 15 17 27 7 13-4 22-13 18-6 13-17 6-22 2-9 12-22 7-25-2-12 3-22-9-14-20" fill="#ffc0d8" stroke="#eb94bb" stroke-width="2"/><path d="M39 29q2-7 10-7M58 16q9-4 14 3" fill="none" stroke="#fff2f7" stroke-width="5" stroke-linecap="round"/><path d="M34 43l5 3M75 33l5-3M54 27l2 6M72 51l5 2M45 55l5-2" stroke-width="3" stroke-linecap="round" stroke="#9b75cf"/><path d="M60 46l4-5M87 43l2 4" stroke="#61bdb0" stroke-width="3" stroke-linecap="round"/><circle cx="49" cy="49" r="2.8" fill="#674253"/><circle cx="71" cy="49" r="2.8" fill="#674253"/><path d="M56 55q4 5 8 0" fill="none" stroke="#674253" stroke-width="2" stroke-linecap="round"/>`;
    } else if (kind === 'movie' || kind === 'popcorn') {
      body = '<path d="M30 44h62l-9 65H39Z" fill="#fff4d8" stroke="#da9e4d" stroke-width="2"/><path d="M38 47h10l3 59H41ZM57 47h10v60H57ZM77 47h10l-6 59H72Z" fill="#ec829b"/><g fill="#ffe394" stroke="#e9bf65" stroke-width="1.4"><circle cx="34" cy="38" r="12"/><circle cx="48" cy="23" r="13"/><circle cx="67" cy="22" r="14"/><circle cx="83" cy="34" r="15"/><circle cx="57" cy="42" r="14"/><circle cx="70" cy="39" r="11"/></g><circle cx="47" cy="77" r="2.7" fill="#644247"/><circle cx="72" cy="77" r="2.7" fill="#644247"/><path d="M55 85q5 5 10 0" fill="none" stroke="#644247" stroke-width="2.4" stroke-linecap="round"/>';
    } else if (kind === 'toy' || kind === 'teddy') {
      body = '<g stroke="#ad754c" stroke-width="1.8"><circle cx="34" cy="28" r="15" fill="#d8a172"/><circle cx="86" cy="28" r="15" fill="#d8a172"/><ellipse cx="60" cy="88" rx="26" ry="26" fill="#d8a172"/><circle cx="60" cy="51" r="32" fill="#e7b88c"/><ellipse cx="39" cy="109" rx="14" ry="9" fill="#e7b88c"/><ellipse cx="81" cy="109" rx="14" ry="9" fill="#e7b88c"/></g><circle cx="33" cy="27" r="8" fill="#f3ceac"/><circle cx="87" cy="27" r="8" fill="#f3ceac"/><ellipse cx="60" cy="59" rx="15" ry="11" fill="#fff1d7"/><circle cx="45" cy="47" r="3.2" fill="#634a3e"/><circle cx="75" cy="47" r="3.2" fill="#634a3e"/><path d="M56 55q4-3 8 0l-4 5Z" fill="#634a3e"/><path d="M51 64q9 6 18 0" fill="none" stroke="#634a3e" stroke-width="2" stroke-linecap="round"/><path d="M57 79l-15-6v16l15-5 6 0 15 5V73l-15 6Z" fill="#ab86da"/>';
    } else if (kind === 'big' || kind === 'gift') {
      body = '<rect x="22" y="47" width="77" height="61" rx="9" fill="#b5a0eb" stroke="#8970c8" stroke-width="2"/><rect x="17" y="37" width="87" height="22" rx="6" fill="#c7b4f6" stroke="#8970c8" stroke-width="2"/><path d="M60 39C7 33 40-13 60 39c18-51 53-6 0 0Z" fill="#f4b0cf" stroke="#d488b5" stroke-width="2.5"/><path d="M53 39h14v69H53Z" fill="#ffc3dc"/><path d="M35 74l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fff4c7"/>';
    } else body = `<path d="${starPath}" fill="#f5c64b" stroke="#e5ac28" stroke-width="2"/><path d="M52 24l-9 22-22 4" fill="none" stroke="#fff5b7" stroke-width="5" stroke-linecap="round"/>`;
    return '<svg class="dl-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">'+body+'</svg>';
  }
  const world = document.createElement('div');
  world.id = 'dl-world'; world.setAttribute('aria-hidden','true');
  world.innerHTML = '<div class="dl-rainbow"></div><div class="dl-cloud cloud-a"></div><div class="dl-cloud cloud-b"></div>';
  for (let i=0;i<36;i++) {
    const star = document.createElement('span'); star.className='dl-sky-star';
    // Even coverage at the edges and between cards, not one cluster offscreen.
    const x = ((i*37+3)%100), y = ((i*23+6)%94);
    star.style.cssText=`left:${x}%;top:${y}%;width:${12+(i%5)*5}px;height:${12+(i%5)*5}px;color:${colors[i%5]};--sway:${(i%2?1:-1)*(10+i%13)}px;--rise:${14+i%23}px;--dur:${10+i%9}s;--delay:-${i*.73}s;--tilt:${i%2?18:-18}deg;`;
    star.innerHTML=smallStar;world.appendChild(star);
  }
  document.body.prepend(world);
  const particles=document.createElement('div');particles.id='dl-particles';particles.setAttribute('aria-hidden','true');document.body.appendChild(particles);
  const live=document.createElement('div');live.className='dl-live';live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.appendChild(live);
  root.classList.add('delight-on');root.dataset.delight='5';
  function motionState(){root.classList.toggle('dl-calm',calm||reduced.matches);root.classList.toggle('dl-sleep',document.hidden);if(still())particles.replaceChildren();}
  motionState();reduced.addEventListener?.('change',motionState);document.addEventListener('visibilitychange',motionState);
  function animate(el,frames,options){if(still()||!el?.animate)return null;return el.animate(frames,options);}
  function cleanupAnimation(el,a,ttl){if(a)a.finished.then(()=>el.remove(),()=>el.remove());setTimeout(()=>el.remove(),ttl);}
  function burst(x,y,count=10,spread=85){
    if(still()||!Number.isFinite(x)||!Number.isFinite(y))return;
    const room=Math.max(0,75-particles.children.length);
    for(let i=0;i<Math.min(count,room);i++){
      const el=document.createElement('span');el.className='dl-particle';el.innerHTML=smallStar;
      const angle=(i/count)*Math.PI*2, radius=spread*(.5+(i%4)*.18),size=8+i%4*3;
      el.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;color:${colors[i%5]}`;
      particles.appendChild(el);
      const a=animate(el,[{transform:'translate(-50%,-50%) scale(.3)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(angle)*radius}px),calc(-50% + ${Math.sin(angle)*radius-25}px)) rotate(${i*39}deg) scale(1)`,opacity:.9,offset:.7},{transform:`translate(calc(-50% + ${Math.cos(angle)*radius*1.2}px),calc(-50% + ${Math.sin(angle)*radius+30}px)) rotate(${i*61}deg) scale(.5)`,opacity:0}],{duration:950+(i%3)*110,easing:'cubic-bezier(.12,.65,.25,1)',fill:'both'});
      cleanupAnimation(el,a,1500);
    }
  }
  function center(el){const r=el?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:{x:innerWidth/2,y:innerHeight/3};}
  function note(text,kind='star'){
    document.querySelector('.dl-note')?.remove();const n=document.createElement('div');n.className='dl-note';
    const mark=document.createElement('span');mark.innerHTML=art(kind);const t=document.createElement('span');t.textContent=text;n.append(mark,t);document.body.appendChild(n);live.textContent=text;
    animate(n,[{opacity:0,transform:'translate(-50%,15px) scale(.94)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:300,easing:'ease-out'});setTimeout(()=>n.remove(),2600);
  }
  function hello(button){
    if(Date.now()-helloTime<1200)return;helloTime=Date.now();
    const texts=['You can do it!','One job at a time!','I believe in you!','Look at you shine!'];
    note(texts[helloIndex++%texts.length],'buddy');const c=center(button);burst(c.x,c.y,12,75);
    animate(button.querySelector('.dl-art'),[{transform:'rotate(0) scale(1)'},{transform:'rotate(-12deg) scale(1.1)'},{transform:'rotate(9deg) scale(1.1)'},{transform:'rotate(0) scale(1)'}],{duration:700});
  }
  function floatPoints(amount){
    const counter=app.querySelector('#kidStarTotal');if(!counter)return;
    const target=center(counter), source=center(app.querySelector('.task-approved')||counter);
    if(!still()&&target.y>0&&target.y<innerHeight){
      const from={x:Math.max(30,Math.min(innerWidth-30,source.x)),y:Math.max(90,Math.min(innerHeight-65,source.y))};
      const el=document.createElement('span');el.className='dl-points-flight';el.textContent='+'+amount;const s=document.createElement('i');s.innerHTML=smallStar;el.append(s);el.style.left=from.x+'px';el.style.top=from.y+'px';particles.appendChild(el);
      const a=animate(el,[{transform:'translate(-50%,-50%) scale(.8)',opacity:0},{transform:'translate(-50%,-70%) scale(1.15)',opacity:1,offset:.18},{transform:`translate(calc(-50% + ${target.x-from.x}px),calc(-50% + ${target.y-from.y}px)) scale(.55)`,opacity:0}],{duration:1050,easing:'cubic-bezier(.25,.6,.35,1)',fill:'both'});cleanupAnimation(el,a,1400);
      const end=Number(counter.textContent)||0,start=Math.max(0,end-amount),now=performance.now();
      const tick=(time)=>{if(!counter.isConnected)return;const p=Math.min(1,(time-now)/850);counter.textContent=String(Math.round(start+(end-start)*(1-(1-p)**3)));if(p<1&&!still())requestAnimationFrame(tick);else counter.textContent=String(end);};requestAnimationFrame(tick);
      setTimeout(()=>{if(counter.isConnected){burst(target.x,target.y,10,50);animate(counter,[{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],{duration:400});}},800);
    }
    note('You earned '+amount+' stars!');
  }
  function enhanceKid(shell,data){
    shell.dataset.dlReady='true';
    const hero=shell.querySelector('.kid-hero');
    const stats=shell.querySelector('.stats'), progressCard=shell.querySelector('.progress-card');
    if(stats&&progressCard){const summary=document.createElement('div');summary.className='dl-summary';stats.parentNode.insertBefore(summary,stats);summary.append(stats,progressCard);}
    const old=hero.querySelector('.buddy-wrap');
    if(old){const b=document.createElement('button');b.className='buddy-wrap dl-buddy';b.type='button';b.setAttribute('aria-label','Say hi to your star friend');b.innerHTML=art('buddy');b.addEventListener('click',()=>hello(b));old.replaceWith(b);}
    hero.querySelector('.eyebrow')?.setAttribute('class','eyebrow dl-greeting');
    const stars=shell.querySelector('.star-stat');if(stars)stars.innerHTML=art('star');const medal=shell.querySelector('.medal-stat');if(medal)medal.innerHTML=art('medal');
    const progress=shell.querySelector('.progress > div');if(progress){progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Stars saved toward your prize');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');progress.setAttribute('aria-valuenow',String(parseInt(progress.style.width)||0));animate(progress,[{transform:'scaleX(.85)'},{transform:'scaleX(1)'}],{duration:500});}
    const cards=[...shell.querySelectorAll('.task')];
    cards.forEach(c=>{ const key=['bed','brush','teddy','shirt'].find(k=>c.classList.contains('task-color-'+k)); if(key)c.querySelector('.vector-task-icon').innerHTML=art(key); });
    cards.forEach((c,i)=>{c.style.setProperty('--card-index',i);if(c.classList.contains('task-pending'))c.querySelector('.doneBtn')?.setAttribute('aria-label','Waiting for Mom to approve this task');});
    shell.querySelectorAll('.reward').forEach((r,i)=>{
      const key=['ice','movie','toy','big'].find(k=>r.classList.contains('reward-'+k));if(key)r.querySelector('.vector-reward-icon').innerHTML=art(key);
      r.style.setProperty('--prize-index',i);
    });
    const goal=(data.rewards||[]).find(r=>r.id===data.goalRewardId);if(goal){const icon=shell.querySelector('.inline-reward-icon');if(icon)icon.innerHTML=art(goal.id);}
    shell.querySelectorAll('.road-stop').forEach((stop,i)=>{
      const r=(data.rewards||[])[i];const key=r?.id||['ice','movie','toy','big'][i];stop.querySelector('.road-icon').innerHTML=art(key);
      stop.setAttribute('role','button');stop.setAttribute('tabindex','0');stop.setAttribute('aria-label',r?`${r.title}: ${r.cost} stars`:'View reward');
      const preview=()=>{if(!r)return;const target=[...shell.querySelectorAll('.reward')].find(c=>c.classList.contains('reward-'+r.id)); target?.scrollIntoView({behavior:still()?'auto':'smooth',block:'center'});const n=Math.max(0,r.cost-(Number(data.stars)||0));note(n?`${n} more stars for ${r.title}.`:`${r.title}: finish your jobs, then choose.`,key);const c=center(stop);burst(c.x,c.y,7,40);};stop.addEventListener('click',preview);stop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();preview();}});
    });
    if(gain>0){const amount=gain;gain=0;setTimeout(()=>floatPoints(amount),250);}
    const all=cards.length>0&&cards.every(c=>c.classList.contains('task-approved'));
    if(all&&!announcedAll){announcedAll=true;if(lastBalance!==null){const banner=shell.querySelector('.all-done-banner');if(banner){const c=center(banner);setTimeout(()=>{if(banner.isConnected)burst(c.x,c.y,22,155);},500);}}}else if(!all)announcedAll=false;
    if(lastGoal&&goal&&lastGoal!==goal.id){const c=center(shell.querySelector('.progress-card'));setTimeout(()=>burst(c.x,c.y,12,90),100);}lastGoal=data.goalRewardId||lastGoal;
  }
  function decorate(){
    frame=0;const data=read();const current=typeof data.stars==='number'?data.stars:Number(app.querySelector('#kidStarTotal')?.textContent);
    const shell=app.querySelector('.kid-shell');root.dataset.dlScene=shell?'kid':app.querySelector('.parent-grid')?'parent':'settings';world.hidden=!shell;
    if(Number.isFinite(current)){if(lastBalance!==null&&current>lastBalance)gain+=current-lastBalance;lastBalance=current;}
    if(shell&&!shell.dataset.dlReady){
      if(!Array.isArray(data.rewards)||!data.rewards.length) data.rewards=[...shell.querySelectorAll('.reward')].map((r,i)=>({id:['ice','movie','toy','big'][i]||'gift',title:r.querySelector('.reward-title')?.textContent||'Prize',cost:parseInt(r.querySelector('.points')?.textContent)||0}));
      if(!Number.isFinite(data.stars)) data.stars=current||0;
      if(!data.goalRewardId){const stops=[...shell.querySelectorAll('.road-stop')];data.goalRewardId=data.rewards[stops.findIndex(s=>s.classList.contains('goal'))]?.id;}
      enhanceKid(shell,data);
    }
    const settings=app.querySelector('.settings-card');
    if(settings&&!settings.querySelector('#dl-motion')){
      const btn=document.createElement('button');btn.type='button';btn.id='dl-motion';btn.className='btn btn-soft w-full mt10';
      const label=()=>{btn.textContent=(calm||reduced.matches)?'GENTLE MOTION: ON':'GENTLE MOTION: OFF';btn.setAttribute('aria-pressed',String(calm||reduced.matches));};label();
      btn.addEventListener('click',()=>{calm=!calm;try{localStorage.setItem(motionKey,calm?'on':'off');}catch(_){}motionState();label();});settings.append(btn);
      const version=document.createElement('div');version.className='dl-version';version.textContent='My Stars · Little Star World';settings.append(version);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(decorate);}
  new MutationObserver(schedule).observe(app,{childList:true});
  function upgradeModal(w){
    if(w.dataset.dlModal)return;w.dataset.dlModal='true';const m=w.querySelector('.modal');if(!m)return;
    const celebrated=m.classList.contains('reward-celebration');m.classList.add(celebrated?'dl-celebrate':'dl-confirm');
    w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');const title=m.querySelector('h2');if(title){title.id='dl-dialog-title-'+(++svgId);w.setAttribute('aria-labelledby',title.id);}
    const data=read();const r=(data.rewards||[]).find(x=>x.id===chosenReward)||(data.rewards||[]).find(x=>title?.textContent.toLowerCase().includes(x.title.toLowerCase()));
    if(r&&m.querySelector('.prize'))m.querySelector('.prize').innerHTML=art(r.id);
    const close=m.querySelector('#no')||m.querySelector('#yay');const buttons=[...m.querySelectorAll('button')];
    w.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close?.click();}if(e.key==='Tab'&&buttons.length){const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    close?.focus({preventScroll:true});
    if(celebrated){
      const ribbon=document.createElement('div');ribbon.className='dl-earned-ribbon';ribbon.textContent='YOU DID IT!';m.prepend(ribbon);
      const prize=m.querySelector('.prize');animate(prize,[{transform:'translateY(35px) scale(.4) rotate(-8deg)',opacity:0},{transform:'translateY(-8px) scale(1.07) rotate(3deg)',opacity:1,offset:.72},{transform:'translateY(0) scale(1) rotate(0)',opacity:1}],{duration:800,easing:'cubic-bezier(.18,.65,.32,1)',fill:'both'});
      [130,550,1000].forEach((delay,i)=>setTimeout(()=>{if(!w.isConnected)return;const rect=m.getBoundingClientRect();burst(rect.left+rect.width*[.2,.8,.5][i],rect.top+rect.height*[.28,.3,.48][i],22,145);},delay));
    }
  }
  new MutationObserver(records=>{for(const record of records)for(const n of record.addedNodes)if(n.nodeType===1){if(n.classList.contains('overlay'))upgradeModal(n);else if(n.style.position==='fixed'&&n.style.zIndex==='50'&&n.style.bottom==='22px')n.classList.add('dl-core-toast');}}).observe(document.body,{childList:true});
  app.addEventListener('pointerdown',e=>{
    const b=e.target.closest('button');if(!b||b.disabled||root.dataset.dlScene!=='kid')return;
    animate(b,[{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:220});
    if(b.matches('.doneBtn,.saveBtn,.redeemBtn')){const c=center(b);burst(c.x,c.y,8,55);}
  });
  app.addEventListener('click',e=>{const b=e.target.closest('.redeemBtn');if(b)chosenReward=b.dataset.id;},true);
  schedule();
})();
