/* Step four: three names, chosen off a board.
   An empty text box is the worst version of this: it asks you to remember
   fifty names and spell them. A ranked field puts the likely ones in front of
   you, orders them the way the market does, and still takes a write-in for
   anyone it has missed. The list filters as you type rather than re-rendering,
   so the caret survives the first keystroke. */
(()=>{
const AWARDS=[['mvp','Most Valuable Player','Nearly always a quarterback. Nearly.'],
 ['opoy','Offensive Player of the Year','The one who broke a number, which is not always the MVP.'],
 ['dpoy','Defensive Player of the Year','The one an offence has to build a plan around.']];

const row=(k,c,on)=>{const t=T[c.t];
 return `<button class="cnd${on?' on':''}" data-pick="${k}" data-n="${esc(c.n.toLowerCase())}"
  ${c.o?'data-board':''} data-name="${esc(c.n)}" data-team="${esc(c.t)}"
  data-pos="${esc(c.p)}" data-odds="${esc(c.o)}"
  ${t?`style="--tc:${t.c}"`:''} aria-pressed="${on}">
${mark(t,'xs')}<span class="cnn">${esc(c.n)}</span>
<span class="cnt">${esc(c.t)} · ${esc(c.p)}</span><span class="cno">${esc(c.o)}</span></button>`};

const chosen=(k,a)=>{const t=a.team?T[a.team]:null;
 return `<div class="pick"${t?` style="--tc:${t.c};--tf:${t.f}"`:''}>
${mark(t,'bg')}
<span class="pkn">${esc(a.player)}</span>
<span class="pkm">${a.team?esc(a.team):'no team'}${a.pos?' · '+esc(a.pos):''}${a.odds?' · '+esc(a.odds):''}</span>
<button class="pkx" data-clear="${k}">Change</button></div>`};

/* Pat and Patrick Surtain are one man, and only one of them should come back
   from a search. Matching on the surname and the club catches the nickname the
   odds board used; requiring one first name to start the other keeps it from
   swallowing two different players who happen to share both. */
const nameKey=n=>{const c=n.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/,'').trim()
  .split(/\s+/).map(w=>w.replace(/[^a-z]/g,''));
 return {first:c[0]||'', last:c[c.length-1]||''}};
const samePerson=(a,b)=>a.last===b.last&&!!a.first&&!!b.first&&
 (a.first.startsWith(b.first)||b.first.startsWith(a.first));

const AW=Object.fromEntries(AWARDS.map(a=>[a[0],a]));
const block=([k,title,note])=>{
 const a=S.award[k]||{},list=board(k);
 if(a.player)return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>${chosen(k,a)}</section>`;
 return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>
<p class="hint">${esc(note)}</p>
<div class="finder">
<input class="fsearch" type="search" data-search="${k}" placeholder="Search the board"
 autocomplete="off" spellcheck="false" aria-label="Search ${esc(title)} candidates">
<div class="cnds" data-list="${k}">${list.map(c=>row(k,c,false)).join('')}
<span data-pool="${k}"></span></div>
<p class="cnone" data-none="${k}" hidden>Nobody by that name.</p>
<div class="writein">
<input class="awin" type="text" data-write="${k}" placeholder="Someone else — type a name"
 autocomplete="off" spellcheck="false" aria-label="Write in a ${esc(title)} pick">
</div>
</div></section>`};

SEC.awards={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("awards")}
<h1>Three awards</h1>
</header>
${AWARDS.map(block).join('')}
${nextBar('awards','See your card','#share')}
</div>`},
after(root){
 /* only the award that changed is redrawn, and it fades rather than the page
    re-entering around it */
 /* a blur handler can pull the section out from under a click, so the swap
    falls back to a full redraw rather than throwing on a detached node */
 const swap=(k,el)=>{const sect=el&&el.closest('.sect');
  if(!sect||!sect.parentNode){save();repaint();return}
  sect.outerHTML=block(AW[k]);save();
  const fresh=[...root.querySelectorAll('.sect')].find(x=>x.querySelector(`[data-search="${k}"],[data-clear="${k}"]`));
  if(fresh){fresh.classList.add('fadein')}
  SEC.awards.after(root);syncChrome()};
 const wirePicks=el=>el.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  S.award[b.dataset.pick]={player:b.dataset.name,team:b.dataset.team,
   pos:b.dataset.pos,odds:b.dataset.odds};
  swap(b.dataset.pick,b)});
 wirePicks(root);
 root.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.clear;S.award[k]={};swap(k,b)});
 /* filtered in place: a re-render would replace the input and drop the caret */
 /* The board is what you see; the rest of the league is what you can find.
    Two thousand rows are never in the DOM at rest — they are rendered only
    once there is something to match them against, and only the first fifty of
    those, because past that you are better off typing another letter. They
    arrive in the same list as the board, unannounced: no price beside a name
    is the only thing that says the market never had an opinion on him. */
 const SIDE={mvp:'',opoy:'O',dpoy:'D'};
 root.querySelectorAll('[data-search]').forEach(inp=>{inp.oninput=()=>{
  const k=inp.dataset.search,q=inp.value.trim().toLowerCase();
  const list=root.querySelector(`[data-list="${k}"]`);let n=0;
  const onBoard=[];
  list.querySelectorAll('.cnd[data-board]').forEach(r=>{
   onBoard.push({...nameKey(r.dataset.name),t:r.dataset.team});
   const hit=!q||r.dataset.n.includes(q);r.hidden=!hit;if(hit)n++});
  const pool=root.querySelector(`[data-pool="${k}"]`);
  let extra=[];
  if(q.length>1)extra=rosterFor(SIDE[k])
   .filter(c=>{if(!c.n.toLowerCase().includes(q))return false;
    const k={...nameKey(c.n),t:c.t};
    return !onBoard.some(b=>b.t===k.t&&samePerson(b,k))})
   .slice(0,50);
  pool.innerHTML=extra.map(c=>row(k,c,false)).join('');
  wirePicks(pool);
  const none=root.querySelector(`[data-none="${k}"]`);
  if(none)none.hidden=!!(n+extra.length)}});
 root.querySelectorAll('[data-write]').forEach(inp=>{
  const commit=()=>{const v=inp.value.trim();if(!v)return;
   S.award[inp.dataset.write]={player:v};swap(inp.dataset.write,inp)};
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit()}};
  inp.onblur=commit})}};
})();
