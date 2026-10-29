/* QLD Agent Finder: homes for sale (browse, property page, homepage strip). Reads the public_listings view. */
(function(){
var PH='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#efe4d6"/><path d="M110 170l90-70 90 70v70H110z" fill="#d9c7b3"/><path d="M95 175l105-85 105 85" fill="none" stroke="#c79a52" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>');
function E(s){return esc(s)}
function thumb(u){return u?u.replace(/\.(jpe?g|png|webp)$/i,'-t.$1'):PH}
var IC={bed:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.5"/></svg>',bath:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',car:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM7 13h.01M17 13h.01"/></svg>',land:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4zM4 12h16M12 4v16"/></svg>'};
function facts(l){var f=[];if(l.beds!=null)f.push('<li title="Bedrooms">'+IC.bed+' '+l.beds+'</li>');if(l.baths!=null)f.push('<li title="Bathrooms">'+IC.bath+' '+l.baths+'</li>');if(l.cars!=null)f.push('<li title="Car spaces">'+IC.car+' '+l.cars+'</li>');if(l.land_m2)f.push('<li title="Land size">'+IC.land+' '+Number(l.land_m2).toLocaleString('en-AU')+' m²</li>');return f.join('')}
window.homeCard=function(l){var sold=l.status==='sold',n=(l.photos||[]).length;
 return '<a class="home" href="property.html?id='+encodeURIComponent(l.id)+'"><div class="hph"><img src="'+E(thumb((l.photos||[])[0]))+'" data-full="'+E((l.photos||[])[0]||PH)+'" alt="" loading="lazy" width="600" height="420" onerror="this.onerror=null;this.src=this.dataset.full">'+(sold?'<span class="ribbon">SOLD</span>':(l.featured?'<span class="ribbon feat">Featured</span>':''))+(n>1?'<span class="pcount">'+n+' photos</span>':'')+'</div>'+
 '<div class="hb"><div class="hp">'+E(l.price_display)+'</div><h3>'+E(l.title)+'</h3><div class="hs">'+E([l.address_line,l.suburb+' QLD'+(l.postcode?' '+l.postcode:'')].filter(Boolean).join(', '))+'</div><ul class="hf">'+facts(l)+'</ul><div class="ha">'+E(l.property_type)+' · '+E(l.agent_name)+(l.agent_agency?', '+E(l.agent_agency):'')+'</div></div></a>'};
function load(q){return api('public_listings?select=*'+(q||'')).then(function(r){return r.ok?r.json():[]}).catch(function(){return []})}
window.QAF_loadHomes=load;

/* ---- browse page ---- */
var grid=document.getElementById('homesGrid');
if(grid){var all=[],shown=12,$=function(s){return document.getElementById(s)};
 var rg=$('hRegion');(window.QAF_REGIONS||[]).forEach(function(r){var o=document.createElement('option');o.value=o.textContent=r;rg.appendChild(o)});
 var PR=[0,400000,500000,600000,700000,800000,1000000,1250000,1500000,2000000];
 ['hMin','hMax'].forEach(function(id,i){var s=$(id);var o=document.createElement('option');o.value='';o.textContent=i?'Max price':'Min price';s.appendChild(o);PR.slice(1).forEach(function(p){var x=document.createElement('option');x.value=p;x.textContent=p>=1000000?'$'+(p/1000000)+'m':'$'+(p/1000)+'k';s.appendChild(x)})});
 var p=new URLSearchParams(location.search);if(p.get('region'))rg.value=p.get('region');if(p.get('q'))$('hQ').value=p.get('q');
 function draw(){var q=$('hQ').value.trim().toLowerCase(),reg=rg.value,t=$('hType').value,mn=+$('hMin').value||0,mx=+$('hMax').value||0,bd=+$('hBeds').value||0,so=$('hSort').value;
  var list=all.filter(function(l){if(reg&&l.region!==reg)return false;if(t&&l.property_type!==t)return false;if(bd&&(l.beds||0)<bd)return false;if((mn||mx)&&l.price_num==null)return false;if(mn&&l.price_num<mn)return false;if(mx&&l.price_num>mx)return false;
   if(q&&(l.suburb+' '+l.postcode+' '+l.title+' '+(l.address_line||'')).toLowerCase().indexOf(q)<0)return false;return true});
  list.sort(function(a,b){if(so==='low')return (a.price_num==null)-(b.price_num==null)||a.price_num-b.price_num;if(so==='high')return (a.price_num==null)-(b.price_num==null)||b.price_num-a.price_num;return (a.status==='sold')-(b.status==='sold')||(!!b.featured)-(!!a.featured)||new Date(b.published_at||0)-new Date(a.published_at||0)});
  $('hCount').textContent=list.length+' home'+(list.length===1?'':'s')+' found';
  grid.innerHTML=list.slice(0,shown).map(window.homeCard).join('');
  $('hMore').hidden=list.length<=shown;
  $('hEmpty').hidden=list.length>0;
  $('hEmpty').querySelector('.hemsg').textContent=all.length?'No homes match these filters. Try widening your search.':'No homes are listed yet. Agents are adding their listings now.';
  if(window.qafReveal)window.qafReveal()}
 ['hQ','hRegion','hType','hMin','hMax','hBeds','hSort'].forEach(function(id){$(id).addEventListener('input',function(){shown=12;draw()})});
 $('hMore').addEventListener('click',function(){shown+=12;draw()});
 $('hClear').addEventListener('click',function(){['hQ','hRegion','hType','hMin','hMax','hBeds'].forEach(function(id){$(id).value=''});draw()});
 load('&order=published_at.desc').then(function(r){all=r;draw()})}

/* ---- property page ---- */
var prop=document.getElementById('property');
if(prop){var id=new URLSearchParams(location.search).get('id');
 load('&id=eq.'+encodeURIComponent(id||'none')).then(function(r){var l=r[0];
  if(!l){prop.innerHTML='<div class="wrap" style="max-width:720px;padding:64px 0"><h1>This property is no longer available</h1><p>It may have been sold or withdrawn, or the link is wrong.</p><p><a class="btn btn-gold" href="for-sale.html">See homes for sale</a></p></div>';return}
  document.title=l.title+' | '+l.suburb+' | QLD Agent Finder';
  var ph=l.photos&&l.photos.length?l.photos:[PH],cur=0,sold=l.status==='sold';
  var addr=[l.address_line,l.suburb+' QLD'+(l.postcode?' '+l.postcode:'')].filter(Boolean).join(', ');
  var feat=(l.features||[]).length?'<h2>Features</h2><ul class="feat">'+l.features.map(function(f){return '<li>'+E(f)+'</li>'}).join('')+'</ul>':'';
  var extra=(l.open_homes?'<div class="pinfo"><b>Open home</b><span>'+E(l.open_homes)+'</span></div>':'')+(l.auction_at?'<div class="pinfo"><b>Auction</b><span>'+E(new Date(l.auction_at).toLocaleString('en-AU',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}))+'</span></div>':'');
  var url=location.href.split('#')[0];if(!sold){try{api('rpc/bump_listing_view',{method:'POST',body:JSON.stringify({p_id:l.id})})}catch(e){}}
  prop.innerHTML='<div class="wrap"><nav class="breadcrumb2" aria-label="Breadcrumb"><a href="index.html">Home</a> › <a href="for-sale.html">Homes for sale</a> › '+E(l.suburb)+'</nav>'+
  '<div class="pgrid"><div class="pmain">'+
  '<div class="gal"><div class="gmain"><img id="gImg" src="'+E(ph[0])+'" alt="Photo 1 of '+ph.length+': '+E(l.title)+'" width="1200" height="800">'+(sold?'<span class="ribbon big">SOLD</span>':'')+(ph.length>1?'<button class="gnav prev" aria-label="Previous photo" type="button">‹</button><button class="gnav next" aria-label="Next photo" type="button">›</button><span class="pcount" id="gCount">1 / '+ph.length+'</span>':'')+'</div>'+(ph.length>1?'<div class="gthumbs" role="list">'+ph.map(function(u,i){return '<button type="button" role="listitem" data-i="'+i+'" class="'+(i?'':'on')+'" aria-label="Show photo '+(i+1)+'"><img src="'+E(thumb(u))+'" alt="" loading="lazy" onerror="this.onerror=null;this.src=\''+E(u)+'\'"></button>'}).join('')+'</div>':'')+'</div>'+
  '<div class="phead"><div class="hp big">'+E(l.price_display)+'</div><h1>'+E(l.title)+'</h1><p class="hs">'+E(addr)+'</p><ul class="hf big">'+facts(l)+'</ul></div>'+
  extra+(l.description?'<h2>About this home</h2><div class="pdesc">'+E(l.description)+'</div>':'')+feat+
  '<p class="small pnote">Listing details are provided by the agent. QLD Agent Finder does not verify listings or act as the agent. Check details and get independent advice before you buy.</p></div>'+
  '<aside class="pside"><div class="agentbox"><div class="agent-top">'+(l.agent_photo?'<img class="avatar" src="'+E(l.agent_photo)+'" alt="" style="object-fit:cover">':'<div class="avatar" aria-hidden="true">'+E(qafInitials(l.agent_name))+'</div>')+'<div><h3>'+(l.agent_id?'<a href="agent.html?id='+encodeURIComponent(l.agent_id)+'" style="color:inherit;text-decoration:none">'+E(l.agent_name)+'</a>':'<span class="pownerbadge">Private seller</span>')+'</h3><div class="ag">'+E(l.agent_agency||'')+(l.agent_verified?' · ✓ Verified':'')+'</div></div></div>'+
  (sold?'<p><b>This property has sold.</b></p><a class="btn btn-gold" href="for-sale.html">See homes for sale</a>':
  '<form id="enqForm" novalidate><h2>Ask about this home</h2><div class="field"><label for="eN">Your name</label><input id="eN" name="name" autocomplete="name" required></div><div class="field"><label for="eE">Email</label><input id="eE" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="eP">Phone (optional)</label><input id="eP" name="phone" type="tel" autocomplete="tel"></div><div class="field"><label for="eM">Message</label><textarea id="eM" name="message" rows="4" required>Hi, I\'m interested in '+E(l.title)+'. Could you send me more information?</textarea></div><p hidden><label>Leave empty <input name="hp" tabindex="-1" autocomplete="off"></label></p><label class="chk"><input type="checkbox" id="eC"> I agree that my details are sent to the '+(l.agent_id?'listing agent':'owner')+' and QLD Agent Finder. <a href="privacy.html">Privacy</a></label><div class="err" role="alert" id="eErr"></div><button class="btn btn-maroon" type="submit" style="width:100%">Send enquiry</button></form><div id="eOk" hidden class="eok"><b>Enquiry sent.</b><p>'+E(l.agent_id?l.agent_name.split(' ')[0]:'The owner')+' will reply by email or phone.</p></div>')+
  '</div><div class="sharebox"><b>Share</b><button type="button" class="btn btn-ghost sm" id="shCopy">Copy link</button><a class="btn btn-ghost sm" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(l.title+' '+url)+'">WhatsApp</a><a class="btn btn-ghost sm" href="mailto:?subject='+encodeURIComponent(l.title)+'&body='+encodeURIComponent(url)+'">Email</a><a class="btn btn-ghost sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(addr)+'">Map</a></div><p class="small"><a href="mailto:contact@qldagentfinder.com.au?subject='+encodeURIComponent('Report listing '+l.id)+'">Report this listing</a></p></aside></div>'+
  '<section id="similar" hidden><h2>More homes nearby</h2><div class="grid3" id="simGrid"></div></section></div>';
  function go(i){cur=(i+ph.length)%ph.length;var im=document.getElementById('gImg');im.src=ph[cur];im.alt='Photo '+(cur+1)+' of '+ph.length+': '+l.title;var c=document.getElementById('gCount');if(c)c.textContent=(cur+1)+' / '+ph.length;Array.prototype.forEach.call(prop.querySelectorAll('.gthumbs button'),function(b,j){b.classList.toggle('on',j===cur)})}
  var pv=prop.querySelector('.prev'),nx=prop.querySelector('.next');if(pv){pv.onclick=function(){go(cur-1)};nx.onclick=function(){go(cur+1)}}
  Array.prototype.forEach.call(prop.querySelectorAll('.gthumbs button'),function(b){b.onclick=function(){go(+b.dataset.i)}});
  prop.querySelector('.gal').addEventListener('keydown',function(e){if(e.key==='ArrowLeft')go(cur-1);if(e.key==='ArrowRight')go(cur+1)});
  var cp=document.getElementById('shCopy');if(cp)cp.onclick=function(){try{navigator.clipboard.writeText(url);cp.textContent='Copied ✓'}catch(e){prompt('Copy this link',url)}};
  var f=document.getElementById('enqForm');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();var er=document.getElementById('eErr'),b=f.querySelector('[type=submit]');er.textContent='';
   if(f.elements.hp.value){location.href='thank-you.html';return}
   var name=f.elements.name.value.trim(),em=f.elements.email.value.trim(),msg=f.elements.message.value.trim();
   if(name.length<2||!/^\S+@\S+\.\S+$/.test(em)||msg.length<2){er.textContent='Please add your name, a valid email and a message.';return}
   if(!document.getElementById('eC').checked){er.textContent='Please tick the box to continue.';return}
   b.disabled=true;b.textContent='Sending…';
   api('listing_enquiries',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({listing_id:l.id,name:name,email:em,phone:f.elements.phone.value.trim()||null,message:msg,consent:true})}).then(function(r){
    if(r.ok){f.hidden=true;document.getElementById('eOk').hidden=false;return}
    return r.json().catch(function(){return{}}).then(function(j){throw new Error(/Too many/.test(j.message||'')?'Too many requests. Please try again later.':/no longer available/.test(j.message||'')?'Sorry, this home is no longer available.':'Sorry, something went wrong. Please try again or email contact@qldagentfinder.com.au')})
   }).catch(function(x){b.disabled=false;b.textContent='Send enquiry';er.textContent=x.message})});
  load('&region=eq.'+encodeURIComponent(l.region)+'&id=neq.'+encodeURIComponent(l.id)+'&limit=3&order=published_at.desc').then(function(s){if(s.length){document.getElementById('similar').hidden=false;document.getElementById('simGrid').innerHTML=s.map(window.homeCard).join('')}})})}

/* ---- homepage strip ---- */
var strip=document.getElementById('latestHomes');
if(strip){load('&order=featured.desc,published_at.desc&limit=3').then(function(r){r=r.filter(function(l){return l.status==='live'});if(!r.length)return;document.getElementById('latestGrid').innerHTML=r.map(window.homeCard).join('')})}
})();
