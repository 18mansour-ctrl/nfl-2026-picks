/* Step five: the two cards. Drawn on canvas rather than screenshotted, so they
   are the same on every phone, crisp at any size, and need nothing loaded from
   anywhere at share time.

   Two pictures, each 1080 x 1350 at two times. One is the season — the seven
   seeds a conference and the three awards. The other is the playoffs — the
   bracket those seeds produce. Thirty two clubs and thirteen games are two
   different jobs, and one frame doing both was the whole reason the old card
   never worked.

   Everything here is a port of card.html, which is the mockup those two were
   designed in. Values that look arbitrary were arrived at there against the
   real marks and the real names; changing one in isolation will usually break
   an alignment that was measured rather than guessed. */
(()=>{
const W=1080,H=1350,SCALE=2;
const PAPER='#FAFAF6',CARD='#FFFDF7',INK='#191917',MUT='#605F58',FNT='#9C9B92';
const HR='rgba(25,25,23,.09)',LN='rgba(25,25,23,.13)';
const SANS='Sohne';

/* Cleveland leads with a brown that at numeral size is indistinguishable from
   black, so its seed takes the club's second colour. The fill behind a
   champion still uses the primary — this is a foreground override only. */
const NUMC={CLE:'#EB3300'};
const numc=k=>NUMC[k]||(T[k]?T[k].c:INK);

/* ---- drawing helpers -----------------------------------------------------
   Every position below is a box top and a line height lifted straight off
   card.html, which is where these two were designed. txBox turns a CSS box
   into a canvas baseline using the font's own metrics, so a value measured in
   the mockup can be typed in here unchanged — the alternative is eyeballing
   baselines, which is how the first port came out wrong in a dozen places. */
function tx(c,s,x,y,{size=16,weight=400,color=INK,align='left',track=0,max=0,
 base='alphabetic'}={}){
 let sz=size;
 c.textAlign=align;c.textBaseline=base;c.fillStyle=color;
 c.letterSpacing=track?track+'px':'0px';
 c.font=`${weight} ${sz}px "${SANS}", sans-serif`;
 if(max){while(sz>9&&c.measureText(s).width>max){sz-=1;
  c.font=`${weight} ${sz}px "${SANS}", sans-serif`}}
 c.fillText(s,x,y);
 const w=c.measureText(s).width;c.letterSpacing='0px';return w}
function measure(c,s,{size=16,weight=400,track=0}={}){
 c.letterSpacing=track?track+'px':'0px';
 c.font=`${weight} ${size}px "${SANS}", sans-serif`;
 const w=c.measureText(s).width;c.letterSpacing='0px';return w}
function baseOf(c,size,weight,lh){
 c.font=`${weight} ${size}px "${SANS}", sans-serif`;
 const m=c.measureText('Hg');
 const a=m.fontBoundingBoxAscent,d=m.fontBoundingBoxDescent;
 return ((lh||size)-(a+d))/2+a}
function txBox(c,s,x,top,o){
 return tx(c,s,x,top+baseOf(c,o.size,o.weight||400,o.lh),o)}
const rule=(c,y,x1,x2,col=HR,h=1)=>{c.fillStyle=col;c.fillRect(x1,y,x2-x1,h)};
function rrect(c,x,y,w,h,r){c.beginPath();
 if(c.roundRect)c.roundRect(x,y,w,h,r);
 else{c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}}
const fade=(hex,a)=>{const n=parseInt(hex.slice(1),16);
 return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};

/* contain, so a wide wordmark and a tall shield both sit in the same square */
function logo(c,t,x,y,box){
 const im=t&&IMG[t.k];
 if(!im){c.save();rrect(c,x,y,box,box,box*.2);c.fillStyle=t?t.c:LN;c.fill();
  if(t)tx(c,t.k,x+box/2,y+box/2,{size:Math.round(box*.32),weight:700,
   color:t.f,align:'center',base:'middle'});
  c.restore();return}
 const r=Math.min(box/im.naturalWidth,box/im.naturalHeight);
 const w=im.naturalWidth*r,h=im.naturalHeight*r;
 c.drawImage(im,x+(box-w)/2,y+(box-h)/2,w,h)}

const CROWN_D='M1.6 17.6V5.1l6.1 4.4L12 2.6l4.3 6.9 6.1-4.4v12.5z';
let CROWN=null;
function crown(c,x,y,w,col){
 if(!CROWN&&window.Path2D)CROWN=new Path2D(CROWN_D);
 if(!CROWN)return;
 const s=w/24;
 c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.fill(CROWN);c.restore()}

/* A headshot is a cutout with its own amount of empty margin — one file is
   176x128 and another 600x436 — so a fixed crop lines up on none of them. The
   opaque box is measured once per image and the bust fitted to the dish from
   that, which puts every face at one scale on one baseline. */
const BBOX={};
function bbox(im,key){
 if(BBOX[key])return BBOX[key];
 const w=im.naturalWidth,h=im.naturalHeight;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;
 const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
 let x0=w,y0=h,x1=0,y1=0;
 try{const px=g.getImageData(0,0,w,h).data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(px[(y*w+x)*4+3]>12){
   if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
 catch(e){x0=0;y0=0;x1=w-1;y1=h-1}
 if(x1<x0){x0=0;y0=0;x1=w-1;y1=h-1}
 return BBOX[key]={x0,y0,x1,y1,w,h}}
function dish(c,x,y,d,t,im,key,initialsFor){
 c.save();c.beginPath();c.arc(x+d/2,y+d/2,d/2,0,6.2832);c.clip();
 c.fillStyle=t?t.c:'#E8E7E0';c.fillRect(x,y,d,d);
 if(im){const b=bbox(im,key),bh=b.y1-b.y0+1,bw=b.x1-b.x0+1;
  const k=d*.86/bh;
  c.drawImage(im,x+d/2-(b.x0+bw/2)*k,y+d-(b.y1+1)*k,b.w*k,b.h*k)}
 else if(initialsFor)tx(c,initials(initialsFor),x+d/2,y+d/2,
  {size:Math.round(d*.34),weight:700,color:t?t.f:MUT,align:'center',base:'middle'});
 c.restore()}

/* ---- the header, shared ---------------------------------------------------
   Left aligned on the card's own margin, not right — the block is as wide as
   its widest line and hangs off x=40 like everything under it. */
/* The name starts at 180, past the mark, and the trophy's own edge is at 892.
   Washington Commanders is the longest in the league and runs 776 wide at the
   size the rest of them are set at, so the ten or so clubs whose full name
   does not fit step down to the size that does rather than run under it. */
const NAMEW=680;
/* the card is whoever filled the name in, and mine when nobody did */
const kicker=()=>{const n=(S.name||'').trim();
 return (n?n+'\u2019s':'My')+' 2026 NFL predictions'};
const DH=248;
function header(c,{tc,tf,items,gap=20,sub,subBold,subX,subTop,subLh,watermark}){
 c.fillStyle=tc;c.fillRect(0,0,W,DH);
 /* the band clips it, the way .dh's overflow does in the mockup — otherwise
    the trophy's base spills onto the paper below the header */
 if(watermark&&IMG['@trophy']){const im=IMG['@trophy'],h=330;
  const w=im.naturalWidth*(h/im.naturalHeight);
  c.save();c.beginPath();c.rect(0,0,W,DH);c.clip();
  c.globalAlpha=.3;c.drawImage(im,W-44-w,-24,w,h);c.restore()}
 txBox(c,kicker(),40,32,{size:32,weight:600,lh:42,color:fade(tf,.62),track:-.7});
 let x=40;
 items.forEach(it=>{
  if(it.logo){logo(c,T[it.k]||null,x,it.y,it.size);x+=it.size+gap;return}
  const w=txBox(c,it.text,x,it.y,{size:it.size,weight:it.weight,lh:it.lh,
   color:it.color||tf,track:it.track||0});
  x+=w+gap});
 let cx=subX;
 if(subBold)cx+=txBox(c,subBold,cx,subTop,{size:26,weight:700,lh:subLh,
  color:tf,track:-.62});
 if(sub){if(subBold){txBox(c,'|',cx+10,subTop,{size:22,weight:500,lh:subLh,
   color:fade(tf,.42)});
   cx+=10+measure(c,'|',{size:22,weight:500})+10}
  txBox(c,sub,cx,subTop,{size:22,weight:500,lh:subLh,color:fade(tf,.7),track:-.3})}}

/* ---- card one: the seeds --------------------------------------------------
   Offsets are relative to the conference head's box top, which the mockup puts
   at 340.5 on a 1350 card. */
const COLW=472,SROW=84;
function seedColumn(c,conf,x,top){
 const s=seedsOf(conf);
 txBox(c,conf,x+1,top,{size:28,weight:700,lh:41,track:.7});
 rule(c,top+46,x,x+COLW,INK,2);
 const bandAt=(label,y)=>{
  const w=txBox(c,label,x+2,y,{size:18,weight:600,lh:22,track:-.32});
  rule(c,y+11,x+2+w+14,x+COLW,HR,1)};
 const row=(k,i,ry)=>{
  const t=k?T[k]:null,two=i<4&&!!t;
  txBox(c,String(i+1),x+20,ry+15.5,{size:52,weight:700,lh:52,
   color:t?numc(k):'#D8D7CE',track:-2.3});
  if(t){
   logo(c,t,x+84,ry+17.5,48);
   const ny=two?ry+9.5:ry+21.5;
   txBox(c,t.name,x+152,ny,{size:31,weight:600,lh:41,track:-.87,max:COLW-192});
   if(two){const lab=conf+' '+t.div;
    const w=txBox(c,lab,x+152,ry+53.5,{size:15,weight:500,lh:20,color:MUT,track:-.12});
    crown(c,x+152+w+8,ry+56,16,FNT)}}
  else txBox(c,'Not picked',x+152,ry+21.5,{size:31,weight:400,lh:41,color:FNT,track:-.87});
  /* the four seed and the seven both end a group, so neither draws a rule —
     the band below one and the card edge below the other close them */
  if(i!==3&&i!==6)rule(c,ry+83,x,x+COLW,HR,1)};
 bandAt('Division winners',top+68);
 for(let i=0;i<4;i++)row(s[i],i,top+94+i*SROW);
 bandAt('Wild cards',top+460);
 for(let i=4;i<7;i++)row(s[i],i,top+486+(i-4)*SROW)}

const AWARDS=[['mvp','MVP'],['opoy','OPOY'],['dpoy','DPOY']];
function awardsRow(c){
 txBox(c,'Award predictions',40,1114,{size:35,weight:700,lh:38.5,track:-1.05});
 const D=100,dy=1191.5,gapT=16;
 const blocks=AWARDS.map(([k,label])=>{
  const a=S.award[k]||{},t=a.team?T[a.team]:null;
  const name=(a.player||'').trim()||'Not picked';
  const meta=[a.pos,t&&t.name].filter(Boolean);
  const w=Math.max(measure(c,name,{size:27,weight:700,track:-.86}),
   measure(c,label,{size:19,weight:700,track:.86}),
   meta.length?measure(c,meta.join('   ')+'  ',{size:15,weight:500}):0);
  return {a,t,label,name,meta,w:D+gapT+w}});
 /* the outer two hold their column and only the middle block moves, so a long
    name in the middle stops crowding the third */
 const colW=(W-80-56)/3,x0=40,x2=40+2*(colW+28);
 const x1=x0+blocks[0].w+((x2-(x0+blocks[0].w))-blocks[1].w)/2;
 [x0,x1,x2].forEach((x,i)=>{const b=blocks[i];
  const key=b.a.player?'@'+shotKey(b.a.player):null;
  dish(c,x,dy,D,b.t,key&&IMG[key],key,b.a.player);
  const tx0=x+D+gapT;
  txBox(c,b.label,tx0,1199.1,{size:19,weight:700,lh:25,color:MUT,track:.86});
  txBox(c,b.name,tx0,1230.1,{size:27,weight:700,lh:28.9,track:-.86,max:W-40-tx0});
  if(b.meta.length){let mx=tx0;
   mx+=txBox(c,b.meta[0],mx,1263.9,{size:15,weight:500,lh:20,color:MUT})+7;
   if(b.meta[1]){mx+=txBox(c,'|',mx,1263.9,{size:15,weight:400,lh:20,color:FNT})+7;
    txBox(c,b.meta[1],mx,1263.9,{size:15,weight:500,lh:20,color:MUT})}}})}

function drawSeason(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 const B=bracket(),ch=champion(),T1=ch?T[ch]:null;
 const other=ch?(B.sb.home===ch?B.sb.away:B.sb.home):null,T2=other?T[other]:null;
 const tf=T1?T1.f:'#fff';
 header(c,{tc:T1?T1.c:INK,tf,watermark:true,
  items:[{logo:1,k:ch,y:83,size:120},
   {text:T1?T1.city+' '+T1.name:'Not picked',y:93,size:74,weight:700,lh:82,
    track:-2.66,max:NAMEW}],
  subX:180,subTop:178,subLh:35,
  subBold:T1?'Super Bowl Champion':'',
  sub:T2?'over the '+T2.city+' '+T2.name:''});
 txBox(c,'Conference seeding',40,280,{size:35,weight:700,lh:38.5,track:-1.05});
 seedColumn(c,'AFC',40,340.5);
 seedColumn(c,'NFC',W-40-COLW,340.5);
 awardsRow(c)}

/* ---- card two: the bracket ------------------------------------------------ */
const GW=292,GROW=58,GH=GROW*2;
function game(c,g,id,x,y,big){
 const rowH=big?62:GROW,h=rowH*2;
 rrect(c,x,y,GW,h,12);c.fillStyle=CARD;c.fill();
 const mkW=big?38:34,nmS=big?32:28,nmL=big?42:37;
 const sdX=18,mkX=big?50:54,nmX=102;
 ['home','away'].forEach((side,i)=>{
  const k=g[side],t=k?T[k]:null,won=!!k&&S.win[id]===k;
  const ry=y+i*rowH,seed=side==='home'?g.hs:g.as;
  if(!t){txBox(c,'—',x+nmX,ry+(rowH-nmL)/2,{size:nmS,weight:400,lh:nmL,color:FNT});return}
  if(big&&won){c.save();rrect(c,x,y,GW,h,12);c.clip();
   c.fillStyle=t.c;c.fillRect(x,ry,GW,rowH);c.restore()}
  const on=big&&won,fg=on?t.f:INK;
  if(seed)txBox(c,String(seed),x+sdX,ry+(rowH-31)/2,{size:23,weight:700,lh:31,
   track:-.8,color:on?fade(t.f,.8):(S.win[id]&&!won?fade(numc(k),.55):numc(k))});
  logo(c,t,x+mkX,ry+(rowH-mkW)/2,mkW);
  txBox(c,t.name,x+nmX,ry+(rowH-nmL)/2,{size:nmS,weight:won?700:400,lh:nmL,
   color:fg,track:-.026*nmS,max:GW-nmX-18})});
 rule(c,y+rowH,x,x+GW,HR,1);
 c.save();rrect(c,x+.5,y+.5,GW-1,h-1,12);c.strokeStyle=LN;c.lineWidth=1;c.stroke();c.restore()}

const SPAN=[2,3,6],GX=[40,394,748];
function conference(c,B,conf,cfTop,bandH){
 txBox(c,conf,41,cfTop,{size:28,weight:700,lh:41,track:.7});
 const bt=cfTop+41,rows=bandH/6,out=[];
 [0,1,2].forEach(r=>{
  const n=[3,2,1][r],span=SPAN[r];
  for(let i=0;i<n;i++){
   const id=conf+'-'+['wc','dv','cc'][r]+(r===2?'':i);
   const gy=bt+(i*span)*rows+(span*rows-GH)/2;
   game(c,B[id],id,GX[r],gy);
   out.push({r,id,x:GX[r],y:gy,cx:GX[r]+GW/2,cy:gy+GH/2})}});
 return {games:out,bottom:bt+bandH}}

function joints(c,A,B){
 if(!A.length||!B.length)return;
 const x=(Math.max(...A.map(p=>p.x+GW))+Math.min(...B.map(p=>p.x)))/2;
 const ys=[...A,...B].map(p=>p.cy);
 c.beginPath();
 if(Math.max(...ys)-Math.min(...ys)>1){c.moveTo(x,Math.min(...ys));c.lineTo(x,Math.max(...ys))}
 A.forEach(p=>{c.moveTo(p.x+GW,p.cy);c.lineTo(x,p.cy)});
 B.forEach(p=>{c.moveTo(x,p.cy);c.lineTo(p.x,p.cy)});
 c.stroke()}

function drawBracket(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 const B=bracket(),sb=B.sb,a=sb.home?T[sb.home]:null,n=sb.away?T[sb.away]:null;
 const ch=champion(),T1=ch?T[ch]:null,tf=T1?T1.f:'#fff';
 /* Two marks, two names, a vs and four gaps have to cross the card: Commanders
    against Buccaneers runs off the right edge at the size Bills against Jets
    sits at comfortably. Both names come down together and by the same step, or
    one club ends up set larger than the one it is playing. */
 const an=a?a.name:'—',nn=n?n.name:'—';
 const room=W-40-40-86-86-20*4-measure(c,'vs',{size:40,weight:600,track:-.82});
 let ns=74;
 while(ns>44&&measure(c,an,{size:ns,weight:700,track:-.036*ns})
  +measure(c,nn,{size:ns,weight:700,track:-.036*ns})>room)ns-=1;
 header(c,{tc:T1?T1.c:INK,tf,
  items:[{logo:1,k:sb.home,y:87,size:86},
   {text:an,y:89,size:ns,weight:700,lh:82,track:-.036*ns},
   {text:'vs',y:100.5,size:40,weight:600,lh:59,color:fade(tf,.55),track:-.82},
   {text:nn,y:89,size:ns,weight:700,lh:82,track:-.036*ns},
   {logo:1,k:sb.away,y:87,size:86}],
  subX:146,subTop:183,subLh:27,subBold:'Super Bowl matchup'});

 txBox(c,'Playoff bracket',40,278,{size:35,weight:700,lh:38.5,track:-1.05});
 const cfTop=336.5,seam=34,bandH=440.7;
 const afc=conference(c,B,'AFC',cfTop,bandH);
 const nfc=conference(c,B,'NFC',afc.bottom+seam,bandH);
 const fy=afc.bottom+seam/2,sbh=124,sbx=GX[2];
 c.save();c.strokeStyle='rgba(25,25,23,.24)';c.lineWidth=1.5;
 [afc,nfc].forEach((band,i)=>{
  const col=r=>band.games.filter(g=>g.r===r);
  joints(c,col(0),col(1));joints(c,col(1),col(2));
  const cc=col(2)[0];if(!cc)return;
  c.beginPath();c.moveTo(cc.cx,i?cc.y:cc.y+GH);
  c.lineTo(cc.cx,i?fy+sbh/2:fy-sbh/2);c.stroke()});
 c.restore();
 game(c,sb,'sb',sbx,fy-sbh/2,true)}

/* ---- assets ---------------------------------------------------------------
   Every face has to be resident before the first stroke or the browser
   silently falls back to the system sans, and drawImage on a half-loaded image
   draws nothing and reports no error. */
const FACES=['400 16px Sohne','500 16px Sohne','600 16px Sohne','700 16px Sohne'];
const IMG={};
const pic=src=>new Promise(res=>{const im=new Image();
 im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});
function loadArt(){
 const jobs=TEAMS.map(t=>{const src=logoOf(t);
  return src?pic(src).then(im=>{if(im)IMG[t.k]=im}):null}).filter(Boolean);
 jobs.push(pic('art/lombardi.png').then(im=>{if(im)IMG['@trophy']=im}));
 ['mvp','opoy','dpoy'].forEach(k=>{const a=S.award[k]||{};
  const src=a.player&&shotOf(a.player);
  if(src)jobs.push(pic(src).then(im=>{if(im)IMG['@'+shotKey(a.player)]=im}))});
 return Promise.all(jobs)}
let READY=null;
const ready=()=>READY=Promise.all([
  Promise.all(FACES.map(f=>document.fonts.load(f))).then(()=>document.fonts.ready),
  loadArt()]).catch(()=>{});

async function paint(){
 const one=$('#card1'),two=$('#card2');
 if(!one||!two)return;
 [one,two].forEach(cv=>{cv.width=W*SCALE;cv.height=H*SCALE});
 await ready();
 drawSeason(one.getContext('2d'));
 drawBracket(two.getContext('2d'))}

/* The preview is a thumbnail; this is the card. A data URL rather than the
   canvas itself, so the live one keeps painting behind it — and so a phone can
   press and hold the picture to save or send it, which is the sentence already
   under the buttons. */
function zoom(cv,label){
 const box=document.createElement('div');
 box.className='lightbox';
 box.innerHTML=`<div class="lbin"><img alt="${esc(label)}"></div>`
  +`<button class="lbx" type="button" aria-label="Close">\u2715</button>`;
 const img=box.querySelector('img');
 img.src=cv.toDataURL('image/png');
 const key=e=>{if(e.key==='Escape')close()};
 const close=()=>{box.remove();document.removeEventListener('keydown',key)};
 box.onclick=e=>{if(e.target!==img)close()};
 document.addEventListener('keydown',key);
 document.body.appendChild(box);
 /* open on the middle of the card rather than against its left edge — after
    the picture has a width, or there is nothing yet to be off-centre */
 const centre=()=>{box.scrollLeft=(box.scrollWidth-box.clientWidth)/2};
 img.complete?centre():img.addEventListener('load',centre,{once:true})}

function download(cv,suffix){
 const nm=(S.name||'picks').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')
  .replace(/^-|-$/g,'');
 cv.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=`nfl-2026-${nm||'picks'}-${suffix}.png`;a.click();
  setTimeout(()=>URL.revokeObjectURL(u),1000)},'image/png')}

SEC.share={render(){
 return `<div class="sheet">
<header class="phx">
<h1>Your cards</h1>
</header>
<section class="sect">
<div class="sh"><h4>Name</h4></div>
<input class="awin wide" id="who" type="text" value="${esc(S.name||'')}"
 placeholder="Your name" autocomplete="name" spellcheck="false" aria-label="Your name">
</section>
<section class="sect">
<div class="sh act"><h4>The season</h4>
<button class="dlb" id="dl1">Save picture</button></div>
<div class="cardwrap"><canvas id="card1" role="img"
 aria-label="Your 2026 conference seeding and award picks"></canvas></div>
</section>
<section class="sect">
<div class="sh act"><h4>The playoffs</h4>
<button class="dlb" id="dl2">Save picture</button></div>
<div class="cardwrap"><canvas id="card2" role="img"
 aria-label="Your 2026 playoff bracket"></canvas></div>
<div class="acts">
<button class="ghost" id="again">Start over</button>
</div>
<p class="hint">Click a picture to see it whole. On a phone you can also press
and hold one to save or send it.</p>
</section>
</div>`},
after(root){
 const who=root.querySelector('#who');
 who.oninput=()=>{S.name=who.value;save();paint()};
 paint();
 root.querySelector('#dl1').onclick=()=>download($('#card1'),'season');
 root.querySelector('#dl2').onclick=()=>download($('#card2'),'bracket');
 [['#card1','The season'],['#card2','The playoffs']].forEach(([sel,label])=>{
  const cv=root.querySelector(sel);
  cv.parentElement.onclick=()=>zoom(cv,label)});
 root.querySelector('#again').onclick=()=>{
  if(!confirm('Clear every pick and start again?'))return;
  S=blank();save();location.hash='seeds';render()}}};
})();
