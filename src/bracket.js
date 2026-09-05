/* Step three: play it out. The card is two halves facing each other, the
   winner's side in gold — the same object the whole way up, so the Super Bowl
   is the wild card round at a larger size rather than a different idea. */
(()=>{
const half=(g,side,id)=>{
 const k=g[side],t=k?T[k]:null,won=S.win[id]===k;
 const seed=side==='home'?g.hs:g.as;
 if(!t)return `<span class="gh empty"><span class="ghn">To be decided</span></span>`;
 return `<button class="gh${won?' w':''}" data-game="${esc(id)}" data-team="${esc(k)}"
  style="--tc:${t.c}" aria-pressed="${won}">
${mark(t,"bg")}
<span class="ghc">${esc(t.city)}</span><span class="ghn">${esc(t.name)}</span>
${seed?`<em class="ghs">${seed} seed</em>`:''}</button>`};

const game=(id,g,cls)=>`<div class="gm${cls?' '+cls:''}">
<div class="gduo">${half(g,'home',id)}${half(g,'away',id)}</div></div>`;

function conference(B,conf){
 const rows=[
  ['Wild Card',[0,1,2].map(i=>conf+'-wc'+i)],
  ['Divisional',[conf+'-dv0',conf+'-dv1']],
  [conf+' Championship',[conf+'-cc']]];
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${seedsOf(conf)[0]?T[seedsOf(conf)[0]].name+' on the bye':''}</span></div>
${rows.map(([label,ids])=>`<p class="rnd">${esc(label)}</p>
<div class="gms${ids.length===1?' one':''}">${ids.map(id=>game(id,B[id])).join('')}</div>`).join('')}
</section>`}

SEC.bracket={render(){
 const B=bracket();
 const sb=B['sb'],ch=champion();
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step three</p>
<h1>Play the bracket</h1>
<p class="lede">Tap the side you think survives. The divisional round reseeds
itself as you go, the way the real one does.</p>
</header>
${CONFS.map(c=>conference(B,c)).join('')}
<section class="sect">
<div class="sh"><h4>Super Bowl</h4></div>
${game('sb',sb,'big')}
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
  repaint()})}};
})();
