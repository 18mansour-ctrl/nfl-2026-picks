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
