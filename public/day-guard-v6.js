/* My Stars local-calendar compatibility guard.
 * Runs BEFORE the existing app module. Its `day` property is legacy UTC metadata;
 * calendarDayV6 is the authoritative local day. Never changes the star balance,
 * task definitions, rewards or redemption history. No network or scheduled job.
 */
(() => {
  'use strict';
  if (window.MyStarsDay) return;
  const KEY = 'myStarsV1';
  const CALENDAR_KEY='myStarsCalendarDayV6';
  const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const utcDay = () => new Date().toISOString().slice(0,10);
  let loadedDay = localDay(), navigating = false, failed = false;
  function read() {
    try { const v=JSON.parse(localStorage.getItem(KEY)); return v && typeof v==='object' && !Array.isArray(v) ? v : null; }
    catch (_) { return null; }
  }
  function normalize(initial = false) {
    const now=localDay(), data=read();
    const visibleDayChanged=now!==loadedDay;
    if (!data) { try{localStorage.setItem(CALENDAR_KEY,now);}catch(_){failed=true;} loadedDay=now; return {changed:visibleDayChanged, ok:!failed}; }
    // Preserve current legacy progress on first migration. Old UTC dates cannot
    // identify the exact local completion time; archive them before any reset.
    let sideDay; try{sideDay=localStorage.getItem(CALENDAR_KEY);}catch(_){}
    const stored=sideDay || data.calendarDayV6 || ((data.day===now || data.day===utcDay() || !data.day) ? now : data.day);
    const changed=stored!==now;
    let dirty=false;
    if (changed) {
      const archive=Array.isArray(data.dailyArchiveV6)?data.dailyArchiveV6:[];
      if (data.completions && Object.keys(data.completions).length) {
        archive.unshift({day:stored,completions:data.completions});
      }
      data.dailyArchiveV6=archive.slice(0,31);
      data.completions={};
      delete data.lastApproved;
      dirty=true;
    }
    if(data.calendarDayV6!==now || data.day!==utcDay()) dirty=true;
    data.calendarDayV6=now;
    // The unmodified legacy load() compares `day` against UTC. Keep that field
    // compatible while all real rollover decisions above use the local date.
    data.day=utcDay();
    if(dirty || sideDay!==now) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); localStorage.setItem(CALENDAR_KEY,now); failed=false; }
      catch (_) { failed=true; return {changed:false,ok:false}; }
    }
    loadedDay=now;
    return {changed: changed || visibleDayChanged, ok:true};
  }
  function refreshIfNeeded(event) {
    if(navigating) { if(event?.cancelable){event.preventDefault();event.stopImmediatePropagation();} return; }
    // Only rewrite while crossing a local date; regular writes remain owned by
    // the original app, so this guard never overwrites its in-memory state.
    const saved=read();
    if(localDay()===loadedDay && (!saved?.calendarDayV6 || saved.calendarDayV6===loadedDay)) return;
    const result=normalize();
    if(result.changed && result.ok){
      navigating=true;
      if(event?.cancelable){event.preventDefault();event.stopImmediatePropagation();}
      document.dispatchEvent(new CustomEvent('mystars:daychange'));
      location.reload(); // rehydrate the existing app rather than mutate its private state
    }
  }
  normalize(true);
  window.MyStarsDay=Object.freeze({today:localDay, read, check:refreshIfNeeded, storageOK:()=>!failed});
  ['click','pointerdown','keydown','submit'].forEach(type=>document.addEventListener(type,refreshIfNeeded,true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshIfNeeded();});
  window.addEventListener('pageshow',()=>refreshIfNeeded());
  window.addEventListener('focus',()=>refreshIfNeeded());
  window.addEventListener('storage',event=>{if(event.key===KEY)refreshIfNeeded();});
  setInterval(refreshIfNeeded,15000);
  const schedule=()=>{
    const now=new Date(), next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    setTimeout(()=>{refreshIfNeeded(); if(!navigating)schedule();},Math.max(50,next-now+20));
  };
  schedule();
})();
