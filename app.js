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
/* The same idea against the second colour, for the places that fill with it
   rather than with the primary — but taking whichever of ink or white actually
   contrasts better, instead of the fixed cut above. That cut exists so thirty
   two row fills agree with each other; nothing here needs to agree with them,
   and it would put white on the mid-tone seconds — Colts grey, Seahawks green,
   Jaguars gold — at about 2.3:1. */
const contrast=(a,b)=>{const x=lum(a),y=lum(b),h=Math.max(x,y),l=Math.min(x,y);
 return (h+.05)/(l+.05)};
TEAMS.forEach(t=>{t.f2=contrast(t.c2,'#191917')>=contrast(t.c2,'#FFFFFF')
 ?'#191917':'#FFFFFF'});

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

/* A whole-screen redraw that nobody sees redraw. Every element worth following
   carries a data-flip key: measure them all, let the redraw happen, then move
   each one from where it used to be. Elements that went away are re-parented
   into a fixed overlay and faded out of the place they occupied — innerHTML
   detaches those nodes rather than destroying them, so they are still there to
   use as their own ghosts. Only the outermost mover is animated, or a section
   and the rows inside it would each carry the same delta and travel twice. */
function flipRender(mutate){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){mutate();repaint();return}
 const root=$('#root'),before=new Map();
 root.querySelectorAll('[data-flip]').forEach(el=>
  before.set(el.dataset.flip,{r:el.getBoundingClientRect(),el}));
 mutate();
 repaint();
 const after=new Map();
 root.querySelectorAll('[data-flip]').forEach(el=>after.set(el.dataset.flip,el));
 const EASE='cubic-bezier(.22,.7,.25,1)';

 /* Only the outermost casualty becomes a ghost. The detached subtree keeps its
    parent chain, so a vanished pool still owns its vanished cards — ghosting
    both would strip the cards out of it and dissolve twelve things where one
    block is what actually left. */
 const gone=[];
 before.forEach(({r,el},k)=>{if(!after.has(k))gone.push({r,el})});
 const goneSet=new Set(gone.map(g=>g.el));
 let ghosts=null;
 gone.filter(({el})=>{let p=el.parentElement;
   while(p){if(goneSet.has(p))return false;p=p.parentElement}return true})
  .forEach(({r,el})=>{
  if(!ghosts){ghosts=document.createElement('div');ghosts.className='ghosts';
   document.body.appendChild(ghosts)}
  el.style.cssText+=`;position:absolute;margin:0;left:${r.left}px;top:${r.top}px;`
   +`width:${r.width}px;height:${r.height}px`;
  ghosts.appendChild(el);
  el.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.96)'}],
   {duration:190,easing:'ease-out',fill:'forwards'})});
 if(ghosts)setTimeout(()=>ghosts.remove(),230);

 const moved=[];
 after.forEach((el,k)=>{const b=before.get(k);if(!b)return;
  const a=el.getBoundingClientRect();
  const dx=b.r.left-a.left,dy=b.r.top-a.top;
  if(Math.abs(dx)<.5&&Math.abs(dy)<.5)return;
  moved.push({el,dx,dy})});
 const set=new Set(moved.map(m=>m.el));
 moved.filter(({el})=>{let p=el.parentElement;
   while(p){if(set.has(p))return false;p=p.parentElement}return true})
  .forEach(({el,dx,dy})=>el.animate(
   [{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],
   {duration:380,easing:EASE}));

 after.forEach((el,k)=>{if(before.has(k))return;
  el.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'none'}],
   {duration:270,easing:EASE})});
}

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
><span class="clrl">Clear</span></button>`}

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
 bracket:()=>{S.win={}},
 awards:()=>{S.award={mvp:{},opoy:{},dpoy:{}}}};
const HASPICKS={
 divisions:()=>Object.values(S.fin).some(a=>a&&a.length),
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
  /* wiping a whole step is worth a second tap; the arming lapses on its own
     after two seconds, quietly — a visible countdown made more of it than
     the moment deserves */
  if(!armed){armed=1;b.classList.add('armed');morphLabel(b,'Confirm?');
   t=setTimeout(disarm,2000);return}
  clearTimeout(t);armed=0;b.classList.remove('armed');b.style.width='';
  CLEARERS[step]();reconcile();save();repaint()}}

/* the button that carries you on, and says what is left when it cannot */
function nextBar(k,label,href){
 const ok=stepDone(k);
 return `<div class="nextbar" data-flip="nextbar" data-for="${k}" data-href="${href}">
<a class="${ok?'next':'next off'}"${ok?` href="${href}"`:''}>${esc(label)}</a>
</div>`}

function boot(){load();reconcile();render()}

/* ===== logos.js ===== */
/* Generated by build.sh from logos/. Do not hand-edit. */
const LOGOS={ari:'webp',atl:'webp',bal:'webp',buf:'webp',car:'webp',chi:'webp',cin:'webp',cle:'webp',dal:'webp',den:'webp',det:'webp',gb:'webp',hou:'webp',ind:'webp',jax:'webp',kc:'webp',lac:'webp',lar:'webp',lv:'webp',mia:'webp',min:'webp',ne:'webp',no:'webp',nyg:'webp',nyj:'png',phi:'webp',pit:'webp',sea:'webp',sf:'webp',tb:'webp',ten:'webp',was:'webp'};

/* ===== shots.js ===== */
/* Generated by build.sh from headshots/. Do not hand-edit. */
const SHOTS=new Set(['aarondonald','aaronrodgers','abdulcarter','aidanhutchinson','ajbrown','alexhighsmith','amonrastbrown','andrewvanginkel','anthonyrichardson','ashtonjeanty','bakermayfield','bijanrobinson','bonix','bradleychubb','breecehall','brianburns','brianthomas','brockbowers','brockpurdy','bryceyoung','buckyirving','buddabaker','byronyoung','calebwilliams','camskattebo','camward','carsonschwesinger','ceedeelamb','chasebrown','chaseyoung','chrisjones','chrisolave','christianmccaffrey','christianwatson','cjstroud','colstonloveland','cooperdejean','courtlandsutton','dakprescott','danieljones','daniellehunter','davanteadams','derekstingley','derrickhenry','derwinjames','deshaunwatson','devinlloyd','devonachane','devonwitherspoon','djmoore','dkmetcalf','drakelondon','drakemaye','emekaegbuka','fernandomendoza','fredwarner','garrettwilson','genosmith','georgekarlaftis','georgekittle','georgepickens','gregrousseau','jacobybrissett','jahmyrgibbs','jalencarter','jalenhurts','jalonwalker','jamarrchase','jamescook','jamesonwilliams','jaredgoff','jaredverse','javontewilliams','jaxonsmithnjigba','jaxsondart','jayceehorn','jaydendaniels','jaylenwaddle','jefferysimmons','jeremiyahlove','jjmccarthy','joeburrow','joeflacco','jonathantaylor','jordanlove','joshallen','joshhinesallen','joshjacobs','joshsweat','justinfields','justinherbert','justinjefferson','kamarilassiter','kennethwalker','kevinbyard','kirkcousins','kylehamilton','kylermurray','kyrenwilliams','laddmcconkey','laiatulatu','lamarjackson','leonardwilliams','macjones','maliknabers','malikwillis','marvinharrison','matthewstafford','maxxcrosby','micahparsons','michaelpenix','mikeevans','montezsweat','mylesgarrett','nickbosa','nickemmanwori','nicocollins','nikbonitto','omarionhampton','patrickmahomes','patricksurtain','pukanacua','quinnenwilliams','quinyonmitchell','rashangary','rasheerice','ricodowdle','rjharvey','romeodunze','ruebenbain','samdarnold','samlaporta','saquonbarkley','shedeursanders','spencerrattler','talanoahufanga','teehiggins','terrymclaurin','tetairoamcmillan','tjwatt','travisetienne','travishunter','trentmcduffie','treveyonhenderson','trevorlawrence','treyhendrickson','treymcbride','tuatagovailoa','tulituipulotu','tylershough','tyreekhill','willanderson','willmcdonald','xaviermckinney','zachallen','zackbaun','zayflowers']);

/* ===== players.js ===== */
/* The three boards.
   A ranked field is a better selector than an empty text box: it puts the
   likely names in front of you, orders them by how the market sees them, and
   still lets you write in anybody it has missed.

   Pulled from the books in September 2026 and then curated by hand with
   curate.html — MVP from a VegasInsider consensus, OPOY and DPOY from
   BetOnline.ag, Aaron Donald's DPOY price from Fox Sports. Neither book
   publishes a team or a position, so those are ours.

   The order is Nick's. The prices have been fitted to it — the smallest change
   to the real numbers that makes them read top to bottom, snapped back onto
   the increments a book actually posts. So a price here is honest about where
   a player sits on this board and only roughly honest about the market: Maxx
   Crosby really is +800 somewhere, he is just not the thirteenth best bet on
   this one. The prices order the field and give a pick some context; anyone
   can still be written in.

   MVP 76 · OPOY 62 · DPOY 55. */
const BOARD={
mvp:[
 ['Josh Allen','BUF','QB','+500'],['Joe Burrow','CIN','QB','+800'],
 ['Lamar Jackson','BAL','QB','+800'],['Matthew Stafford','LAR','QB','+1100'],
 ['Justin Herbert','LAC','QB','+1100'],['Drake Maye','NE','QB','+1100'],
 ['Caleb Williams','CHI','QB','+1200'],['Trevor Lawrence','JAX','QB','+1300'],
 ['Patrick Mahomes','KC','QB','+1300'],['Jayden Daniels','WAS','QB','+1600'],
 ['Dak Prescott','DAL','QB','+1600'],['Jordan Love','GB','QB','+2000'],
 ['Brock Purdy','SF','QB','+2000'],['Bo Nix','DEN','QB','+2500'],
 ['Jalen Hurts','PHI','QB','+2500'],['Sam Darnold','SEA','QB','+2500'],
 ['Jared Goff','DET','QB','+2500'],['Kyler Murray','MIN','QB','+4000'],
 ['Jaxson Dart','NYG','QB','+4000'],['Baker Mayfield','TB','QB','+4000'],
 ['C.J. Stroud','HOU','QB','+5000'],['Cam Ward','TEN','QB','+5000'],
 ['Jahmyr Gibbs','DET','RB','+5000'],['Bijan Robinson','ATL','RB','+6000'],
 ['Myles Garrett','LAR','EDGE','+10000'],['Daniel Jones','IND','QB','+10000'],
 ['Tyler Shough','NO','QB','+10000'],['Aaron Rodgers','PIT','QB','+10000'],
 ['Bryce Young','CAR','QB','+10000'],['Jacoby Brissett','ARI','QB','+17500'],
 ['Malik Willis','MIA','QB','+17500'],['Michael Penix Jr.','ATL','QB','+17500'],
 ['Fernando Mendoza','LV','QB','+17500'],['Geno Smith','NYJ','QB','+17500'],
 ['Puka Nacua','LAR','WR','+17500'],['Christian McCaffrey','SF','RB','+17500'],
 ['Tua Tagovailoa','ATL','QB','+17500'],['Kirk Cousins','LV','QB','+17500'],
 ['Justin Jefferson','MIN','WR','+17500'],['Ja\'Marr Chase','CIN','WR','+17500'],
 ['Will Anderson Jr.','HOU','EDGE','+17500'],['Joe Flacco','CIN','QB','+17500'],
 ['Anthony Richardson','IND','QB','+17500'],['Mac Jones','SF','QB','+17500'],
 ['Shedeur Sanders','CLE','QB','+17500'],['Deshaun Watson','CLE','QB','+17500'],
 ['Saquon Barkley','PHI','RB','+17500'],['Jaxon Smith-Njigba','SEA','WR','+17500'],
 ['CeeDee Lamb','DAL','WR','+17500'],['James Cook','BUF','RB','+17500'],
 ['Jonathan Taylor','IND','RB','+17500'],['Derrick Henry','BAL','RB','+17500'],
 ['De\'Von Achane','MIA','RB','+20000'],['Drake London','ATL','WR','+20000'],
 ['J.J. McCarthy','MIN','QB','+20000'],['Amon-Ra St. Brown','DET','WR','+25000'],
 ['Nico Collins','HOU','WR','+25000'],['Malik Nabers','NYG','WR','+25000'],
 ['Travis Hunter','JAX','WR/CB','+25000'],['Aaron Donald','LAR','DT','+40000'],
 ['Jared Verse','CLE','EDGE','+40000'],['Aidan Hutchinson','DET','EDGE','+40000'],
 ['Nik Bonitto','DEN','EDGE','+40000'],['Nick Bosa','SF','EDGE','+40000'],
 ['Travis Etienne Jr.','NO','RB','+40000'],['Maxx Crosby','LV','EDGE','+40000'],
 ['Jeffery Simmons','TEN','DT','+40000'],['Micah Parsons','GB','EDGE','+40000'],
 ['Omarion Hampton','LAC','RB','+40000'],['Javonte Williams','DAL','RB','+40000'],
 ['Bucky Irving','TB','RB','+50000'],['Jalen Carter','PHI','DT','+50000'],
 ['Mike Evans','SF','WR','+50000'],['George Pickens','DAL','WR','+50000'],
 ['Chris Olave','NO','WR','+50000'],['Cam Skattebo','NYG','RB','+50000']],
opoy:[
 ['Jahmyr Gibbs','DET','RB','+750'],['Bijan Robinson','ATL','RB','+900'],
 ['Ja\'Marr Chase','CIN','WR','+900'],['Puka Nacua','LAR','WR','+1000'],
 ['Jonathan Taylor','IND','RB','+1300'],['Jaxon Smith-Njigba','SEA','WR','+1300'],
 ['Justin Jefferson','MIN','WR','+1400'],['Amon-Ra St. Brown','DET','WR','+1400'],
 ['Christian McCaffrey','SF','RB','+1400'],['James Cook','BUF','RB','+1800'],
 ['Malik Nabers','NYG','WR','+1800'],['Derrick Henry','BAL','RB','+1800'],
 ['CeeDee Lamb','DAL','WR','+1800'],['Ashton Jeanty','LV','RB','+2500'],
 ['Saquon Barkley','PHI','RB','+2500'],['De\'Von Achane','MIA','RB','+2500'],
 ['Jeremiyah Love','ARI','RB','+3300'],['Rashee Rice','KC','WR','+3300'],
 ['Nico Collins','HOU','WR','+3300'],['Brock Bowers','LV','TE','+5500'],
 ['Drake London','ATL','WR','+5500'],['Trey McBride','ARI','TE','+5500'],
 ['Josh Allen','BUF','QB','+5500'],['Lamar Jackson','BAL','QB','+5500'],
 ['Kenneth Walker III','KC','RB','+5500'],['Cam Skattebo','NYG','RB','+5500'],
 ['Omarion Hampton','LAC','RB','+5500'],['Tetairoa McMillan','CAR','WR','+5500'],
 ['Davante Adams','LAR','WR','+6600'],['Bucky Irving','TB','RB','+6600'],
 ['George Pickens','DAL','WR','+6600'],['A.J. Brown','NE','WR','+6600'],
 ['Terry McLaurin','WAS','WR','+7500'],['Travis Etienne Jr.','NO','RB','+7500'],
 ['Chase Brown','CIN','RB','+8000'],['Caleb Williams','CHI','QB','+8000'],
 ['Jayden Daniels','WAS','QB','+8000'],['Joe Burrow','CIN','QB','+8000'],
 ['Justin Herbert','LAC','QB','+8000'],['Patrick Mahomes','KC','QB','+8000'],
 ['Trevor Lawrence','JAX','QB','+8000'],['Breece Hall','NYJ','RB','+8000'],
 ['Garrett Wilson','NYJ','WR','+8000'],['Javonte Williams','DAL','RB','+8000'],
 ['Kyren Williams','LAR','RB','+8000'],['Brock Purdy','SF','QB','+10000'],
 ['Chris Olave','NO','WR','+10000'],['Zay Flowers','BAL','WR','+10000'],
 ['Christian Watson','GB','WR','+10000'],['Colston Loveland','CHI','TE','+10000'],
 ['Dak Prescott','DAL','QB','+10000'],['Daniel Jones','IND','QB','+10000'],
 ['DJ Moore','BUF','WR','+10000'],['Emeka Egbuka','TB','WR','+10000'],
 ['Jalen Hurts','PHI','QB','+10000'],['Jaylen Waddle','DEN','WR','+10000'],
 ['Marvin Harrison Jr.','ARI','WR','+10000'],['Matthew Stafford','LAR','QB','+10000'],
 ['Mike Evans','SF','WR','+10000'],['Rico Dowdle','PIT','RB','+10000'],
 ['RJ Harvey','DEN','RB','+10000'],['TreVeyon Henderson','NE','RB','+10000']],
dpoy:[
 ['Myles Garrett','LAR','EDGE','+450'],['Will Anderson Jr.','HOU','EDGE','+750'],
 ['Aidan Hutchinson','DET','EDGE','+900'],['Micah Parsons','GB','EDGE','+1000'],
 ['Aaron Donald','LAR','DT','+1800'],['Jared Verse','CLE','EDGE','+1800'],
 ['Nik Bonitto','DEN','EDGE','+1800'],['Danielle Hunter','HOU','EDGE','+1800'],
 ['Nick Bosa','SF','EDGE','+1800'],['Fred Warner','SF','LB','+2800'],
 ['Kyle Hamilton','BAL','S','+2800'],['Trey Hendrickson','BAL','EDGE','+2800'],
 ['Josh Hines-Allen','JAX','EDGE','+2800'],['Maxx Crosby','LV','EDGE','+2800'],
 ['Devon Witherspoon','SEA','CB','+2800'],['Brian Burns','NYG','EDGE','+2800'],
 ['T.J. Watt','PIT','EDGE','+2800'],['Quinyon Mitchell','PHI','CB','+3500'],
 ['Jalen Carter','PHI','DT','+3500'],['Carson Schwesinger','CLE','LB','+3500'],
 ['Laiatu Latu','IND','EDGE','+3500'],['Tuli Tuipulotu','LAC','EDGE','+3500'],
 ['Chris Jones','KC','DT','+5000'],['Cooper DeJean','PHI','CB','+5000'],
 ['Abdul Carter','NYG','EDGE','+6600'],['Derwin James Jr.','LAC','S','+7000'],
 ['Derek Stingley Jr.','HOU','CB','+7000'],['Patrick Surtain II','DEN','CB','+7000'],
 ['Quinnen Williams','DAL','DT','+7000'],['Trent McDuffie','LAR','CB','+7000'],
 ['Josh Sweat','ARI','EDGE','+7000'],['Montez Sweat','CHI','EDGE','+7000'],
 ['Andrew Van Ginkel','MIN','LB','+7000'],['Nick Emmanwori','SEA','S','+7000'],
 ['Will McDonald IV','NYJ','EDGE','+7000'],['Bradley Chubb','BUF','EDGE','+7500'],
 ['Byron Young','LAR','EDGE','+8000'],['Devin Lloyd','CAR','LB','+8000'],
 ['George Karlaftis','KC','EDGE','+8000'],['Jaycee Horn','CAR','CB','+8000'],
 ['Jeffery Simmons','TEN','DT','+8000'],['Kamari Lassiter','HOU','CB','+8000'],
 ['Leonard Williams','SEA','DT','+8000'],['Alex Highsmith','PIT','EDGE','+10000'],
 ['Budda Baker','ARI','S','+10000'],['Rueben Bain Jr.','TB','EDGE','+10000'],
 ['Chase Young','NO','EDGE','+10000'],['Greg Rousseau','BUF','EDGE','+10000'],
 ['Jalon Walker','ATL','EDGE','+10000'],['Kevin Byard III','NE','S','+10000'],
 ['Rashan Gary','DAL','EDGE','+10000'],['Talanoa Hufanga','DEN','S','+10000'],
 ['Xavier McKinney','GB','S','+10000'],['Zach Allen','DEN','DT','+10000'],
 ['Zack Baun','PHI','LB','+10000']]};
const board=k=>(BOARD[k]||[]).map(([n,t,p,o])=>({n,t,p,o}));

/* ===== roster.js ===== */
/* Generated by tools/roster.py from rosters-2026.csv. Do not hand-edit.
   1952 players — every skill position on all 32 rosters. Linemen,
   kickers, punters and long snappers are left out. The fourth field is the
   side of the ball, which is what keeps offensive names out of the defensive
   award's search and the other way round. */
const ROSTER=[
 ['Israel Abanikanda','DAL','RB','O'],['Ameer Abdullah','JAX','RB','O'],['Yasir Abdullah','ATL','LB','D'],
 ['Kris Abrams-Draine','DEN','CB','D'],['De\'Von Achane','MIA','RB','O'],['Davante Adams','LAR','WR','O'],
 ['Jamal Adams','MIN','LB','D'],['Tony Adams','TEN','S','D'],['Jordan Addison','MIN','WR','O'],
 ['Adetomiwa Adebawore','IND','DT','D'],['Paulson Adebo','NYG','CB','D'],['Nate Adkins','DEN','TE','O'],
 ['David Ebuka Agoha','DEN','EDGE','D'],['Joey Aguilar','JAX','QB','O'],['Salvon Ahmed','CHI','RB','O'],
 ['Brandon Aiyuk','SF','WR','O'],['Austin Ajiake','IND','LB','D'],['Azeez Al-Shaair','HOU','LB','D'],
 ['Darius Alexander','NYG','DT','D'],['Dee Alford','BUF','CB','D'],['Rasheen Ali','BAL','RB','O'],
 ['Mo Alie-Cox','IND','TE','O'],['Drew Allar','PIT','QB','O'],['Braelon Allen','NYJ','RB','O'],
 ['CJ Allen','IND','LB','D'],['Cyrus Allen','KC','WR','O'],['Davis Allen','LAR','TE','O'],
 ['Jonathan Allen','CIN','DT','D'],['Josh Allen','BUF','QB','O'],['Kaytron Allen','WAS','RB','O'],
 ['Keenan Allen','IND','WR','O'],['Kyle Allen','BUF','QB','O'],['Marcus Allen','MIN','CB','D'],
 ['Zach Allen','DEN','EDGE','D'],['Tyler Allgeier','ARI','RB','O'],['Luke Altmyer','DET','QB','O'],
 ['Trey Amos','WAS','CB','D'],['Nick Andersen','LAR','S','D'],['Liam Anderson','MIA','LB','D'],
 ['Tycen Anderson','DEN','S','D'],['Zayne Anderson','MIA','S','D'],['Joe Andreessen','BUF','LB','D'],
 ['Mark Andrews','BAL','TE','O'],['Felix Anudike-Uzomah','KC','EDGE','D'],['Chigozie Anusiem','LV','CB','D'],
 ['Alex Anzalone','TB','LB','D'],['Tanner Arkin','NE','TE','O'],['Arik Armstead','JAX','DT','D'],
 ['Da\'Veawn Armstead','MIN','CB','D'],['Andrew Armstrong','KC','WR','O'],['Dorance Armstrong','WAS','EDGE','D'],
 ['Terrion Arnold','SEA','CB','D'],['Elijah Arroyo','SEA','TE','O'],['Eugene Asante','ARI','LB','D'],
 ['Tutu Atwell','LAR','WR','O'],['Brent Austin','DEN','CB','D'],['Chidobe Awuzie','BAL','CB','D'],
 ['Elic Ayomanor','TEN','WR','O'],['Joe Bachie','DET','LB','D'],['Alex Bachman','LAR','WR','O'],
 ['Tyler Badie','DEN','RB','O'],['Tyson Bagent','CHI','QB','O'],['David Bailey','NYJ','LB','D'],
 ['Dominic Bailey','HOU','DT','D'],['Levelle Bailey','DEN','LB','D'],['Wesley Bailey','LAR','LB','D'],
 ['Budda Baker','ARI','S','D'],['Cameron Ball','IND','DT','D'],['Mory Bamba','NYJ','CB','D'],
 ['Michael Bandy','DEN','WR','O'],['Caleb Banks','MIN','DT','D'],['Deonte Banks','NYG','CB','D'],
 ['Keshawn Banks','ATL','EDGE','D'],['Ricky Barber','WAS','DT','D'],['Jaishawn Barham','DAL','LB','D'],
 ['Saquon Barkley','PHI','RB','O'],['Christian Barmore','NE','DT','D'],['AJ Barner','SEA','TE','O'],
 ['Derrick Barnes','DET','LB','D'],['Zaire Barnes','NYG','LB','D'],['Derek Barnett','CLE','EDGE','D'],
 ['Tyler Baron','NYJ','EDGE','D'],['Nick Barrett','LAC','DT','D'],['Jahdae Barron','DEN','CB','D'],
 ['Justin Barron','DAL','LB','D'],['Gavin Bartholomew','MIN','TE','O'],['Shemar Bartholomew','TEN','CB','D'],
 ['Jared Bartlett','JAX','LB','D'],['Cody Barton','TEN','LB','D'],['Lander Barton','LAC','LB','D'],
 ['Jeffrey Bassa','KC','LB','D'],['Rashod Bateman','BAL','WR','O'],['John Bates','WAS','TE','O'],
 ['Jordan Battle','CIN','S','D'],['Tyler Batty','MIN','LB','D'],['Kyler Baugh','PIT','DT','D'],
 ['Zack Baun','PHI','LB','D'],['Jack Bech','LV','WR','O'],['Andrew Beck','NYJ','FB','O'],
 ['Carson Beck','ARI','QB','O'],['Chris Bell','MIA','WR','O'],['Dillon Bell','MIN','WR','O'],
 ['Markquese Bell','DAL','S','D'],['Ronnie Bell','LV','WR','O'],['Skyler Bell','BUF','WR','O'],
 ['Travis Bell','CLE','DT','D'],['Daniel Bellinger','TEN','TE','O'],['Dane Belton','NYJ','S','D'],
 ['Christian Benford','BUF','CB','D'],['Jakorian Bennett','PHI','CB','D'],['Rayshaun Benny','BAL','DT','D'],
 ['Malik Benson','LV','WR','O'],['Trey Benson','ARI','RB','O'],['Dallen Bentley','DEN','TE','O'],
 ['Keeanu Benton','PIT','DT','D'],['Jordan van den Berg','CHI','DT','D'],['Germie Bernard','PIT','WR','O'],
 ['Terrel Bernard','BUF','LB','D'],['Uar Bernard','PHI','DT','D'],['Jarrick Bernard-Converse','NYG','CB','D'],
 ['Braxton Berrios','NYG','WR','O'],['JD Bertrand','ATL','LB','D'],['Tatum Bethune','SF','LB','D'],
 ['Zeek Biggers','MIA','DT','D'],['Tank Bigsby','PHI','RB','O'],['Andrew Billings','ARI','DT','D'],
 ['Cole Bishop','BUF','S','D'],['Kaelon Black','SF','RB','O'],['Korie Black','NYG','CB','D'],
 ['Yahya Black','PIT','EDGE','D'],['Julian Blackmon','NO','S','D'],['Mekhi Blackmon','CLE','CB','D'],
 ['Josh Blackwell','CHI','CB','D'],['Chris Blair','ATL','WR','O'],['DaRon Bland','DAL','CB','D'],
 ['Reed Blankenship','HOU','S','D'],['Joey Blount','ARI','S','D'],['Jaydon Blue','PHI','RB','O'],
 ['Jake Bobo','SEA','WR','O'],['Nate Boerkircher','JAX','TE','O'],['Bryce Boettcher','IND','LB','D'],
 ['T.J. Bollers','JAX','DT','D'],['Nick Bolton','KC','LB','D'],['Isaiah Bond','CLE','WR','O'],
 ['Lewis Bond','HOU','WR','O'],['Nik Bonitto','DEN','LB','D'],['Ethan Bonner','MIA','CB','D'],
 ['Austin Booker','CHI','EDGE','D'],['Davon Booth','IND','RB','O'],['Nick Bosa','SF','EDGE','D'],
 ['Denzel Boston','CLE','WR','O'],['Kendrick Bourne','ARI','WR','O'],['Kayshon Boutte','HOU','WR','O'],
 ['Brock Bowers','LV','TE','O'],['Shawn Bowman','ARI','TE','O'],['Khristian Boyd','NO','DT','D'],
 ['Swayze Bozeman','CIN','LB','D'],['Carter Bradley','JAX','QB','O'],['Jaden Bradley','WAS','WR','O'],
 ['Brian Branch','DET','S','D'],['Zachariah Branch','ATL','WR','O'],['Chris Braswell','HOU','LB','D'],
 ['Christian Braswell','JAX','CB','D'],['Max Bredeson','MIN','FB','O'],['JuJu Brents','MIA','CB','D'],
 ['Bryan Bresee','NO','DT','D'],['Trikweze Bridges','CIN','CB','D'],['Jowon Briggs','NYJ','DT','D'],
 ['Jake Briningstool','KC','TE','O'],['Warren Brinson','GB','DT','D'],['Michael Briscoe','MIN','WR','O'],
 ['Jaquan Brisker','PIT','S','D'],['Jacoby Brissett','ARI','QB','O'],['K.J. Britt','NE','LB','D'],
 ['British Brooks','HOU','RB','O'],['Chris Brooks','GB','RB','O'],['Jalen Brooks','ARI','WR','O'],
 ['Jonathon Brooks','CAR','RB','O'],['Jordyn Brooks','MIA','LB','D'],['Karl Brooks','GB','DT','D'],
 ['Kendell Brooks','TEN','S','D'],['Tahj Brooks','CIN','RB','O'],['Max Brosmer','MIN','QB','O'],
 ['Vernon Broughton','NO','DT','D'],['A.J. Brown','NE','WR','O'],['Aamaris Brown','DET','CB','D'],
 ['Amon-Ra St. Brown','DET','WR','O'],['Barion Brown','NO','WR','O'],['Brittain Brown','CHI','RB','O'],
 ['Camden Brown','DAL','WR','O'],['Chase Brown','CIN','RB','O'],['Derrick Brown','CAR','DT','D'],
 ['Dyami Brown','WAS','WR','O'],['Hollywood Brown','PHI','WR','O'],['Ji\'Ayir Brown','SF','S','D'],
 ['Montaric Brown','JAX','CB','D'],['Pharaoh Brown','IND','TE','O'],['Sydney Brown','ATL','S','D'],
 ['Tre Brown','NYJ','CB','D'],['Baron Browning','ARI','LB','D'],['Carson Bruener','PIT','LB','D'],
 ['Coby Bryant','CHI','S','D'],['Myles Bryant','CLE','CB','D'],['Pat Bryant','DEN','WR','O'],
 ['Teddye Buchanan','BAL','LB','D'],['DeForest Buckner','IND','DT','D'],['Shane Buechele','BUF','QB','O'],
 ['Javon Bullard','GB','S','D'],['Jonathan Bullard','DAL','DT','D'],['Calen Bullock','HOU','S','D'],
 ['Kentrel Bullock','CIN','RB','O'],['Jordan Burch','ARI','LB','D'],['Cole Burgess','PIT','WR','O'],
 ['Terrell Burgess','TEN','S','D'],['Denzel Burke','ARI','CB','D'],['Ethan Burke','BAL','LB','D'],
 ['Deion Burks','IND','WR','O'],['Oren Burks','CIN','LB','D'],['Treylon Burks','WAS','WR','O'],
 ['Brian Burns','NYG','LB','D'],['Major Burns','MIA','S','D'],['Joe Burrow','CIN','QB','O'],
 ['Michael Burton','CLE','FB','O'],['Devin Bush','CHI','LB','D'],['Adam Butler','LV','DT','D'],
 ['Percy Butler','WAS','S','D'],['Kevin Byard','NE','S','D'],['Cam Bynum','IND','S','D'],
 ['Solomon Byrd','HOU','EDGE','D'],['Grant Calcaterra','PHI','TE','O'],['Jamaree Caldwell','LAC','DT','D'],
 ['Jeff Caldwell','KC','WR','O'],['Matthew Caldwell','LAR','QB','O'],['Dalen Cambre','NYG','WR','O'],
 ['Josh Cameron','JAX','WR','O'],['Anthony Campbell','GB','DT','D'],['Calais Campbell','BAL','EDGE','D'],
 ['Chance Campbell','PHI','LB','D'],['Dalevon Campbell','LAC','WR','O'],['Elijah Campbell','NYG','S','D'],
 ['Jack Campbell','DET','LB','D'],['Jihaad Campbell','PHI','LB','D'],['Tyson Campbell','CLE','CB','D'],
 ['Channing Canada','NE','CB','D'],['Jadon Canady','KC','CB','D'],['DeMonte Capehart','TB','DT','D'],
 ['Jaylon Carlies','IND','LB','D'],['Stephen Carlson','CHI','TE','O'],['Caelen Carson','DAL','CB','D'],
 ['Abdul Carter','NYG','LB','D'],['Barrett Carter','CIN','LB','D'],['DeWayne Carter','BUF','DT','D'],
 ['Jalen Carter','PHI','DT','D'],['Michael Carter','TEN','RB','O'],['Nathan Carter','KC','RB','O'],
 ['Zachary Carter','ARI','DT','D'],['Blake Cashman','MIN','LB','D'],['Anderson Castle','IND','RB','O'],
 ['Sebastian Castro','PIT','S','D'],['Tariq Castro-Fields','PHI','CB','D'],['K\'Lavon Chaisson','WAS','LB','D'],
 ['Tahj Chambers','IND','LB','D'],['Chaz Chambliss','MIN','LB','D'],['Ty Chandler','NO','RB','O'],
 ['Zach Charbonnet','SEA','RB','O'],['Irv Charles','SEA','WR','O'],['Ja\'Marr Chase','CIN','WR','O'],
 ['Elijah Chatman','CLE','DT','D'],['Leo Chenal','WAS','LB','D'],['Claudin Cherelus','CAR','LB','D'],
 ['Julius Chestnut','TEN','RB','O'],['Zion Childress','CAR','CB','D'],['Jeremy Chinn','LV','S','D'],
 ['Cole Christiansen','KC','LB','D'],['Bradley Chubb','BUF','LB','D'],['Andre Cisco','NYJ','S','D'],
 ['Brandon Cisse','GB','CB','D'],['Demond Claiborne','MIN','RB','O'],['Alijah Clark','DAL','S','D'],
 ['Bud Clark','SEA','S','D'],['Chuck Clark','DET','S','D'],['Damone Clark','DET','LB','D'],
 ['Jordan Clark','NYJ','CB','D'],['Kei\'Trel Clark','ARI','CB','D'],['Kenny Clark','DAL','DT','D'],
 ['Micheal Clemons','IND','EDGE','D'],['Brandon Cleveland','LV','DT','D'],['Sean Clifford','CIN','QB','O'],
 ['Jadeveon Clowney','HOU','EDGE','D'],['Jack Cochrane','KC','LB','D'],['Brandon Codrington','SF','CB','D'],
 ['Jalen Coker','CAR','WR','O'],['Jonah Coleman','DEN','RB','O'],['Keon Coleman','BUF','WR','O'],
 ['Chris Collier','LV','RB','O'],['L.J. Collier','ARI','EDGE','D'],['Alfred Collins','SF','DT','D'],
 ['Beaux Collins','ATL','WR','O'],['Maliek Collins','CLE','DT','D'],['Nico Collins','HOU','WR','O'],
 ['Zaven Collins','ARI','LB','D'],['Junior Colson','LAC','LB','D'],['Branson Combs','JAX','LB','D'],
 ['KC Concepcion','CLE','WR','O'],['Tyler Conklin','DET','TE','O'],['Chamarri Conner','KC','S','D'],
 ['James Conner','ARI','RB','O'],['Dean Connors','LAR','RB','O'],['Brady Cook','MIA','QB','O'],
 ['Bryan Cook','CIN','S','D'],['Darius Cooper','PHI','WR','O'],['Edgerrin Cooper','GB','LB','D'],
 ['Jonathon Cooper','DEN','LB','D'],['Malachi Corley','CLE','WR','O'],['Blake Corum','LAR','RB','O'],
 ['Te\'Cory Couch','BUF','CB','D'],['Kirk Cousins','LV','QB','O'],['Britain Covey','PHI','WR','O'],
 ['Byron Cowart','WAS','DT','D'],['Jacob Cowing','SF','WR','O'],['Keyron Crawford','LV','EDGE','D'],
 ['Kitan Crawford','ARI','S','D'],['Maxx Crosby','LV','EDGE','D'],['Jacory Croskey-Merritt','WAS','RB','O'],
 ['Nick Cross','WAS','S','D'],['Josh Cuevas','BAL','TE','O'],['Kam Curl','LAR','S','D'],
 ['Caden Curry','IND','LB','D'],['Drake Dabney','GB','TE','O'],['DeeJay Dallas','MIN','RB','O'],
 ['Andy Dalton','PHI','QB','O'],['CJ Daniels','LAR','WR','O'],['Jalon Daniels','TB','QB','O'],
 ['Jayden Daniels','WAS','QB','O'],['Kendal Daniels','ATL','LB','D'],['Mike Danna','BUF','EDGE','D'],
 ['Michael Dansby','SEA','CB','D'],['Sam Darnold','SEA','QB','O'],['Jaxson Dart','NYG','QB','O'],
 ['Marcus Davenport','CHI','EDGE','D'],['Ashtyn Davis','SF','S','D'],['Demario Davis','NYJ','LB','D'],
 ['Derius Davis','LAC','WR','O'],['Isaiah Davis','NYJ','RB','O'],['Jalen Davis','CIN','CB','D'],
 ['Jordan Davis','PHI','DT','D'],['Kaden Davis','CHI','WR','O'],['Kalia Davis','CLE','DT','D'],
 ['Malik Davis','DAL','RB','O'],['Ray Davis','BUF','RB','O'],['Tacario Davis','CIN','CB','D'],
 ['Tyler Davis','LAR','EDGE','D'],['Akeem Davis-Gaither','IND','LB','D'],['Elliott Davison','NE','S','D'],
 ['Cooper DeJean','PHI','CB','D'],['Dominic DeLuca','BAL','LB','D'],['Tommy DeVito','NE','QB','O'],
 ['Divine Deablo','ATL','LB','D'],['Jamel Dean','PIT','CB','D'],['Nakobe Dean','LV','LB','D'],
 ['Mansoor Delane','KC','CB','D'],['Tank Dell','HOU','WR','O'],['Oscar Delp','NO','TE','O'],
 ['Grant Delpit','CLE','S','D'],['Emari Demercado','DAL','RB','O'],['Charles Demmings','MIN','CB','D'],
 ['SirVocea Dennis','TB','LB','D'],['Dani Dennis-Sutton','GB','EDGE','D'],['Mohamoud Diabate','TEN','LB','D'],
 ['Yaya Diaby','TB','LB','D'],['Matt Dickerson','JAX','EDGE','D'],['Fadil Diggs','NO','EDGE','D'],
 ['Stefon Diggs','WAS','WR','O'],['Trevon Diggs','SEA','CB','D'],['Chimere Dike','TEN','WR','O'],
 ['AJ Dillon','CAR','RB','O'],['Khalil Dinkins','SF','TE','O'],['CJ Dippre','TB','TE','O'],
 ['Kyle Dixon','NE','WR','O'],['Thaddeus Dixon','NYG','CB','D'],['J.K. Dobbins','DEN','RB','O'],
 ['Joshua Dobbs','DET','QB','O'],['Tyrel Dodson','CAR','LB','D'],['Shaun Dolac','LAR','LB','D'],
 ['Aaron Donald','LAR','DT','D'],['CJ Donaldson','NO','RB','O'],['Brandon Dorlus','ATL','DT','D'],
 ['Cameron Dorner','NE','WR','O'],['Khalil Dorsey','DET','CB','D'],['Greg Dortch','BUF','WR','O'],
 ['Jahan Dotson','ATL','WR','O'],['Romeo Doubs','NE','WR','O'],['Caleb Douglas','MIA','WR','O'],
 ['DeMario Douglas','NE','WR','O'],['Rasul Douglas','WAS','CB','D'],['Rico Dowdle','PIT','RB','O'],
 ['Caleb Downs','DAL','S','D'],['Ethan Downs','KC','LB','D'],['Josh Downs','IND','WR','O'],
 ['Dylan Drummond','ATL','WR','O'],['Storm Duck','MIA','CB','D'],['Jaden Dugger','SF','LB','D'],
 ['Kyle Dugger','CIN','S','D'],['Greg Dulcich','MIA','TE','O'],['Ashton Dulin','IND','WR','O'],
 ['Bud Dupree','LAC','LB','D'],['Cobie Durant','DAL','CB','D'],['Zane Durant','BUF','DT','D'],
 ['Cory Durden','NE','DT','D'],['Zach Durfee','JAX','EDGE','D'],['Payne Durham','TB','TE','O'],
 ['Devin Duvernay','ARI','WR','O'],['Troy Dye','LAC','LB','D'],['Bryson Eason','KC','DT','D'],
 ['Deven Eastern','SEA','DT','D'],['Arnold Ebiketie','PHI','LB','D'],['Justin Eboigbe','LAC','DT','D'],
 ['Samson Ebukam','ATL','EDGE','D'],['Brandin Echols','PIT','CB','D'],['Tremaine Edmunds','NYG','LB','D'],
 ['Johnathan Edwards','IND','CB','D'],['T.J. Edwards','CHI','LB','D'],['TeRah Edwards','CAR','DT','D'],
 ['Emeka Egbuka','TB','WR','O'],['Sam Ehlinger','DEN','QB','O'],['Tommy Eichenberg','LV','LB','D'],
 ['Milo Eifler','TEN','LB','D'],['Paschal Ekeji','NYJ','EDGE','D'],['Kaiir Elam','LAC','CB','D'],
 ['Kaleb Elarms-Orr','BUF','LB','D'],['DeShon Elliott','PIT','S','D'],['Jordan Elliott','TEN','DT','D'],
 ['Keyshaun Elliott','CHI','LB','D'],['Christian Elliss','NE','LB','D'],['Jonah Elliss','DEN','LB','D'],
 ['Kaden Elliss','NO','LB','D'],['Nick Emmanwori','SEA','S','D'],['Kingsley Enagbare','NYJ','LB','D'],
 ['Jack Endries','CIN','TE','O'],['Evan Engram','DEN','TE','O'],['AJ Epenesa','PHI','EDGE','D'],
 ['Marcus Epps','PHI','S','D'],['Audric Estime','NO','RB','O'],['Trevor Etienne','CAR','RB','O'],
 ['Akayleb Evans','CAR','CB','D'],['Mike Evans','SF','WR','O'],['Mitchell Evans','CAR','TE','O'],
 ['Omari Evans','KC','WR','O'],['Daylen Everette','PIT','CB','D'],['Quinn Ewers','JAX','QB','O'],
 ['Donovan Ezeiruaku','DAL','LB','D'],['Joe Fagnano','BAL','QB','O'],['Logan Fano','CLE','EDGE','D'],
 ['Noah Fant','NO','TE','O'],['Princeton Fant','DAL','TE','O'],['Joshua Farmer','NE','DT','D'],
 ['Luke Farrell','SF','TE','O'],['Folorunso Fatukasi','LV','DT','D'],['Keldric Faulk','TEN','EDGE','D'],
 ['Simi Fehoko','ARI','WR','O'],['Tai Felton','MIN','WR','O'],['Jake Ferguson','DAL','TE','O'],
 ['Terrance Ferguson','LAR','TE','O'],['Clelin Ferrell','MIA','EDGE','D'],['Justin Fields','KC','QB','O'],
 ['Malachi Fields','NYG','WR','O'],['AJ Finley','SEA','S','D'],['Grant Finley','NYG','FB','O'],
 ['Aiden Fisher','HOU','LB','D'],['Braden Fiske','LAR','EDGE','D'],['Bishop Fitzgerald','PIT','S','D'],
 ['Minkah Fitzpatrick','NYJ','S','D'],['Joe Flacco','CIN','QB','O'],['Cor\'Dale Flott','TEN','CB','D'],
 ['Ryan Flournoy','DAL','WR','O'],['Dallis Flowers','CHI','CB','D'],['Zay Flowers','BAL','WR','O'],
 ['Jaylan Ford','NO','LB','D'],['Jonathan Ford','GB','DT','D'],['Poona Ford','LAR','DT','D'],
 ['Trace Ford','NYG','LB','D'],['Darrick Forrest','SF','S','D'],['Isaiah Foskey','CIN','EDGE','D'],
 ['Nyzier Fourqurean','LAR','CB','D'],['Troy Franklin','DEN','WR','O'],['Zaire Franklin','GB','LB','D'],
 ['John Franklin-Myers','TEN','EDGE','D'],['Feleipe Franks','CAR','TE','O'],['Pat Freiermuth','PIT','TE','O'],
 ['Sean Fresch','DEN','CB','D'],['Andre Fuller','SEA','CB','D'],['Kristian Fulton','KC','CB','D'],
 ['Dillon Gabriel','CLE','QB','O'],['Oronde Gadsden','LAC','TE','O'],['Amari Gainer','MIA','LB','D'],
 ['Greg Gaines','BUF','DT','D'],['Kenny Gainwell','TB','RB','O'],['Neville Gallimore','CHI','DT','D'],
 ['Elijah Garcia','DAL','EDGE','D'],['Dennis Gardeck','JAX','LB','D'],['Sauce Gardner','IND','CB','D'],
 ['C.J. Gardner-Johnson','BUF','S','D'],['Ayden Garnes','TB','CB','D'],['Myles Garrett','LAR','EDGE','D'],
 ['Jonathan Garvin','CHI','EDGE','D'],['Rashan Gary','DAL','LB','D'],['Ali Gaye','HOU','EDGE','D'],
 ['Jameson Geers','ARI','TE','O'],['Mike Gesicki','CIN','TE','O'],['Jack Gibbens','ARI','LB','D'],
 ['Jahmyr Gibbs','DET','RB','O'],['DJ Giddens','IND','RB','O'],['Luke Gifford','SF','LB','D'],
 ['Joe Giles-Harris','CIN','LB','D'],['Cam Gill','CAR','LB','D'],['Skyler Gill-Howard','DET','DT','D'],
 ['Reggie Gilliam','NE','FB','O'],['Ashton Gillotte','KC','EDGE','D'],['Alohi Gilman','KC','S','D'],
 ['Andrew Van Ginkel','MIN','LB','D'],['Trevis Gipson','CAR','LB','D'],['Kevin Givens','SF','DT','D'],
 ['Davon Godchaux','NO','DT','D'],['Dallas Goedert','PHI','TE','O'],['Jared Goff','DET','QB','O'],
 ['Jake Golday','MIN','LB','D'],['Matthew Golden','GB','WR','O'],['Chauncey Golston','NYG','EDGE','D'],
 ['Christian Gonzalez','NE','CB','D'],['Anthony Goodlow','CAR','EDGE','D'],['Tyler Goodson','ATL','RB','O'],
 ['Kyler Gordon','CHI','CB','D'],['Thomas Gordon','DET','TE','O'],['Stephen Gosnell','BUF','WR','O'],
 ['Anthony Gould','IND','WR','O'],['Jalen Graham','SF','LB','D'],['Mason Graham','CLE','DT','D'],
 ['Carl Granderson','NO','EDGE','D'],['Cam Grandy','MIN','TE','O'],['Kylen Granson','TEN','TE','O'],
 ['Kenneth Grant','MIA','DT','D'],['Cedric Gray','TEN','LB','D'],['Danny Gray','PHI','WR','O'],
 ['Noah Gray','KC','TE','O'],['Mike Green','BAL','LB','D'],['Renardo Green','SF','CB','D'],
 ['Taylen Green','CLE','QB','O'],['Jonathan Greenard','PHI','LB','D'],['Garrett Greene','TB','WR','O'],
 ['Dre Greenlaw','SF','LB','D'],['Eric Gregory','NE','DT','D'],['Wesley Grimes','SF','WR','O'],
 ['Isaac Guerendo','SF','RB','O'],['Xavier Guillory','BAL','WR','O'],['Kapena Gushiken','IND','CB','D'],
 ['John Michael Gyllenborg','KC','TE','O'],['Kamal Hadden','GB','CB','D'],['Jake Haener','NYG','QB','O'],
 ['Kahlef Hailassie','MIN','S','D'],['Maxwell Hairston','BUF','CB','D'],['Aaron Hall','CAR','DT','D'],
 ['Breece Hall','NYJ','RB','O'],['Bryce Hall','HOU','CB','D'],['Derick Hall','SEA','LB','D'],
 ['Gabe Hall','PHI','DT','D'],['Logan Hall','HOU','EDGE','D'],['Gracen Halton','SF','DT','D'],
 ['DaVon Hamilton','JAX','DT','D'],['Kyle Hamilton','BAL','S','D'],['Kyonte Hamilton','HOU','DT','D'],
 ['Ty Hamilton','LAR','DT','D'],['Damar Hamlin','BUF','S','D'],['Omarion Hampton','LAC','RB','O'],
 ['Jordan Hancock','BUF','CB','D'],['Da\'Shawn Hand','ATL','DT','D'],['Jake Hansen','HOU','LB','D'],
 ['Myles Harden','CLE','CB','D'],['Daequan Hardy','PIT','CB','D'],['Daniel Hardy','CHI','EDGE','D'],
 ['Javon Hargrave','GB','DT','D'],['Derrick Harmon','PIT','DT','D'],['Thomas Harper','DET','S','D'],
 ['Jaylen Harrell','TEN','LB','D'],['Christian Harris','ATL','LB','D'],['Kenneth Harris','IND','CB','D'],
 ['Marcus Harris','KC','DT','D'],['Marcus Harris','TEN','CB','D'],['Najee Harris','NYG','RB','O'],
 ['Shelby Harris','NYG','DT','D'],['Tre\' Harris','LAC','WR','O'],['Malik Harrison','NYG','LB','D'],
 ['Zach Harrison','ATL','EDGE','D'],['Jared Harrison-Hunte','ARI','EDGE','D'],['Sabastian Harsh','HOU','EDGE','D'],
 ['Cam Hart','LAC','CB','D'],['Sam Hartman','WAS','QB','O'],['RJ Harvey','DEN','RB','O'],
 ['Hassan Haskins','NE','RB','O'],['Ahmed Hassanein','DET','EDGE','D'],['A.J. Haulcy','IND','S','D'],
 ['Jackson Hawes','BUF','TE','O'],['Jaylinn Hawkins','BAL','S','D'],['Josh Hayes','TB','CB','D'],
 ['Jack Heflin','NYJ','DT','D'],['Eli Heidenreich','PIT','RB','O'],['Romello Height','SF','EDGE','D'],
 ['DeMarcco Hellams','ATL','S','D'],['Gunnar Helm','TEN','TE','O'],['Roman Hemby','LV','RB','O'],
 ['Tonka Hemingway','LV','DT','D'],['Al-Jay Henderson','NYJ','RB','O'],['C.J. Henderson','ATL','CB','D'],
 ['TreVeyon Henderson','NE','RB','O'],['Trey Hendrickson','BAL','LB','D'],['Daiyan Henley','LAC','LB','D'],
 ['Matt Henningsen','DEN','EDGE','D'],['Derrick Henry','BAL','RB','O'],['Hunter Henry','NE','TE','O'],
 ['Justin Herbert','LAC','QB','O'],['Patrick Herbert','LAC','TE','O'],['Nick Herbig','PIT','LB','D'],
 ['DJ Herman','MIA','FB','O'],['Malik Herring','MIA','EDGE','D'],['Cameron Heyward','PIT','DT','D'],
 ['Connor Heyward','LV','FB','O'],['Shaka Heyward','CIN','LB','D'],['Matthew Hibner','BAL','TE','O'],
 ['Ronnie Hickman','CLE','S','D'],['Elijah Hicks','CHI','S','D'],['Jaden Hicks','KC','S','D'],
 ['Julian Hicks','SEA','WR','O'],['Tyler Higbee','LAR','TE','O'],['Elijah Higgins','ARI','TE','O'],
 ['Jayden Higgins','HOU','WR','O'],['Tee Higgins','CIN','WR','O'],['Alex Highsmith','PIT','LB','D'],
 ['B.J. Hill','CIN','DT','D'],['Dax Hill','CIN','CB','D'],['Jamal Hill','HOU','LB','D'],
 ['Julian Hill','NE','TE','O'],['Justice Hill','BAL','RB','O'],['Josh Hines-Allen','JAX','EDGE','D'],
 ['Nate Hobbs','SF','CB','D'],['T.J. Hockenson','MIN','TE','O'],['KhaDarel Hodge','SF','WR','O'],
 ['Michael Hoecht','BUF','EDGE','D'],['George Holani','SEA','RB','O'],['Cole Holcomb','PIT','LB','D'],
 ['Jimmy Holiday','KC','WR','O'],['Jevon Holland','NYG','S','D'],['Mack Hollins','NE','WR','O'],
 ['Darnay Holmes','ATL','CB','D'],['Jalyn Holmes','TEN','EDGE','D'],['Yasir Holmes','TB','LB','D'],
 ['Travis Homer','PIT','RB','O'],['Colton Hood','NYG','CB','D'],['Maxen Hook','SEA','S','D'],
 ['Amani Hooker','TEN','S','D'],['Hendon Hooker','TEN','QB','O'],['Malik Hooker','DAL','S','D'],
 ['Austin Hooper','ATL','TE','O'],['Ty\'Ron Hopper','GB','LB','D'],['Jaycee Horn','CAR','CB','D'],
 ['Timmy Horne','TEN','DT','D'],['Cam Horsley','ARI','DT','D'],['Dylan Horton','HOU','EDGE','D'],
 ['Tory Horton','SEA','WR','O'],['James Houston','DAL','LB','D'],['Will Howard','PIT','QB','O'],
 ['Jordan Howden','NO','S','D'],['Cashius Howell','CIN','EDGE','D'],['Sam Howell','DAL','QB','O'],
 ['Aidan Hubbard','SEA','LB','D'],['Chuba Hubbard','CAR','RB','O'],['Jordan Hudson','DAL','WR','O'],
 ['Tanner Hudson','CIN','TE','O'],['Talanoa Hufanga','DEN','S','D'],['Mike Hughes','ATL','CB','D'],
 ['Parker Hughes','JAX','LB','D'],['Evan Hull','ARI','RB','O'],['Jake Hummel','HOU','LB','D'],
 ['Lil\'Jordan Humphrey','DEN','WR','O'],['Marlon Humphrey','BAL','CB','D'],['Jalyx Hunt','PHI','LB','D'],
 ['Danielle Hunter','HOU','EDGE','D'],['Erick Hunter','NE','LB','D'],['Jarquez Hunter','MIA','RB','O'],
 ['Lee Hunter','CAR','DT','D'],['Travis Hunter','JAX','WR','O'],['Adin Huntington','CLE','EDGE','D'],
 ['Tyler Huntley','BAL','QB','O'],['Jalen Hurd','NE','WR','O'],['Max Hurleman','PIT','RB','O'],
 ['Jalen Hurts','PHI','QB','O'],['Jalen Huskey','JAX','S','D'],['Quintayvious Hutchins','NE','LB','D'],
 ['Aidan Hutchinson','DET','EDGE','D'],['Xavier Hutchinson','HOU','WR','O'],['Alijah Huzzie','HOU','CB','D'],
 ['Jalin Hyatt','NYG','WR','O'],['Andre Carter II','LAC','LB','D'],['Andrew Farmer II','SF','EDGE','D'],
 ['B.J. Green II','JAX','EDGE','D'],['Byron Murphy II','SEA','DT','D'],['Chris Brazzell II','CAR','WR','O'],
 ['Chris Rumph II','NO','EDGE','D'],['DJ Turner II','CIN','CB','D'],['Dexter Lawrence II','CIN','DT','D'],
 ['Erick Hallett II','TEN','S','D'],['Fred Davis II','WAS','CB','D'],['Gardner Minshew II','ARI','QB','O'],
 ['Greg Newsome II','NYG','CB','D'],['Jermaine Johnson II','TEN','EDGE','D'],['Jerrick Reed II','TEN','S','D'],
 ['Johnathan Baldwin II','GB','S','D'],['Keir Thomas II','LAR','LB','D'],['Keith Abney II','DET','CB','D'],
 ['Michael Carter II','PHI','CB','D'],['Ollie Gordon II','MIA','RB','O'],['Pat Surtain II','DEN','CB','D'],
 ['Patrick Jones II','CAR','LB','D'],['Rodney Thomas II','SEA','S','D'],['Ruben Hyppolite II','CHI','LB','D'],
 ['Thomas Fidone II','NYG','TE','O'],['Tony Fields II','CHI','LB','D'],['Vinny Anthony II','ATL','WR','O'],
 ['Anthony Tyus III','CAR','RB','O'],['Bobby Brown III','CAR','DT','D'],['Calvin Austin III','NYG','WR','O'],
 ['Carlton Davis III','NE','CB','D'],['Clark Phillips III','CHI','CB','D'],['Darryl Peterson III','LAR','LB','D'],
 ['Eddie Walls III','LAR','LB','D'],['Efton Chism III','NE','WR','O'],['Gary Smith III','LV','DT','D'],
 ['Harold Landry III','NE','LB','D'],['Harrison Wallace III','ARI','WR','O'],['Howard Cross III','CIN','DT','D'],
 ['James Cook III','BUF','RB','O'],['Jessie Bates III','ATL','S','D'],['Joe Milton III','DAL','QB','O'],
 ['John Metchie III','CAR','WR','O'],['John Ridgeway III','NO','DT','D'],['Kenneth Walker III','KC','RB','O'],
 ['Leonard Taylor III','NE','DT','D'],['Luther Burden III','CHI','WR','O'],['Mario Goodrich III','TEN','CB','D'],
 ['Murvin Kenion III','GB','S','D'],['Rayuan Lane III','JAX','S','D'],['Ricky White III','SEA','WR','O'],
 ['Samuel Womack III','NYJ','CB','D'],['Ted Hurst III','TB','WR','O'],['Trey Dean III','GB','S','D'],
 ['Walter Nolen III','ARI','DT','D'],['Wayne Matthews III','CHI','LB','D'],['Will Lee III','CAR','CB','D'],
 ['Ernest Jones IV','SEA','LB','D'],['Jay Higgins IV','BAL','LB','D'],['Malcolm DeWalt IV','ATL','CB','D'],
 ['Stetson Bennett IV','LAR','QB','O'],['Thomas Booker IV','LV','DT','D'],['Ulysses Bentley IV','IND','RB','O'],
 ['Will McDonald IV','NYJ','EDGE','D'],['Noah Igbinoghene','CLE','CB','D'],['Davison Igbinosun','BUF','CB','D'],
 ['Thomas Incoom','CAR','LB','D'],['Tanner Ingle','LAR','S','D'],['Alec Ingold','LAC','FB','O'],
 ['Ja\'Marcus Ingram','HOU','CB','D'],['Tyrion Ingram-Dawkins','MIN','EDGE','D'],['Andrei Iosivas','CIN','WR','O'],
 ['Bucky Irving','TB','RB','O'],['Adisa Isaac','BAL','LB','D'],['Qadir Ismail','CHI','TE','O'],
 ['Isaiah Iton','NE','DT','D'],['DJ Ivey','CIN','CB','D'],['Jared Ivey','ATL','LB','D'],
 ['Christian Izien','DET','S','D'],['Gabe Jacas','NE','LB','D'],['Brennan Jackson','LV','LB','D'],
 ['Cam Jackson','CAR','DT','D'],['D\'Marco Jackson','CHI','LB','D'],['Domani Jackson','GB','CB','D'],
 ['Donte Jackson','LAC','CB','D'],['Jordan Jackson','DEN','DT','D'],['Justin Jackson','DET','RB','O'],
 ['Keondre Jackson','BAL','S','D'],['Lamar Jackson','BAL','QB','O'],['Landon Jackson','BUF','EDGE','D'],
 ['Lucky Jackson','DET','WR','O'],['Mike Jackson','CAR','CB','D'],['Theo Jackson','MIN','S','D'],
 ['Curtis Jacobs','WAS','LB','D'],['Josh Jacobs','GB','RB','O'],['Khalil Jacobs','NE','LB','D'],
 ['DJ James','NYG','CB','D'],['Jordan James','SF','RB','O'],['Shemar James','DAL','LB','D'],
 ['Keyshawn James-Newby','PHI','LB','D'],['D\'Shawn Jamison','ARI','CB','D'],['Bobby Jamison-Travis','NYG','DT','D'],
 ['Grady Jarrett','CHI','EDGE','D'],['Javontae Jean-Baptiste','WAS','LB','D'],['Ashton Jeanty','LV','RB','O'],
 ['Jermar Jefferson','MIN','RB','O'],['Jordan Jefferson','LAC','DT','D'],['Justin Jefferson','CLE','LB','D'],
 ['Justin Jefferson','MIN','WR','O'],['Tony Jefferson','LAC','S','D'],['E.J. Jenkins','PHI','TE','O'],
 ['John Jenkins','BAL','DT','D'],['Keonta Jenkins','BUF','LB','D'],['Rayshawn Jenkins','PIT','S','D'],
 ['Anfernee Jennings','NO','LB','D'],['Gary Jennings','LAC','WR','O'],['Jauan Jennings','MIN','WR','O'],
 ['Jerry Jeudy','CLE','WR','O'],['Josh Jobe','SEA','CB','D'],['Alex Johnson','LAR','CB','D'],
 ['Amar Johnson','LAC','RB','O'],['Antonio Johnson','JAX','S','D'],['Brandon Johnson','PIT','WR','O'],
 ['Buddy Johnson','CHI','LB','D'],['Cedric Johnson','CIN','EDGE','D'],['Chris Johnson','MIA','CB','D'],
 ['D.J. Johnson','WAS','CB','D'],['Dalton Johnson','LV','S','D'],['Desjuan Johnson','LAR','EDGE','D'],
 ['Emmett Johnson','KC','RB','O'],['Jaylon Johnson','CHI','CB','D'],['Josh Johnson','CIN','QB','O'],
 ['Juwan Johnson','NO','TE','O'],['Kaleb Johnson','GB','RB','O'],['Kameron Johnson','TB','WR','O'],
 ['Patrick Johnson','LV','EDGE','D'],['Roschon Johnson','CHI','RB','O'],['Taron Johnson','LV','CB','D'],
 ['Tez Johnson','TB','WR','O'],['Theo Johnson','NYG','TE','O'],['Ty Johnson','BUF','RB','O'],
 ['Will Johnson','ARI','CB','D'],['Quentin Johnston','LAC','WR','O'],['Justin Joly','MIA','TE','O'],
 ['Kingsley Jonathan','NYJ','EDGE','D'],['Brandon Jones','DEN','S','D'],['Cam Jones','KC','LB','D'],
 ['Carl Jones','BAL','LB','D'],['Cash Jones','ATL','RB','O'],['Charlie Jones','NYG','WR','O'],
 ['Chris Jones','KC','DT','D'],['D.J. Jones','DEN','DT','D'],['Daniel Jones','IND','QB','O'],
 ['Dre\'Mont Jones','NE','EDGE','D'],['Elijah Jones','NYG','CB','D'],['Jack Jones','SF','CB','D'],
 ['Jacoby Jones','WAS','WR','O'],['Jarrian Jones','JAX','CB','D'],['Jaylon Jones','CHI','CB','D'],
 ['Jaylon Jones','IND','CB','D'],['Jayson Jones','TB','DT','D'],['Jeshaun Jones','MIN','WR','O'],
 ['Jonathan Jones','PHI','CB','D'],['Mac Jones','SF','QB','O'],['Marcus Jones','NE','CB','D'],
 ['Naquan Jones','MIN','DT','D'],['Nic Jones','NYG','CB','D'],['Sai\'vion Jones','DEN','EDGE','D'],
 ['Tim Jones','JAX','WR','O'],['Travis Jones','BAL','DT','D'],['Truman Jones','TEN','EDGE','D'],
 ['Brevin Jordan','HOU','TE','O'],['Cameron Jordan','NO','EDGE','D'],['Jawhar Jordan','HOU','RB','O'],
 ['Kerby Joseph','DET','S','D'],['Sebastian Joseph-Day','PIT','DT','D'],['Joshua Josephs','WAS','LB','D'],
 ['A.J. Terrell Jr.','ATL','CB','D'],['Andre Jones Jr.','BUF','LB','D'],['Anthony Hill Jr.','TEN','LB','D'],
 ['Antoine Winfield Jr.','TB','S','D'],['Antwane Wells Jr.','ATL','WR','O'],['Asante Samuel Jr.','PIT','CB','D'],
 ['Beanie Bishop Jr.','CHI','CB','D'],['Billy Bowman Jr.','ATL','CB','D'],['Brenton Cox Jr.','GB','EDGE','D'],
 ['Brian Robinson Jr.','ATL','RB','O'],['Brian Thomas Jr.','JAX','WR','O'],['Broderick Washington Jr.','BAL','DT','D'],
 ['Bryan Thomas Jr.','JAX','EDGE','D'],['Byron Murphy Jr.','MIN','CB','D'],['Carlos Allen Jr.','ATL','DT','D'],
 ['Carlos Washington Jr.','MIA','RB','O'],['Chris Godwin Jr.','TB','WR','O'],['Chris Hilton Jr.','GB','WR','O'],
 ['Chris Rodriguez Jr.','JAX','RB','O'],['Dante Fowler Jr.','SEA','LB','D'],['Dante Trader Jr.','MIA','S','D'],
 ['Darrell Baker Jr.','MIA','CB','D'],['Darrell Jackson Jr.','NYJ','DT','D'],['Darrell Luter Jr.','LV','CB','D'],
 ['David Long Jr.','NO','CB','D'],['Deatrich Wise Jr.','WAS','EDGE','D'],['Demetrius Knight Jr.','CIN','LB','D'],
 ['Derek Stingley Jr.','HOU','CB','D'],['Derwin James Jr.','LAC','S','D'],['Dont\'e Thornton Jr.','LV','WR','O'],
 ['Dwight McGlothern Jr.','MIN','CB','D'],['Emmanuel Forbes Jr.','LAR','CB','D'],['Emmanuel Henderson Jr.','SEA','WR','O'],
 ['Ennis Rakestraw Jr.','DET','CB','D'],['Eric Rivers Jr.','TB','WR','O'],['Erick All Jr.','CIN','TE','O'],
 ['Frank Gore Jr.','BUF','RB','O'],['George Gumbs Jr.','IND','LB','D'],['Greg Desrosiers Jr.','LAC','RB','O'],
 ['Harold Fannin Jr.','CLE','TE','O'],['Harold Perkins Jr.','ATL','LB','D'],['Ivan Pace Jr.','MIN','LB','D'],
 ['James Pearce Jr.','ATL','LB','D'],['James Thompson Jr.','SF','DT','D'],['Jarvis Brownlee Jr.','NYJ','CB','D'],
 ['Jason Marshall Jr.','MIA','CB','D'],['Jeremiah Pharms Jr.','NE','DT','D'],['Jeremiah Trotter Jr.','PHI','LB','D'],
 ['Jimmy Horn Jr.','CAR','WR','O'],['Joey Porter Jr.','PIT','CB','D'],['Keith Cooper Jr.','MIA','DT','D'],
 ['Kelvin Gilliam Jr.','DAL','DT','D'],['Kevin Austin Jr.','NO','WR','O'],['Kevin Coleman Jr.','MIA','WR','O'],
 ['Kevin Jobity Jr.','PIT','DT','D'],['Kevin Winston Jr.','TEN','S','D'],['Kris Jenkins Jr.','CIN','DT','D'],
 ['Lardarius Webb Jr.','BAL','CB','D'],['LeQuint Allen Jr.','JAX','RB','O'],['Lorenzo Styles Jr.','NO','S','D'],
 ['Marcellas Dial Jr.','MIA','CB','D'],['Mario Edwards Jr.','HOU','DT','D'],['Martin Emerson Jr.','NO','CB','D'],
 ['Marvin Harrison Jr.','ARI','WR','O'],['Marvin Jones Jr.','SEA','LB','D'],['Marvin Mims Jr.','DEN','WR','O'],
 ['Melvin Smith Jr.','TEN','CB','D'],['Michael Coats Jr.','CLE','CB','D'],['Michael Penix Jr.','ATL','QB','O'],
 ['Michael Pittman Jr.','PIT','WR','O'],['Mike Ford Jr.','ATL','CB','D'],['Mike Hall Jr.','CLE','DT','D'],
 ['Mike Washington Jr.','LV','RB','O'],['Montorie Foster Jr.','SEA','WR','O'],['Nolan Smith Jr.','PHI','LB','D'],
 ['Odell Beckham Jr.','NYG','WR','O'],['Omar Cooper Jr.','NYJ','WR','O'],['Pierre Strong Jr.','GB','RB','O'],
 ['Rob Carter Jr.','IND','CB','D'],['Robert Beal Jr.','MIA','EDGE','D'],['Robert Henry Jr.','WAS','RB','O'],
 ['Ronnie Harrison Jr.','MIA','LB','D'],['Rueben Bain Jr.','TB','LB','D'],['Sam Franklin Jr.','BUF','S','D'],
 ['Shavon Revel Jr.','DAL','CB','D'],['Smael Mondon Jr.','PHI','LB','D'],['T.J. Slaton Jr.','CIN','DT','D'],
 ['TJ Hall Jr.','NO','CB','D'],['Theo Wease Jr.','LAC','WR','O'],['Tommy Dunn Jr.','DAL','DT','D'],
 ['Toriano Pride Jr.','CLE','CB','D'],['Travis Etienne Jr.','NO','RB','O'],['Tyrone Tracy Jr.','NYG','RB','O'],
 ['Velus Jones Jr.','SEA','WR','O'],['Vincent Anthony Jr.','SF','EDGE','D'],['Will Anderson Jr.','HOU','EDGE','D'],
 ['Willie Gay Jr.','MIA','LB','D'],['Wydett Williams Jr.','ARI','S','D'],['Quinshon Judkins','CLE','RB','O'],
 ['PJ Jules','CIN','S','D'],['Kyle Juszczyk','SF','FB','O'],['Will Kacmarek','MIA','TE','O'],
 ['Ale Kaho','WAS','LB','D'],['Athan Kaliakmanis','WAS','QB','O'],['Nikola Kalinic','CHI','TE','O'],
 ['Nick Kallerup','SEA','TE','O'],['Alvin Kamara','NO','RB','O'],['Bangally Kamara','MIN','LB','D'],
 ['Mikail Kamara','SF','EDGE','D'],['Mohamed Kamara','TB','LB','D'],['Sam Kamara','CLE','DT','D'],
 ['Jaren Kanak','TEN','TE','O'],['Calijah Kancey','TB','DT','D'],['Khalid Kareem','SF','DT','D'],
 ['George Karlaftis','KC','EDGE','D'],['Kolbe Katsis','DEN','WR','O'],['Case Keenum','CHI','QB','O'],
 ['Travis Kelce','KC','TE','O'],['Jaden Keller','NYJ','LB','D'],['Jack Kelly','NYG','LB','D'],
 ['Josh Kelly','HOU','WR','O'],['Nyjalik Kelly','GB','EDGE','D'],['Anthony Kendall','BUF','CB','D'],
 ['Derion Kendrick','DAL','CB','D'],['Tom Kennedy','DET','WR','O'],['Donte Kent','PIT','CB','D'],
 ['Arden Key','IND','EDGE','D'],['Dane Key','DEN','WR','O'],['Devon Key','DEN','S','D'],
 ['Ko Kieft','TB','TE','O'],['Jalon Kilgore','BUF','S','D'],['Miles Killebrew','TB','S','D'],
 ['Dalton Kincaid','BUF','TE','O'],['Kamren Kinchens','LAR','S','D'],['Corey Kiner','NE','RB','O'],
 ['Haynes King','CAR','QB','O'],['Kalen King','ARI','CB','D'],['Javon Kinlaw','WAS','DT','D'],
 ['Christian Kirk','SF','WR','O'],['Jack Kiser','JAX','LB','D'],['George Kittle','SF','TE','O'],
 ['Max Klare','LAR','TE','O'],['Marlin Klein','HOU','TE','O'],['Cade Klubnik','NYJ','QB','O'],
 ['Cole Kmet','CHI','TE','O'],['Bam Knight','ARI','RB','O'],['Tyrice Knight','SEA','LB','D'],
 ['Kevin Knowles','TB','CB','D'],['Dawson Knox','BUF','TE','O'],['Kader Kohou','KC','CB','D'],
 ['Charlie Kolar','LAC','TE','O'],['Bilhal Kone','BAL','CB','D'],['Rene Konga','MIA','DT','D'],
 ['Malcolm Koonce','LV','EDGE','D'],['Tanner Koziol','JAX','TE','O'],['Tanoh Kpassagnon','TEN','EDGE','D'],
 ['Tucker Kraft','GB','TE','O'],['Jamree Kromah','CHI','EDGE','D'],['Lucas Krull','DEN','TE','O'],
 ['Cooper Kupp','SEA','WR','O'],['Jackson Kuwatch','CAR','LB','D'],['Sam LaPorta','DET','TE','O'],
 ['Caullin Lacy','NYJ','WR','O'],['Tyler Lacy','DET','DT','D'],['Devin Lafayette','LV','S','D'],
 ['Quentin Lake','LAR','S','D'],['CeeDee Lamb','DAL','WR','O'],['KeAndre Lambert-Smith','LAC','WR','O'],
 ['Brock Lampe','SEA','FB','O'],['Cam Lampkin','LAR','CB','D'],['Bryce Lance','NO','WR','O'],
 ['Trey Lance','LAC','QB','O'],['Isaiah Land','DAL','LB','D'],['Nate Landman','LAR','LB','D'],
 ['Ja\'Kobi Lane','BAL','WR','O'],['Jaylin Lane','WAS','WR','O'],['Hayden Large','CHI','TE','O'],
 ['Tucker Large','PHI','S','D'],['Lan Larison','NE','RB','O'],['Kamari Lassiter','HOU','CB','D'],
 ['Cameron Latu','NE','TE','O'],['Keleki Latu','BUF','TE','O'],['Laiatu Latu','IND','EDGE','D'],
 ['Dylan Laube','LV','RB','O'],['Jonah Laulu','LV','DT','D'],['Kendrick Law','DET','WR','O'],
 ['DeMarcus Lawrence','SEA','LB','D'],['Malachi Lawrence','DAL','LB','D'],['Trevor Lawrence','JAX','QB','O'],
 ['Raheem Layne','NYG','S','D'],['Logan Lee','PIT','DT','D'],['Xavier Legette','CAR','WR','O'],
 ['Makai Lemon','PHI','WR','O'],['Deommodore Lenoir','SF','CB','D'],['Deane Leonard','LAC','CB','D'],
 ['Riley Leonard','IND','QB','O'],['Eku Leota','ARI','LB','D'],['Cam Lewis','CHI','CB','D'],
 ['Jourdan Lewis','JAX','CB','D'],['Isaiah Likely','NYG','TE','O'],['Cody Lindenberg','LV','LB','D'],
 ['Marist Liufau','DAL','LB','D'],['Max Llewellyn','MIA','EDGE','D'],['Devin Lloyd','CAR','LB','D'],
 ['MarShawn Lloyd','GB','RB','O'],['Drew Lock','SEA','QB','O'],['P.J. Locke','DAL','S','D'],
 ['Caleb Lohner','DEN','TE','O'],['Drake London','ATL','WR','O'],['LaCale London','ATL','EDGE','D'],
 ['Hunter Long','ARI','TE','O'],['Robert Longerbeam','PHI','CB','D'],['Roy Lopez','ARI','DT','D'],
 ['Kyle Louis','MIA','LB','D'],['Jeremiyah Love','ARI','RB','O'],['Jordan Love','GB','QB','O'],
 ['Julian Love','SEA','S','D'],['Colston Loveland','CHI','TE','O'],['Dominic Lovett','DET','WR','O'],
 ['Jayden Loving','CHI','DT','D'],['Anthony Lucas','DET','EDGE','D'],['Hunter Luepke','DAL','FB','O'],
 ['Frankie Luvu','WAS','LB','D'],['Bralyn Lux','CIN','CB','D'],['James Lynch','CHI','DT','D'],
 ['Nate Lynn','NYJ','EDGE','D'],['Jeffrey M\'ba','WAS','DT','D'],['Khalil Mack','LAC','LB','D'],
 ['Ja\'Mori Maclin','BUF','WR','O'],['Avonte Maddox','DET','CB','D'],['Nnamdi Madubuike','BAL','DT','D'],
 ['Boye Mafe','CIN','EDGE','D'],['Jordan Magee','WAS','LB','D'],['Patrick Mahomes','KC','QB','O'],
 ['Will Mallory','IND','TE','O'],['DeAngelo Malone','ATL','LB','D'],['Chris Manhertz','NYG','TE','O'],
 ['Dontae Manning','CHI','CB','D'],['Marcus Mariota','WAS','QB','O'],['Woody Marks','HOU','RB','O'],
 ['Ahmani Marshall','CAR','RB','O'],['Devon Marshall','JAX','CB','D'],['Jackie Marshall','TEN','DT','D'],
 ['Chandler Martin','NYG','LB','D'],['Jacob Martin','TEN','EDGE','D'],['Keyon Martin','BAL','CB','D'],
 ['Nick Martin','SF','LB','D'],['Quan Martin','WAS','S','D'],['Tay Martin','DET','WR','O'],
 ['David Martin-Robinson','TEN','TE','O'],['Bam Martin-Scott','CAR','LB','D'],['Easton Mascarenas-Arnold','CLE','LB','D'],
 ['Jordan Mason','MIN','RB','O'],['Hezekiah Masses','LV','CB','D'],['Moliki Matavao','NO','TE','O'],
 ['Damarri Mathis','CLE','CB','D'],['Phidarian Mathis','BUF','DT','D'],['Scott Matlock','LAC','FB','O'],
 ['Kiko Mauigoa','NYJ','LB','D'],['Dorian Mausi','TEN','LB','D'],['Drake Maye','NE','QB','O'],
 ['Michael Mayer','LV','TE','O'],['Baker Mayfield','TB','QB','O'],['Trey McBride','ARI','TE','O'],
 ['Christian McCaffrey','SF','RB','O'],['Luke McCaffrey','WAS','WR','O'],['Tanner McCalister','KC','S','D'],
 ['J.J. McCarthy','MIN','QB','O'],['Malik McClain','NYJ','WR','O'],['Chris McClellan','GB','DT','D'],
 ['Jaylen McCollough','LAR','S','D'],['Tristin McCollum','LV','S','D'],['Zyon McCollum','TB','CB','D'],
 ['Ladd McConkey','LAC','WR','O'],['Kyle McCord','MIA','QB','O'],['Sincere McCormick','SF','RB','O'],
 ['Jermod McCoy','LV','CB','D'],['Marcelino McCrary-Ball','NYJ','LB','D'],['Roger McCreary','DET','CB','D'],
 ['Cooper McDonald','KC','LB','D'],['Kayden McDonald','HOU','DT','D'],['Isaiah McDuffie','GB','LB','D'],
 ['Trent McDuffie','LAR','CB','D'],['Micah McFadden','NYG','LB','D'],['Seth McGowan','IND','RB','O'],
 ['Rodney McGraw','MIA','EDGE','D'],['Braiden McGregor','NYJ','EDGE','D'],['Cameron McGrone','LV','LB','D'],
 ['Isaiah McGuire','CLE','EDGE','D'],['Tanner McKee','PHI','QB','O'],['Sean McKeon','IND','TE','O'],
 ['Xavier McKinney','GB','S','D'],['Kool-Aid McKinstry','NO','CB','D'],['Deshawn McKnight','TB','DT','D'],
 ['Jaleel McLaughlin','CLE','RB','O'],['Terry McLaurin','WAS','WR','O'],['Jalen McLeod','JAX','LB','D'],
 ['Jalen McMillan','TB','WR','O'],['Tetairoa McMillan','CAR','WR','O'],['Ja\'Quan McMillian','DEN','CB','D'],
 ['Donovan McMillon','CLE','S','D'],['Jalen McMurray','TEN','CB','D'],['Emmanuel McNeil-Warren','CLE','S','D'],
 ['Alim McNeill','DET','DT','D'],['Jeremy McNichols','WAS','RB','O'],['Zech McPhearson','LAR','CB','D'],
 ['Lake McRee','PIT','TE','O'],['Mac McWilliams','PHI','CB','D'],['Kain Medrano','WAS','LB','D'],
 ['Jackson Meeks','DET','WR','O'],['Ifeatu Melifonwu','TB','S','D'],['Bo Melton','GB','WR','O'],
 ['Max Melton','ARI','CB','D'],['Mitchell Melton','IND','EDGE','D'],['Fernando Mendoza','LV','QB','O'],
 ['Kaevon Merriweather','JAX','S','D'],['Graham Mertz','HOU','QB','O'],['Akheem Mesidor','LAC','LB','D'],
 ['DK Metcalf','PIT','WR','O'],['Joshua Metellus','MIN','S','D'],['Dohnte Meyers','CIN','WR','O'],
 ['Jakobi Meyers','JAX','WR','O'],['RJ Mickens','LAC','S','D'],['Christen Miller','NO','DT','D'],
 ['Jordan Miller','MIA','DT','D'],['Kendre Miller','NO','RB','O'],['Ryan Miller','MIA','WR','O'],
 ['Scotty Miller','CHI','WR','O'],['Ventrell Miller','JAX','LB','D'],['Von Miller','DAL','LB','D'],
 ['Davis Mills','HOU','QB','O'],['Rylie Mills','SEA','DT','D'],['Jalen Milroe','SEA','QB','O'],
 ['Kendall Milton','CIN','RB','O'],['Jonathan Mingo','DAL','WR','O'],['Josh Minkins','ARI','S','D'],
 ['Adonai Mitchell','NYJ','WR','O'],['Cameron Mitchell','IND','CB','D'],['James Mitchell','DAL','TE','O'],
 ['Keaton Mitchell','LAC','RB','O'],['Quinyon Mitchell','PHI','CB','D'],['Zaire Mitchell-Paden','HOU','TE','O'],
 ['Tre\'von Moehrig','CAR','S','D'],['Elijah Molden','LAC','CB','D'],['Kyle Monangai','CHI','RB','O'],
 ['D.J. Montgomery','IND','WR','O'],['David Montgomery','HOU','RB','O'],['Myles Montgomery','NE','RB','O'],
 ['Tyren Montgomery','TEN','WR','O'],['Dexter Moody','BAL','S','D'],['Darnell Mooney','NYG','WR','O'],
 ['Chris Moore','BAL','WR','O'],['DJ Moore','BUF','WR','O'],['David Moore','CAR','WR','O'],
 ['Derrick Moore','DET','EDGE','D'],['Devin Moore','DAL','CB','D'],['Elijah Moore','PHI','WR','O'],
 ['Jordan Moore','CIN','WR','O'],['Malachi Moore','NYJ','S','D'],['Quentin Moore','WAS','TE','O'],
 ['Skyy Moore','GB','WR','O'],['Trey Moore','MIA','LB','D'],['Fabian Moreau','WAS','CB','D'],
 ['Foster Moreau','HOU','TE','O'],['Jalen Moreno-Cropper','NO','WR','O'],['Mike Morris','SEA','EDGE','D'],
 ['Quintin Morris','JAX','TE','O'],['Benjamin Morrison','TB','CB','D'],['Behren Morton','NE','QB','O'],
 ['Arron Mosby','GB','EDGE','D'],['Riley Moss','DEN','CB','D'],['Darius Muasau','NE','LB','D'],
 ['Al-Quadin Muhammad','TB','LB','D'],['Jabbar Muhammad','JAX','CB','D'],['Malik Muhammad','CHI','CB','D'],
 ['Andrew Mukuba','PHI','S','D'],['Nick Mullens','JAX','QB','O'],['Kalel Mullings','TEN','RB','O'],
 ['Konata Mumpfield','LAR','WR','O'],['Johnny Mundt','PHI','TE','O'],['Larrell Murchison','LAR','EDGE','D'],
 ['Red Murdock','DEN','LB','D'],['Caleb Murphy','LAC','LB','D'],['Myles Murphy','CIN','EDGE','D'],
 ['Sean Murphy-Bunting','TB','CB','D'],['Eric Murray','JAX','S','D'],['Kyler Murray','MIN','QB','O'],
 ['Nick Muse','ATL','TE','O'],['Luke Musgrave','GB','TE','O'],['Malik Mustapha','SF','S','D'],
 ['Mapalo Mwansa','CAR','LB','D'],['Chris Myarick','LV','TE','O'],['Malik Nabers','NYG','WR','O'],
 ['Puka Nacua','LAR','WR','O'],['Jalen Nailor','LV','WR','O'],['Elias Neal','LAR','LB','D'],
 ['Julian Neal','SEA','CB','D'],['Siran Neal','SF','CB','D'],['Anthony Nelson','TB','LB','D'],
 ['Lukas Van Ness','GB','EDGE','D'],['Jer\'Zhan Newton','WAS','DT','D'],['Josh Newton','CIN','CB','D'],
 ['Isaiah Neyor','GB','WR','O'],['Lew Nichols','PIT','RB','O'],['Nick Niemann','GB','LB','D'],
 ['Bo Nix','DEN','QB','O'],['Keisean Nixon','GB','CB','D'],['David Njoku','LAC','TE','O'],
 ['Jaylin Noel','HOU','WR','O'],['Omarr Norman-Lott','KC','DT','D'],['Bill Norton','LAR','DT','D'],
 ['Riley Nowakowski','PIT','FB','O'],['Trevor Nowaske','DET','LB','D'],['Kyle Van Noy','MIN','LB','D'],
 ['Tyler Nubin','NYG','S','D'],['Rakeem Nunez-Roches','TB','DT','D'],['Garrett Nussmeier','KC','QB','O'],
 ['Kene Nwangwu','NYJ','RB','O'],['Xavier Nwankpa','KC','S','D'],['Uchenna Nwosu','SEA','LB','D'],
 ['Aidan O\'Connell','LV','QB','O'],['Patrick O\'Connell','SEA','LB','D'],['Eric O\'Neill','DET','EDGE','D'],
 ['Connor O\'Toole','SEA','LB','D'],['Namdi Obiazor','NE','LB','D'],['Adedayo Odeleye','DAL','DT','D'],
 ['Dayo Odeyingbo','CHI','EDGE','D'],['Osa Odighizuwa','SF','DT','D'],['Thomas Odukoya','KC','TE','O'],
 ['George Odum','HOU','S','D'],['Rome Odunze','CHI','WR','O'],['Emmanuel Ogbah','KC','EDGE','D'],
 ['Amen Ogbongbemiga','DET','LB','D'],['Otito Ogbonnia','DAL','DT','D'],['Drew Ogletree','IND','TE','O'],
 ['Dare Ogunbowale','LV','RB','O'],['Moro Ojomo','PHI','DT','D'],['Azeez Ojulari','LV','LB','D'],
 ['Ty Okada','SEA','S','D'],['Bobby Okereke','CAR','LB','D'],['Chig Okonkwo','WAS','TE','O'],
 ['Ogbo Okoronkwo','SF','LB','D'],['CJ Okoye','NYG','DT','D'],['Sam Okuayinonu','SF','DT','D'],
 ['Kitan Oladapo','GB','S','D'],['Oluwafemi Oladejo','TEN','EDGE','D'],['David Olajiga','BAL','DT','D'],
 ['Chris Olave','NO','WR','O'],['Bryce Oliver','CLE','WR','O'],['Collin Oliver','GB','EDGE','D'],
 ['Ed Oliver','BUF','DT','D'],['Josh Oliver','MIN','TE','O'],['Gunner Olszewski','NYG','WR','O'],
 ['Segun Olubi','LV','LB','D'],['Foyesade Oluokun','JAX','LB','D'],['Charles Omenihu','WAS','EDGE','D'],
 ['Levi Onwuzurike','DET','EDGE','D'],['Tyler Onyedim','DEN','DT','D'],['David Onyemata','NYJ','DT','D'],
 ['Domonique Orange','MIN','DT','D'],['Ruke Orhorhoro','JAX','DT','D'],['K.J. Osborn','TEN','WR','O'],
 ['Joseph Ossai','NYJ','EDGE','D'],['K.C. Ossai','HOU','LB','D'],['Esezi Otomewo','PIT','DT','D'],
 ['Jaydn Ott','KC','RB','O'],['Cade Otton','TB','TE','O'],['Robbie Ouzts','SEA','FB','O'],
 ['DeMarvion Overshown','DAL','LB','D'],['LT Overton','DAL','DT','D'],['Odafe Oweh','WAS','LB','D'],
 ['Coleman Owen','IND','WR','O'],['Jonathan Owens','IND','S','D'],['Tyler Owens','WAS','S','D'],
 ['Jeremiah Owusu-Koramoah','CLE','LB','D'],['Isiah Pacheco','DET','RB','O'],['Payton Page','NYJ','DT','D'],
 ['Joshua Palmer','BUF','WR','O'],['Trey Palmer','NO','WR','O'],['Owen Pappoe','TEN','LB','D'],
 ['TJ Parker','BUF','LB','D'],['Colby Parkinson','LAR','TE','O'],['Jacob Parrish','TB','CB','D'],
 ['Micah Parsons','GB','EDGE','D'],['Tim Patrick','NYJ','WR','O'],['Dean Patterson','TB','WR','O'],
 ['Will Pauling','SF','WR','O'],['Kwity Paye','LV','EDGE','D'],['Daron Payne','WAS','DT','D'],
 ['VJ Payne','NYJ','S','D'],['Cole Payton','PHI','QB','O'],['Rico Payton','NYG','CB','D'],
 ['Ricky Pearsall','SF','WR','O'],['Aeneas Peebles','BAL','DT','D'],['JJ Pegues','LV','DT','D'],
 ['Trebor Pena','JAX','WR','O'],['Samaje Perine','CIN','RB','O'],['D\'Arco Perkins-McAllister','KC','CB','D'],
 ['Denzel Perryman','LAC','LB','D'],['Parker Petersen','CAR','DT','D'],['Dell Pettus','NE','S','D'],
 ['Ty Pezza','BAL','TE','O'],['Bryce Phillips','MIN','CB','D'],['Del\'Shawn Phillips','LAC','LB','D'],
 ['Dru Phillips','NYG','CB','D'],['Harrison Phillips','NYJ','DT','D'],['Jaelan Phillips','CAR','LB','D'],
 ['Jordan Phillips','MIA','DT','D'],['George Pickens','DAL','WR','O'],['Kenny Pickett','CAR','QB','O'],
 ['Alec Pierce','IND','WR','O'],['Dameon Pierce','PHI','RB','O'],['James Pierre','MIN','CB','D'],
 ['Brandon Pili','SEA','DT','D'],['Jason Pinnock','NYG','S','D'],['Jalen Pitre','HOU','S','D'],
 ['Isaiah Pola-Mao','LV','S','D'],['Tony Pollard','TEN','RB','O'],['Elijah Ponder','NE','LB','D'],
 ['D\'Angelo Ponds','NYJ','CB','D'],['Darien Porter','LV','CB','D'],['Adam Prentice','DEN','FB','O'],
 ['Dak Prescott','DAL','QB','O'],['Brennan Presley','LAR','WR','O'],['Jadarian Price','SEA','RB','O'],
 ['Jayden Price','NO','CB','D'],['Myles Price','MIN','WR','O'],['Deantre Prince','CHI','CB','D'],
 ['Jamaal Pritchett','NYJ','WR','O'],['Nehemiah Pritchett','SEA','CB','D'],['Kaleb Proctor','ARI','DT','D'],
 ['Karon Prunty','NE','CB','D'],['Ephesians Prysock','SF','CB','D'],['Maximus Pulley','PHI','S','D'],
 ['Brock Purdy','SF','QB','O'],['Jack Pyburn','KC','LB','D'],['Patrick Queen','PIT','LB','D'],
 ['Teagan Quitoriano','ARI','TE','O'],['Jose Ramirez','NE','LB','D'],['Jalen Ramsey','PIT','CB','D'],
 ['Kamari Ramsey','HOU','S','D'],['Adam Randall','BAL','RB','O'],['Garmon Randolph','CIN','EDGE','D'],
 ['Sheldon Rankins','HOU','DT','D'],['Caleb Ransaw','JAX','S','D'],['Lathan Ransom','CAR','S','D'],
 ['Eli Raridon','NE','TE','O'],['Spencer Rattler','NO','QB','O'],['Kalif Raymond','CHI','WR','O'],
 ['DJ Reader','NYG','DT','D'],['Jalen Reagor','MIA','WR','O'],['Jeremy Reaves','WAS','S','D'],
 ['Brock Rechsteiner','NO','WR','O'],['Mark Redman','GB','TE','O'],['Jalen Redmond','MIN','DT','D'],
 ['D.J. Reed','DET','CB','D'],['Ja\'seem Reed','CAR','WR','O'],['Jarran Reed','SEA','DT','D'],
 ['Jayden Reed','GB','WR','O'],['Jaylen Reed','NE','S','D'],['Nikko Reed','LAC','CB','D'],
 ['Troy Reeder','NYJ','LB','D'],['Arvell Reese','NYG','LB','D'],['Albert Regis','JAX','DT','D'],
 ['Justin Reid','NO','S','D'],['Karene Reid','DEN','LB','D'],['Mike Reid','NO','CB','D'],
 ['Winston Reid','CLE','LB','D'],['Mason Reiger','PHI','LB','D'],['Tip Reiman','ARI','TE','O'],
 ['Nikko Remigio','KC','WR','O'],['Xavier Restrepo','TEN','WR','O'],['Craig Reynolds','WAS','RB','O'],
 ['Patrick Ricard','NYG','FB','O'],['Rashee Rice','KC','WR','O'],['Decamerion Richardson','NO','CB','D'],
 ['JP Richardson','CHI','WR','O'],['Bo Richter','MIN','LB','D'],['Daniel Rickert','LAR','EDGE','D'],
 ['Calvin Ridley','TEN','WR','O'],['Jordon Riley','GB','DT','D'],['Quincy Riley','NO','CB','D'],
 ['Kelee Ringo','PHI','CB','D'],['Jahvaree Ritzie','MIN','EDGE','D'],['Chandler Rivers','BAL','CB','D'],
 ['Ronnie Rivers','LAR','RB','O'],['Malcolm Roach','DEN','DT','D'],['Elijah Roberts','TB','EDGE','D'],
 ['JJ Roberts','TB','S','D'],['Amik Robertson','WAS','CB','D'],['Cameron Robertson','ARI','LB','D'],
 ['Roy Robertson-Harris','NYG','DT','D'],['A\'Shawn Robinson','TB','DT','D'],['Bijan Robinson','ATL','RB','O'],
 ['Chop Robinson','MIA','LB','D'],['Curtis Robinson','DAL','LB','D'],['Darius Robinson','ARI','EDGE','D'],
 ['Demarcus Robinson','SF','WR','O'],['Dominique Robinson','HOU','EDGE','D'],['Jahquez Robinson','BAL','S','D'],
 ['Jakob Robinson','SF','CB','D'],['Jammie Robinson','ATL','S','D'],['Landon Robinson','CIN','DT','D'],
 ['Micah Robinson','TEN','CB','D'],['Que Robinson','DEN','LB','D'],['Tavius Robinson','BAL','LB','D'],
 ['Ty Robinson','PHI','DT','D'],['Wan\'Dale Robinson','TEN','WR','O'],['Aaron Rodgers','PIT','QB','O'],
 ['Isaiah Rodgers','MIN','CB','D'],['Jacob Rodriguez','MIA','LB','D'],['Levi Drake Rodriguez','MIN','DT','D'],
 ['Malcolm Rodriguez','DET','LB','D'],['DJ Rogers','DAL','TE','O'],['Chris Roland-Wallace','KC','CB','D'],
 ['Jimmy Rolder','DET','LB','D'],['D\'Angelo Ross','CLE','CB','D'],['Kurtis Rourke','SF','QB','O'],
 ['Sam Roush','CHI','TE','O'],['Greg Rousseau','BUF','LB','D'],['Jalen Royals','KC','WR','O'],
 ['Joe Royer','CLE','TE','O'],['Christian Rozeboom','TB','LB','D'],['Gabriel Rubio','PIT','EDGE','D'],
 ['Hayden Rucci','JAX','TE','O'],['Corey Rucker','LV','WR','O'],['Kaimon Rucker','BAL','LB','D'],
 ['Jeremy Ruckert','NYJ','TE','O'],['Mason Rudolph','PIT','QB','O'],['Trayvon Rudolph','MIN','WR','O'],
 ['Carter Runyon','LV','TE','O'],['Cooper Rush','ATL','QB','O'],['Darius Rush','WAS','CB','D'],
 ['Brady Russell','SEA','FB','O'],['Carsen Ryan','CLE','TE','O'],['Kenyon Sadiq','NYJ','TE','O'],
 ['Mike Sainristil','WAS','CB','D'],['Andre\' Sam','PHI','S','D'],['Drew Sample','CIN','TE','O'],
 ['Dylan Sampson','CLE','RB','O'],['Jack Sanborn','CHI','LB','D'],['Drew Sanders','DEN','LB','D'],
 ['Ja\'Tavion Sanders','CAR','TE','O'],['Raheim Sanders','CLE','RB','O'],['Shedeur Sanders','CLE','QB','O'],
 ['T.J. Sanders','BUF','DT','D'],['Jonas Sanker','NO','S','D'],['Tyreak Sapp','CLE','EDGE','D'],
 ['Elijah Sarratt','BAL','WR','O'],['Eric Saubert','SEA','TE','O'],['Jack Sawyer','PIT','LB','D'],
 ['Jacob Saylors','DET','RB','O'],['Brenden Schooler','NE','S','D'],['Luke Schoonmaker','DAL','TE','O'],
 ['Cody Schrader','DEN','RB','O'],['Dalton Schultz','HOU','TE','O'],['Carson Schwesinger','CLE','LB','D'],
 ['Daniel Scott','IND','S','D'],['Keionte Scott','TB','CB','D'],['Miles Scott','DEN','S','D'],
 ['Nick Scott','CAR','S','D'],['Zavier Scott','CHI','RB','O'],['Nic Scourton','CAR','LB','D'],
 ['Trey Sermon','ATL','RB','O'],['Tim Settle','WAS','DT','D'],['Marlen Sewell','CHI','S','D'],
 ['Nephi Sewell','CHI','LB','D'],['Noah Sewell','CHI','LB','D'],['Rashid Shaheed','SEA','WR','O'],
 ['Khalil Shakir','BUF','WR','O'],['Karson Sharar','ARI','LB','D'],['Bauer Sharp','TB','TE','O'],
 ['Tyrell Shavers','BUF','WR','O'],['Rodney Shelley','LAC','CB','D'],['Nathan Shepherd','NO','DT','D'],
 ['Will Sheppard','MIA','WR','O'],['Trent Sherfield','BUF','WR','O'],['Jamie Sheriff','LAR','LB','D'],
 ['Jamien Sherwood','NYJ','LB','D'],['Will Shipley','PHI','RB','O'],['Justin Shorter','LV','WR','O'],
 ['Tyler Shough','NO','QB','O'],['Zach Sieler','MIA','DT','D'],['Marques Sigle','SF','S','D'],
 ['Cam\'Ron Silmon-Craig','JAX','S','D'],['Elijah Simmons','TB','DT','D'],['Isaiah Simmons','CAR','S','D'],
 ['Jeffery Simmons','TEN','DT','D'],['Cody Simon','ARI','LB','D'],['Joshua Simon','WAS','TE','O'],
 ['Jaylin Simpson','MIA','S','D'],['Trenton Simpson','BAL','LB','D'],['Ty Simpson','LAR','QB','O'],
 ['Ben Sims','MIA','TE','O'],['Devin Singletary','NYG','RB','O'],['Alex Singleton','DEN','LB','D'],
 ['DeShon Singleton','KC','S','D'],['Nicholas Singleton','TEN','RB','O'],['Ben Sinnott','WAS','TE','O'],
 ['Jackson Sirmon','NO','LB','D'],['Cam Skattebo','NYG','RB','O'],['JL Skinner','DEN','S','D'],
 ['Ben Skowronek','PIT','WR','O'],['Doneiko Slaughter','PIT','CB','D'],['Darius Slayton','NYG','WR','O'],
 ['Cian Slone','LV','EDGE','D'],['Kedon Slovis','GB','QB','O'],['Stone Smartt','NO','TE','O'],
 ['Aaron Smith','SEA','LB','D'],['Anthony Smith','DAL','WR','O'],['Arian Smith','NYJ','WR','O'],
 ['Avery Smith','SEA','CB','D'],['Brandon Smith','PIT','WR','O'],['Brashard Smith','KC','RB','O'],
 ['Chris Smith','DET','DT','D'],['DeVonta Smith','CAR','CB','D'],['DeVonta Smith','PHI','WR','O'],
 ['Genesis Smith','LAC','S','D'],['Geno Smith','NYJ','QB','O'],['Harrison Smith','MIN','S','D'],
 ['Jaylin Smith','HOU','CB','D'],['Jonnu Smith','GB','TE','O'],['Maason Smith','ATL','DT','D'],
 ['Mazi Smith','MIA','DT','D'],['Roquan Smith','BAL','LB','D'],['Terell Smith','WAS','CB','D'],
 ['Tim Smith','IND','DT','D'],['Tremon Smith','HOU','CB','D'],['Tykee Smith','TB','S','D'],
 ['Tyreke Smith','KC','EDGE','D'],['Xavier Smith','LAR','WR','O'],['Za\'Darius Smith','ATL','EDGE','D'],
 ['Ihmir Smith-Marsette','ARI','WR','O'],['Jaxon Smith-Njigba','SEA','WR','O'],['Chau Smith-Wade','CAR','CB','D'],
 ['Durham Smythe','BAL','TE','O'],['L\'Jarius Sneed','KC','CB','D'],['Daniel Sobkowicz','HOU','WR','O'],
 ['Javon Solomon','BUF','LB','D'],['Barryn Sorrell','GB','EDGE','D'],['Brevyn Spann-Ford','DAL','TE','O'],
 ['Tyjae Spears','TEN','RB','O'],['Robert Spears-Jennings','PIT','S','D'],['Ameer Speed','DAL','CB','D'],
 ['E.J. Speed','HOU','LB','D'],['Omar Speights','LAR','LB','D'],['Robert Spillane','NE','LB','D'],
 ['Aaron Jones Sr.','MIN','RB','O'],['Anthony Richardson Sr.','IND','QB','O'],['Deebo Samuel Sr.','SF','WR','O'],
 ['Gervon Dexter Sr.','ATL','DT','D'],['James Williams Sr.','TEN','LB','D'],['Kyle Pitts Sr.','ATL','TE','O'],
 ['Mack Wilson Sr.','ARI','LB','D'],['Benjamin St-Juste','GB','CB','D'],['Nazir Stackhouse','TEN','DT','D'],
 ['Matthew Stafford','LAR','QB','O'],['Isaiah Stalbird','NO','LB','D'],['Malaki Starks','BAL','S','D'],
 ['Carson Steele','PHI','RB','O'],['Brandon Stephens','NYJ','CB','D'],['Rhamondre Stevenson','NE','RB','O'],
 ['Tyrique Stevenson','CHI','CB','D'],['Reddy Steward','DAL','CB','D'],['Grover Stewart','IND','DT','D'],
 ['Josaiah Stewart','LAR','LB','D'],['M.J. Stewart','HOU','S','D'],['Shemar Stewart','CIN','EDGE','D'],
 ['Easton Stick','TB','QB','O'],['Jarrett Stidham','DEN','QB','O'],['Qwan\'tez Stiggers','NYJ','CB','D'],
 ['Tarheeb Still','LAC','CB','D'],['Ben Stille','DET','DT','D'],['Dante Stills','ARI','DT','D'],
 ['Eric Stokes','LV','CB','D'],['Geno Stone','BUF','S','D'],['Upton Stout','SF','CB','D'],
 ['Cade Stover','HOU','TE','O'],['Eli Stowers','PHI','TE','O'],['Jack Strand','ATL','QB','O'],
 ['Brenton Strange','JAX','TE','O'],['Kentavius Street','CHI','DT','D'],['De\'Zhaun Stribling','SF','WR','O'],
 ['Danny Striggow','JAX','EDGE','D'],['Justin Strnad','DEN','LB','D'],['Jalen Stroman','SF','S','D'],
 ['Dorian Strong','BUF','CB','D'],['C.J. Stroud','HOU','QB','O'],['Grant Stuard','LAR','LB','D'],
 ['Treydan Stukes','LV','S','D'],['J. Michael Sturdivant','GB','WR','O'],['Danny Stutsman','NO','LB','D'],
 ['Sonny Styles','WAS','LB','D'],['Jay\'viar Suggs','NO','DT','D'],['Chazz Surratt','SEA','LB','D'],
 ['Courtland Sutton','DEN','WR','O'],['Evan Svoboda','LAC','TE','O'],['Josh Sweat','ARI','LB','D'],
 ['Montez Sweat','CHI','EDGE','D'],['T\'Vondre Sweat','NYJ','DT','D'],['D\'Andre Swift','CHI','RB','O'],
 ['Bradyn Swinson','PIT','LB','D'],['Messiah Swinson','CLE','TE','O'],['Khordae Sydnor','CLE','EDGE','D'],
 ['Michael Taaffe','MIA','S','D'],['Junior Tafuna','HOU','DT','D'],['Tua Tagovailoa','ATL','QB','O'],
 ['T.J. Tampa','BAL','CB','D'],['Teair Tart','LAC','DT','D'],['Laki Tasi','TEN','DT','D'],
 ['Carnell Tate','TEN','WR','O'],['Jahlani Tavai','JAX','LB','D'],['Alontae Taylor','TEN','CB','D'],
 ['J\'Mari Taylor','JAX','RB','O'],['Ja\'Sir Taylor','CIN','CB','D'],['Jonathan Taylor','IND','RB','O'],
 ['Mason Taylor','NYJ','TE','O'],['Reese Taylor','MIA','CB','D'],['Tyrod Taylor','GB','QB','O'],
 ['Cam Taylor-Britt','IND','CB','D'],['Dadrion Taylor-Demerson','ARI','S','D'],['Isaac TeSlaa','DET','WR','O'],
 ['Avieon Terrell','ATL','CB','D'],['Kayvon Thibodeaux','NYG','LB','D'],['Dillon Thieneman','CHI','S','D'],
 ['Azareye\'h Thomas','NYJ','CB','D'],['Cameron Thomas','ATL','EDGE','D'],['Daniel Thomas','CLE','S','D'],
 ['Drake Thomas','SEA','LB','D'],['Ian Thomas','LV','TE','O'],['Jacob Thomas','MIN','S','D'],
 ['Jakobe Thomas','MIN','S','D'],['Noah Thomas','CIN','WR','O'],['R Mason Thomas','KC','EDGE','D'],
 ['Skyler Thomas','CHI','S','D'],['Solomon Thomas','TEN','DT','D'],['Tavierre Thomas','MIN','S','D'],
 ['Zavion Thomas','CHI','WR','O'],['Deven Thompkins','LV','WR','O'],['Anterio Thompson','ATL','DT','D'],
 ['Brenen Thompson','LAC','WR','O'],['Jalen Thompson','DAL','S','D'],['Shaq Thompson','BUF','LB','D'],
 ['Skylar Thompson','BAL','QB','O'],['Corey Thornton','CAR','CB','D'],['Tyquan Thornton','KC','WR','O'],
 ['Jamari Thrash','CLE','WR','O'],['Jerry Tillery','IND','DT','D'],['Cedric Tillman','NO','WR','O'],
 ['Dondrea Tillman','DEN','LB','D'],['Mitchell Tinsley','HOU','WR','O'],['Mason Tipton','NO','WR','O'],
 ['Henry To\'oTo\'o','HOU','LB','D'],['Tommy Togiai','HOU','DT','D'],['Jalen Tolbert','MIA','WR','O'],
 ['Dalvin Tomlinson','LAC','DT','D'],['Khyiris Tonga','KC','DT','D'],['Jake Tonges','SF','TE','O'],
 ['Robert Tonyan','PIT','TE','O'],['Carson Towt','IND','TE','O'],['Austin Trammell','JAX','WR','O'],
 ['Drue Tranquill','KC','LB','D'],['Seydou Traore','MIA','TE','O'],['Adam Trautman','DEN','TE','O'],
 ['Chip Trayanum','NYJ','RB','O'],['Laquon Treadwell','IND','WR','O'],['Brycen Tremayne','CAR','WR','O'],
 ['Tommy Tremble','CAR','TE','O'],['Bralen Trice','ATL','LB','D'],['Michael Trigg','DAL','TE','O'],
 ['Josiah Trotter','TB','LB','D'],['Mitchell Trubisky','TEN','QB','O'],['Sean Tucker','TB','RB','O'],
 ['Tre Tucker','LV','WR','O'],['Jaylahn Tuimoloau','IND','EDGE','D'],['Tuli Tuipulotu','LAC','LB','D'],
 ['Josh Tupou','NYG','DT','D'],['Cole Turner','MIA','TE','O'],['Dallas Turner','MIN','LB','D'],
 ['Jordan Turner','DEN','LB','D'],['Kobie Turner','LAR','EDGE','D'],['Payton Turner','DET','EDGE','D'],
 ['Shemar Turner','CHI','DT','D'],['KaVontae Turpin','DAL','WR','O'],['Bhayshul Tuten','JAX','RB','O'],
 ['Shy Tuttle','WAS','DT','D'],['Jordyn Tyson','NO','WR','O'],['Josh Uche','MIA','LB','D'],
 ['DJ Uiagalelei','LAC','QB','O'],['Edefuan Ulofoshio','CLE','LB','D'],['Princely Umanmielen','CAR','LB','D'],
 ['Eyioma Uwazurike','DEN','EDGE','D'],['David Sills V','TB','WR','O'],['Starling Thomas V','ARI','CB','D'],
 ['Sione Vaki','DET','RB','O'],['Sebastian Valdez','SF','DT','D'],['Carrington Valentine','GB','CB','D'],
 ['Ben VanSumeren','KC','FB','O'],['Greedy Vance','LV','CB','D'],['Nick Vannett','BAL','TE','O'],
 ['Zemaiah Vaughn','MIN','CB','D'],['Vita Vea','TB','DT','D'],['Devaughn Vele','NO','WR','O'],
 ['Jack Velling','ATL','TE','O'],['Malik Verdon','ATL','LB','D'],['Jared Verse','CLE','EDGE','D'],
 ['Kimani Vidal','LAC','RB','O'],['Car\'lin Vigers','PIT','CB','D'],['Kindle Vildor','NE','CB','D'],
 ['Dan Villari','LAR','TE','O'],['Reggie Virgil','ARI','WR','O'],['Jaylen Waddle','DEN','WR','O'],
 ['David Walker','TB','LB','D'],['Deone Walker','BUF','DT','D'],['Devontez Walker','BAL','WR','O'],
 ['Jahdae Walker','CHI','WR','O'],['Johnny Walker','DEN','LB','D'],['Kani Walker','BUF','CB','D'],
 ['Quay Walker','LV','LB','D'],['Travon Walker','JAX','EDGE','D'],['Josh Wallace','LAR','CB','D'],
 ['K\'Von Wallace','BAL','CB','D'],['Trevin Wallace','NYJ','LB','D'],['Tylan Wallace','CLE','WR','O'],
 ['Darren Waller','CAR','TE','O'],['Justin Walley','IND','CB','D'],['Garret Wallow','SF','LB','D'],
 ['Silas Walters','TB','S','D'],['Cam Ward','TEN','QB','O'],['Charvarius Ward','IND','CB','D'],
 ['Denzel Ward','CLE','CB','D'],['Jay Ward','MIN','S','D'],['Jonathan Ward','BAL','RB','O'],
 ['Fred Warner','SF','LB','D'],['Jaylen Warren','PIT','RB','O'],['Tyler Warren','IND','TE','O'],
 ['Ar\'Darius Washington','NYG','S','D'],['Casey Washington','CAR','WR','O'],['Darnell Washington','PIT','TE','O'],
 ['Malik Washington','MIA','WR','O'],['Parker Washington','JAX','WR','O'],['Trey Washington','IND','S','D'],
 ['Zion Washington','CLE','S','D'],['Jordan Waters','LAR','RB','O'],['Jordan Watkins','SF','WR','O'],
 ['Christian Watson','GB','WR','O'],['Deshaun Watson','CLE','QB','O'],['Jaylen Watson','LAR','CB','D'],
 ['Nathaniel Watson','CLE','LB','D'],['Tre Watson','MIA','TE','O'],['T.J. Watt','PIT','LB','D'],
 ['Xavier Watts','ATL','S','D'],['Marlowe Wax','LAC','LB','D'],['Jared Wayne','HOU','WR','O'],
 ['Xavier Weaver','ARI','WR','O'],['Jeremiah Webb','NE','WR','O'],['Terry Webb','LAC','DT','D'],
 ['West Weeks','IND','LB','D'],['Kristian Welch','GB','LB','D'],['Treyton Welch','NO','TE','O'],
 ['Julius Welschof','PIT','LB','D'],['Carson Wentz','MIN','QB','O'],['Pete Werner','NO','LB','D'],
 ['Joshua Weru','PHI','LB','D'],['C.J. West','SF','DT','D'],['Tyre West','DET','DT','D'],
 ['Nick Westbrook-Ikhine','IND','WR','O'],['LaJohntay Wester','BAL','WR','O'],['Jack Westover','WAS','TE','O'],
 ['Kaden Wetjen','PIT','WR','O'],['Tershawn Wharton','CAR','DT','D'],['Tyrus Wheat','DAL','LB','D'],
 ['Zakee Wheatley','CAR','S','D'],['Cody White','LV','WR','O'],['Devin White','DET','LB','D'],
 ['Keion White','SF','EDGE','D'],['Rachaad White','WAS','RB','O'],['Zamir White','NO','RB','O'],
 ['Blake Whiteheart','CLE','TE','O'],['Nick Whiteside','DET','CB','D'],['Jordan Whittington','LAR','WR','O'],
 ['Noah Whittington','HOU','RB','O'],['Josh Whyle','GB','TE','O'],['Dontayvion Wicks','PHI','WR','O'],
 ['Nate Wiggins','BAL','CB','D'],['Jared Wiley','KC','TE','O'],['Antonio Williams','WAS','WR','O'],
 ['CJ Williams','JAX','WR','O'],['Caleb Williams','CHI','QB','O'],['Chris Williams','CLE','DT','D'],
 ['Damonic Williams','ARI','DT','D'],['Dorian Williams','BUF','LB','D'],['Elijah Williams','MIN','EDGE','D'],
 ['Evan Williams','GB','S','D'],['Garrett Williams','ARI','CB','D'],['Isaiah Williams','NYJ','WR','O'],
 ['Jameson Williams','DET','WR','O'],['Javonte Williams','DAL','RB','O'],['Josh Williams','TB','RB','O'],
 ['Joshua Williams','TEN','CB','D'],['Ke\'Shawn Williams','CIN','WR','O'],['Kyle Williams','NE','WR','O'],
 ['Kyren Williams','LAR','RB','O'],['Leonard Williams','SEA','DT','D'],['Milton Williams','NE','DT','D'],
 ['Mykel Williams','SF','EDGE','D'],['Nohl Williams','KC','CB','D'],['Quincy Williams','CLE','LB','D'],
 ['Quinnen Williams','DAL','DT','D'],['Sam Williams','CLE','LB','D'],['Savion Williams','GB','WR','O'],
 ['Tyleik Williams','DET','DT','D'],['Wesley Williams','JAX','EDGE','D'],['Xavier Williams','TB','S','D'],
 ['Kendall Williamson','LAC','S','D'],['Malik Willis','MIA','QB','O'],['Emanuel Wilson','SEA','RB','O'],
 ['Eric Wilson','MIN','LB','D'],['Garrett Wilson','NYJ','WR','O'],['Joel Wilson','TEN','TE','O'],
 ['Johnny Wilson','PHI','WR','O'],['Kole Wilson','CLE','WR','O'],['Michael Wilson','ARI','WR','O'],
 ['Payton Wilson','PIT','LB','D'],['Riley Wilson','NE','LB','D'],['Roman Wilson','PIT','WR','O'],
 ['Tyree Wilson','NO','EDGE','D'],['Zach Wilson','NO','QB','O'],['Jacoby Windmon','PIT','LB','D'],
 ['Andrew Wingard','ARI','S','D'],['Mekhi Wingo','DET','DT','D'],['Jameis Winston','NYG','QB','O'],
 ['Dee Winters','DAL','LB','D'],['Cole Wisniewski','PHI','S','D'],['Devon Witherspoon','SEA','CB','D'],
 ['Charlie Woerner','ATL','TE','O'],['Hunter Wohler','IND','S','D'],['DJ Wonnum','DET','LB','D'],
 ['Julius Wood','MIA','S','D'],['Jackson Woodard','MIA','LB','D'],['Wade Woodaz','HOU','LB','D'],
 ['Colby Wooden','NO','DT','D'],['Charles Woods','NE','CB','D'],['Jelani Woods','NYJ','TE','O'],
 ['Josh Woods','ATL','LB','D'],['Peter Woods','KC','DT','D'],['Xavier Woods','CHI','S','D'],
 ['Craig Woodson','NE','S','D'],['Riq Woolen','PHI','CB','D'],['Michael Wortham','JAX','WR','O'],
 ['Xavier Worthy','KC','WR','O'],['Alex Wright','CLE','EDGE','D'],['Brock Wright','DET','TE','O'],
 ['Collin Wright','HOU','CB','D'],['Jacardia Wright','SEA','RB','O'],['Javin Wright','TB','LB','D'],
 ['Jaylen Wright','MIA','RB','O'],['Nahshon Wright','NYJ','CB','D'],['Rejzohn Wright','NO','CB','D'],
 ['Devonte Wyatt','GB','DT','D'],['Rock Ya-Sin','DET','CB','D'],['Colson Yankoff','WAS','TE','O'],
 ['Thomas Yassmin','GB','TE','O'],['Russ Yeast','CIN','S','D'],['Isaac Yiadom','WAS','CB','D'],
 ['Bryce Young','CAR','QB','O'],['Byron Young','LAR','LB','D'],['Byron Young','PHI','DT','D'],
 ['Chase Young','NO','EDGE','D'],['Colbie Young','CIN','WR','O'],['Dareke Young','LV','WR','O'],
 ['Zion Young','BAL','LB','D'],['Ben Yurosek','MIN','TE','O'],['Olamide Zaccheaus','ATL','WR','O'],
 ['Bailey Zappe','NYJ','QB','O'],['Shane Zylstra','NE','TE','O']];
const rosterFor=side=>ROSTER.filter(r=>!side||r[3]===side)
 .map(([n,t,p])=>({n,t,p,o:''}));

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
 return orderOf(conf,div).map(t=>rowOf(t,fin.indexOf(t.k)+1)).join('')}

const orderOf=(conf,div)=>{const fin=finOf(conf,div);
 return fin.length===4?fin.map(k=>T[k]):divTeams(conf,div)};

/* Rewriting the list was throwing away the very elements whose transitions
   were supposed to carry the change: a replaced row starts life already filled,
   so background and colour arrive instantly however long the transition says.
   Every row is kept and edited in place instead — the fill, the badge and the
   text then cross under the CSS transitions they already declare, and the FLIP
   only has to carry the move. Keeping the nodes also keeps their handlers, so
   there is nothing to rewire. */
function setRow(r,t,rank){
 const on=!!rank;
 r.classList.toggle('on',on);
 r.setAttribute('aria-pressed',String(on));
 r.setAttribute('aria-label',`${t.city} ${t.name}`+
  (rank===1?', wins the division':rank?', '+ORD[rank-1]:', not placed'));
 const n=r.querySelector('.rkn');
 if(n.textContent!==(rank?String(rank):''))n.textContent=rank?String(rank):'';
 const had=r.querySelector('.crown');
 if(rank===1&&!had){r.insertAdjacentHTML('beforeend',CROWN);
  const c=r.querySelector('.crown');
  if(!REDUCED)c.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],
   {duration:240,easing:'cubic-bezier(.2,.8,.3,1)'})}
 else if(rank!==1&&had){
  if(REDUCED){had.remove();return}
  had.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.6)'}],
   {duration:140,easing:'ease-in',fill:'forwards'}).onfinish=()=>had.remove()}}

const REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Order first, then state, and only reorder when the order actually changed.
   Re-inserting an element cancels the transitions running on it, and the old
   version re-appended all four rows on every tap — so the fill was being
   cancelled a moment after it started, on taps where nothing moved at all.
   Now three of four taps touch the DOM order not at all, and on the fourth the
   colour is set after the move rather than before it, so it still has a
   transition to run. */
function relist(box){
 const conf=box.dataset.conf,div=box.dataset.name;
 const list=box.querySelector('.rank'),fin=finOf(conf,div);
 flip(list,()=>{
  const want=orderOf(conf,div).map(t=>t.k);
  if(want.join()!==[...list.children].map(r=>r.dataset.team).join())
   want.forEach(k=>list.appendChild(list.querySelector(`[data-team="${k}"]`)));
  [...list.children].forEach(r=>
   setRow(r,T[r.dataset.team],fin.indexOf(r.dataset.team)+1))})}

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
  S.fin[key]=[];reconcile();save();
  relist(box);
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
  const fin=(S.fin[key]||[]).slice(),at=fin.indexOf(k);
  if(at>=0)fin.splice(at,1); else if(fin.length<4)fin.push(k); else return;
  S.fin[key]=fin;reconcile();save();
  relist(box);
  wireReset(box);syncChrome()})}

/* First, Last, Invert, Play. Measure where every row is, let the list reorder,
   then put each row back where it was and release it — so the rows travel to
   their new places instead of teleporting. */
/* The move is animated through the Web Animations API rather than an inline
   transition. The inline version wrote transition:transform onto the row and
   never took it off, so from a row's first move onward its transition property
   was transform and nothing else — the fill and the text colour had no
   transition left to run under, however long the stylesheet said. An animate()
   call leaves the element's own styles alone, so the move and the colour cross
   at the same time. */
function flip(list,mutate){
 const before=new Map([...list.children].map(r=>[r.dataset.team,r.getBoundingClientRect().top]));
 mutate();
 if(REDUCED)return;
 [...list.children].forEach(r=>{
  const was=before.get(r.dataset.team);if(was==null)return;
  const dy=was-r.getBoundingClientRect().top;
  if(!dy)return;
  r.animate([{transform:`translateY(${dy}px)`},{transform:'none'}],
   {duration:300,easing:'cubic-bezier(.2,.7,.3,1)'})})}
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
 return `<div class="sd full" style="--tc:${t.c};--tf:${t.f}" data-row="${i}"
 data-team="${esc(k)}" data-flip="row:${conf}:${esc(k)}">
<i class="sdn">${i+1}</i>${mark(t,'sm')}
<span class="sdt">${esc(t.city)} ${esc(t.name)}</span>
${i===0?'<em class="sdb">bye</em>':''}
${i>=4?`<button class="sdx" data-drop="${esc(k)}" aria-label="Remove ${esc(t.name)}">✕</button>`:''}
<button class="grip" data-grip aria-label="Reorder ${esc(t.name)}"
 aria-describedby="griphelp">${GRIP}</button></div>`}

const hole=(i,txt,conf)=>`<div class="sd open" data-row="${i}"
 data-flip="hole:${conf}:${i}"><i class="sdn">${i+1}</i>
<span class="sdt empty">${esc(txt||'Wild card — tap a team below')}</span></div>`;

function conference(conf){
 const ord=ordOf(conf),wild=wildOf(conf);
 const w=new Set(winnersOf(conf));
 const left=3-wild.length;
 const taken=new Set(ord.concat(wild));
 const pool=confTeams(conf).filter(t=>!taken.has(t.k)&&!w.has(t.k));
 return `<section class="sect" data-flip="sect:${conf}">
<div class="sh"><h4>${conf}</h4></div>
<p class="bandl">Division winners <em>drag to order</em></p>
<div class="seeds" data-band="${conf}:ord">${[0,1,2,3].map(i=>ord[i]?row(conf,ord[i],i):hole(i,'Win a division first',conf)).join('')}</div>
<p class="bandl wc" data-flip="band:${conf}:wild">Wild cards</p>
<div class="seeds" data-band="${conf}:wild">${[0,1,2].map(i=>wild[i]?row(conf,wild[i],i+4):hole(i+4,'',conf)).join('')}</div>
${left?`<div class="tms pool" data-flip="pool:${conf}">${pool.map(t=>`<button class="tm" data-seed="${conf}" data-k="${t.k}"
 data-flip="tm:${conf}:${t.k}" style="--tc:${t.c}">${mark(t)}<span class="tct">${esc(t.city)}</span><span class="tnm">${esc(t.name)}</span></button>`).join('')}</div>`:''}
</section>`}

SEC.seeds={render(){
 return `<div class="sheet">
<header class="phx">
<h1>Conference seeding</h1>
<p class="sr" id="griphelp">Press space to lift a team, then use the arrow keys
to move it, and space again to drop it.</p>
</header>
${CONFS.map(conference).join('')}
${nextBar('seeds','Play the bracket','#bracket')}
</div>`},
after(root){
 root.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
  const conf=b.dataset.seed,wl=S.wild[conf]||[];
  if(wl.length<3)flipRender(()=>{wl.push(b.dataset.k);S.wild[conf]=wl})});
 root.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{
  flipRender(()=>CONFS.forEach(c=>{
   S.wild[c]=(S.wild[c]||[]).filter(k=>k!==b.dataset.drop)}))});
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

/* A game nobody has reached yet is a placeholder, not a card — same open
   treatment an unfilled seed row gets on the step before. */
const game=(id,g)=>`<div class="bgm${!g.home&&!g.away?' open':''}"
>${slot(g,'home',id)}${slot(g,'away',id)}</div>`;

const champHTML=()=>{const ch=champion();
 return ch?`<div class="champ" style="--tc:${T[ch].c};--ts:${T[ch].c2};--tsf:${T[ch].f2}">
${mark(T[ch],'lg')}<span>Your champion</span><b>${esc(T[ch].city)} ${esc(T[ch].name)}</b></div>`:''};
function finalHTML(B){
 const g=B['sb'];
 const side=k=>{const t=k?T[k]:null,won=S.win['sb']===k;
  if(!t)return `<span class="sbh empty"><span class="sbn">Waiting</span></span>`;
  const lost=!!S.win['sb']&&!won;
  return `<button class="sbh${won?' w':''}${lost?' lost':''}" data-game="sb" data-team="${esc(k)}"
   style="--tc:${t.c};--tf:${t.f}" aria-pressed="${won}">${mark(t,'bg')}
<span class="sbc">${esc(t.city)}</span><span class="sbn">${esc(t.name)}</span></button>`};
 return `<div class="sbw">${side(g.home)}<span class="sbv">vs</span>${side(g.away)}</div>
<div id="champline">${champHTML()}</div>`}

function conference(B,conf){
 return `<section class="sect">
<div class="sh"><h4>${conf}</h4></div>
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
<h1>Playoff bracket</h1>
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
  const d=[],REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;
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
  /* One path per connector rather than one for all of them, so a line that has
     just become true can draw itself in while the ones already on screen stay
     put. lines() also runs on resize, where nothing has changed and nothing
     should animate — hence comparing against what was drawn last time. */
  const seen=new Set(svg.dataset.paths?svg.dataset.paths.split('|'):[]);
  svg.innerHTML=d.map(p=>`<path d="${p}" fill="none" stroke="rgba(25,25,23,.26)"`
   +` stroke-width="1.5" stroke-linejoin="round"/>`).join('');
  svg.dataset.paths=d.join('|');
  if(REDUCED)return;
  [...svg.querySelectorAll('path')].forEach((p,i)=>{
   if(seen.has(d[i]))return;
   const len=p.getTotalLength();
   p.setAttribute('stroke-dasharray',len);
   p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],
    {duration:420,easing:'cubic-bezier(.3,.8,.3,1)'})
    .onfinish=()=>p.removeAttribute('stroke-dasharray')})});
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
  ${c.o?'data-board':''} data-name="${esc(c.n)}" data-team="${esc(c.t)}"
  data-pos="${esc(c.p)}" data-odds="${esc(c.o)}"
  ${t?`style="--tc:${t.c}"`:''} aria-pressed="${on}">
${mark(t,'xs')}<span class="cnn">${esc(c.n)}</span>
<span class="cnt">${esc(c.t)} · ${esc(c.p)}</span><span class="cno">${esc(c.o)}</span></button>`};

const chosen=(k,a)=>{const t=a.team?T[a.team]:null;
 return `<div class="pick"${t?` style="--tc:${t.c};--tf:${t.f}"`:''}>
${mark(t,'bg')}
<span class="pkn">${esc(a.player)}</span>
<span class="pkm">${a.team?esc(a.team):'no team'}${a.pos?' · '+esc(a.pos):''}${a.odds?' · '+esc(a.odds):''}</span>
<button class="pkx" data-clear="${k}">Change</button></div>`};

/* Pat and Patrick Surtain are one man, and only one of them should come back
   from a search. Matching on the surname and the club catches the nickname the
   odds board used; requiring one first name to start the other keeps it from
   swallowing two different players who happen to share both. */
const nameKey=n=>{const c=n.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/,'').trim()
  .split(/\s+/).map(w=>w.replace(/[^a-z]/g,''));
 return {first:c[0]||'', last:c[c.length-1]||''}};
const samePerson=(a,b)=>a.last===b.last&&!!a.first&&!!b.first&&
 (a.first.startsWith(b.first)||b.first.startsWith(a.first));

const AW=Object.fromEntries(AWARDS.map(a=>[a[0],a]));
const block=([k,title,note])=>{
 const a=S.award[k]||{},list=board(k);
 if(a.player)return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>${chosen(k,a)}</section>`;
 return `<section class="sect">
<div class="sh"><h4>${esc(title)}</h4></div>
<p class="hint">${esc(note)}</p>
<div class="finder">
<input class="fsearch" type="search" data-search="${k}" placeholder="Search the board"
 autocomplete="off" spellcheck="false" aria-label="Search ${esc(title)} candidates">
<div class="cnds" data-list="${k}">${list.map(c=>row(k,c,false)).join('')}
<span data-pool="${k}"></span></div>
<p class="cnone" data-none="${k}" hidden>Nobody by that name.</p>
<div class="writein">
<input class="awin" type="text" data-write="${k}" placeholder="Someone else — type a name"
 autocomplete="off" spellcheck="false" aria-label="Write in a ${esc(title)} pick">
</div>
</div></section>`};

SEC.awards={render(){
 return `<div class="sheet">
<header class="phx">
${clearBtn("awards")}
<h1>Three awards</h1>
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
 const wirePicks=el=>el.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  S.award[b.dataset.pick]={player:b.dataset.name,team:b.dataset.team,
   pos:b.dataset.pos,odds:b.dataset.odds};
  swap(b.dataset.pick,b)});
 wirePicks(root);
 root.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.clear;S.award[k]={};swap(k,b)});
 /* filtered in place: a re-render would replace the input and drop the caret */
 /* The board is what you see; the rest of the league is what you can find.
    Two thousand rows are never in the DOM at rest — they are rendered only
    once there is something to match them against, and only the first fifty of
    those, because past that you are better off typing another letter. They
    arrive in the same list as the board, unannounced: no price beside a name
    is the only thing that says the market never had an opinion on him. */
 const SIDE={mvp:'',opoy:'O',dpoy:'D'};
 root.querySelectorAll('[data-search]').forEach(inp=>{inp.oninput=()=>{
  const k=inp.dataset.search,q=inp.value.trim().toLowerCase();
  const list=root.querySelector(`[data-list="${k}"]`);let n=0;
  const onBoard=[];
  list.querySelectorAll('.cnd[data-board]').forEach(r=>{
   onBoard.push({...nameKey(r.dataset.name),t:r.dataset.team});
   const hit=!q||r.dataset.n.includes(q);r.hidden=!hit;if(hit)n++});
  const pool=root.querySelector(`[data-pool="${k}"]`);
  let extra=[];
  if(q.length>1)extra=rosterFor(SIDE[k])
   .filter(c=>{if(!c.n.toLowerCase().includes(q))return false;
    const k={...nameKey(c.n),t:c.t};
    return !onBoard.some(b=>b.t===k.t&&samePerson(b,k))})
   .slice(0,50);
  pool.innerHTML=extra.map(c=>row(k,c,false)).join('');
  wirePicks(pool);
  const none=root.querySelector(`[data-none="${k}"]`);
  if(none)none.hidden=!!(n+extra.length)}});
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
<h1>Your card</h1>
</header>
<section class="sect">
<div class="sh"><h4>Name</h4></div>
<input class="awin wide" id="who" type="text" value="${esc(S.name||'')}"
 placeholder="Your name" autocomplete="name" spellcheck="false" aria-label="Your name">
</section>
<section class="sect">
<div class="sh"><h4>The picture</h4></div>
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
