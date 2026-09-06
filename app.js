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
 {k:'CLE',city:'Cleveland',name:'Browns',conf:'AFC',div:'North',c:'#311D00',c2:'#EB3300'},
 {k:'PIT',city:'Pittsburgh',name:'Steelers',conf:'AFC',div:'North',c:'#FFB81C',c2:'#010101'},
 {k:'HOU',city:'Houston',name:'Texans',conf:'AFC',div:'South',c:'#E4002B',c2:'#1D1F2A'},
 {k:'IND',city:'Indianapolis',name:'Colts',conf:'AFC',div:'South',c:'#002C5F',c2:'#A2AAAD'},
 {k:'JAX',city:'Jacksonville',name:'Jaguars',conf:'AFC',div:'South',c:'#006778',c2:'#D7A22A'},
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

/* Whether ink or paper reads on a team's colour, measured rather than guessed:
   Steelers gold and Texans navy cannot take the same text. Worked out once at
   load and carried on the team, so both the page and the canvas use the same
   answer. */
function lum(hex){const n=parseInt(hex.slice(1),16),f=v=>{v/=255;
 return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
 return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255)}
/* Four of these lead with a colour the reference sheet files as secondary:
   Cleveland's brown over its orange, Pittsburgh's gold over its black,
   Houston's red over its navy, and Jacksonville's teal, which the sheet does
   not carry at all. Nick's call, and they are the colours those teams are
   actually known by — it also stops four AFC teams all fielding near-black. */
TEAMS.forEach(t=>{t.f=lum(t.c)>.42?'#191917':'#FFFFFF'});
/* Two exceptions, on Nick's call. Both fill with a gold light enough that the
   measurement says ink, and both look wrong that way beside thirty other cards
   set in white. Contrast suffers for it — white on Steelers gold is about
   1.7:1 — so this is a deliberate trade of legibility for consistency, not an
   oversight in the calculation above. */
['NO','PIT'].forEach(k=>{const t=TEAMS.find(x=>x.k===k);if(t)t.f='#FFFFFF'});

const T=Object.fromEntries(TEAMS.map(t=>[t.k,t]));

/* The team's mark. A real logo when the file is there, and a tile in the
   team's own colour carrying its abbreviation when it is not — the same
   arrangement the HUB uses for a player with no headshot. The set can be
   completed a few files at a time and nothing looks broken in between,
   which is not true of a half-filled row of logos and blanks. */
const logoOf=t=>{if(!t)return null;const k=t.k.toLowerCase();
 return LOGOS[k]?`logos/${k}.${LOGOS[k]}`:null};

/* A player's face, keyed on the name stripped to letters and digits with any
   generational suffix dropped — the feed and the image set disagree about
   punctuation, and "Brian Thomas" and "Brian Thomas Jr" are one man. Anyone
   without a file gets his initials instead, which is a designed stand-in
   rather than a blank. */
const shotKey=n=>String(n||'').toLowerCase().trim()
 .replace(/\b(jr|sr|ii|iii|iv|v)\.?$/,'').replace(/[^a-z0-9]/g,'');
const shotOf=n=>{const k=shotKey(n);return SHOTS.has(k)?`headshots/${k}.webp`:null};
const initials=n=>String(n||'').trim().split(/\s+/).filter(Boolean)
 .slice(0,2).map(w=>w[0].toUpperCase()).join('');
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
/* The order of the division winners and the wild cards are two different
   decisions, so they are two different keys. They used to share one array of
   seven with the winners pinned to the front, which meant every moment a
   division sat empty mid-edit — the instant between un-picking one team and
   picking another — reconcile could not tell a stale winner from a wild card
   and cleared the lot. Changing your mind about one division should not cost
   you three wild cards. */
const blank=()=>({name:'',fin:{},ord:{AFC:[],NFC:[]},wild:{AFC:[],NFC:[]},
 win:{},award:{mvp:{},opoy:{},dpoy:{}}});
let S=blank();

function load(){try{const r=localStorage.getItem(KEY);if(!r)return;
 const j=JSON.parse(r);
 /* sheets written before the split still open */
 if(j.seed&&!j.ord){j.ord={};j.wild={};
  CONFS.forEach(c=>{const a=j.seed[c]||[];j.ord[c]=a.slice(0,4);j.wild[c]=a.slice(4)})}
 /* sheets that only recorded a division winner keep it as first place */
 if(j.div&&!j.fin){j.fin={};
  Object.keys(j.div).forEach(k=>{if(j.div[k])j.fin[k]=[j.div[k]]})}
 S=Object.assign(blank(),j);delete S.seed;delete S.div}
 catch(e){/* a private window, or cleared data. A blank sheet is the right answer. */}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---- the picture of a season --------------------------------------------
   Everything downstream is derived from these three, never stored twice: the
   eight division winners, the seven seeds a conference, and the winner of each
   played game. A pick that is no longer legal — a division winner swapped out
   from under a seed — is dropped rather than left to render as a ghost. */
const divKey=(conf,div)=>conf+' '+div;
/* A division is predicted in full — first through fourth — not just at the top.
   The winner is simply whoever you put first, so there is no second place to
   keep in step with anything. */
const finOf=(conf,div)=>(S.fin[divKey(conf,div)]||[]).filter(Boolean);
const finDone=(conf,div)=>finOf(conf,div).length===4;
const winnersOf=conf=>DIVS.map(d=>finOf(conf,d)[0]).filter(Boolean);
/* the winners in the order you put them, and the wild cards in the order you
   added them; the seeding is the two concatenated, and only once all four
   divisions are decided */
const ordOf=conf=>(S.ord[conf]||[]).filter(Boolean);
const wildOf=conf=>(S.wild[conf]||[]).filter(Boolean);
const seedsOf=conf=>winnersOf(conf).length===4?ordOf(conf).concat(wildOf(conf)):[];
const seededAll=conf=>seedsOf(conf).length===7;
/* A division winner can never fall below the fourth seed and a wild card can
   never rise above the fifth. That is the actual rule, so it is the only
   constraint the arrows need. */


/* Seeds 1-4 are the division winners by rule, so a changed division winner
   invalidates the seeding it was part of. */
function reconcile(){
 /* a team can only place once in its own division */
 Object.keys(S.fin).forEach(k=>{
  S.fin[k]=(S.fin[k]||[]).filter((t,i,a)=>t&&a.indexOf(t)===i).slice(0,4)});
 CONFS.forEach(conf=>{
  const w=winnersOf(conf);
  /* the order keeps whatever is still a winner and picks up any that are new,
     so swapping one division moves one row rather than resetting four */
  const keep=(S.ord[conf]||[]).filter(k=>w.includes(k));
  S.ord[conf]=keep.concat(w.filter(k=>!keep.includes(k)));
  /* a wild card that has since won its division is not also a wild card */
  S.wild[conf]=(S.wild[conf]||[])
   .filter((k,i,a)=>T[k]&&T[k].conf===conf&&!w.includes(k)&&a.indexOf(k)===i)
   .slice(0,3)});
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
  /* 1 plays the lowest survivor; the middle two meet. The top seed is known
     the moment the conference is seeded, so it sits in the divisional waiting
     for an opponent rather than showing as a blank. */
  B[conf+'-dv0']=alive?{round:'Divisional',conf,home:alive[0],away:alive[3],
   hs:seedOf(alive[0]),as:seedOf(alive[3])}
   :{round:'Divisional',conf,home:ok?at(1):null,away:null,hs:ok?1:null};
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
const doneDiv=()=>CONFS.every(c=>DIVS.every(d=>finDone(c,d)));
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

/* A step change is the only thing that replaces the page, and it is the only
   thing that plays the entrance. Everything else — every pick, every drag —
   changes the DOM that is already there, so a tap reads as the one control
   responding rather than as the page reloading. That distinction is the whole
   difference between motion that feels designed and motion that feels like a
   refresh. */
function render(){
 STEP=route();
 reconcile();save();
 const root=$('#root');
 root.innerHTML=rail()+SEC[STEP].render();
 wire(root);
 const sheet=root.querySelector('.sheet');
 if(sheet){sheet.classList.remove('enter');void sheet.offsetWidth;sheet.classList.add('enter')}
 window.scrollTo(0,0);
}
function wire(root){
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.step});
 if(SEC[STEP].after)SEC[STEP].after(root);
 wireClear(root)}

/* Re-render one region and nothing else, with no entrance. Used where a pick
   genuinely changes what is downstream of it — the bracket past the game you
   just decided — and never for the control you actually touched, which keeps
   its own element so its CSS transition can run. */
function patch(sel,html){
 const el=$(sel);if(!el)return null;
 el.innerHTML=html;return el}

/* The two things every screen has to keep honest after a pick. */
function syncChrome(){
 const root=$('#root');if(!root)return;
 /* the clear button appears the moment there is something to clear, and every
    step calls through here after a pick — it cannot live in the render path,
    because a pick deliberately does not re-render */
 const cb=root.querySelector('[data-clear-step]');
 if(cb){const h=HASPICKS[cb.dataset.clearStep];toggleCtl(cb,!!(h&&h()))}
 root.querySelectorAll('.rl').forEach(b=>{const k=b.dataset.step;
  b.disabled=!stepOpen(k);
  b.classList.toggle('ok',stepDone(k)&&k!==STEP);
  const i=b.querySelector('i');const idx=STEPS.findIndex(x=>x[0]===k);
  if(i)i.textContent=(stepDone(k)&&k!==STEP)?'✓':String(idx+1)});
 const bar=root.querySelector('.nextbar');
 if(bar&&bar.dataset.for){const k=bar.dataset.for;
  const ok=stepDone(k),a=bar.firstElementChild;
  if(a){a.className=ok?'next':'next off';
   if(ok)a.setAttribute('href',bar.dataset.href);else a.removeAttribute('href')}}}

/* Kept for the places a whole-screen redraw is genuinely the simplest correct
   thing — collapsing the award finder onto its pick. It skips the entrance. */
function repaint(){
 reconcile();save();
 const root=$('#root'),y=scrollY;
 root.innerHTML=rail()+SEC[STEP].render();
 wire(root);
 scrollTo(0,y);
}
window.addEventListener('hashchange',render);

/* Clearing a step is cheap to offer and expensive to do by accident — the
   divisions step alone is thirty-two taps — so it asks twice rather than
   opening a dialog. The second tap has three seconds, then it forgets. */
function clearBtn(step){
 return `<button class="clr" type="button" data-clear-step="${step}" hidden
><span class="clrl">Clear</span><i class="clrb"></i></button>`}

/* hidden is what keeps a dead control out of the tab order and off the
   accessibility tree, and display:none cannot transition — so the class
   carries the motion, and hidden goes on a beat late or comes off a beat
   early. Re-entrant: flipping back mid-flight just cancels the pending hide. */
function toggleCtl(el,show){
 if(!el)return;
 if((el.dataset.on==='1')===!!show)return;
 el.dataset.on=show?'1':'0';
 clearTimeout(+el.dataset.t||0);
 if(show){el.hidden=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(el.dataset.on==='1')el.classList.add('in')}))}
 else{el.classList.remove('in');
  el.dataset.t=setTimeout(()=>{if(el.dataset.on!=='1')el.hidden=true},200)}}

/* Swap a label without the button snapping to its new width: measure both
   ends with transitions off, then let the width travel between them. */
function morphLabel(b,txt){
 const l=b.querySelector('.clrl');if(!l)return;
 const w0=b.getBoundingClientRect().width;
 b.style.transition='none';b.style.width='auto';l.textContent=txt;
 const w1=b.getBoundingClientRect().width;
 b.style.width=w0+'px';b.getBoundingClientRect();
 b.style.transition='';b.style.width=w1+'px';
 clearTimeout(+b.dataset.w||0);
 b.dataset.w=setTimeout(()=>{b.style.width=''},260)}
const CLEARERS={
 /* seeding hangs off the division results, so wiping step one has to take the
    wild cards with it. reconcile only drops a wild card that has since won its
    division — it would otherwise hold three teams picked against a board that
    no longer exists, and hand them back as seeds the moment four winners
    reappear. S.ord is derived from the winners and clears itself. */
 divisions:()=>{S.fin={};S.ord={AFC:[],NFC:[]};S.wild={AFC:[],NFC:[]}},
 seeds:()=>{S.ord={AFC:[],NFC:[]};S.wild={AFC:[],NFC:[]}},
 bracket:()=>{S.win={}},
 awards:()=>{S.award={mvp:{},opoy:{},dpoy:{}}}};
const HASPICKS={
 divisions:()=>Object.values(S.fin).some(a=>a&&a.length),
 seeds:()=>CONFS.some(c=>wildOf(c).length),
 bracket:()=>Object.keys(S.win).length>0,
 awards:()=>['mvp','opoy','dpoy'].some(k=>(S.award[k]||{}).player)};
function wireClear(root){
 const b=root.querySelector('[data-clear-step]');if(!b)return;
 const step=b.dataset.clearStep;
 /* render only ever emits it hidden; syncChrome is what reveals it, and that
    runs from pick handlers — so a reload carrying saved picks needs this. */
 toggleCtl(b,!!HASPICKS[step]());
 let armed=0,t=null;
 const disarm=()=>{armed=0;b.classList.remove('armed');morphLabel(b,'Clear')};
 b.onclick=()=>{
  /* wiping a whole step is worth a second tap; the bar across the foot of the
     pill drains for as long as that second tap is still live */
  if(!armed){armed=1;b.classList.add('armed');morphLabel(b,'Confirm?');
   t=setTimeout(disarm,3000);return}
  clearTimeout(t);armed=0;b.classList.remove('armed');b.style.width='';
  CLEARERS[step]();reconcile();save();repaint()}}

/* the button that carries you on, and says what is left when it cannot */
function nextBar(k,label,href){
 const ok=stepDone(k);
 return `<div class="nextbar" data-for="${k}" data-href="${href}">
<a class="${ok?'next':'next off'}"${ok?` href="${href}"`:''}>${esc(label)}</a>
</div>`}

function boot(){load();reconcile();render()}

/* ===== logos.js ===== */
/* Generated by build.sh from logos/. Do not hand-edit. */
const LOGOS={ari:'webp',atl:'webp',bal:'webp',buf:'webp',car:'webp',chi:'webp',cin:'webp',cle:'webp',dal:'webp',den:'webp',det:'webp',gb:'webp',hou:'webp',ind:'webp',jax:'webp',kc:'webp',lac:'webp',lar:'webp',lv:'webp',mia:'webp',min:'webp',ne:'webp',no:'webp',nyg:'webp',nyj:'png',phi:'webp',pit:'webp',sea:'webp',sf:'webp',tb:'webp',ten:'webp',was:'webp'};

/* ===== shots.js ===== */
/* Generated by build.sh from headshots/. Do not hand-edit. */
const SHOTS=new Set(['aaronrodgers','amonrastbrown','ashtonjeanty','bakermayfield','bijanrobinson','bonix','breecehall','brianthomas','brockbowers','brockpurdy','bryceyoung','buckyirving','calebwilliams','camward','ceedeelamb','chasebrown','chrisolave','christianmccaffrey','cjstroud','courtlandsutton','dakprescott','danieljones','davanteadams','derrickhenry','devonachane','dkmetcalf','drakelondon','drakemaye','garrettwilson','genosmith','georgekittle','georgepickens','jahmyrgibbs','jalenhurts','jamarrchase','jamescook','jamesonwilliams','jaredgoff','jaxonsmithnjigba','jaydendaniels','jjmccarthy','joeburrow','jonathantaylor','jordanlove','joshallen','joshjacobs','justinfields','justinherbert','justinjefferson','kennethwalker','kylermurray','kyrenwilliams','laddmcconkey','lamarjackson','maliknabers','marvinharrison','matthewstafford','michaelpenix','mikeevans','nicocollins','omarionhampton','patrickmahomes','pukanacua','romeodunze','samdarnold','samlaporta','saquonbarkley','shedeursanders','spencerrattler','teehiggins','terrymclaurin','travisetienne','travishunter','treveyonhenderson','trevorlawrence','treymcbride','tuatagovailoa','tyreekhill','zayflowers']);

/* ===== players.js ===== */
/* The three boards.
   A ranked field is a better selector than an empty text box: it puts the
   likely names in front of you, orders them by how the market sees them, and
   still lets you write in anybody it has missed.

   The prices are an indicative preseason board, not a live market — they are
   here to order the field and give a pick some context, and the app says so
   where they are shown. Anyone can be written in. */
const BOARD={
mvp:[
 ['Josh Allen','BUF','QB','+450'],['Lamar Jackson','BAL','QB','+550'],
 ['Patrick Mahomes','KC','QB','+700'],['Jayden Daniels','WAS','QB','+900'],
 ['Joe Burrow','CIN','QB','+1000'],['Jalen Hurts','PHI','QB','+1200'],
 ['Drake Maye','NE','QB','+1400'],['C.J. Stroud','HOU','QB','+1800'],
 ['Justin Herbert','LAC','QB','+2000'],['Saquon Barkley','PHI','RB','+2000'],
 ['Matthew Stafford','LAR','QB','+2200'],['Brock Purdy','SF','QB','+2500'],
 ['Dak Prescott','DAL','QB','+2500'],['Bo Nix','DEN','QB','+2800'],
 ['Bijan Robinson','ATL','RB','+2800'],['Caleb Williams','CHI','QB','+3000'],
 ['Jared Goff','DET','QB','+3000'],['Baker Mayfield','TB','QB','+3300'],
 ['Jahmyr Gibbs','DET','RB','+3500'],['Kyler Murray','ARI','QB','+4000'],
 ['Trevor Lawrence','JAX','QB','+4000'],['Derrick Henry','BAL','RB','+4000'],
 ['J.J. McCarthy','MIN','QB','+4500'],['Jordan Love','GB','QB','+4500'],
 ["Ja'Marr Chase",'CIN','WR','+5000'],['Michael Penix Jr.','ATL','QB','+5000'],
 ['Sam Darnold','SEA','QB','+5000'],['Christian McCaffrey','SF','RB','+5000'],
 ['Justin Fields','NYJ','QB','+6000'],['Justin Jefferson','MIN','WR','+6600'],
 ['Bryce Young','CAR','QB','+6600'],['Ashton Jeanty','LV','RB','+6600'],
 ['Cam Ward','TEN','QB','+7500'],['CeeDee Lamb','DAL','WR','+8000'],
 ['Geno Smith','LV','QB','+8000'],['Tua Tagovailoa','MIA','QB','+8000'],
 ['Jonathan Taylor','IND','RB','+8000'],['Puka Nacua','LAR','WR','+10000'],
 ['Daniel Jones','IND','QB','+10000'],['Amon-Ra St. Brown','DET','WR','+12000'],
 ['Shedeur Sanders','CLE','QB','+12000'],['Aaron Rodgers','PIT','QB','+12000'],
 ["De'Von Achane",'MIA','RB','+12000'],['Malik Nabers','NYG','WR','+15000'],
 ['Brian Thomas Jr.','JAX','WR','+15000'],['Russell Wilson','NYG','QB','+15000'],
 ['Bucky Irving','TB','RB','+15000'],['Nico Collins','HOU','WR','+20000'],
 ['Omarion Hampton','LAC','RB','+20000'],['Spencer Rattler','NO','QB','+20000']],
opoy:[
 ["Ja'Marr Chase",'CIN','WR','+700'],['Justin Jefferson','MIN','WR','+900'],
 ['Saquon Barkley','PHI','RB','+1000'],['CeeDee Lamb','DAL','WR','+1200'],
 ['Bijan Robinson','ATL','RB','+1200'],['Jahmyr Gibbs','DET','RB','+1400'],
 ['Puka Nacua','LAR','WR','+1600'],['Josh Allen','BUF','QB','+1600'],
 ['Amon-Ra St. Brown','DET','WR','+1800'],['Derrick Henry','BAL','RB','+1800'],
 ['Christian McCaffrey','SF','RB','+2000'],['Lamar Jackson','BAL','QB','+2000'],
 ['Malik Nabers','NYG','WR','+2200'],['Brian Thomas Jr.','JAX','WR','+2500'],
 ['Ashton Jeanty','LV','RB','+2500'],['Patrick Mahomes','KC','QB','+2500'],
 ['Jayden Daniels','WAS','QB','+2800'],['Nico Collins','HOU','WR','+3000'],
 ['Drake London','ATL','WR','+3000'],['Jonathan Taylor','IND','RB','+3300'],
 ['Garrett Wilson','NYJ','WR','+3500'],['Marvin Harrison Jr.','ARI','WR','+3500'],
 ['Ladd McConkey','LAC','WR','+4000'],['Jaxon Smith-Njigba','SEA','WR','+4000'],
 ['Rome Odunze','CHI','WR','+4500'],['Tee Higgins','CIN','WR','+5000'],
 ["De'Von Achane",'MIA','RB','+5000'],['Bucky Irving','TB','RB','+5000'],
 ['Brock Bowers','LV','TE','+5000'],['Trey McBride','ARI','TE','+6600'],
 ['DK Metcalf','PIT','WR','+6600'],['Josh Jacobs','GB','RB','+6600'],
 ['James Cook','BUF','RB','+7500'],['Kenneth Walker III','SEA','RB','+8000'],
 ['Breece Hall','NYJ','RB','+8000'],['Chase Brown','CIN','RB','+8000'],
 ['Omarion Hampton','LAC','RB','+8000'],['TreVeyon Henderson','NE','RB','+10000'],
 ['Travis Etienne Jr.','JAX','RB','+10000'],['Kyren Williams','LAR','RB','+10000'],
 ['Terry McLaurin','WAS','WR','+10000'],['Zay Flowers','BAL','WR','+10000'],
 ['George Pickens','DAL','WR','+10000'],['Courtland Sutton','DEN','WR','+12000'],
 ['Chris Olave','NO','WR','+12000'],['Jameson Williams','DET','WR','+12000'],
 ['Tyreek Hill','MIA','WR','+15000'],['Mike Evans','TB','WR','+15000'],
 ['Davante Adams','LAR','WR','+15000'],['George Kittle','SF','TE','+15000'],
 ['Sam LaPorta','DET','TE','+20000']],
dpoy:[
 ['Micah Parsons','GB','EDGE','+550'],['Myles Garrett','CLE','EDGE','+700'],
 ['T.J. Watt','PIT','EDGE','+900'],['Aidan Hutchinson','DET','EDGE','+1000'],
 ['Will Anderson Jr.','HOU','EDGE','+1200'],['Nik Bonitto','DEN','EDGE','+1400'],
 ['Maxx Crosby','LV','EDGE','+1600'],['Trey Hendrickson','CIN','EDGE','+1800'],
 ['Jared Verse','LAR','EDGE','+1800'],['Abdul Carter','NYG','EDGE','+2000'],
 ['Fred Warner','SF','LB','+2200'],['Zack Baun','PHI','LB','+2500'],
 ['Roquan Smith','BAL','LB','+2800'],['Patrick Surtain II','DEN','CB','+2800'],
 ['Sauce Gardner','NYJ','CB','+3000'],['Derek Stingley Jr.','HOU','CB','+3000'],
 ['Danielle Hunter','HOU','EDGE','+3300'],['Chris Jones','KC','DT','+3500'],
 ['Quinnen Williams','NYJ','DT','+4000'],['Dexter Lawrence','NYG','DT','+4000'],
 ['Jalen Carter','PHI','DT','+4000'],['Kerby Joseph','DET','S','+4500'],
 ['Brian Branch','DET','S','+5000'],['Jeffery Simmons','TEN','DT','+5000'],
 ['Travon Walker','JAX','EDGE','+5000'],['Christian Gonzalez','NE','CB','+6600'],
 ['Kayvon Thibodeaux','NYG','EDGE','+6600'],['Rashan Gary','GB','EDGE','+6600'],
 ['Jalen Ramsey','PIT','CB','+6600'],['Nnamdi Madubuike','BAL','DT','+7500'],
 ['Milton Williams','NE','DT','+7500'],['Byron Murphy II','SEA','DT','+8000'],
 ['Mykel Williams','SF','EDGE','+8000'],['Jalon Walker','ATL','EDGE','+8000'],
 ['James Pearce Jr.','ATL','EDGE','+8000'],['Travis Hunter','JAX','CB','+8000'],
 ['Devon Witherspoon','SEA','CB','+8000'],['Shemar Stewart','CIN','EDGE','+10000'],
 ['Mason Graham','CLE','DT','+10000'],['Walter Nolen','ARI','DT','+10000'],
 ['Kenneth Grant','MIA','DT','+12000'],['Tyleik Williams','DET','DT','+12000'],
 ['Donovan Ezeiruaku','DAL','EDGE','+12000'],['Jahdae Barron','DEN','CB','+12000'],
 ['Malaki Starks','BAL','S','+12000'],['Nick Emmanwori','SEA','S','+12000'],
 ['Marlon Humphrey','BAL','CB','+12000'],['Landon Jackson','BUF','EDGE','+15000'],
 ['Vita Vea','TB','DT','+15000'],['Budda Baker','ARI','S','+15000']]};
const board=k=>(BOARD[k]||[]).map(([n,t,p,o])=>({n,t,p,o}));

/* ===== divisions.js ===== */
/* Step one: how each division finishes, first through fourth.

   Tap to place, and the list physically reorders as you do.

   The research is against drag here. Karth's comparison of ranking questions
   found drag-and-drop scored no better on usability than entering the order,
   and was no faster; the guidance for small lists on a phone is click-to-rank,
   with drag reserved as the thing you reach for to *adjust* an order that
   already exists — which is what the seeding step is. Four items is also well
   inside the 3-7 that ranking questions are meant to stay within.

   What drag does have over a bare tap-to-rank is that you can see the order
   you are building. So the list sorts itself into the finish order — but only
   once all four are placed, and back to league order if one is taken out. The
   sort is the confirmation, not a running commentary.
   Nothing is randomised — these are teams with a conventional order, and
   shuffling them to dodge a primacy effect would just read as broken. */
(()=>{
const ORD=['1st','2nd','3rd','4th'];

/* first place wears a crown rather than a ring on its number: the badge is
   the place, the crown is what the place wins you */
/* The arrow is the gesture, not decoration — it turns once, clockwise, when
   the division is put back. */
const RESET_ICON='<svg class="dvri" viewBox="0 0 24 24" aria-hidden="true">'
 +'<path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/>'
 +'<path d="M21 3v5h-5"/></svg>';

const CROWN='<svg class="crown" viewBox="0 0 24 20" aria-hidden="true">'
 +'<path d="M1.6 17.6V5.1l6.1 4.4L12 2.6l4.3 6.9 6.1-4.4v12.5z"/></svg>';
const rowOf=(t,rank)=>`<button class="rkr${rank?' on':''}" data-pick="${t.k}"
 data-team="${t.k}" style="--tc:${t.c};--tf:${t.f}" aria-pressed="${!!rank}"
 aria-label="${esc(t.city)} ${esc(t.name)}${rank===1?', wins the division':rank?', '+ORD[rank-1]:', not placed'}">
<i class="rkn">${rank||''}</i>${mark(t,'sm')}
<span class="rkc">${esc(t.city)}</span><span class="rkt">${esc(t.name)}</span>
${rank===1?CROWN:''}</button>`;

/* The list holds its league order while you are still deciding — only the
   badges change — and drops into finish order the moment the fourth place is
   set. Reordering on every tap meant the rows you had not judged yet kept
   moving under your finger, which is the opposite of helpful; this way the
   sort is the thing that tells you the division is done. Take one back out and
   it returns to league order, because the answer is no longer complete. */
function listHTML(conf,div){
 const fin=finOf(conf,div);
 const order=fin.length===4?fin.map(k=>T[k]):divTeams(conf,div);
 return order.map(t=>rowOf(t,fin.indexOf(t.k)+1)).join('')}

const division=(conf,div)=>{
 const fin=finOf(conf,div),key=divKey(conf,div);
 return `<div class="dv" data-div="${esc(key)}" data-conf="${conf}" data-name="${esc(div)}">
<p class="dvl">${esc(div)}<button class="dvr" type="button"
 aria-label="Reset ${conf} ${esc(div)}"${fin.length?'':' hidden'}>${RESET_ICON}Reset</button></p>
<div class="rank">${listHTML(conf,div)}</div></div>`};

SEC.divisions={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("divisions")}
<p class="kick">Step one</p>
<h1>Division standings</h1>
<p class="lede">Tap the teams in the order you think they will finish.</p>
</header>
${CONFS.map(conf=>`<section class="sect">
<div class="sh"><h4>${conf}</h4></div>
<div class="divs">${DIVS.map(d=>division(conf,d)).join('')}</div></section>`).join('')}
${nextBar('divisions','Seed the conferences','#seeds')}
</div>`},
after(root){wireRank(root);root.querySelectorAll('.dv').forEach(wireReset)}};

/* Per-division reset. Tapping a placed team already removes it, so this is the
   shortcut for redoing a whole division rather than an undo — it needs no
   confirm, because it costs four taps at most and sits next to what it clears.
   The header Clear keeps its two-tap confirm: that one wipes all thirty-two. */
function wireReset(box){
 const r=box.querySelector('.dvr');if(!r)return;
 const key=box.dataset.div;
 toggleCtl(r,!!(S.fin[key]||[]).length);
 r.onclick=()=>{
  const list=box.querySelector('.rank');
  S.fin[key]=[];reconcile();save();
  flip(list,()=>{list.innerHTML=listHTML(box.dataset.conf,box.dataset.name);
   wireRank(box)});
  /* Let the arrow finish its turn before the chip leaves — cutting the spin
     off halfway reads as a glitch. The hide is guarded because a fresh pick
     inside those 300ms puts something back worth resetting. */
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)toggleCtl(r,false);
  else{r.classList.add('spin');
   setTimeout(()=>{if(!(S.fin[key]||[]).length)toggleCtl(r,false)},300);
   setTimeout(()=>r.classList.remove('spin'),560)}
  syncChrome()}}

function wireRank(root){
 root.querySelectorAll('.dv [data-pick]').forEach(b=>b.onclick=()=>{
  const box=b.closest('.dv'),key=box.dataset.div,k=b.dataset.pick;
  const list=box.querySelector('.rank');
  const fin=(S.fin[key]||[]).slice(),at=fin.indexOf(k);
  if(at>=0)fin.splice(at,1); else if(fin.length<4)fin.push(k); else return;
  S.fin[key]=fin;reconcile();save();
  flip(list,()=>{list.innerHTML=listHTML(box.dataset.conf,box.dataset.name);
   wireRank(box)});
  wireReset(box);syncChrome()})}

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

/* ===== seeds.js ===== */
/* Step two: the order, not the teams.
   The four division winners are already decided, so asking you to tap them
   again was data entry rather than a decision. They are placed for you and you
   drag them; the only thing left to choose is the three wild cards.

   Two separate lists rather than one of seven, because a division winner can
   never fall below the fourth seed and a wild card can never rise above the
   fifth. Making that structural means the drag has no illegal move to reject —
   there is nowhere wrong to drop. */
(()=>{
const GRIP='<span class="gripd"></span><span class="gripd"></span><span class="gripd"></span>'
 +'<span class="gripd"></span><span class="gripd"></span><span class="gripd"></span>';

function row(conf,k,i){
 const t=T[k];
 return `<div class="sd full" style="--tc:${t.c};--tf:${t.f}" data-row="${i}" data-team="${esc(k)}">
<i class="sdn">${i+1}</i>${mark(t,'sm')}
<span class="sdt">${esc(t.city)} ${esc(t.name)}</span>
${i===0?'<em class="sdb">bye</em>':''}
${i>=4?`<button class="sdx" data-drop="${esc(k)}" aria-label="Remove ${esc(t.name)}">✕</button>`:''}
<button class="grip" data-grip aria-label="Reorder ${esc(t.name)}"
 aria-describedby="griphelp">${GRIP}</button></div>`}

const hole=(i,txt)=>`<div class="sd open" data-row="${i}"><i class="sdn">${i+1}</i>
<span class="sdt empty">${esc(txt||'Wild card — tap a team below')}</span></div>`;

function conference(conf){
 const ord=ordOf(conf),wild=wildOf(conf);
 const w=new Set(winnersOf(conf));
 const left=3-wild.length;
 const taken=new Set(ord.concat(wild));
 const pool=confTeams(conf).filter(t=>!taken.has(t.k)&&!w.has(t.k));
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4><span>${left?left+' wild card'+(left===1?'':'s')+' to add':'seeded'}</span></div>
<p class="bandl">Division winners <em>already in — drag to order</em></p>
<div class="seeds" data-band="${conf}:ord">${[0,1,2,3].map(i=>ord[i]?row(conf,ord[i],i):hole(i,'Win a division first')).join('')}</div>
<p class="bandl wc">Wild cards <em>your three picks</em></p>
<div class="seeds" data-band="${conf}:wild">${[0,1,2].map(i=>wild[i]?row(conf,wild[i],i+4):hole(i+4)).join('')}</div>
${left?`<div class="tms pool">${pool.map(t=>`<button class="tm" data-seed="${conf}" data-k="${t.k}"
 style="--tc:${t.c}">${mark(t)}<span class="tct">${esc(t.city)}</span><span class="tnm">${esc(t.name)}</span></button>`).join('')}</div>`:''}
</section>`}

SEC.seeds={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("seeds")}
<p class="kick">Step two</p>
<h1>Seed the conferences</h1>
<p class="lede">Your four division winners take the top four seeds — that part
is the rule, not a choice, so they are already in. Drag them into order and add
three wild cards. The one seed sits out the first round.</p>
<p class="sr" id="griphelp">Press space to lift a team, then use the arrow keys
to move it, and space again to drop it.</p>
</header>
${CONFS.map(conference).join('')}
${nextBar('seeds','Play the bracket','#bracket')}
</div>`},
after(root){
 root.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
  const conf=b.dataset.seed,wl=S.wild[conf]||[];
  if(wl.length<3){wl.push(b.dataset.k);S.wild[conf]=wl;repaint()}});
 root.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{
  CONFS.forEach(c=>{S.wild[c]=(S.wild[c]||[]).filter(k=>k!==b.dataset.drop)});repaint()});
 root.querySelectorAll('.seeds[data-band]').forEach(sortable)}};

/* ---- the drag ------------------------------------------------------------
   Pointer events, so one code path covers mouse, touch and pen. The rows are
   never reordered in the DOM while you are dragging: the one under your finger
   is translated to follow it and the others are translated out of its way, so
   nothing reflows mid-gesture and the whole thing stays on the compositor. The
   DOM is put in its new order once, on drop, at the moment the transforms
   already have everything in that position — so there is nothing to see. */
function sortable(list){
 const [conf,which]=list.dataset.band.split(':');
 const off=which==='wild'?4:0;

 const rows=()=>[...list.children].filter(r=>r.dataset.team);
 const commit=order=>{
  S[which][conf]=order.slice();
  reconcile();save();
  [...list.children].forEach((r,i)=>{const n=r.querySelector('.sdn');
   if(n)n.textContent=off+i+1;r.dataset.row=off+i;
   /* the bye follows the one seed rather than the element that started there */
   const b=r.querySelector('.sdb');
   if(off===0&&i===0&&!b)r.querySelector('.sdt')
     .insertAdjacentHTML('afterend','<em class="sdb">bye</em>');
   if(b&&!(off===0&&i===0))b.remove()});
  syncChrome()};

 list.querySelectorAll('[data-grip]').forEach(grip=>{
  grip.addEventListener('pointerdown',e=>{
   if(e.button)return;
   const row=grip.closest('.sd'),items=rows();
   if(items.length<2)return;
   e.preventDefault();
   grip.setPointerCapture(e.pointerId);

   const rects=items.map(r=>r.getBoundingClientRect());
   const h=rects[0].height+(rects[1]?rects[1].top-rects[0].bottom:0);
   let from=items.indexOf(row),to=from;
   const startY=e.clientY;
   list.classList.add('dragging');
   row.classList.add('lift');
   items.forEach(r=>{if(r!==row)r.classList.add('slide')});

   let raf=0,edge=0;
   const place=dy=>{
    row.style.transform=`translateY(${dy}px)`;
    const next=Math.max(0,Math.min(items.length-1,from+Math.round(dy/h)));
    if(next!==to){to=next;
     items.forEach((r,i)=>{if(r===row)return;
      let shift=0;
      if(from<to&&i>from&&i<=to)shift=-h;
      else if(from>to&&i>=to&&i<from)shift=h;
      r.style.transform=shift?`translateY(${shift}px)`:''})}};

   const move=ev=>{
    const dy=ev.clientY-startY+edge;
    place(dy);
    /* walk the page when the finger reaches the top or bottom of it */
    const m=90,vy=ev.clientY;
    const speed=vy<m?-(m-vy)/6:vy>innerHeight-m?(vy-(innerHeight-m))/6:0;
    if(speed&&!raf){const step=()=>{
      const before=scrollY;scrollBy(0,speed);edge+=scrollY-before;
      place(ev.clientY-startY+edge);
      raf=speed?requestAnimationFrame(step):0};raf=requestAnimationFrame(step)}
    else if(!speed&&raf){cancelAnimationFrame(raf);raf=0}};

   const up=()=>{
    if(raf){cancelAnimationFrame(raf);raf=0}
    grip.removeEventListener('pointermove',move);
    grip.removeEventListener('pointerup',up);
    grip.removeEventListener('pointercancel',up);
    /* Settle into the slot rather than snapping to it. The timer is not a
       belt-and-braces on transitionend, it is the only reliable trigger: drop
       a row exactly where the settle would put it and the transform never
       changes, so transitionend never fires and the drop never commits. */
    row.style.transition='transform 180ms cubic-bezier(.2,.7,.3,1)';
    row.style.transform=`translateY(${(to-from)*h}px)`;
    let settled=false;
    const done=()=>{
     if(settled)return;settled=true;
     clearTimeout(timer);
     row.removeEventListener('transitionend',done);
     const order=items.map(r=>r.dataset.team);
     const [moved]=order.splice(from,1);order.splice(to,0,moved);
     items.forEach(r=>{r.style.transition='';r.style.transform='';
      r.classList.remove('lift','slide')});
     list.classList.remove('dragging');
     order.forEach(k=>{const el=items.find(r=>r.dataset.team===k);list.appendChild(el)});
     commit(order)};
    const timer=setTimeout(done,200);
    row.addEventListener('transitionend',done)};

   grip.addEventListener('pointermove',move);
   grip.addEventListener('pointerup',up);
   grip.addEventListener('pointercancel',up)});

  /* the same move, for anyone not using a pointer */
  grip.addEventListener('keydown',e=>{
   const items=rows(),row=grip.closest('.sd'),i=items.indexOf(row);
   if(e.key===' '||e.key==='Enter'){e.preventDefault();
    row.classList.toggle('held');return}
   if(!row.classList.contains('held'))return;
   const d=e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0;
   if(!d)return;e.preventDefault();
   const j=i+d;if(j<0||j>=items.length)return;
   const order=items.map(r=>r.dataset.team);
   const [m]=order.splice(i,1);order.splice(j,0,m);
   order.forEach(k=>{list.appendChild(items.find(r=>r.dataset.team===k))});
   commit(order);grip.focus()})});
}
})();

/* ===== bracket.js ===== */
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

/* ===== awards.js ===== */
/* Step four: three names, chosen off a board.
   An empty text box is the worst version of this: it asks you to remember
   fifty names and spell them. A ranked field puts the likely ones in front of
   you, orders them the way the market does, and still takes a write-in for
   anyone it has missed. The list filters as you type rather than re-rendering,
   so the caret survives the first keystroke. */
(()=>{
const AWARDS=[['mvp','Most Valuable Player','Nearly always a quarterback. Nearly.'],
 ['opoy','Offensive Player of the Year','The one who broke a number, which is not always the MVP.'],
 ['dpoy','Defensive Player of the Year','The one an offence has to build a plan around.']];

const row=(k,c,on)=>{const t=T[c.t];
 return `<button class="cnd${on?' on':''}" data-pick="${k}" data-n="${esc(c.n.toLowerCase())}"
  data-name="${esc(c.n)}" data-team="${esc(c.t)}" data-pos="${esc(c.p)}" data-odds="${esc(c.o)}"
  ${t?`style="--tc:${t.c}"`:''} aria-pressed="${on}">
${mark(t,'xs')}<span class="cnn">${esc(c.n)}</span>
<span class="cnt">${esc(c.t)} · ${esc(c.p)}</span><span class="cno">${esc(c.o)}</span></button>`};

const chosen=(k,a)=>{const t=a.team?T[a.team]:null;
 return `<div class="pick"${t?` style="--tc:${t.c}"`:''}>
${mark(t,'bg')}
<span class="pkn">${esc(a.player)}</span>
<span class="pkm">${a.team?esc(a.team):'no team'}${a.pos?' · '+esc(a.pos):''}${a.odds?' · '+esc(a.odds):''}</span>
<button class="pkx" data-clear="${k}">Change</button></div>`};

const AW=Object.fromEntries(AWARDS.map(a=>[a[0],a]));
const block=([k,title,note])=>{
 const a=S.award[k]||{},list=board(k);
 if(a.player)return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>${chosen(k,a)}</section>`;
 return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4><span>${list.length} on the board</span></div>
<p class="hint">${esc(note)}</p>
<div class="finder">
<input class="fsearch" type="search" data-search="${k}" placeholder="Search the board"
 autocomplete="off" spellcheck="false" aria-label="Search ${esc(title)} candidates">
<div class="cnds" data-list="${k}">${list.map(c=>row(k,c,false)).join('')}</div>
<p class="cnone" data-none="${k}" hidden>Nobody by that name on the board.</p>
<div class="writein">
<input class="awin" type="text" data-write="${k}" placeholder="Someone else — type a name"
 autocomplete="off" spellcheck="false" aria-label="Write in a ${esc(title)} pick">
</div>
</div></section>`};

SEC.awards={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("awards")}
<p class="kick">Step four</p>
<h1>Three awards</h1>
<p class="lede">Pick off the board or write anyone in. The prices are an
indicative preseason line — they are here to order the field, not because
anyone is taking the bet.</p>
</header>
${AWARDS.map(block).join('')}
${nextBar('awards','See your card','#share')}
</div>`},
after(root){
 /* only the award that changed is redrawn, and it fades rather than the page
    re-entering around it */
 /* a blur handler can pull the section out from under a click, so the swap
    falls back to a full redraw rather than throwing on a detached node */
 const swap=(k,el)=>{const sect=el&&el.closest('.sect');
  if(!sect||!sect.parentNode){save();repaint();return}
  sect.outerHTML=block(AW[k]);save();
  const fresh=[...root.querySelectorAll('.sect')].find(x=>x.querySelector(`[data-search="${k}"],[data-clear="${k}"]`));
  if(fresh){fresh.classList.add('fadein')}
  SEC.awards.after(root);syncChrome()};
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  S.award[b.dataset.pick]={player:b.dataset.name,team:b.dataset.team,
   pos:b.dataset.pos,odds:b.dataset.odds};
  swap(b.dataset.pick,b)});
 root.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.clear;S.award[k]={};swap(k,b)});
 /* filtered in place: a re-render would replace the input and drop the caret */
 root.querySelectorAll('[data-search]').forEach(inp=>{inp.oninput=()=>{
  const k=inp.dataset.search,q=inp.value.trim().toLowerCase();
  const list=root.querySelector(`[data-list="${k}"]`);let n=0;
  list.querySelectorAll('.cnd').forEach(r=>{
   const hit=!q||r.dataset.n.includes(q);r.hidden=!hit;if(hit)n++});
  const none=root.querySelector(`[data-none="${k}"]`);if(none)none.hidden=!!n}});
 root.querySelectorAll('[data-write]').forEach(inp=>{
  const commit=()=>{const v=inp.value.trim();if(!v)return;
   S.award[inp.dataset.write]={player:v};swap(inp.dataset.write,inp)};
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit()}};
  inp.onblur=commit})}};
})();

/* ===== share.js ===== */
/* Step five: the card. Drawn on a canvas rather than screenshotted, so it is
   the same on every phone, crisp at any size, and needs nothing loaded from
   anywhere. 1080 x 1620 at two times, which is a portrait that fills a phone
   and survives a group chat's compression. */
(()=>{
/* --- the card -------------------------------------------------------------
   One object. The real NFL bracket: AFC running in from the left, NFC in from
   the right, the champion in the middle where the trophy goes. A name, and
   three awards along the foot.

   Everything else went. Earlier versions had a masthead, a dateline, a
   champion band, two section heads, a super bowl block, a leader table and a
   colophon — fifteen things, each with its own label and rule, which is how a
   card ends up looking like every other generated card. A bracket is already a
   recognisable object. It does not need a frame around it. */
const W=1080,H=1080,PAD=34,SCALE=2;
const INK='#191917',MUT='#605F58',FNT='#9C9B92',PAPER='#FAFAF6';
const HAIR='rgba(25,25,23,.22)';
const COND='Sohne Schmal',SANS='Sohne';

function tx(c,s,x,y,{size=16,weight=400,face=SANS,color=INK,align='left',track=0,max=0}={}){
 let sz=size;
 c.textAlign=align;c.textBaseline='alphabetic';c.fillStyle=color;
 c.letterSpacing=track?track+'px':'0px';
 c.font=`${weight} ${sz}px "${face}", sans-serif`;
 if(max){while(sz>9&&c.measureText(s).width>max){sz-=1;
  c.font=`${weight} ${sz}px "${face}", sans-serif`}}
 c.fillText(s,x,y);c.letterSpacing='0px';
 return c.measureText(s).width}
const rule=(c,y,x1,x2,col=HAIR,h=1)=>{c.fillStyle=col;c.fillRect(x1,y,x2-x1,h)};
const onDark=hex=>lum(hex)>.42;
const over=(hex,a)=>onDark(hex)?`rgba(25,25,23,${a})`:`rgba(255,255,255,${a})`;

const CW=128,GAP=12,ROW=84,GAME=ROW*2,GGAP=50;

/* A cell mirrors on the NFC side — logo outboard, text reading in towards the
   middle — so both halves point at the champion rather than both pointing
   right. */
function cell(c,g,id,x,y,flip){
 c.fillStyle='#FFFFFF';c.fillRect(x,y,CW,GAME);
 ['home','away'].forEach((side,i)=>{
  const k=g[side],t=k?T[k]:null,won=S.win[id]===k;
  const sy=y+i*ROW,seed=side==='home'?g.hs:g.as;
  if(won){c.fillStyle=t.c;c.fillRect(x,sy,CW,ROW)}
  if(!t){tx(c,'—',x+CW/2,sy+ROW/2+6,{size:16,weight:400,color:FNT,align:'center'});return}
  const lost=!!S.win[id]&&!won;
  if(lost){c.save();c.globalAlpha=.4}
  const lx=flip?x+CW-38:x+8;
  logo(c,t,lx,sy+10,30);
  if(seed)tx(c,String(seed),flip?x+CW-46:x+46,sy+28,
   {size:13,weight:600,face:COND,color:won?over(t.c,.6):FNT,track:.6,
    align:flip?'right':'left'});
  tx(c,t.k,flip?x+CW-10:x+10,sy+ROW-18,
   {size:32,weight:700,face:COND,color:won?t.f:INK,track:.8,
    align:flip?'right':'left'});
  if(lost)c.restore()});
 c.fillStyle=HAIR;
 c.fillRect(x,y,CW,1);c.fillRect(x,y+GAME-1,CW,1);
 c.fillRect(x,y,1,GAME);c.fillRect(x+CW-1,y,1,GAME);
 c.fillRect(x,y+ROW,CW,1)}

function elbow(c,a,b){const mid=(a.x+b.x)/2;
 c.beginPath();c.moveTo(a.x,a.y);c.lineTo(mid,a.y);
 c.lineTo(mid,b.y);c.lineTo(b.x,b.y);c.stroke()}

/* one half of the bracket, running inwards */
function half(c,B,conf,x0,top,flip){
 const ids=[[conf+'-wc0',conf+'-wc1',conf+'-wc2'],[conf+'-dv0',conf+'-dv1'],[conf+'-cc']];
 const span=3*GAME+2*GGAP;
 const cols=ids.map((col,ci)=>{
  const cx=flip?x0-ci*(CW+GAP):x0+ci*(CW+GAP);
  const h=col.length*GAME+(col.length-1)*GGAP,off=(span-h)/2;
  return col.map((id,i)=>{
   const gy=top+off+i*(GAME+GGAP),g=B[id];
   return {id,g,x:cx,y:gy,
    rows:['home','away'].map((side,j)=>({team:g[side],won:S.win[id]===g[side],
     x:flip?cx:cx+CW,y:gy+j*ROW+ROW/2}))}})});
 c.save();c.strokeStyle=HAIR;c.lineWidth=1;
 for(let ci=1;ci<cols.length;ci++){
  const prev=cols[ci-1].flatMap(g=>g.rows).filter(r=>r.won);
  cols[ci].forEach(g=>g.rows.forEach(r=>{
   if(!r.team)return;const src=prev.find(p=>p.team===r.team);
   if(src)elbow(c,src,{x:flip?r.x+CW:r.x-CW,y:r.y})}))}
 c.restore();
 ['Wild Card','Divisional','Championship'].forEach((l,ci)=>{
  const cx=flip?x0-ci*(CW+GAP):x0+ci*(CW+GAP);
  tx(c,l,flip?cx+CW:cx,top-16,{size:12,weight:600,face:COND,color:FNT,
   track:1,align:flip?'right':'left'})});
 cols.forEach(col=>col.forEach(g=>cell(c,g.g,g.id,g.x,g.y,flip)));
 return span}

function draw(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 const B=bracket(),ch=champion(),T1=ch?T[ch]:null;

 tx(c,((S.name||'').trim()||'My picks').toUpperCase(),PAD,58,
  {size:26,weight:700,face:COND,track:1.6,max:520});
 tx(c,'2026 NFL PREDICTIONS',W-PAD,58,
  {size:26,weight:700,face:COND,color:T1?T1.c:INK,track:1.6,align:'right'});
 rule(c,76,PAD,W-PAD,'rgba(25,25,23,.9)',2);

 const top=176;
 tx(c,'AFC',PAD,132,{size:30,weight:700,face:COND,track:1});
 tx(c,'NFC',W-PAD,132,{size:30,weight:700,face:COND,track:1,align:'right'});
 const span=half(c,B,'AFC',PAD,top,false);
 half(c,B,'NFC',W-PAD-CW,top,true);

 /* the middle, where the trophy goes */
 const mx=PAD+3*(CW+GAP),mw=W-PAD*2-6*(CW+GAP)-GAP*2,cx=mx+GAP+mw/2;
 const my=top+span/2;
 if(T1){
  logo(c,T1,cx-72,my-134,144);
  tx(c,'CHAMPION',cx,my+22,{size:15,weight:700,face:COND,color:MUT,
   track:2.4,align:'center'});
  tx(c,T1.city.toUpperCase(),cx,my+62,{size:22,weight:600,face:COND,color:MUT,
   track:1,align:'center',max:mw+80});
  tx(c,T1.name.toUpperCase(),cx,my+110,{size:46,weight:700,face:COND,color:T1.c,
   track:.8,align:'center',max:mw+110});
 }else{
  tx(c,'CHAMPION',cx,my-6,{size:14,weight:700,face:COND,color:FNT,track:2.2,align:'center'});
  tx(c,'—',cx,my+34,{size:34,weight:700,face:COND,color:FNT,align:'center'})}

 /* the three names, along the foot, on one line each */
 /* three cards along the foot, each in its man's colours with his face on it */
 const gapA=16,cwA=(W-PAD*2-gapA*2)/3,chA=182,ay=top+span+74;
 [['mvp','MVP'],['opoy','OPOY'],['dpoy','DPOY']].forEach(([k,l],i)=>{
  const a=S.award[k]||{},t=a.team?T[a.team]:null;
  const x=PAD+i*(cwA+gapA);
  tx(c,l,x,ay-14,{size:17,weight:700,face:COND,color:MUT,track:2});
  const bg=t?t.c:'#E8E7E0',fg=t?t.f:MUT;
  c.fillStyle=bg;c.fillRect(x,ay,cwA,chA);
  const im=a.player&&IMG['@'+shotKey(a.player)];
  const ps=132;
  if(im){/* face bled off the right edge, cropped square to the head */
   c.save();c.beginPath();c.rect(x+cwA-ps-6,ay+chA-ps-2,ps,ps);c.clip();
   const r=ps/Math.min(im.naturalWidth,im.naturalHeight);
   const w=im.naturalWidth*r,h=im.naturalHeight*r;
   c.drawImage(im,x+cwA-ps-6+(ps-w)/2,ay+chA-ps-2+(ps-h)/2,w,h);c.restore()}
  else if(a.player){c.save();c.globalAlpha=.22;c.fillStyle=fg;
   c.beginPath();c.arc(x+cwA-72,ay+chA-64,52,0,6.29);c.fill();c.restore();
   tx(c,initials(a.player),x+cwA-72,ay+chA-50,
    {size:38,weight:700,face:COND,color:fg,align:'center'})}
  if(a.pos)tx(c,a.pos,x+16,ay+34,{size:15,weight:700,face:COND,
   color:over(bg,.72),track:1.6});
  const nm=((a.player||'').trim()||'Not picked');
  const parts=nm.split(/\s+/),last=parts.length>1?parts.pop():'',first=parts.join(' ');
  if(last){
   tx(c,first.toUpperCase(),x+16,ay+chA-52,{size:20,weight:600,face:COND,
    color:over(bg,.78),track:1,max:cwA-150});
   tx(c,last.toUpperCase(),x+16,ay+chA-20,{size:34,weight:700,face:COND,
    color:fg,track:.6,max:cwA-150})}
  else tx(c,nm.toUpperCase(),x+16,ay+chA-20,{size:30,weight:700,face:COND,
   color:fg,track:.6,max:cwA-150})});
}

/* Every face the card uses has to be resident before the first stroke, or the
   browser silently falls back and the whole thing is set in the system sans.
   The logos are the same problem in image form: drawImage on a half-loaded
   image draws nothing and reports no error. */
const FACES=['700 26px "Sohne Schmal"','600 19px "Sohne Schmal"','400 16px Sohne'];
const IMG={};
const pic=src=>new Promise(res=>{const im=new Image();
 im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});
function loadLogos(){
 const jobs=TEAMS.map(t=>{const src=logoOf(t);
  return src?pic(src).then(im=>{if(im)IMG[t.k]=im}):null}).filter(Boolean);
 /* and the three faces the awards are currently pointing at */
 ['mvp','opoy','dpoy'].forEach(k=>{const a=S.award[k]||{};
  const src=a.player&&shotOf(a.player);
  if(src)jobs.push(pic(src).then(im=>{if(im)IMG['@'+shotKey(a.player)]=im}))});
 return Promise.all(jobs)}
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
<div class="sh"><h4>The picture</h4><span>1080 × 1080</span></div>
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
