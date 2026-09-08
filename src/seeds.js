/* Step one: the seeds.
   Predicting all four places in all eight divisions was thirty two taps to
   produce eight answers the rest of the app used — the winners — and twenty
   four that never appeared anywhere again. The winners are picked here
   directly, and the order you pick them in is the order they seed: tapping
   four clubs across four divisions answers who wins and who is better in one
   gesture rather than two passes. The drag is still there to correct it.

   Two separate lists rather than one of seven, because a division winner can
   never fall below the fourth seed and a wild card can never rise above the
   fifth. Making that structural means the drag has no illegal move to reject —
   there is nowhere wrong to drop. */
(()=>{
const GRIP='<span class="gripd"></span><span class="gripd"></span><span class="gripd"></span>'
 +'<span class="gripd"></span><span class="gripd"></span><span class="gripd"></span>';

function row(conf,k,i){
 const t=T[k];
 const drop=i>=4?`data-drop="${esc(k)}"`:`data-unwin="${conf}|${t.div}"`;
 return `<div class="sd full" style="--tc:${t.c};--tf:${t.f}" data-row="${i}"
 data-team="${esc(k)}" data-flip="row:${conf}:${esc(k)}">
<i class="sdn">${i+1}</i>${mark(t,'sm')}
<span class="sdt">${esc(t.city)} ${esc(t.name)}</span>
${i<4?`<em class="sdb">${esc(t.div)}</em>`:''}
<button class="sdx" ${drop} aria-label="Remove ${esc(t.name)}">✕</button>
<button class="grip" data-grip aria-label="Reorder ${esc(t.name)}"
 aria-describedby="griphelp">${GRIP}</button></div>`}

const hole=(i,txt,conf)=>`<div class="sd open" data-row="${i}"
 data-flip="hole:${conf}:${i}"><i class="sdn">${i+1}</i>
<span class="sdt empty">${esc(txt)}</span></div>`;

const chip=(t,attr)=>`<button class="tm" ${attr} data-flip="tm:${t.k}"
 style="--tc:${t.c}">${mark(t)}<span class="tct">${esc(t.city)}</span>
<span class="tnm">${esc(t.name)}</span></button>`;

/* one pool a division, and a division's pool leaves the page the moment it has
   an answer — so what is left on screen is always what is left to decide */
function divPools(conf){
 const need=DIVS.filter(d=>!winOfDiv(conf,d));
 if(!need.length)return '';
 return need.map(d=>`<div data-flip="dp:${conf}:${d}">
<p class="bandl wc">${conf} ${esc(d)}</p>
<div class="tms pool">${confTeams(conf).filter(t=>t.div===d)
 .map(t=>chip(t,`data-win="${conf}|${esc(d)}|${t.k}"`)).join('')}</div></div>`).join('')}

function conference(conf){
 const ord=ordOf(conf),wild=wildOf(conf),done=divDone(conf);
 const taken=new Set(ord.concat(wild));
 const pool=confTeams(conf).filter(t=>!taken.has(t.k));
 return `<section class="sect" data-flip="sect:${conf}">
<div class="sh"><h4>${conf}</h4></div>
<p class="bandl">Division winners${ord.length>1?' <em>drag to order</em>':''}</p>
<div class="seeds" data-band="${conf}:ord">${[0,1,2,3]
 .map(i=>ord[i]?row(conf,ord[i],i):hole(i,'Pick a division winner below',conf)).join('')}</div>
${divPools(conf)}
${done?`<p class="bandl wc" data-flip="band:${conf}:wild">Wild cards</p>
<div class="seeds" data-band="${conf}:wild">${[0,1,2]
 .map(i=>wild[i]?row(conf,wild[i],i+4):hole(i+4,'Wild card — tap a team below',conf)).join('')}</div>
${wild.length<3?`<div class="tms pool" data-flip="pool:${conf}">${pool
 .map(t=>chip(t,`data-seed="${conf}" data-k="${t.k}"`)).join('')}</div>`:''}`:''}
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
 /* the pick and the seed are one tap: a winner takes the next slot going down,
    and the drag is what changes its mind */
 root.querySelectorAll('[data-win]').forEach(b=>b.onclick=()=>{
  const [conf,div,k]=b.dataset.win.split('|');
  flipRender(()=>{S.divw[divKey(conf,div)]=k;
   const o=(S.ord[conf]||[]).filter(Boolean);
   if(!o.includes(k))o.push(k);S.ord[conf]=o})});
 root.querySelectorAll('[data-unwin]').forEach(b=>b.onclick=()=>{
  const [conf,div]=b.dataset.unwin.split('|');
  flipRender(()=>{delete S.divw[divKey(conf,div)]})});
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
 /* The seed number is the only thing on a row that the row's position decides.
    The badge beside the name is the club's division, which travels with the
    club — it used to read "bye" and belong to whatever sat at the top, and the
    code that moved it from row to row outlived the label it was moving. */
 const commit=order=>{
  S[which][conf]=order.slice();
  reconcile();save();
  [...list.children].forEach((r,i)=>{const n=r.querySelector('.sdn');
   if(n)n.textContent=off+i+1;r.dataset.row=off+i});
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
