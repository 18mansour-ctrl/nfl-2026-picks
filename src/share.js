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

/* One bracket cell: two stacked slots in a rounded box, the winner's side
   filled with its own colour. Same object as the one on screen, drawn rather
   than laid out. */
const SLOT=34,GAME=SLOT*2,GGAP=18;
function cell(c,g,id,x,y,w){
 c.save();rrect(c,x,y,w,GAME,7);c.fillStyle='#FFFDF7';c.fill();
 c.shadowColor='rgba(25,25,23,.16)';c.shadowBlur=10;c.shadowOffsetY=3;c.fill();c.restore();
 ['home','away'].forEach((side,i)=>{
  const k=g[side],t=k?T[k]:null,won=S.win[id]===k;
  const sy=y+i*SLOT,seed=side==='home'?g.hs:g.as;
  if(won){c.save();rrect(c,x,sy,w,SLOT,i?0:7);c.beginPath();
   c.rect(x,sy+(i?0:4),w,SLOT-(i?4:4));c.clip();
   rrect(c,x,y,w,GAME,7);c.fillStyle=tint(t.c,.20);c.fill();c.restore()}
  if(i){c.fillStyle=LINE;c.fillRect(x,sy,w,1)}
  if(!t){tx(c,'—',x+14,sy+SLOT/2+6,{size:14,weight:400,color:FNT});return}
  if(seed)tx(c,String(seed),x+15,sy+SLOT/2+5,{size:11,weight:600,color:won?MUT:FNT,align:'center'});
  logo(c,t,x+26,sy+(SLOT-22)/2,22);
  tx(c,t.k,x+56,sy+SLOT/2+6,{size:16,weight:won?700:600,color:INK,track:-.2,max:w-66})});
}
/* the same gather-and-redraw the screen draws: three into a spine, two out */
function joins(c,fromYs,toYs,x1,x2){
 const sp=(x1+x2)/2,ys=fromYs.concat(toYs);
 c.save();c.strokeStyle='rgba(25,25,23,.22)';c.lineWidth=1;c.beginPath();
 c.moveTo(sp,Math.min(...ys));c.lineTo(sp,Math.max(...ys));
 fromYs.forEach(y=>{c.moveTo(x1,y);c.lineTo(sp,y)});
 toYs.forEach(y=>{c.moveTo(sp,y);c.lineTo(x2,y)});
 c.stroke();c.restore()}

function drawConf(c,B,conf,y){
 const inner=W-PAD*2,colW=(inner-40)/3,sw=colW-8;
 const xs=[PAD,PAD+colW+20,PAD+(colW+20)*2];
 tx(c,conf,PAD,y,{size:20,weight:700,color:INK,track:.4});
 const bye=seedsOf(conf)[0];
 if(bye)tx(c,T[bye].name+' on the bye',W-PAD,y,{size:15,weight:400,color:FNT,align:'right'});
 const top=y+42;
 const ids=[[conf+'-wc0',conf+'-wc1',conf+'-wc2'],[conf+'-dv0',conf+'-dv1'],[conf+'-cc']];
 const span=3*GAME+2*GGAP;
 const centres=ids.map(col=>{
  const h=col.length*GAME+(col.length-1)*GGAP,off=(span-h)/2;
  return col.map((_,i)=>top+off+i*(GAME+GGAP)+GAME/2)});
 ids.forEach((col,ci)=>{
  tx(c,['Wild Card','Divisional','Championship'][ci],xs[ci]+sw/2,top-14,
   {size:12,weight:700,color:FNT,track:1.2,align:'center'});
  col.forEach((id,i)=>cell(c,B[id],id,xs[ci],centres[ci][i]-GAME/2,sw))});
 for(let i=0;i<2;i++)joins(c,centres[i],centres[i+1],xs[i]+sw,xs[i+1]);
 return top+span}

function draw(c){
 c.setTransform(SCALE,0,0,SCALE,0,0);
 c.fillStyle=PAPER;c.fillRect(0,0,W,H);
 const B=bracket(),ch=champion(),T1=ch?T[ch]:null;

 tx(c,'2026 NFL PREDICTIONS',PAD,110,{size:19,weight:700,color:MUT,track:2.2});
 const who=(S.name||'').trim();
 tx(c,who||'My picks',PAD,174,{size:52,weight:700,color:INK,track:-1.4,max:W-PAD*2});

 /* the champion, which is the point of the card */
 const cy=214,chH=196;
 if(T1){
  c.save();rrect(c,PAD,cy,W-PAD*2,chH,16);c.fillStyle=tint(T1.c,.15);c.fill();
  c.fillStyle=T1.c;rrect(c,PAD,cy,9,chH,4.5);c.fill();c.restore();
  logo(c,T1,W-PAD-158,cy+30,136);
  tx(c,'CHAMPION',PAD+36,cy+50,{size:15,weight:700,color:MUT,track:2});
  tx(c,T1.city,PAD+36,cy+104,{size:38,weight:400,color:INK,track:-.9,max:W-PAD*2-240});
  tx(c,T1.name,PAD+36,cy+158,{size:50,weight:700,color:INK,track:-1.5,max:W-PAD*2-240});
 }

 /* the bracket */
 let y=cy+chH+74;
 label(c,'The bracket',y);
 y+=64;
 y=drawConf(c,B,'AFC',y)+56;
 y=drawConf(c,B,'NFC',y)+48;

 /* the final, as one wide cell */
 const sb=B['sb'],sw2=(W-PAD*2-90)/2;
 tx(c,'SUPER BOWL',W/2,y,{size:13,weight:700,color:FNT,track:1.6,align:'center'});
 y+=16;
 [['home',PAD],['away',PAD+sw2+90]].forEach(([side,x])=>{
  const k=sb[side],t=k?T[k]:null,won=S.win['sb']===k;
  c.save();rrect(c,x,y,sw2,84,10);c.fillStyle=t&&won?tint(t.c,.20):'#FFFDF7';c.fill();
  c.shadowColor='rgba(25,25,23,.16)';c.shadowBlur=10;c.shadowOffsetY=3;c.fill();c.restore();
  if(!t){tx(c,'—',x+sw2/2,y+50,{size:20,weight:400,color:FNT,align:'center'});return}
  logo(c,t,x+18,y+20,44);
  tx(c,t.city,x+76,y+38,{size:16,weight:400,color:MUT,max:sw2-90});
  tx(c,t.name,x+76,y+66,{size:24,weight:won?700:600,color:INK,track:-.5,max:sw2-90})});
 tx(c,'v',W/2,y+50,{size:15,weight:400,color:FNT,align:'center'});
 y+=84+58;

 /* the eight, on one line a conference */
 label(c,'Division winners',y);
 y+=54;
 CONFS.forEach((conf,ci)=>{
  const ry=y+ci*54;
  tx(c,conf,PAD,ry,{size:17,weight:700,color:MUT,track:.4});
  DIVS.forEach((d,di)=>{
   const k=S.div[divKey(conf,d)],t=k?T[k]:null;
   const x=PAD+62+di*((W-PAD*2-62)/4);
   tx(c,d,x,ry,{size:15,weight:400,color:FNT});
   if(t){logo(c,t,x+46,ry-20,26);
    tx(c,t.k,x+80,ry,{size:19,weight:600,color:INK,track:-.2})}
   else tx(c,'—',x+80,ry,{size:19,weight:400,color:FNT})})});
 y+=54*2+34;

 /* the three names */
 label(c,'Awards',y);
 y+=54;
 [['mvp','MVP'],['opoy','OPOY'],['dpoy','DPOY']].forEach(([k,l],i)=>{
  const a=S.award[k]||{},t=a.team?T[a.team]:null,ry=y+i*54;
  tx(c,l,PAD,ry,{size:17,weight:400,color:FNT});
  const nm=(a.player||'').trim()||'—';
  tx(c,nm,PAD+118,ry,{size:24,weight:600,color:INK,track:-.4,max:W-PAD*2-260});
  if(t)logo(c,t,W-PAD-36,ry-27,36);
  if(a.odds)tx(c,a.odds,W-PAD-(t?58:0),ry,{size:16,weight:500,color:MUT,align:'right'})});

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
