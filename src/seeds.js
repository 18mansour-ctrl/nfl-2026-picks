/* Step two: the order, not the teams.
   The four division winners are already decided, so asking you to tap them
   again was data entry rather than a decision. They are placed for you and you
   move them; the only thing left to choose is the three wild cards. */
(()=>{
const arrows=(conf,i,n)=>`<span class="sdmv">
<button class="sar" data-mv="${conf}" data-i="${i}" data-d="-1"
 ${i===0||bandOf(i-1)!==bandOf(i)?'disabled':''} aria-label="Move up">↑</button>
<button class="sar" data-mv="${conf}" data-i="${i}" data-d="1"
 ${i>=n-1||bandOf(i+1)!==bandOf(i)?'disabled':''} aria-label="Move down">↓</button></span>`;

function slot(conf,seeds,i){
 const k=seeds[i],t=k?T[k]:null,n=seeds.length;
 if(!t)return `<div class="sd open"><i class="sdn">${i+1}</i>
<span class="sdt empty">Wild card — tap a team below</span></div>`;
 return `<div class="sd full" style="--tc:${t.c}">
<i class="sdn">${i+1}</i>${mark(t,'sm')}
<span class="sdt">${esc(t.city)} ${esc(t.name)}</span>
${i===0?'<em class="sdb">bye</em>':''}
${i>=4?`<button class="sdx" data-drop="${esc(k)}" aria-label="Remove ${esc(t.name)}">✕</button>`:''}
${arrows(conf,i,n)}</div>`}

function conference(conf){
 const seeds=seedsOf(conf),n=seeds.length;
 const w=new Set(winnersOf(conf));
 const left=3-Math.max(0,n-4);
 const pool=confTeams(conf).filter(t=>!seeds.includes(t.k)&&!w.has(t.k));
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${left?left+' wild card'+(left===1?'':'s')+' to add':'seeded'}</span></div>
<p class="bandl">Division winners <em>already in — order them</em></p>
<div class="seeds">${[0,1,2,3].map(i=>slot(conf,seeds,i)).join('')}</div>
<p class="bandl wc">Wild cards <em>your three picks</em></p>
<div class="seeds">${[4,5,6].map(i=>slot(conf,seeds,i)).join('')}</div>
${left?`<div class="tms pool">${pool.map(t=>`<button class="tm" data-seed="${conf}" data-k="${t.k}"
 style="--tc:${t.c}">${mark(t)}<span class="tct">${esc(t.city)}</span><span class="tnm">${esc(t.name)}</span></button>`).join('')}</div>`:''}
</section>`}

SEC.seeds={render(){
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step two</p>
<h1>Seed the conferences</h1>
<p class="lede">Your four division winners take the top four seeds — that part
is the rule, not a choice, so they are already in. Put them in order and add
three wild cards. The one seed sits out the first round.</p>
</header>
${CONFS.map(conference).join('')}
${nextBar('seeds','Play the bracket','#bracket')}
</div>`},
after(root){
 root.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
  const conf=b.dataset.seed,s=S.seed[conf]||[];
  if(s.length<7){s.push(b.dataset.k);S.seed[conf]=s;repaint()}});
 root.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{
  CONFS.forEach(c=>{S.seed[c]=(S.seed[c]||[]).filter(k=>k!==b.dataset.drop)});repaint()});
 root.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{
  moveSeed(b.dataset.mv,+b.dataset.i,+b.dataset.d)})}};
})();
