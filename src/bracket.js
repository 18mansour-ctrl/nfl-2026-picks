/* Step three: the bracket, drawn as one.
   Three columns a conference — wild card, divisional, championship — each
   column holding fewer games than the last, so the shape converges the way a
   bracket is supposed to. The connectors are drawn in after layout rather
   than faked in CSS, because the NFL reseeds: the winners of the wild card
   round are pooled and redrawn against the bye, so the honest picture is
   three games gathering onto one spine and two coming back off it. Fixed
   elbows would claim a feeder that does not exist. */
(()=>{
const ROUNDS=[['Wild Card',c=>[c+'-wc0',c+'-wc1',c+'-wc2']],
              ['Divisional',c=>[c+'-dv0',c+'-dv1']],
              ['Championship',c=>[c+'-cc']]];

const slot=(g,side,id)=>{
 const k=g[side],t=k?T[k]:null,won=S.win[id]===k;
 const seed=side==='home'?g.hs:g.as;
 const ready=!!(g.home&&g.away);
 /* once a game is decided the side that did not survive steps back rather than
    disappearing: you still want to read who you beat */
 const lost=!!S.win[id]&&!won;
 if(!t)return `<span class="bsl empty"><i class="bsd"></i><span class="bnm">Waiting</span></span>`;
 /* a team can sit in a round before it has an opponent — the top seed is in
    the divisional the moment the conference is seeded — but it cannot win a
    game that has nobody on the other side of it */
 if(!ready)return `<span class="bsl held" style="--tc:${t.c};--tf:${t.f}">
<i class="bsd">${seed||''}</i>${mark(t,'xs')}<span class="bnm">${esc(t.k)}</span></span>`;
 return `<button class="bsl${won?' w':''}${lost?' lost':''}" data-game="${esc(id)}" data-team="${esc(k)}"
  style="--tc:${t.c};--tf:${t.f}" aria-pressed="${won}" aria-label="${esc(t.city)} ${esc(t.name)}">
<i class="bsd">${seed||''}</i>${mark(t,'xs')}<span class="bnm">${esc(t.k)}</span></button>`};

/* A game nobody has reached yet is a placeholder, not a card — same open
   treatment an unfilled seed row gets on the step before. */
const game=(id,g)=>`<div class="bgm${!g.home&&!g.away?' open':''}"
>${slot(g,'home',id)}${slot(g,'away',id)}</div>`;

const champHTML=()=>{const ch=champion();
 return ch?`<div class="champ" style="--tc:${T[ch].c};--ts:${T[ch].c2};--tsf:${T[ch].f2}">
${mark(T[ch],'lg')}<span>Your champion</span><b>${esc(T[ch].city)} ${esc(T[ch].name)}</b></div>`:''};
function finalHTML(B){
 const g=B['sb'];
 const side=k=>{const t=k?T[k]:null,won=S.win['sb']===k;
  if(!t)return `<span class="sbh empty"><span class="sbn">Waiting</span></span>`;
  const lost=!!S.win['sb']&&!won;
  return `<button class="sbh${won?' w':''}${lost?' lost':''}" data-game="sb" data-team="${esc(k)}"
   style="--tc:${t.c};--tf:${t.f}" aria-pressed="${won}">${mark(t,'bg')}
<span class="sbc">${esc(t.city)}</span><span class="sbn">${esc(t.name)}</span></button>`};
 return `<div class="sbw">${side(g.home)}<span class="sbv">vs</span>${side(g.away)}</div>
<div id="champline">${champHTML()}</div>`}

function conference(B,conf){
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4></div>
<div class="bkt" data-conf="${conf}">
<svg class="blines" aria-hidden="true"></svg>
${ROUNDS.map(([label,ids],ci)=>`<div class="bcol" data-col="${ci}">
<p class="bch">${esc(label)}</p>
<div class="bgs">${ids(conf).map(id=>game(id,B[id])).join('')}</div>
</div>`).join('')}
</div></section>`}

SEC.bracket={render(){
 const B=bracket();
 return `<div class="sheet">
<header class="phx">
${clearBtn("bracket")}
<h1>Playoff bracket</h1>
</header>
${CONFS.map(c=>conference(B,c)).join('')}
<section class="sect">
<div class="sh"><h4>Super Bowl</h4></div>
<div id="final">${finalHTML(B)}</div>
</section>
${nextBar('bracket','Pick the awards','#awards')}
</div>`},
after(root){
 wireGames(root);
 lines(root);
 if(!SEC.bracket._wired){SEC.bracket._wired=true;
  let t=null;addEventListener('resize',()=>{clearTimeout(t);
   t=setTimeout(()=>{const r=$('#root');if(STEP==='bracket')lines(r)},120)})}}};

/* A pick changes two things: the game you tapped, and whatever is downstream
   of it. The tapped game keeps its own elements so the tint transitions in
   under your finger; only the later columns are redrawn, and they fade rather
   than travel. Re-rendering the page here is what made every tap look like a
   reload. */
function wireGames(root){
 root.querySelectorAll('[data-game]').forEach(b=>{b.onclick=()=>{
  const id=b.dataset.game,k=b.dataset.team;
  S.win[id]=S.win[id]===k?undefined:k;
  if(!S.win[id])delete S.win[id];
  reconcile();save();
  /* the final lives outside the columns, so it is its own case rather than a
     null .bgm — which is what it used to be */
  const scope=b.closest('.bgm')||b.closest('.sbw');
  const decided=!!S.win[id];
  scope.querySelectorAll('[data-team]').forEach(x=>{
   const on=S.win[id]===x.dataset.team;
   x.classList.toggle('w',on);
   x.classList.toggle('lost',decided&&!on);
   x.setAttribute('aria-pressed',on)});
  const bkt=b.closest('.bkt');
  if(bkt){
   const conf=bkt.dataset.conf,B=bracket(),from=+b.closest('.bcol').dataset.col;
   ROUNDS.forEach(([label,ids],ci)=>{
    if(ci<=from)return;
    const gs=bkt.querySelector(`.bcol[data-col="${ci}"] .bgs`);
    if(!gs)return;
    gs.innerHTML=ids(conf).map(id2=>game(id2,B[id2])).join('');
    gs.classList.remove('fadein');void gs.offsetWidth;gs.classList.add('fadein')});
   const fin=root.querySelector('#final');
   if(fin){fin.innerHTML=finalHTML(bracket());
    fin.classList.remove('fadein');void fin.offsetWidth;fin.classList.add('fadein')}}
  else{
   /* the final was the thing tapped: it keeps its elements so the fill
      transitions, and only the champion line underneath is redrawn */
   const cl=root.querySelector('#champline');
   if(cl){cl.innerHTML=champHTML();
    cl.classList.remove('fadein');void cl.offsetWidth;cl.classList.add('fadein')}}
  wireGames(root);lines(root);syncChrome()}})}

/* Measured, not guessed: the columns distribute their games with space-around,
   so where a game actually sits depends on the width it ended up with. */
function lines(root){
 root.querySelectorAll('.bkt').forEach(bkt=>{
  const svg=bkt.querySelector('.blines');if(!svg)return;
  const box=bkt.getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  svg.setAttribute('width',box.width);svg.setAttribute('height',box.height);
  const cols=[...bkt.querySelectorAll('.bcol')];
  const R=el=>{const r=el.getBoundingClientRect();
   return {l:r.left-box.left,r:r.right-box.left,y:r.top-box.top+r.height/2}};
  const d=[],REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* One line per team that advanced, from the row it won in to the row it
     turns up in — not a shared spine. The reseeding is already expressed by
     where the names land, so the lines can simply be true.

     They cannot all turn in the same place, though. Reseeding sends the top
     wild card winner to the bottom divisional game and the bottom one to the
     top, so with a single midpoint their vertical runs land on the same x and
     read as one crossed spine. Each connector gets its own channel across the
     gutter instead, ordered by how far it has to travel: the longest turns
     first, nearest the column it is leaving, so lines nest rather than cross.
     Corners are rounded, because a right angle at this size reads as a
     rendering artefact rather than a decision. */
  const elbow=(a,b,x,r)=>{
   if(Math.abs(b.y-a.y)<.5)return `M${a.r} ${a.y}H${b.l}`;
   const dir=b.y>a.y?1:-1;
   const rr=Math.min(r,Math.abs(b.y-a.y)/2,Math.abs(x-a.r),Math.abs(b.l-x));
   return `M${a.r} ${a.y}H${x-rr}`
    +`Q${x} ${a.y} ${x} ${a.y+rr*dir}`
    +`V${b.y-rr*dir}`
    +`Q${x} ${b.y} ${x+rr} ${b.y}`
    +`H${b.l}`};

  /* A stub into the spine and a stub back out of it. */
  const stub=(from,to,x,y,dir,r)=>{
   const rr=Math.min(r,Math.abs(x-from));
   return dir==='in'
    ? `M${from} ${y}H${x}` : `M${x} ${y}H${to}`};

  for(let i=1;i<cols.length;i++){
   const prev=[...cols[i-1].querySelectorAll('.bsl.w')];
   const legs=[];
   cols[i].querySelectorAll('.bsl[data-team]').forEach(row=>{
    const src=prev.find(p=>p.dataset.team===row.dataset.team);
    if(!src)return;
    legs.push({a:R(src),b:R(row)})});
   if(!legs.length)continue;
   const gapL=Math.max(...legs.map(l=>l.a.r)),gapR=Math.min(...legs.map(l=>l.b.l));
   const x=(gapL+gapR)/2;

   /* The wild card round does not feed the divisional game by game — the
      winners are pooled and drawn again against the bye. Three lines nesting
      past each other draw that as a tree, which is both untrue and the messiest
      thing on the page: the top seed's conqueror crosses the bottom seed's on
      the way past. So they gather on one spine and come back off it, which is
      the shape of a re-draw and reads as one object instead of three snakes.
      Every later round really is a tree — two winners, one game — so those keep
      their own elbows, where nothing crosses anyway. */
   const pooled=i===1&&legs.length>1;
   if(pooled){
    const ys=legs.flatMap(l=>[l.a.y,l.b.y]);
    d.push(`M${x} ${Math.min(...ys)}V${Math.max(...ys)}`);
    legs.forEach(l=>{
     d.push(`M${l.a.r} ${l.a.y}H${x}`);
     d.push(`M${x} ${l.b.y}H${l.b.l}`)});
    continue}

   legs.sort((p,q)=>Math.abs(q.b.y-q.a.y)-Math.abs(p.b.y-p.a.y));
   const span=gapR-gapL,n=legs.length;
   legs.forEach((l,j)=>{
    const cx=n===1?gapL+span/2:gapL+span*(j+1)/(n+1);
    d.push(elbow(l.a,l.b,cx,5))})}
  /* One path per connector rather than one for all of them, so a line that has
     just become true can draw itself in while the ones already on screen stay
     put. lines() also runs on resize, where nothing has changed and nothing
     should animate — hence comparing against what was drawn last time. */
  const seen=new Set(svg.dataset.paths?svg.dataset.paths.split('|'):[]);
  svg.innerHTML=d.map(p=>`<path d="${p}" fill="none" stroke="rgba(25,25,23,.26)"`
   +` stroke-width="1.5" stroke-linejoin="round"/>`).join('');
  svg.dataset.paths=d.join('|');
  if(REDUCED)return;
  [...svg.querySelectorAll('path')].forEach((p,i)=>{
   if(seen.has(d[i]))return;
   const len=p.getTotalLength();
   p.setAttribute('stroke-dasharray',len);
   p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],
    {duration:420,easing:'cubic-bezier(.3,.8,.3,1)'})
    .onfinish=()=>p.removeAttribute('stroke-dasharray')})});
}
})();
