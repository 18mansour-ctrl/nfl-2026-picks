/* Step one: how each division finishes, first through fourth.

   Tap to place, and the list physically reorders as you do.

   The research is against drag here. Karth's comparison of ranking questions
   found drag-and-drop scored no better on usability than entering the order,
   and was no faster; the guidance for small lists on a phone is click-to-rank,
   with drag reserved as the thing you reach for to *adjust* an order that
   already exists — which is what the seeding step is. Four items is also well
   inside the 3-7 that ranking questions are meant to stay within.

   What drag does have over a bare tap-to-rank is that you can see the order
   you are building. So the row moves: tapping a team lifts it into the ranked
   group and everything slides, which is the same feedback without the gesture.
   Nothing is randomised — these are teams with a conventional order, and
   shuffling them to dodge a primacy effect would just read as broken. */
(()=>{
const ORD=['1st','2nd','3rd','4th'];

const rowOf=(t,rank)=>`<button class="rkr${rank?' on':''}" data-pick="${t.k}"
 data-team="${t.k}" style="--tc:${t.c};--tf:${t.f}" aria-pressed="${!!rank}"
 aria-label="${esc(t.city)} ${esc(t.name)}${rank?', '+ORD[rank-1]:', not placed'}">
<i class="rkn">${rank||''}</i>${mark(t,'sm')}
<span class="rkc">${esc(t.city)}</span><span class="rkt">${esc(t.name)}</span></button>`;

function listHTML(conf,div){
 const fin=finOf(conf,div);
 const rest=divTeams(conf,div).filter(t=>!fin.includes(t.k));
 return fin.map((k,i)=>rowOf(T[k],i+1)).join('')+rest.map(t=>rowOf(t,0)).join('')}

const division=(conf,div)=>{
 const fin=finOf(conf,div),key=divKey(conf,div);
 return `<div class="dv" data-div="${esc(key)}" data-conf="${conf}" data-name="${esc(div)}">
<p class="dvl">${esc(div)}<em>${fin.length<4?ORD[fin.length]+' next':'set'}</em></p>
<div class="rank">${listHTML(conf,div)}</div></div>`};

SEC.divisions={render(){
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step one</p>
<h1>How does each division finish?</h1>
<p class="lede">Tap the teams in the order you think they will finish, first to
fourth. Whoever you put first wins the division and takes a top-four seed, so
this is the shape of your bracket as well as your table.</p>
</header>
${CONFS.map(conf=>`<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${DIVS.filter(d=>finDone(conf,d)).length} of 4 set</span></div>
<div class="divs">${DIVS.map(d=>division(conf,d)).join('')}</div></section>`).join('')}
${nextBar('divisions','Seed the conferences','#seeds')}
</div>`},
after(root){wireRank(root)}};

function wireRank(root){
 root.querySelectorAll('.dv [data-pick]').forEach(b=>b.onclick=()=>{
  const box=b.closest('.dv'),key=box.dataset.div,k=b.dataset.pick;
  const list=box.querySelector('.rank');
  const fin=(S.fin[key]||[]).slice(),at=fin.indexOf(k);
  if(at>=0)fin.splice(at,1); else if(fin.length<4)fin.push(k); else return;
  S.fin[key]=fin;reconcile();save();
  flip(list,()=>{list.innerHTML=listHTML(box.dataset.conf,box.dataset.name);
   wireRank(box)});
  const lab=box.querySelector('.dvl em');
  if(lab)lab.textContent=fin.length<4?ORD[fin.length]+' next':'set';
  const conf=box.dataset.conf;
  const count=box.closest('.sect').querySelector('.sh>span');
  if(count)count.textContent=DIVS.filter(d=>finDone(conf,d)).length+' of 4 set';
  syncChrome()})}

/* First, Last, Invert, Play. Measure where every row is, let the list rewrite
   itself, then put each row back where it was and release it — so the rows
   travel to their new places instead of teleporting. */
function flip(list,mutate){
 const before=new Map([...list.children].map(r=>[r.dataset.team,r.getBoundingClientRect().top]));
 mutate();
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 [...list.children].forEach(r=>{
  const was=before.get(r.dataset.team);if(was==null)return;
  const dy=was-r.getBoundingClientRect().top;
  if(!dy)return;
  r.style.transition='none';r.style.transform=`translateY(${dy}px)`;
  requestAnimationFrame(()=>{
   r.style.transition='transform 280ms cubic-bezier(.2,.7,.3,1)';r.style.transform=''})})}
})();
