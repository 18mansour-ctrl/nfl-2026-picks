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

/* --- the card -------------------------------------------------------------
   One loud move and then restraint. The champion is a full-bleed band in that
   team's own colour, because it is the claim the card is making and it has to
   survive being a thumbnail in a group chat. Everything under it is on paper
   and quiet by comparison. The division winners came off: they are seeds one
   to four, already in the bracket, and printing them twice was what made this
   read as a spreadsheet. */
const SLOT=46,GAME=SLOT*2,GGAP=24;

/* white or ink, depending on what the team's colour can carry — the same
   answer core.js works out once and hangs on the team */
const onDark=hex=>lum(hex)>.42;
const over=(hex,a)=>onDark(hex)?`rgba(25,25,23,${a})`:`rgba(255,255,255,${a})`;

/* One bracket cell: two rows in a rounded box. The side that advanced is
   filled with its own colour rather than washed with a tint of it, so the
   path through the bracket is the first thing the eye follows. */
function cell(c,g,id,x,y,w){
 c.save();rrect(c,x,y,w,GAME,9);c.fillStyle='#FFFDF7';c.fill();
 c.shadowColor='rgba(25,25,23,.13)';c.shadowBlur=14;c.shadowOffsetY=4;c.fill();c.restore();
 ['home','away'].forEach((side,i)=>{
  const k=g[side],t=k?T[k]:null,won=S.win[id]===k;
  const sy=y+i*SLOT,seed=side==='home'?g.hs:g.as;
  if(won){c.save();c.beginPath();c.rect(x,sy,w,SLOT);c.clip();
   rrect(c,x,y,w,GAME,9);c.fillStyle=t.c;c.fill();c.restore()}
  if(i&&!won&&!(S.win[id]===g.home)){c.fillStyle=LINE;c.fillRect(x+12,sy,w-24,1)}
  if(!t){tx(c,'—',x+20,sy+SLOT/2+6,{size:17,weight:400,color:FNT});return}
  const lost=!!S.win[id]&&!won;
  if(lost){c.save();c.globalAlpha=.44}
  const fg=won?t.f:INK,dim=won?over(t.c,.62):FNT;
  if(seed)tx(c,String(seed),x+20,sy+SLOT/2+5,{size:12.5,weight:600,color:dim,align:'center'});
  logo(c,t,x+34,sy+(SLOT-28)/2,28);
  tx(c,t.name,x+74,sy+SLOT/2+7,{size:21,weight:won?700:500,color:won?fg:MUT,
   track:-.4,max:w-88});
  if(lost)c.restore()});
}
/* One line per team that advanced, from the row it won in to the row it turns
   up in. The reseeding is already expressed by where the names land, so the
   lines can simply be true. */
function elbow(c,a,b){
 const mid=(a.r+b.l)/2;
 c.beginPath();c.moveTo(a.r,a.y);c.lineTo(mid,a.y);
 c.lineTo(mid,b.y);c.lineTo(b.l,b.y);c.stroke()}

function drawConf(c,B,conf,y){
 const inner=W-PAD*2,colW=(inner-52)/3,sw=colW-10;
 const xs=[PAD,PAD+colW+26,PAD+(colW+26)*2];
 tx(c,conf,PAD,y,{size:23,weight:700,color:INK,track:.2});
 const bye=seedsOf(conf)[0];
 if(bye)tx(c,T[bye].name+' on the bye',W-PAD,y,{size:16,weight:400,color:FNT,align:'right'});
 const top=y+48;
 const ids=[[conf+'-wc0',conf+'-wc1',conf+'-wc2'],[conf+'-dv0',conf+'-dv1'],[conf+'-cc']];
 const span=3*GAME+2*GGAP;
 /* positions first, so the connectors can be drawn underneath the cells */
 const cols=ids.map((col,ci)=>{
  const h=col.length*GAME+(col.length-1)*GGAP,off=(span-h)/2;
  return col.map((id,i)=>{
   const gy=top+off+i*(GAME+GGAP),g=B[id];
   return {id,g,x:xs[ci],y:gy,
    rows:['home','away'].map((side,j)=>({team:g[side],won:S.win[id]===g[side],
     l:xs[ci],r:xs[ci]+sw,y:gy+j*SLOT+SLOT/2}))}})});
 c.save();c.strokeStyle='rgba(25,25,23,.26)';c.lineWidth=1.6;c.lineJoin='round';
 for(let ci=1;ci<cols.length;ci++){
  const prev=cols[ci-1].flatMap(g=>g.rows).filter(r=>r.won);
  cols[ci].forEach(g=>g.rows.forEach(r=>{
   if(!r.team)return;const src=prev.find(p=>p.team===r.team);
   if(src)elbow(c,src,r)}))}
 c.restore();
 ids.forEach((col,ci)=>tx(c,['Wild Card','Divisional','Championship'][ci],xs[ci]+sw/2,top-16,
  {size:13,weight:700,color:FNT,track:1.4,align:'center'}));
 cols.forEach(col=>col.forEach(g=>cell(c,g.g,g.id,g.x,g.y,sw)));
 return top+span}

function draw(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 const B=bracket(),ch=champion(),T1=ch?T[ch]:null;
 const bg=T1?T1.c:'#191917',ink=onDark(bg)?'#191917':'#FFFFFF';

 /* the band: the one saturated field on the card, and it is the pick itself */
 c.fillStyle=bg;c.fillRect(0,0,W,470);
 tx(c,'2026 NFL PREDICTIONS',PAD,86,{size:19,weight:700,color:over(bg,.6),track:2.2});
 tx(c,(S.name||'').trim()||'My picks',PAD,142,
  {size:44,weight:700,color:ink,track:-1.2,max:W-PAD*2});
 c.fillStyle=over(bg,.22);c.fillRect(PAD,180,W-PAD*2,1);
 if(T1){
  logo(c,T1,W-PAD-190,214,190);
  tx(c,'CHAMPION',PAD,240,{size:15,weight:700,color:over(bg,.62),track:2.2});
  tx(c,T1.city,PAD,300,{size:34,weight:400,color:over(bg,.8),track:-.6,max:W-PAD*2-230});
  tx(c,T1.name,PAD,364,{size:58,weight:700,color:ink,track:-1.8,max:W-PAD*2-230});
  const sb=B['sb'],lost=sb.home===ch?sb.away:sb.home;
  if(lost)tx(c,'beat the '+T[lost].name+' in the Super Bowl',PAD,412,
   {size:18,weight:400,color:over(bg,.62),max:W-PAD*2-230});
 }else tx(c,'No champion picked yet',PAD,300,{size:30,weight:400,color:over(bg,.7)});

 /* the bracket, given the room to be the body of the card */
 let y=556;
 y=drawConf(c,B,'AFC',y)+72;
 y=drawConf(c,B,'NFC',y)+56;

 /* the final, one row */
 const sb=B['sb'],half=(W-PAD*2-70)/2;
 tx(c,'SUPER BOWL',W/2,y,{size:13,weight:700,color:FNT,track:1.6,align:'center'});
 y+=18;
 [['home',PAD],['away',PAD+half+70]].forEach(([side,x])=>{
  const k=sb[side],t=k?T[k]:null,won=S.win['sb']===k;
  c.save();rrect(c,x,y,half,86,10);c.fillStyle=t&&won?t.c:'#FFFDF7';c.fill();
  c.shadowColor='rgba(25,25,23,.14)';c.shadowBlur=12;c.shadowOffsetY=3;c.fill();c.restore();
  if(!t){tx(c,'—',x+half/2,y+52,{size:22,weight:400,color:FNT,align:'center'});return}
  const lost=!!S.win['sb']&&!won;
  if(lost)c.globalAlpha=.5;
  logo(c,t,x+20,y+21,44);
  tx(c,t.city,x+80,y+40,{size:16,weight:400,color:won?over(t.c,.7):MUT,max:half-96});
  tx(c,t.name,x+80,y+68,{size:25,weight:won?700:600,color:won?t.f:INK,track:-.5,max:half-96});
  c.globalAlpha=1});
 tx(c,'v',W/2,y+52,{size:16,weight:400,color:FNT,align:'center'});
 y+=86+60;

 /* three names, given a row each rather than a table line */
 label(c,'Awards',y);
 y+=64;
 [['mvp','MVP'],['opoy','OPOY'],['dpoy','DPOY']].forEach(([k,l],i)=>{
  const a=S.award[k]||{},t=a.team?T[a.team]:null,ry=y+i*62;
  tx(c,l,PAD,ry,{size:17,weight:700,color:FNT,track:1.2});
  if(t)logo(c,t,PAD+96,ry-26,32);
  tx(c,(a.player||'').trim()||'—',PAD+140,ry,
   {size:27,weight:600,color:INK,track:-.5,max:W-PAD*2-250});
  if(a.odds)tx(c,a.odds,W-PAD,ry,{size:17,weight:500,color:MUT,align:'right'})});

 /* foot */
 rule(c,H-112);
 const when=new Date().toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 tx(c,'Filled out '+when,PAD,H-68,{size:18,weight:400,color:FNT});
 tx(c,'ON PAPER',W-PAD,H-68,{size:16,weight:700,color:FNT,align:'right',track:2});
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
