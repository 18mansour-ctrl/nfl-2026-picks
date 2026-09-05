/* Step one: the eight division winners. Everything else in the sheet is
   downstream of these, so they are picked first and on their own screen. */
(()=>{
const chip=(t,on)=>`<button class="tm${on?' on':''}" data-pick="${t.k}"
 style="--tc:${t.c};--tf:${t.f}" aria-pressed="${on}">
${mark(t)}<span class="tct">${esc(t.city)}</span><span class="tnm">${esc(t.name)}</span></button>`;

SEC.divisions={render(){
 const blocks=CONFS.map(conf=>`<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${winnersOf(conf).length} of 4</span></div>
<div class="divs">${DIVS.map(div=>{
  const key=divKey(conf,div),pick=S.div[key];
  return `<div class="dv">
<p class="dvl">${esc(div)}</p>
<div class="tms">${divTeams(conf,div).map(t=>chip(t,pick===t.k)).join('')}</div>
</div>`}).join('')}</div></section>`).join('');
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step one</p>
<h1>Who wins each division?</h1>
<p class="lede">Eight picks. These become the top four seeds in each conference,
so they decide the shape of your bracket.</p>
</header>
${blocks}
${nextBar('divisions','Seed the conferences','#seeds')}
</div>`},
after(root){
 /* Nothing is re-rendered here. The chip that was tapped keeps its element, so
    the background transition in the stylesheet actually runs from the old
    colour to the new one instead of appearing already finished. */
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  const t=T[b.dataset.pick],key=divKey(t.conf,t.div);
  const was=S.div[key];
  S.div[key]=was===t.k?undefined:t.k;
  if(!S.div[key])delete S.div[key];
  const now=S.div[key];
  b.closest('.tms').querySelectorAll('[data-pick]').forEach(x=>{
   const on=x.dataset.pick===now;
   x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});
  const sect=b.closest('.sect'),conf=t.conf;
  const count=sect.querySelector('.sh>span');
  if(count)count.textContent=winnersOf(conf).length+' of 4';
  reconcile();save();syncChrome()})}};
})();
