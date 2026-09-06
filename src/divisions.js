/* Step one: how each division finishes, first through fourth.

   Tap to place, and the list physically reorders as you do.

   The research is against drag here. Karth's comparison of ranking questions
   found drag-and-drop scored no better on usability than entering the order,
   and was no faster; the guidance for small lists on a phone is click-to-rank,
   with drag reserved as the thing you reach for to *adjust* an order that
   already exists — which is what the seeding step is. Four items is also well
   inside the 3-7 that ranking questions are meant to stay within.

   What drag does have over a bare tap-to-rank is that you can see the order
   you are building. So the list sorts itself into the finish order — but only
   once all four are placed, and back to league order if one is taken out. The
   sort is the confirmation, not a running commentary.
   Nothing is randomised — these are teams with a conventional order, and
   shuffling them to dodge a primacy effect would just read as broken. */
(()=>{
const ORD=['1st','2nd','3rd','4th'];

/* first place wears a crown rather than a ring on its number: the badge is
   the place, the crown is what the place wins you */
/* The arrow is the gesture, not decoration — it turns once, clockwise, when
   the division is put back. */
const RESET_ICON='<svg class="dvri" viewBox="0 0 24 24" aria-hidden="true">'
 +'<path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/>'
 +'<path d="M21 3v5h-5"/></svg>';

const CROWN='<svg class="crown" viewBox="0 0 24 20" aria-hidden="true">'
 +'<path d="M1.6 17.6V5.1l6.1 4.4L12 2.6l4.3 6.9 6.1-4.4v12.5z"/></svg>';
const rowOf=(t,rank)=>`<button class="rkr${rank?' on':''}" data-pick="${t.k}"
 data-team="${t.k}" style="--tc:${t.c};--tf:${t.f}" aria-pressed="${!!rank}"
 aria-label="${esc(t.city)} ${esc(t.name)}${rank===1?', wins the division':rank?', '+ORD[rank-1]:', not placed'}">
<i class="rkn">${rank||''}</i>${mark(t,'sm')}
<span class="rkc">${esc(t.city)}</span><span class="rkt">${esc(t.name)}</span>
${rank===1?CROWN:''}</button>`;

/* The list holds its league order while you are still deciding — only the
   badges change — and drops into finish order the moment the fourth place is
   set. Reordering on every tap meant the rows you had not judged yet kept
   moving under your finger, which is the opposite of helpful; this way the
   sort is the thing that tells you the division is done. Take one back out and
   it returns to league order, because the answer is no longer complete. */
function listHTML(conf,div){
 const fin=finOf(conf,div);
 return orderOf(conf,div).map(t=>rowOf(t,fin.indexOf(t.k)+1)).join('')}

const orderOf=(conf,div)=>{const fin=finOf(conf,div);
 return fin.length===4?fin.map(k=>T[k]):divTeams(conf,div)};

/* Rewriting the list was throwing away the very elements whose transitions
   were supposed to carry the change: a replaced row starts life already filled,
   so background and colour arrive instantly however long the transition says.
   Every row is kept and edited in place instead — the fill, the badge and the
   text then cross under the CSS transitions they already declare, and the FLIP
   only has to carry the move. Keeping the nodes also keeps their handlers, so
   there is nothing to rewire. */
function setRow(r,t,rank){
 const on=!!rank;
 r.classList.toggle('on',on);
 r.setAttribute('aria-pressed',String(on));
 r.setAttribute('aria-label',`${t.city} ${t.name}`+
  (rank===1?', wins the division':rank?', '+ORD[rank-1]:', not placed'));
 const n=r.querySelector('.rkn');
 if(n.textContent!==(rank?String(rank):''))n.textContent=rank?String(rank):'';
 const had=r.querySelector('.crown');
 if(rank===1&&!had){r.insertAdjacentHTML('beforeend',CROWN);
  const c=r.querySelector('.crown');
  if(!REDUCED)c.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],
   {duration:240,easing:'cubic-bezier(.2,.8,.3,1)'})}
 else if(rank!==1&&had){
  if(REDUCED){had.remove();return}
  had.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.6)'}],
   {duration:140,easing:'ease-in',fill:'forwards'}).onfinish=()=>had.remove()}}

const REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Order first, then state, and only reorder when the order actually changed.
   Re-inserting an element cancels the transitions running on it, and the old
   version re-appended all four rows on every tap — so the fill was being
   cancelled a moment after it started, on taps where nothing moved at all.
   Now three of four taps touch the DOM order not at all, and on the fourth the
   colour is set after the move rather than before it, so it still has a
   transition to run. */
function relist(box){
 const conf=box.dataset.conf,div=box.dataset.name;
 const list=box.querySelector('.rank'),fin=finOf(conf,div);
 flip(list,()=>{
  const want=orderOf(conf,div).map(t=>t.k);
  if(want.join()!==[...list.children].map(r=>r.dataset.team).join())
   want.forEach(k=>list.appendChild(list.querySelector(`[data-team="${k}"]`)));
  [...list.children].forEach(r=>
   setRow(r,T[r.dataset.team],fin.indexOf(r.dataset.team)+1))})}

const division=(conf,div)=>{
 const fin=finOf(conf,div),key=divKey(conf,div);
 return `<div class="dv" data-div="${esc(key)}" data-conf="${conf}" data-name="${esc(div)}">
<p class="dvl">${esc(div)}<button class="dvr" type="button"
 aria-label="Reset ${conf} ${esc(div)}"${fin.length?'':' hidden'}>${RESET_ICON}Reset</button></p>
<div class="rank">${listHTML(conf,div)}</div></div>`};

SEC.divisions={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("divisions")}
<h1>Division standings</h1>
<p class="lede">Tap the teams in the order you think they will finish.</p>
</header>
${CONFS.map(conf=>`<section class="sect">
<div class="sh"><h4>${conf}</h4></div>
<div class="divs">${DIVS.map(d=>division(conf,d)).join('')}</div></section>`).join('')}
${nextBar('divisions','Seed the conferences','#seeds')}
</div>`},
after(root){wireRank(root);root.querySelectorAll('.dv').forEach(wireReset)}};

/* Per-division reset. Tapping a placed team already removes it, so this is the
   shortcut for redoing a whole division rather than an undo — it needs no
   confirm, because it costs four taps at most and sits next to what it clears.
   The header Clear keeps its two-tap confirm: that one wipes all thirty-two. */
function wireReset(box){
 const r=box.querySelector('.dvr');if(!r)return;
 const key=box.dataset.div;
 toggleCtl(r,!!(S.fin[key]||[]).length);
 r.onclick=()=>{
  S.fin[key]=[];reconcile();save();
  relist(box);
  /* Let the arrow finish its turn before the chip leaves — cutting the spin
     off halfway reads as a glitch. The hide is guarded because a fresh pick
     inside those 300ms puts something back worth resetting. */
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)toggleCtl(r,false);
  else{r.classList.add('spin');
   setTimeout(()=>{if(!(S.fin[key]||[]).length)toggleCtl(r,false)},300);
   setTimeout(()=>r.classList.remove('spin'),560)}
  syncChrome()}}

function wireRank(root){
 root.querySelectorAll('.dv [data-pick]').forEach(b=>b.onclick=()=>{
  const box=b.closest('.dv'),key=box.dataset.div,k=b.dataset.pick;
  const fin=(S.fin[key]||[]).slice(),at=fin.indexOf(k);
  if(at>=0)fin.splice(at,1); else if(fin.length<4)fin.push(k); else return;
  S.fin[key]=fin;reconcile();save();
  relist(box);
  wireReset(box);syncChrome()})}

/* First, Last, Invert, Play. Measure where every row is, let the list reorder,
   then put each row back where it was and release it — so the rows travel to
   their new places instead of teleporting. */
/* The move is animated through the Web Animations API rather than an inline
   transition. The inline version wrote transition:transform onto the row and
   never took it off, so from a row's first move onward its transition property
   was transform and nothing else — the fill and the text colour had no
   transition left to run under, however long the stylesheet said. An animate()
   call leaves the element's own styles alone, so the move and the colour cross
   at the same time. */
function flip(list,mutate){
 const before=new Map([...list.children].map(r=>[r.dataset.team,r.getBoundingClientRect().top]));
 mutate();
 if(REDUCED)return;
 [...list.children].forEach(r=>{
  const was=before.get(r.dataset.team);if(was==null)return;
  const dy=was-r.getBoundingClientRect().top;
  if(!dy)return;
  r.animate([{transform:`translateY(${dy}px)`},{transform:'none'}],
   {duration:300,easing:'cubic-bezier(.2,.7,.3,1)'})})}
})();
