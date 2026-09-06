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

const game=(id,g)=>`<div class="bgm">${slot(g,'home',id)}${slot(g,'away',id)}</div>`;

const champHTML=()=>{const ch=champion();
 return ch?`<div class="champ" style="--tc:${T[ch].c}">
${mark(T[ch],'lg')}<span>Your champion</span><b>${esc(T[ch].city)} ${esc(T[ch].name)}</b></div>`:''};
function finalHTML(B){
 const g=B['sb'];
 const side=k=>{const t=k?T[k]:null,won=S.win['sb']===k;
  if(!t)return `<span class="sbh empty"><span class="sbn">Waiting</span></span>`;
  const lost=!!S.win['sb']&&!won;
  return `<button class="sbh${won?' w':''}${lost?' lost':''}" data-game="sb" data-team="${esc(k)}"
   style="--tc:${t.c};--tf:${t.f}" aria-pressed="${won}">${mark(t,'bg')}
<span class="sbc">${esc(t.city)}</span><span class="sbn">${esc(t.name)}</span></button>`};
 return `<div class="sbw">${side(g.home)}<span class="sbv">v</span>${side(g.away)}</div>
<div id="champline">${champHTML()}</div>`}

function conference(B,conf){
 const bye=seedsOf(conf)[0];
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${bye?T[bye].name+' on the bye':'seven to seed'}</span></div>
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
<p class="kick">Step three</p>
<h1>Play the bracket</h1>
<p class="lede">Tap the side you think survives. The divisional round reseeds
itself as you go — the top seed left draws the lowest seed left — so the three
wild card winners pool before they are redrawn.</p>
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
  const d=[];
  /* One line per team that advanced, from the row it won in to the row it
     turns up in — not a shared spine. The reseeding is already expressed by
     where the names land, so the lines can simply be true. */
  for(let i=1;i<cols.length;i++){
   const prev=[...cols[i-1].querySelectorAll('.bsl.w')];
   cols[i].querySelectorAll('.bsl[data-team]').forEach(row=>{
    const src=prev.find(p=>p.dataset.team===row.dataset.team);
    if(!src)return;
    const a=R(src),b=R(row),mid=(a.r+b.l)/2;
    d.push(`M${a.r} ${a.y}H${mid}V${b.y}H${b.l}`)})}
  svg.innerHTML=d.length?`<path d="${d.join(' ')}" fill="none" stroke="rgba(25,25,23,.26)" stroke-width="1.5" stroke-linejoin="round"/>`:''});
}
})();
