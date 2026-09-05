/* NFL Predictions — built from src/*.js; edit those and re-run build.sh */

/* ===== core.js ===== */
/* NFL Predictions — the whole league, the state, and the shell.
   Static and dependency-free, same as the HUB it borrows its type from. */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>
 ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* The 32, with the colour each one is known by. The palette is used at low
   alpha behind a pick and at full strength on the champion, so every one of
   them has to read against paper — which is why the dark navies keep their
   own value rather than being lightened into a house tint. */
const TEAMS=[
 {k:'BUF',city:'Buffalo',name:'Bills',conf:'AFC',div:'East',c:'#003087',c2:'#C8102E'},
 {k:'MIA',city:'Miami',name:'Dolphins',conf:'AFC',div:'East',c:'#008C95',c2:'#FC4C02'},
 {k:'NE',city:'New England',name:'Patriots',conf:'AFC',div:'East',c:'#0C2340',c2:'#C8102E'},
 {k:'NYJ',city:'New York',name:'Jets',conf:'AFC',div:'East',c:'#115740',c2:'#FFFFFF'},
 {k:'BAL',city:'Baltimore',name:'Ravens',conf:'AFC',div:'North',c:'#24125F',c2:'#9A7611'},
 {k:'CIN',city:'Cincinnati',name:'Bengals',conf:'AFC',div:'North',c:'#FB4F14',c2:'#000000'},
 {k:'CLE',city:'Cleveland',name:'Browns',conf:'AFC',div:'North',c:'#EB3300',c2:'#311D00'},
 {k:'PIT',city:'Pittsburgh',name:'Steelers',conf:'AFC',div:'North',c:'#010101',c2:'#FFB81C'},
 {k:'HOU',city:'Houston',name:'Texans',conf:'AFC',div:'South',c:'#1D1F2A',c2:'#E4002B'},
 {k:'IND',city:'Indianapolis',name:'Colts',conf:'AFC',div:'South',c:'#002C5F',c2:'#A2AAAD'},
 {k:'JAX',city:'Jacksonville',name:'Jaguars',conf:'AFC',div:'South',c:'#101820',c2:'#D7A22A'},
 {k:'TEN',city:'Tennessee',name:'Titans',conf:'AFC',div:'South',c:'#418FDE',c2:'#C8102E'},
 {k:'DEN',city:'Denver',name:'Broncos',conf:'AFC',div:'West',c:'#FB4F14',c2:'#002244'},
 {k:'KC',city:'Kansas City',name:'Chiefs',conf:'AFC',div:'West',c:'#C8102E',c2:'#FFB81C'},
 {k:'LV',city:'Las Vegas',name:'Raiders',conf:'AFC',div:'West',c:'#000000',c2:'#A5ACAF'},
 {k:'LAC',city:'Los Angeles',name:'Chargers',conf:'AFC',div:'West',c:'#0072CE',c2:'#FFB81C'},
 {k:'DAL',city:'Dallas',name:'Cowboys',conf:'NFC',div:'East',c:'#0C2340',c2:'#7F9695'},
 {k:'NYG',city:'New York',name:'Giants',conf:'NFC',div:'East',c:'#001E62',c2:'#A6192E'},
 {k:'PHI',city:'Philadelphia',name:'Eagles',conf:'NFC',div:'East',c:'#004851',c2:'#869397'},
 {k:'WAS',city:'Washington',name:'Commanders',conf:'NFC',div:'East',c:'#651C32',c2:'#FFB81C'},
 {k:'CHI',city:'Chicago',name:'Bears',conf:'NFC',div:'North',c:'#091F2C',c2:'#DC4405'},
 {k:'DET',city:'Detroit',name:'Lions',conf:'NFC',div:'North',c:'#0069B1',c2:'#A2AAAD'},
 {k:'GB',city:'Green Bay',name:'Packers',conf:'NFC',div:'North',c:'#203731',c2:'#FFB612'},
 {k:'MIN',city:'Minnesota',name:'Vikings',conf:'NFC',div:'North',c:'#582C83',c2:'#FFC72C'},
 {k:'ATL',city:'Atlanta',name:'Falcons',conf:'NFC',div:'South',c:'#A71930',c2:'#000000'},
 {k:'CAR',city:'Carolina',name:'Panthers',conf:'NFC',div:'South',c:'#0085CA',c2:'#101820'},
 {k:'NO',city:'New Orleans',name:'Saints',conf:'NFC',div:'South',c:'#D3BC8D',c2:'#010101'},
 {k:'TB',city:'Tampa Bay',name:'Buccaneers',conf:'NFC',div:'South',c:'#A6192E',c2:'#3D3935'},
 {k:'ARI',city:'Arizona',name:'Cardinals',conf:'NFC',div:'West',c:'#9B2743',c2:'#FFFFFF'},
 {k:'LAR',city:'Los Angeles',name:'Rams',conf:'NFC',div:'West',c:'#003594',c2:'#FFA300'},
 {k:'SF',city:'San Francisco',name:'49ers',conf:'NFC',div:'West',c:'#A6192E',c2:'#AF8C5C'},
 {k:'SEA',city:'Seattle',name:'Seahawks',conf:'NFC',div:'West',c:'#0C2340',c2:'#78BE21'}];

const T=Object.fromEntries(TEAMS.map(t=>[t.k,t]));

/* The team's mark. A real logo when the file is there, and a tile in the
   team's own colour carrying its abbreviation when it is not — the same
   arrangement the HUB uses for a player with no headshot. The set can be
   completed a few files at a time and nothing looks broken in between,
   which is not true of a half-filled row of logos and blanks. */
const logoOf=t=>{if(!t)return null;const k=t.k.toLowerCase();
 return LOGOS[k]?`logos/${k}.${LOGOS[k]}`:null};
function mark(t,cls){
 if(!t)return `<span class="mark${cls?' '+cls:''} none"></span>`;
 const src=logoOf(t);
 return src
  ? `<span class="mark${cls?' '+cls:''}" style="--tc:${t.c}"><img src="${src}" alt="" width="72" height="72" loading="lazy" decoding="async"></span>`
  : `<span class="mark${cls?' '+cls:''} tile" style="--tc:${t.c}"><i>${esc(t.k)}</i></span>`}
const CONFS=['AFC','NFC'];
const DIVS=['East','North','South','West'];
const divTeams=(conf,div)=>TEAMS.filter(t=>t.conf===conf&&t.div===div);
const confTeams=conf=>TEAMS.filter(t=>t.conf===conf);

/* ---- state ---------------------------------------------------------------
   One object, saved on every change. There is no server: each person fills
   their own sheet on their own device and shares the picture. */
const KEY='nflpicks.2026';
const blank=()=>({name:'',div:{},seed:{AFC:[],NFC:[]},win:{},award:{mvp:{},opoy:{},dpoy:{}}});
let S=blank();

function load(){try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(blank(),JSON.parse(r))}
 catch(e){/* a private window, or cleared data. A blank sheet is the right answer. */}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---- the picture of a season --------------------------------------------
   Everything downstream is derived from these three, never stored twice: the
   eight division winners, the seven seeds a conference, and the winner of each
   played game. A pick that is no longer legal — a division winner swapped out
   from under a seed — is dropped rather than left to render as a ghost. */
const divKey=(conf,div)=>conf+' '+div;
const winnersOf=conf=>DIVS.map(d=>S.div[divKey(conf,d)]).filter(Boolean);
const seedsOf=conf=>(S.seed[conf]||[]).filter(Boolean);
const seededAll=conf=>seedsOf(conf).length===7;

/* Seeds 1-4 are the division winners by rule, so a changed division winner
   invalidates the seeding it was part of. */
function reconcile(){
 CONFS.forEach(conf=>{
  const w=new Set(winnersOf(conf));
  const s=S.seed[conf]||[];
  const top=s.slice(0,4);
  if(top.length&&(top.some(k=>!w.has(k))||w.size!==4))S.seed[conf]=[];
  else{
   /* a wild card that has since become a division winner cannot also be one */
   S.seed[conf]=s.filter((k,i)=>i<4||!w.has(k));
  }});
 /* every game whose participants are no longer determined loses its winner */
 const live=new Set(Object.keys(bracket()).flatMap(id=>{const g=bracket()[id];
  return [g.home,g.away].filter(Boolean)}));
 Object.keys(S.win).forEach(id=>{const g=bracket()[id];
  if(!g||!g.home||!g.away||(S.win[id]!==g.home&&S.win[id]!==g.away))delete S.win[id]});
}

/* ---- the bracket ---------------------------------------------------------
   Built fresh from the seeds and the results so far, never stored. The NFL
   reseeds after the wild card round — the top seed left plays the lowest seed
   left — so the divisional matchups cannot be written down in advance, which
   is exactly why this is computed rather than kept. */
function bracket(){
 const B={};
 CONFS.forEach(conf=>{
  const s=seedsOf(conf),ok=s.length===7;
  const at=n=>ok?s[n-1]:null;
  const wc=[[2,7],[3,6],[4,5]];
  wc.forEach(([a,b],i)=>{B[conf+'-wc'+i]={round:'Wild Card',conf,home:at(a),away:at(b),hs:a,as:b}});
  const wcw=wc.map((_,i)=>S.win[conf+'-wc'+i]).filter(Boolean);
  const seedOf=k=>s.indexOf(k)+1;
  const alive=ok&&wcw.length===3
   ? [at(1),...wcw].sort((a,b)=>seedOf(a)-seedOf(b)) : null;
  /* 1 plays the lowest survivor; the middle two meet */
  B[conf+'-dv0']=alive?{round:'Divisional',conf,home:alive[0],away:alive[3],
   hs:seedOf(alive[0]),as:seedOf(alive[3])}:{round:'Divisional',conf,home:null,away:null};
  B[conf+'-dv1']=alive?{round:'Divisional',conf,home:alive[1],away:alive[2],
   hs:seedOf(alive[1]),as:seedOf(alive[2])}:{round:'Divisional',conf,home:null,away:null};
  const d0=S.win[conf+'-dv0'],d1=S.win[conf+'-dv1'];
  const pair=(d0&&d1)?[d0,d1].sort((a,b)=>seedOf(a)-seedOf(b)):null;
  B[conf+'-cc']=pair?{round:conf+' Championship',conf,home:pair[0],away:pair[1],
   hs:seedOf(pair[0]),as:seedOf(pair[1])}:{round:conf+' Championship',conf,home:null,away:null};
 });
 const a=S.win['AFC-cc'],n=S.win['NFC-cc'];
 B['sb']={round:'Super Bowl',conf:null,home:a||null,away:n||null};
 return B;
}
const champion=()=>S.win['sb']||null;

/* The champion's path: every side they had to get past, in order, with the bye
   named rather than skipped — a one seed sitting out the first round is a
   prediction in itself and the card should say so. */
function roadOf(k){
 if(!k)return [];
 const B=bracket(),out=[];
 const conf=T[k].conf,seeds=seedsOf(conf);
 if(seeds[0]===k)out.push({round:'Wild Card',bye:true});
 ['wc0','wc1','wc2','dv0','dv1','cc'].forEach(id=>{
  const g=B[conf+'-'+id];if(!g||S.win[conf+'-'+id]!==k)return;
  out.push({round:g.round,opp:g.home===k?g.away:g.home})});
 const sb=B['sb'];
 if(S.win['sb']===k)out.push({round:'Super Bowl',opp:sb.home===k?sb.away:sb.home});
 return out}

/* ---- progress ------------------------------------------------------------
   Each step reports its own completeness, so the rail and the export gate
   read from one place rather than each re-deriving what "done" means. */
const STEPS=[['divisions','Divisions'],['seeds','Seeding'],['bracket','Bracket'],
 ['awards','Awards'],['share','Share']];
const doneDiv=()=>CONFS.every(c=>winnersOf(c).length===4);
const doneSeed=()=>doneDiv()&&CONFS.every(seededAll);
const doneBracket=()=>doneSeed()&&!!champion();
const doneAward=()=>['mvp','opoy','dpoy'].every(k=>(S.award[k]||{}).player);
const doneAll=()=>doneBracket()&&doneAward();
const stepDone=k=>k==='divisions'?doneDiv():k==='seeds'?doneSeed()
 :k==='bracket'?doneBracket():k==='awards'?doneAward():doneAll();
/* A step opens when the one before it is finished. Sharing waits for all of it. */
const stepOpen=k=>{const i=STEPS.findIndex(s=>s[0]===k);
 return i===0||STEPS.slice(0,i).every(s=>stepDone(s[0]))};

/* ---- shell ---------------------------------------------------------------- */
const SEC={};
let STEP='divisions';
const route=()=>{const k=(location.hash||'#divisions').slice(1);
 return SEC[k]&&stepOpen(k)?k:'divisions'};

function rail(){
 return `<nav class="rail" aria-label="Progress">${STEPS.map(([k,l],i)=>{
  const on=k===STEP,ok=stepDone(k),open=stepOpen(k);
  return `<button class="rl${on?' on':''}${ok?' ok':''}" ${open?'':'disabled'}
   data-step="${k}" aria-current="${on?'step':'false'}">
<i>${ok&&!on?'✓':i+1}</i><span>${esc(l)}</span></button>`}).join('')}</nav>`}

function render(){
 STEP=route();
 reconcile();save();
 const root=$('#root');
 root.innerHTML=rail()+SEC[STEP].render();
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.step});
 if(SEC[STEP].after)SEC[STEP].after(root);
 window.scrollTo(0,0);
}
/* Not a full re-render: the pick screens re-render themselves in place so a
   tap does not throw away scroll position halfway down a list of eight. */
function repaint(){
 reconcile();save();
 const root=$('#root'),y=scrollY;
 root.innerHTML=rail()+SEC[STEP].render();
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.step});
 if(SEC[STEP].after)SEC[STEP].after(root);
 scrollTo(0,y);
}
window.addEventListener('hashchange',render);

/* the button that carries you on, and says what is left when it cannot */
function nextBar(k,label,href){
 const ok=stepDone(k);
 return `<div class="nextbar">
${ok?`<a class="next" href="${href}">${esc(label)}</a>`
   :`<span class="next off">${esc(label)}</span>`}
</div>`}

function boot(){load();reconcile();render()}

/* ===== logos.js ===== */
/* Generated by build.sh from logos/. Do not hand-edit. */
const LOGOS={ari:'webp',atl:'webp',bal:'webp',buf:'webp',car:'webp',chi:'webp',cin:'webp',cle:'webp',dal:'webp',den:'webp',det:'webp',gb:'webp',hou:'webp',ind:'webp',jax:'webp',kc:'webp',lac:'webp',lar:'webp',lv:'webp',mia:'webp',min:'webp',ne:'webp',no:'webp',nyg:'webp',nyj:'png',phi:'webp',pit:'webp',sea:'webp',sf:'webp',tb:'webp',ten:'webp',was:'webp'};

/* ===== divisions.js ===== */
/* Step one: the eight division winners. Everything else in the sheet is
   downstream of these, so they are picked first and on their own screen. */
(()=>{
const chip=(t,on)=>`<button class="tm${on?' on':''}" data-pick="${t.k}"
 style="--tc:${t.c}" aria-pressed="${on}">
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
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  const t=T[b.dataset.pick],key=divKey(t.conf,t.div);
  S.div[key]=S.div[key]===t.k?undefined:t.k;
  if(!S.div[key])delete S.div[key];
  repaint()})}};
})();

/* ===== seeds.js ===== */
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

/* ===== bracket.js ===== */
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

/* ===== awards.js ===== */
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

/* ===== share.js ===== */
/* Step five: the card. Drawn on a canvas rather than screenshotted, so it is
   the same on every phone, crisp at any size, and needs nothing loaded from
   anywhere. 1080 x 1620 at two times, which is a portrait that fills a phone
   and survives a group chat's compression. */
(()=>{
const W=1080,H=1920,PAD=76,SCALE=2;
const INK='#191917',MUT='#605F58',FNT='#9C9B92',PAPER='#FAFAF6',LINE='rgba(25,25,23,.12)';

/* --- small drawing helpers ------------------------------------------------ */
function tx(c,s,x,y,{size=16,weight=400,face='Sohne',color=INK,align='left',track=0,max=0}={}){
 let sz=size;
 c.textAlign=align;c.textBaseline='alphabetic';c.fillStyle=color;
 c.letterSpacing=track?track+'px':'0px';
 c.font=`${weight} ${sz}px "${face}", sans-serif`;
 if(max){while(sz>10&&c.measureText(s).width>max){sz-=1;
  c.font=`${weight} ${sz}px "${face}", sans-serif`}}
 c.fillText(s,x,y);
 c.letterSpacing='0px';
 return sz}
const rule=(c,y,x1=PAD,x2=W-PAD,col=LINE)=>{c.fillStyle=col;c.fillRect(x1,y,x2-x1,1)};
function rrect(c,x,y,w,h,r){c.beginPath();
 c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);
 c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
/* a team colour laid over paper at low strength, so ink still reads on it */
function tint(hex,a){const n=parseInt(hex.slice(1),16);
 return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
const label=(c,s,y)=>{tx(c,s.toUpperCase(),PAD,y,{size:17,weight:700,color:MUT,track:1.6});
 rule(c,y+16)};

/* --- the card ------------------------------------------------------------- */
function draw(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);

 /* head */
 tx(c,'2026 NFL PREDICTIONS',PAD,120,{size:19,weight:700,color:MUT,track:2.2});
 const who=(S.name||'').trim();
 tx(c,who||'My picks',PAD,186,{size:54,weight:700,color:INK,track:-1.4,max:W-PAD*2});

 /* the champion, which is the whole point of the card */
 const ch=champion(),T1=ch?T[ch]:null;
 const cy=232,chH=246;
 if(T1){
  c.save();rrect(c,PAD,cy,W-PAD*2,chH,18);c.fillStyle=tint(T1.c,.14);c.fill();
  c.fillStyle=T1.c;rrect(c,PAD,cy,10,chH,5);c.fill();c.restore();
  logo(c,T1,W-PAD-176,cy+43,160);
  tx(c,'CHAMPION',PAD+40,cy+56,{size:16,weight:700,color:MUT,track:2});
  tx(c,T1.city,PAD+40,cy+126,{size:46,weight:400,color:INK,track:-1,max:W-PAD*2-270});
  tx(c,T1.name,PAD+40,cy+192,{size:60,weight:700,color:INK,track:-1.6,max:W-PAD*2-270});
 }

 /* the eight, in the two columns they are actually organised in */
 let y=cy+chH+92;
 label(c,'Division winners',y);
 y+=62;
 const colW=(W-PAD*2)/2, rowH=58;
 CONFS.forEach((conf,ci)=>{
  const x=PAD+ci*colW;
  tx(c,conf,x,y,{size:18,weight:700,color:INK,track:.6});
  DIVS.forEach((d,di)=>{
   const k=S.div[divKey(conf,d)],t=k?T[k]:null,ry=y+34+di*rowH;
   tx(c,d,x,ry,{size:19,weight:400,color:FNT});
   if(t){logo(c,t,x+104,ry-27,32);
    tx(c,t.name,x+146,ry,{size:22,weight:600,color:INK,track:-.3,max:colW-166})}
   else tx(c,'—',x+146,ry,{size:22,weight:400,color:FNT});
  })});

 /* who they beat to get there */
 y+=34+rowH*4+58;
 label(c,'Conference champions',y);
 y+=62;
 CONFS.forEach((conf,i)=>{
  const k=S.win[conf+'-cc'],t=k?T[k]:null,ry=y+i*62;
  tx(c,conf,PAD,ry,{size:19,weight:400,color:FNT});
  if(t){logo(c,t,PAD+100,ry-32,40);
   tx(c,t.city+' '+t.name,PAD+152,ry,{size:26,weight:600,color:INK,track:-.4,max:W-PAD*2-170})}
  else tx(c,'—',PAD+152,ry,{size:26,weight:400,color:FNT})});

 /* the three names */
 y+=62*2+42;
 label(c,'Awards',y);
 y+=62;
 [['mvp','MVP'],['opoy','OPOY'],['dpoy','DPOY']].forEach(([k,l],i)=>{
  const a=S.award[k]||{},t=a.team?T[a.team]:null,ry=y+i*64;
  tx(c,l,PAD,ry,{size:19,weight:400,color:FNT});
  const nm=(a.player||'').trim()||'—';
  tx(c,nm,PAD+132,ry,{size:26,weight:600,color:INK,track:-.4,max:W-PAD*2-210});
  if(t)logo(c,t,W-PAD-38,ry-31,38)});

 /* the road there, which is the part of a prediction worth arguing about */
 const road=roadOf(ch);
 if(road.length){
  y+=64*3+40;
  label(c,'The road',y);
  y+=58;
  road.forEach((r,i)=>{
   const ry=y+i*52,o=r.opp?T[r.opp]:null;
   tx(c,r.round,PAD,ry,{size:18,weight:400,color:FNT,max:250});
   if(r.bye)tx(c,'Bye',PAD+272,ry,{size:21,weight:400,color:MUT});
   else if(o){logo(c,o,PAD+264,ry-25,30);
    tx(c,'beat '+o.city+' '+o.name,PAD+304,ry,
     {size:21,weight:500,color:INK,track:-.3,max:W-PAD*2-320})}});
 }

 /* foot */
 rule(c,H-118);
 const when=new Date().toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 tx(c,'Filled out '+when,PAD,H-72,{size:19,weight:400,color:FNT});
 tx(c,'ON PAPER',W-PAD,H-72,{size:17,weight:700,color:FNT,align:'right',track:2});
}

/* Every face the card uses has to be resident before the first stroke, or the
   browser silently falls back and the whole thing is set in the system sans.
   The logos are the same problem in image form: drawImage on a half-loaded
   image draws nothing and reports no error. */
const FACES=['400 54px Sohne','700 54px Sohne','600 26px Sohne','700 19px Sohne','400 19px Sohne'];
const IMG={};
function loadLogos(){
 return Promise.all(TEAMS.map(t=>new Promise(res=>{
  const src=logoOf(t);if(!src)return res();
  const im=new Image();im.onload=()=>{IMG[t.k]=im;res()};im.onerror=()=>res();im.src=src})))}
let READY=null;
const ready=()=>READY||(READY=Promise.all([
  Promise.all(FACES.map(f=>document.fonts.load(f))).then(()=>document.fonts.ready),
  loadLogos()]).catch(()=>{}));
/* contain, so a wide wordmark and a tall shield both sit in the same square */
function logo(c,t,x,y,box){
 const im=t&&IMG[t.k];
 if(!im){c.save();rrect(c,x,y,box,box,box*.2);c.fillStyle=t?t.c:LINE;c.fill();
  if(t){c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
   c.font=`700 ${Math.round(box*.34)}px "Sohne", sans-serif`;c.fillText(t.k,x+box/2,y+box/2+1)}
  c.restore();return}
 const r=Math.min(box/im.naturalWidth,box/im.naturalHeight);
 const w=im.naturalWidth*r,h=im.naturalHeight*r;
 c.drawImage(im,x+(box-w)/2,y+(box-h)/2,w,h)}

async function paint(){
 const cv=$('#card');if(!cv)return;
 cv.width=W*SCALE;cv.height=H*SCALE;
 await ready();
 draw(cv.getContext('2d'));
}

SEC.share={render(){
 return `<div class="sheet">
<header class="phx">
<p class="kick">Step five</p>
<h1>Your card</h1>
<p class="lede">Put your name on it, then save the picture and send it to the group.</p>
</header>
<section class="sect">
<div class="sh"><h4>Name</h4></div>
<input class="awin wide" id="who" type="text" value="${esc(S.name||'')}"
 placeholder="Your name" autocomplete="name" spellcheck="false" aria-label="Your name">
</section>
<section class="sect">
<div class="sh"><h4>The picture</h4><span>1080 × 1920</span></div>
<div class="cardwrap"><canvas id="card" role="img" aria-label="Your 2026 NFL predictions"></canvas></div>
<div class="acts">
<button class="next" id="dl">Save the picture</button>
<button class="ghost" id="again">Start over</button>
</div>
<p class="hint">On a phone you can also press and hold the picture to save or send it.</p>
</section>
</div>`},
after(root){
 const who=root.querySelector('#who');
 who.oninput=()=>{S.name=who.value;save();paint()};
 paint();
 root.querySelector('#dl').onclick=()=>{
  const cv=$('#card');
  const nm=(S.name||'picks').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  cv.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement('a');
   a.href=u;a.download=`nfl-2026-${nm||'picks'}.png`;a.click();
   setTimeout(()=>URL.revokeObjectURL(u),1000)},'image/png')};
 root.querySelector('#again').onclick=()=>{
  if(!confirm('Clear every pick and start again?'))return;
  S=blank();save();location.hash='divisions';render()}}};
})();

boot();
