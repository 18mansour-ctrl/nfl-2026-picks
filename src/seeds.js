/* Step two: the seven, in order. Seeds one to four are the division winners by
   rule, so the screen only offers those until the fourth is placed and only
   the rest afterwards — the format is taught by what is tappable rather than
   by a paragraph explaining it. */
(()=>{
const ordinal=n=>n+(n===1?'st':n===2?'nd':n===3?'rd':'th');

function conference(conf){
 const seeds=seedsOf(conf),n=seeds.length,w=new Set(winnersOf(conf));
 const stage=n<4?'winners':'wild';
 const pool=confTeams(conf).filter(t=>!seeds.includes(t.k)
  &&(stage==='winners'?w.has(t.k):!w.has(t.k)));
 const slot=(i)=>{const k=seeds[i];const t=k?T[k]:null;
  return `<div class="sd${t?' full':''}${!t&&i===n?' next':''}"${t?` style="--tc:${t.c}"`:''}>
<i class="sdn">${i+1}</i>${t?mark(t,"sm"):''}
${t?`<button class="sdt" data-drop="${esc(k)}"><span>${esc(t.city)} ${esc(t.name)}</span></button>`
   :`<span class="sdt empty">${i<4?'Division winner':'Wild card'}</span>`}
${t&&i===0?'<em class="sdb">bye</em>':''}</div>`};
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${n} of 7</span></div>
<div class="seeds">${[0,1,2,3,4,5,6].map(slot).join('')}</div>
${n<7?`<p class="hint">${stage==='winners'
  ? `Tap your ${ordinal(n+1)} seed — the division winners, best first.`
  : `Tap your ${ordinal(n+1)} seed — three wild cards from the rest of the ${conf}.`}</p>
<div class="tms pool">${pool.map(t=>`<button class="tm" data-seed="${conf}" data-k="${t.k}"
 style="--tc:${t.c}">${mark(t)}<span class="tct">${esc(t.city)}</span><span class="tnm">${esc(t.name)}</span></button>`).join('')}</div>`
 :'<p class="hint done">Seeded. Tap a team to take it back out.</p>'}
</section>`}

SEC.seeds={render(){
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step two</p>
<h1>Seed the conferences</h1>
<p class="lede">Order matters. The one seed sits out the first round; everyone
else is drawn against it from the bottom up.</p>
</header>
${CONFS.map(conference).join('')}
${nextBar('seeds','Play the bracket','#bracket')}
</div>`},
after(root){
 root.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
  const conf=b.dataset.seed;(S.seed[conf]=S.seed[conf]||[]).push(b.dataset.k);repaint()});
 root.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{
  CONFS.forEach(c=>{S.seed[c]=(S.seed[c]||[]).filter(k=>k!==b.dataset.drop)});repaint()})}};
})();
