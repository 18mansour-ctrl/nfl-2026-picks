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
 if(SEC[STEP].after)SEC[STEP].after(root)}

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

/* the button that carries you on, and says what is left when it cannot */
function nextBar(k,label,href){
 const ok=stepDone(k);
 return `<div class="nextbar" data-for="${k}" data-href="${href}">
<a class="${ok?'next':'next off'}"${ok?` href="${href}"`:''}>${esc(label)}</a>
</div>`}

function boot(){load();reconcile();render()}
