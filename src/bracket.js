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
 if(!t)return `<span class="bsl empty"><i class="bsd"></i><span class="bnm">Waiting</span></span>`;
 /* a team can sit in a round before it has an opponent — the top seed is in
    the divisional the moment the conference is seeded — but it cannot win a
    game that has nobody on the other side of it */
 if(!ready)return `<span class="bsl held" style="--tc:${t.c}">
<i class="bsd">${seed||''}</i>${mark(t,'xs')}<span class="bnm">${esc(t.k)}</span></span>`;
 return `<button class="bsl${won?' w':''}" data-game="${esc(id)}" data-team="${esc(k)}"
  style="--tc:${t.c}" aria-pressed="${won}" aria-label="${esc(t.city)} ${esc(t.name)}">
<i class="bsd">${seed||''}</i>${mark(t,'xs')}<span class="bnm">${esc(t.k)}</span></button>`};

const game=(id,g)=>`<div class="bgm">${slot(g,'home',id)}${slot(g,'away',id)}</div>`;

function conference(B,conf){
 const bye=seedsOf(conf)[0];
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${bye?T[bye].name+' on the bye':'seven to seed'}</span></div>
<div class="bkt" data-conf="${conf}">
<svg class="blines" aria-hidden="true"></svg>
${ROUNDS.map(([label,ids])=>`<div class="bcol">
<p class="bch">${esc(label)}</p>
<div class="bgs">${ids(conf).map(id=>game(id,B[id])).join('')}</div>
</div>`).join('')}
</div></section>`}

SEC.bracket={render(){
 const B=bracket(),ch=champion();
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step three</p>
<h1>Play the bracket</h1>
<p class="lede">Tap the side you think survives. The divisional round reseeds
itself as you go — the top seed left draws the lowest seed left — so the three
wild card winners pool before they are redrawn.</p>
</header>
${CONFS.map(c=>conference(B,c)).join('')}
<section class="sect">
<div class="sh"><h4>Super Bowl</h4></div>
<div class="sbw">${(()=>{const g=B['sb'];
 const side=k=>{const t=k?T[k]:null,won=S.win['sb']===k;
  if(!t)return `<span class="sbh empty"><span class="sbn">Waiting</span></span>`;
  return `<button class="sbh${won?' w':''}" data-game="sb" data-team="${esc(k)}"
   style="--tc:${t.c}" aria-pressed="${won}">${mark(t,'bg')}
<span class="sbc">${esc(t.city)}</span><span class="sbn">${esc(t.name)}</span></button>`};
 return side(g.home)+'<span class="sbv">v</span>'+side(g.away)})()}</div>
${ch?`<div class="champ" style="--tc:${T[ch].c}">
${mark(T[ch],'lg')}<span>Your champion</span><b>${esc(T[ch].city)} ${esc(T[ch].name)}</b></div>`:''}
</section>
${nextBar('bracket','Pick the awards','#awards')}
</div>`},
after(root){
 root.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.game,k=b.dataset.team;
  S.win[id]=S.win[id]===k?undefined:k;
  if(!S.win[id])delete S.win[id];
  repaint()});
 lines(root);
 if(!SEC.bracket._wired){SEC.bracket._wired=true;
  let t=null;addEventListener('resize',()=>{clearTimeout(t);
   t=setTimeout(()=>{const r=$('#root');if(STEP==='bracket')lines(r)},120)})}}};

/* Measured, not guessed: the columns distribute their games with space-around,
   so where a game actually sits depends on the width it ended up with. */
function lines(root){
 root.querySelectorAll('.bkt').forEach(bkt=>{
  const svg=bkt.querySelector('.blines');if(!svg)return;
  const box=bkt.getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  svg.setAttribute('width',box.width);svg.setAttribute('height',box.height);
  const cols=[...bkt.querySelectorAll('.bcol')].map(c=>
   [...c.querySelectorAll('.bgm')].map(g=>{const r=g.getBoundingClientRect();
    return {x1:r.left-box.left,x2:r.right-box.left,y:r.top-box.top+r.height/2}}));
  const d=[];
  for(let i=0;i<cols.length-1;i++){
   const from=cols[i],to=cols[i+1];
   if(!from.length||!to.length)continue;
   const gapL=Math.max(...from.map(g=>g.x2)),gapR=Math.min(...to.map(g=>g.x1));
   const spine=(gapL+gapR)/2;
   const ys=[...from.map(g=>g.y),...to.map(g=>g.y)];
   d.push(`M${spine} ${Math.min(...ys)}V${Math.max(...ys)}`);
   from.forEach(g=>d.push(`M${g.x2} ${g.y}H${spine}`));
   to.forEach(g=>d.push(`M${spine} ${g.y}H${g.x1}`));
  }
  svg.innerHTML=`<path d="${d.join(' ')}" fill="none" stroke="rgba(25,25,23,.18)" stroke-width="1"/>`});
}
})();
