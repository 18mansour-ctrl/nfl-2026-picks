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
