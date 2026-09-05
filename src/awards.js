/* Step four: three names. A player list would mean inventing a roster for a
   season that has not been played, so the name is typed and the team is
   picked — which is also what gives the award its colour on the export. */
(()=>{
const AWARDS=[['mvp','Most Valuable Player','The best player in the league, on the best story.'],
 ['opoy','Offensive Player of the Year','Not always the MVP. Often the one who broke a number.'],
 ['dpoy','Defensive Player of the Year','The one an offence has to plan around.']];

const block=([k,title,note])=>{
 const a=S.award[k]||{},t=a.team?T[a.team]:null;
 return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>
<p class="hint">${esc(note)}</p>
<div class="awd${t?' has':''}"${t?` style="--tc:${t.c}"`:''}>
<input class="awin" type="text" data-aw="${k}" value="${esc(a.player||'')}"
 placeholder="Player" autocomplete="off" spellcheck="false" aria-label="${esc(title)} pick">
<div class="awt" role="group" aria-label="Team">
${TEAMS.map(x=>`<button class="tmini${a.team===x.k?' on':''}" data-awt="${k}" data-k="${x.k}"
 style="--tc:${x.c}" title="${esc(x.city)} ${esc(x.name)}" aria-label="${esc(x.city)} ${esc(x.name)}">${mark(x,'xs')}</button>`).join('')}
</div></div></section>`};

SEC.awards={render(){
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step four</p>
<h1>Three awards</h1>
<p class="lede">Type the name, tap the team. The team is what gives each pick
its colour on the card you share.</p>
</header>
${AWARDS.map(block).join('')}
${nextBar('awards','See your card','#share')}
</div>`},
after(root){
 root.querySelectorAll('[data-aw]').forEach(inp=>{
  /* typed in place: re-rendering on every keystroke would drop the caret */
  inp.oninput=()=>{const k=inp.dataset.aw;
   S.award[k]=Object.assign({},S.award[k],{player:inp.value});save();
   const bar=root.querySelector('.nextbar');if(bar)gate(root)};
  inp.onblur=()=>repaint()});
 root.querySelectorAll('[data-awt]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.awt,cur=(S.award[k]||{}).team;
  S.award[k]=Object.assign({},S.award[k],{team:cur===b.dataset.k?undefined:b.dataset.k});
  repaint()});
 gate(root)}};

/* the onward button follows the typing without a full re-render */
function gate(root){
 const bar=root.querySelector('.nextbar');if(!bar)return;
 bar.innerHTML=doneAward()
  ? `<a class="next" href="#share">See your card</a>`
  : `<span class="next off">See your card</span>`;
 root.querySelectorAll('.rl').forEach(b=>{
  const k=b.dataset.step;b.disabled=!stepOpen(k);
  b.classList.toggle('ok',stepDone(k)&&k!==STEP)});
}
})();
