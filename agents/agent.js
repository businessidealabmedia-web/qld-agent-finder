/* QLD Agent Finder — Agent portal */
(function(){
var CFG=window.QAF_CONFIG||{};
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var fmt=function(d){return d?new Date(d).toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric'}):''};
var REGIONS=['Brisbane','Logan','Gold Coast','Sunshine Coast','Ipswich','Moreton Bay','Redlands','Toowoomba','Other QLD'];
var AGENT_ST=[['contacted','Contacted'],['appraisal_booked','Appraisal booked'],['listed','Listed'],['sold','Sold'],['lost','Lost']];
var site=(CFG.siteUrl||'').replace(/\/$/,'');
$('#applyLink').href=site+'/join.html';

if(!CFG.supabaseUrl||!CFG.supabaseAnonKey){$('#setupView').hidden=false;return}
var sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey);
var me=null,leads=[],listings=[],enqs=[],views={},tab='home';

function toast(t,bad){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:'+(bad?'#A3122B':'#0F6B6B')+';color:#fff;padding:12px 20px;border-radius:999px;font-weight:700;z-index:99';document.body.appendChild(d);setTimeout(function(){d.remove()},2800)}

var sentTo='';
(function(){var q=(location.hash||'').replace(/^#/,'');if(!q)return;var p=new URLSearchParams(q);var d=p.get('error_description')||p.get('error');
  if(d){var m=$('#loginMsg');m.className='msg err';m.textContent=(/expired|invalid/i.test(d)?'That login link has expired or was already used. Request a new one below, or use the code from the email.':d.replace(/\+/g,' '));history.replaceState(null,'',location.pathname)}})();
$('#loginForm').addEventListener('submit',async function(e){e.preventDefault();var m=$('#loginMsg');m.className='msg';m.textContent='Sending…';
  sentTo=$('#lEmail').value.trim();
  var r=await sb.auth.signInWithOtp({email:sentTo,options:{shouldCreateUser:true,emailRedirectTo:location.origin+'/'}});
  if(r.error){m.className='msg err';m.textContent=r.error.message;return}
  m.className='msg ok';m.textContent='Check your inbox. We sent you a login link and a code.';$('#codeBox').hidden=false});
$('#codeBtn').addEventListener('click',async function(){var m=$('#loginMsg');var t=$('#lCode').value.replace(/\s/g,'');if(!sentTo)sentTo=$('#lEmail').value.trim();
  if(!sentTo||!t){m.className='msg err';m.textContent='Enter your email, then the code from the email.';return}
  m.className='msg';m.textContent='Checking…';
  var r=await sb.auth.verifyOtp({email:sentTo,token:t,type:'email'});
  if(r.error){m.className='msg err';m.textContent='That code did not work. It may have expired. Request a new one.';return}
  m.textContent=''});
$('#logout').addEventListener('click',async function(){await sb.auth.signOut();location.reload()});
$('#tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(b.dataset.tab)});

var booting=false;
async function boot(){if(booting)return;booting=true;try{
  var s=(await sb.auth.getSession()).data.session;
  if(!s){$('#loginView').hidden=false;$('#appView').hidden=true;return}
  $('#loginView').hidden=true;$('#appView').hidden=false;
  var c=await sb.rpc('claim_agent_profile');
  if(!c.data){$('#tabs').hidden=true;$('#main').innerHTML='<div class="box" style="max-width:560px;margin:40px auto"><h2>No agent profile found</h2><p>We couldn\'t find an application for <b>'+esc(s.user.email)+'</b>.</p><p>Apply first, using this same email, and we\'ll review it within 1–2 business days.</p><div class="row" style="justify-content:flex-start"><a class="btn" href="'+esc(site)+'/join.html">Apply to join</a></div></div>';return}
  var r=await sb.from('agents').select('*').eq('id',c.data).single();me=r.data;
  if(me&&me.status==='approved'){$('#viewPublic').hidden=false;$('#viewPublic').href=site+'/agent.html?id='+me.id}
  await loadLeads();await loadListings();show(tab);
}finally{booting=false}}
async function loadLeads(){var r=await sb.from('leads').select('*').eq('assigned_agent',me.id).order('created_at',{ascending:false});leads=r.data||[];
  var n=leads.filter(function(l){return l.status==='assigned'||l.status==='new'}).length;$('#pLeads').hidden=!n;$('#pLeads').textContent=n}
function show(t){tab=t;$$('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t)});({home:vHome,leads:vLeads,listings:vListings,enq:vEnq,profile:vProfile})[t]()}

function banner(){if(me.status==='approved')return '';
  return '<div class="box" style="max-width:none;margin-bottom:18px;background:#fdf1dc;border-color:#f3dcb0;box-shadow:none"><b>'+(me.status==='pending'?'Your profile is under review.':'Your profile is not public right now.')+'</b> '+(me.status==='pending'?'Complete your details below. We\'ll email you once it\'s live.':'Contact us at contact@qldagentfinder.com.au')+'</div>'}

function completeness(){var a=me,c=[['Profile photo',!!a.photo_url,'profile'],['Bio (40+ characters)',(a.bio||'').length>=40,'profile'],['Suburbs you cover',(a.suburbs||[]).length>0,'profile'],['Specialty',!!a.specialty,'profile'],['Typical fees',!!a.commission,'profile'],['Website',!!a.website,'profile'],['Years and sales numbers',!!(a.years&&a.sold_12m),'profile'],['Post your first home',listings.some(function(l){return l.status!=='draft'}),'listings']];
  return {pct:Math.round(c.filter(function(x){return x[1]}).length/c.length*100),items:c}}
function vHome(){var c=completeness(),live=listings.filter(function(l){return l.status==='live'}).length,pend=listings.filter(function(l){return l.status==='pending'}).length;
  var tv=Object.keys(views).reduce(function(t,k){return t+views[k]},0),newE=enqs.filter(function(e){return e.status==='new'}).length,newL=leads.filter(function(l){return l.status==='assigned'||l.status==='new'}).length;
  var stats=[['New seller leads',newL,'leads'],['Live homes',live,'listings'],['Home page views',tv,'listings'],['New buyer enquiries',newE,'enq']];
  var todo=c.items.filter(function(x){return !x[1]});
  $('#main').innerHTML=banner()+'<h1>Welcome, '+esc((me.name||'').split(' ')[0])+'</h1><div class="stats">'+stats.map(function(s){return '<div class="stat" data-go="'+s[2]+'" style="cursor:pointer"><b>'+s[1]+'</b>'+s[0]+'</div>'}).join('')+'</div>'+
   (pend?'<div class="box" style="max-width:none;margin:14px 0;box-shadow:none"><b>'+pend+' listing'+(pend>1?'s are':' is')+' waiting for review.</b> We usually approve within a day.</div>':'')+
   '<div class="box" style="max-width:none;margin:14px 0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">Profile strength: '+c.pct+'%</h2>'+(me.status==='approved'?'<a class="btn sm ghost" target="_blank" rel="noopener" href="'+site+'/agent.html?id='+me.id+'">View my public profile</a>':'')+'</div>'+
   '<div style="height:10px;background:#efe4d6;border-radius:99px;margin:12px 0;overflow:hidden"><div style="height:100%;width:'+c.pct+'%;background:linear-gradient(90deg,#E8A33D,#0F6B6B)"></div></div>'+
   (todo.length?'<p style="margin:0 0 8px;color:#5E5862">A complete profile ranks and converts better. Still to do:</p><ul style="margin:0;padding-left:20px">'+todo.map(function(x){return '<li><a href="#" data-go="'+x[2]+'">'+esc(x[0])+'</a></li>'}).join('')+'</ul>':'<p style="margin:0;color:#0F6B6B"><b>Your profile is complete. Nice work.</b></p>')+'</div>'+
   (me.status==='approved'?'<div class="row" style="justify-content:flex-start;gap:10px"><button class="btn gold" id="hNew">+ New listing</button><button class="btn ghost" id="hCopy">Copy my profile link</button></div>':'');
  $$('[data-go]').forEach(function(d){d.onclick=function(e){e.preventDefault();show(d.dataset.go)}});
  if($('#hNew'))$('#hNew').onclick=function(){show('listings');listingForm(null)};
  if($('#hCopy'))$('#hCopy').onclick=function(){var u=site+'/agent.html?id='+me.id;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){toast('Link copied ✓')},function(){prompt('Copy this link',u)})}}

function vLeads(){
  $('#main').innerHTML=banner()+'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h1 style="margin:0">My leads</h1>'+(leads.length?'<button class="btn ghost" id="lcsv">Download CSV</button>':'')+'</div>'+(leads.length?'<div class="tbl"><table><thead><tr><th>Received</th><th>Seller</th><th>Property</th><th>Goal / timing</th><th>Status</th><th>My notes</th><th></th></tr></thead><tbody>'+
   leads.map(function(l){return '<tr><td>'+fmt(l.created_at)+'</td><td><b>'+esc(l.name)+'</b><br><a href="tel:'+esc(l.phone)+'">'+esc(l.phone)+'</a><br><a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a></td><td>'+esc([l.address,l.suburb,l.postcode].filter(Boolean).join(', '))+'<br>'+esc([l.property_type,l.bedrooms&&l.bedrooms+' bed',l.bathrooms&&l.bathrooms+' bath'].filter(Boolean).join(' · '))+(l.notes?'<br><i>'+esc(l.notes)+'</i>':'')+'</td><td>'+esc(l.goal)+'<br>'+esc(l.timeframe)+'<br>'+esc(l.price_expectation)+'</td>'+
   '<td><select data-st="'+l.id+'" aria-label="Status">'+(AGENT_ST.some(function(s){return s[0]===l.status})?'':'<option value="'+esc(l.status)+'">New</option>')+AGENT_ST.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===l.status?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select></td>'+
   '<td><textarea data-nt="'+l.id+'" rows="2" aria-label="Notes">'+esc(l.agent_notes)+'</textarea></td><td><button class="btn sm" data-save="'+l.id+'">Save</button></td></tr>'}).join('')+'</tbody></table></div>':'<div class="tbl"><div class="empty">No leads yet. When we match a seller to you, they\'ll appear here, and we\'ll let you know.</div></div>');
  if($('#lcsv'))$('#lcsv').onclick=function(){csvGen(['created_at','status','name','phone','email','address','suburb','postcode','goal','timeframe','agent_notes'],leads,'my-leads')};
  $$('[data-save]').forEach(function(b){b.onclick=async function(){var id=b.dataset.save;var r=await sb.from('leads').update({status:$('[data-st="'+id+'"]').value,agent_notes:$('[data-nt="'+id+'"]').value.trim()}).eq('id',id);
    if(r.error)return toast(r.error.message,true);toast('Saved ✓');await loadLeads()}})}


/* ---------- listings (homes for sale) ---------- */
var TYPES=['House','Unit / Apartment','Townhouse','Land','Acreage'];
var thumbOf=function(u){return u?u.replace(/\.(jpe?g|png|webp)$/i,'-t.$1'):''};
async function loadListings(){var r=await sb.from('listings').select('*').eq('agent_id',me.id).order('updated_at',{ascending:false});listings=r.data||[];
  var e=await sb.from('listing_enquiries').select('*, listings(title,suburb)').order('created_at',{ascending:false});enqs=e.data||[];var vv=await sb.from('listing_views').select('*');views={};(vv.data||[]).forEach(function(v){views[v.listing_id]=v.views});
  var n=enqs.filter(function(x){return x.status==='new'}).length;var pe=$('#pEnq');if(pe){pe.hidden=!n;pe.textContent=n}}
function vListings(){
  var ok=me.status==='approved';
  $('#main').innerHTML=banner()+'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h1 style="margin:0">My listings</h1>'+(ok?'<button class="btn gold" id="newL">+ New listing</button>':'')+'</div>'+
   (ok?'<p style="color:#5E5862">New and edited listings are checked by QLD Agent Finder before they go live, usually within a day.</p>':'<div class="box" style="max-width:none"><b>Listings unlock when your profile is approved.</b></div>')+
   (listings.length?'<div class="tbl"><table><thead><tr><th></th><th>Listing</th><th>Price</th><th>Views / enq.</th><th>Status</th><th></th></tr></thead><tbody>'+listings.map(function(l){return '<tr><td>'+(l.photos&&l.photos[0]?'<img src="'+esc(thumbOf(l.photos[0]))+'" alt="" width="72" height="52" style="border-radius:8px;object-fit:cover" onerror="this.onerror=null;this.src=\''+esc(l.photos[0])+'\'">':'')+'</td><td><b>'+esc(l.title)+'</b><br>'+esc(l.suburb)+'</td><td>'+esc(l.price_display)+'</td><td>'+(views[l.id]||0)+' / '+enqs.filter(function(e){return e.listing_id===l.id}).length+'</td><td><span class="tag '+esc(l.status)+'">'+esc(l.status)+'</span>'+(l.status==='rejected'&&l.admin_notes?'<br><span style="font-size:12px;color:#A3122B">'+esc(l.admin_notes)+'</span>':'')+'</td><td style="white-space:nowrap"><button class="btn sm" data-le="'+l.id+'">Edit</button> <button class="btn sm ghost" data-lc="'+l.id+'" title="Copy details into a new draft (no photos)">Duplicate</button> '+(l.status==='live'?'<a class="btn sm ghost" target="_blank" rel="noopener" href="'+site+'/property.html?id='+l.id+'">View</a> <button class="btn sm ghost" data-ls="'+l.id+'">Mark sold</button> ':'')+(['pending','live','sold'].indexOf(l.status)>-1?'<button class="btn sm ghost" data-lw="'+l.id+'">Withdraw</button>':'')+(['draft','rejected','withdrawn'].indexOf(l.status)>-1?'<button class="btn sm ghost" data-ld="'+l.id+'">Delete</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div>':(ok?'<div class="tbl"><div class="empty">No listings yet. Click “New listing” to add your first home.</div></div>':''));
  if($('#newL'))$('#newL').onclick=function(){listingForm(null)};
  var setSt=async function(id,st){var r=await sb.from('listings').update({status:st}).eq('id',id);if(r.error)return toast(r.error.message,true);toast('Updated ✓');await loadListings();vListings()};
  $$('[data-le]').forEach(function(b){b.onclick=function(){listingForm(listings.find(function(x){return x.id===b.dataset.le}))}});
  $$('[data-lc]').forEach(function(b){b.onclick=function(){var o=listings.find(function(x){return x.id===b.dataset.lc});var c=Object.assign({},o);delete c.id;c.title=o.title;c.status='draft';c.photos=[];c.auction_at=null;listingForm(Object.assign({},c,{_dup:true}))}});
  $$('[data-ls]').forEach(function(b){b.onclick=function(){if(confirm('Mark this home as sold?'))setSt(b.dataset.ls,'sold')}});
  $$('[data-lw]').forEach(function(b){b.onclick=function(){if(confirm('Withdraw this listing? It will no longer show publicly.'))setSt(b.dataset.lw,'withdrawn')}});
  $$('[data-ld]').forEach(function(b){b.onclick=async function(){if(!confirm('Delete this listing permanently?'))return;var r=await sb.from('listings').delete().eq('id',b.dataset.ld);if(r.error)return toast(r.error.message,true);toast('Deleted');await loadListings();vListings()}})}

function resizeTo(file,max,q){return new Promise(function(res,rej){var im=new Image(),u=URL.createObjectURL(file);im.onload=function(){var k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej(new Error('Could not process photo'))},'image/jpeg',q)};im.onerror=function(){rej(new Error('That file is not a valid image'))};im.src=u})}
var BUCKET='listing-photos';
function pathOf(url){var i=url.indexOf('/'+BUCKET+'/');return i<0?null:url.slice(i+BUCKET.length+2)}

function listingForm(l){var isNew=!l||!!l._dup;if(l&&l._dup){delete l._dup}l=l||{status:'draft',photos:[],features:[],region:me.region||'Brisbane',property_type:'House'};
  var photos=(l.photos||[]).slice();
  var inp=function(id,label,val,type,full,ph,attrs){return '<div'+(full?' class="full"':'')+'><label for="'+id+'">'+label+'</label><input id="'+id+'" '+(type?'type="'+type+'" ':'')+'value="'+esc(val==null?'':val)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+(attrs||'')+'></div>'};
  var dt=l.auction_at?new Date(new Date(l.auction_at).getTime()-new Date(l.auction_at).getTimezoneOffset()*60000).toISOString().slice(0,16):'';
  $('#main').innerHTML=banner()+'<p><button class="btn sm ghost" id="lback" type="button">← Back to listings</button></p><h1>'+(isNew?'New listing':'Edit listing')+'</h1>'+(l.status==='rejected'&&l.admin_notes?'<div class="box" style="max-width:none;background:#fbe9ec;border-color:#f1c3cb;box-shadow:none"><b>Needs changes:</b> '+esc(l.admin_notes)+'</div>':'')+(l.status==='live'?'<div class="box" style="max-width:none;background:#fdf1dc;border-color:#f3dcb0;box-shadow:none">This listing is live. If you change it, it goes back for review before the changes show.</div>':'')+
  '<form class="box" style="max-width:860px" id="lf"><div class="grid2">'+
  inp('ltitle','Headline',l.title,'',1,'e.g. Renovated 4 bedroom family home near schools','maxlength="120" required')+
  '<div><label for="ltype">Property type</label><select id="ltype">'+TYPES.map(function(t){return '<option'+(t===l.property_type?' selected':'')+'>'+t+'</option>'}).join('')+'</select></div>'+
  '<div><label for="lregion">Region</label><select id="lregion">'+REGIONS.map(function(r){return '<option'+(r===l.region?' selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
  inp('lsub','Suburb',l.suburb,'',0,'','maxlength="60" required')+inp('lpc','Postcode',l.postcode,'',0,'4123','inputmode="numeric" maxlength="4"')+
  inp('laddr','Street address',l.address_line,'',1,'12 Example Street','maxlength="120"')+
  '<div class="full"><label class="chk"><input type="checkbox" id="lhide"'+(l.hide_address?' checked':'')+'> Hide the street address on the public page</label></div>'+
  inp('lprice','Price wording shown to buyers',l.price_display,'',0,'e.g. Offers over $950,000 or Auction or Contact agent','maxlength="60" required')+
  inp('lpnum','Price number for search filters (optional)',l.price_num,'number',0,'950000','min="0"')+
  inp('lbeds','Bedrooms',l.beds,'number',0,'','min="0" max="20"')+inp('lbaths','Bathrooms',l.baths,'number',0,'','min="0" max="20"')+inp('lcars','Car spaces',l.cars,'number',0,'','min="0" max="20"')+inp('lland','Land size (m²)',l.land_m2,'number',0,'','min="0"')+
  inp('lopen','Open home times',l.open_homes,'',1,'e.g. Saturday 10:00 to 10:30am','maxlength="300"')+
  '<div><label for="lauc">Auction date and time (optional)</label><input id="lauc" type="datetime-local" value="'+esc(dt)+'"></div>'+
  inp('lfeat','Features (comma separated, up to 20)',(l.features||[]).join(', '),'',1,'Air conditioning, Pool, Solar panels')+
  '<div class="full"><label for="ldesc">Description</label><textarea id="ldesc" rows="8" maxlength="4000" placeholder="Describe the home, the location and what buyers will love. Plain text only, no web links.">'+esc(l.description)+'</textarea></div>'+
  '<div class="full"><label>Photos (up to 15). The first photo is the cover.</label><div id="phs" class="phs"></div><input id="lfiles" type="file" accept="image/jpeg,image/png,image/webp" multiple><div style="font-size:12px;color:#5E5862">Photos are resized automatically. Use landscape photos of the home you are selling.</div></div></div>'+
  '<p style="font-size:13px;color:#5E5862">By submitting you confirm you are authorised to advertise this property, the details are accurate, and the price shown is not misleading under Queensland property laws. QLD Agent Finder may remove or ask you to change any listing.</p>'+
  '<div class="row"><button type="button" class="btn ghost" id="lsave">Save draft</button><button type="submit" class="btn gold" id="lsubmit">'+(l.status==='live'?'Save changes (re-check)':'Submit for review')+'</button></div><p class="msg err" id="lmsg" role="alert"></p></form>';
  var drawP=function(){$('#phs').innerHTML=photos.map(function(u,i){return '<div class="ph"><img src="'+esc(thumbOf(u))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(u)+'\'">'+(i===0?'<span class="cv">Cover</span>':'')+'<div class="pa"><button type="button" data-pm="'+i+'" aria-label="Make cover">★</button><button type="button" data-pl="'+i+'" aria-label="Move earlier">←</button><button type="button" data-pr="'+i+'" aria-label="Move later">→</button><button type="button" data-px="'+i+'" aria-label="Remove">✕</button></div></div>'}).join('');
    $$('[data-pm]').forEach(function(b){b.onclick=function(){var i=+b.dataset.pm;photos.unshift(photos.splice(i,1)[0]);drawP()}});
    $$('[data-pl]').forEach(function(b){b.onclick=function(){var i=+b.dataset.pl;if(i>0){photos.splice(i-1,0,photos.splice(i,1)[0]);drawP()}}});
    $$('[data-pr]').forEach(function(b){b.onclick=function(){var i=+b.dataset.pr;if(i<photos.length-1){photos.splice(i+1,0,photos.splice(i,1)[0]);drawP()}}});
    $$('[data-px]').forEach(function(b){b.onclick=function(){var i=+b.dataset.px,u=photos.splice(i,1)[0];var pa=pathOf(u);if(pa&&l.photos.indexOf(u)<0){sb.storage.from(BUCKET).remove([pa,pa.replace(/\.jpg$/,'-t.jpg')])}drawP()}})};
  drawP();
  $('#lback').onclick=function(){vListings()};
  $('#lfiles').addEventListener('change',async function(){var files=Array.prototype.slice.call(this.files),m=$('#lmsg');m.className='msg';
    if(photos.length+files.length>15){m.className='msg err';m.textContent='You can add up to 15 photos.';this.value='';return}
    var uid=(await sb.auth.getUser()).data.user.id;m.textContent='Uploading '+files.length+' photo'+(files.length>1?'s':'')+'…';
    try{for(var i=0;i<files.length;i++){var f=files[i];var big=await resizeTo(f,1600,.82),sm=await resizeTo(f,640,.78);
      var base=uid+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
      var a=await sb.storage.from(BUCKET).upload(base+'.jpg',big,{contentType:'image/jpeg'});if(a.error)throw a.error;
      var t=await sb.storage.from(BUCKET).upload(base+'-t.jpg',sm,{contentType:'image/jpeg'});if(t.error)throw t.error;
      photos.push(sb.storage.from(BUCKET).getPublicUrl(base+'.jpg').data.publicUrl)}
      m.className='msg ok';m.textContent='Photos added.';drawP()}catch(e){m.className='msg err';m.textContent=e.message||'Upload failed'}
    this.value=''});
  var save=async function(submit){var m=$('#lmsg');m.className='msg err';m.textContent='';
    var n=function(id){var v=$(id).value.trim();return v===''?null:parseInt(v,10)};
    var row={title:$('#ltitle').value.trim(),property_type:$('#ltype').value,region:$('#lregion').value,suburb:$('#lsub').value.trim(),postcode:$('#lpc').value.trim()||null,address_line:$('#laddr').value.trim()||null,hide_address:$('#lhide').checked,
      price_display:$('#lprice').value.trim(),price_num:n('#lpnum'),beds:n('#lbeds'),baths:n('#lbaths'),cars:n('#lcars'),land_m2:n('#lland'),open_homes:$('#lopen').value.trim()||null,auction_at:$('#lauc').value?new Date($('#lauc').value).toISOString():null,
      features:$('#lfeat').value.split(',').map(function(x){return x.trim()}).filter(Boolean).slice(0,20),description:$('#ldesc').value.trim()||null,photos:photos};
    if(row.title.length<5){m.textContent='Add a headline (at least 5 characters).';return}if(!row.suburb||!row.price_display){m.textContent='Suburb and price wording are required.';return}
    if(row.postcode&&!/^\d{4}$/.test(row.postcode)){m.textContent='Postcode must be 4 digits.';return}
    if(submit){if(!photos.length){m.textContent='Add at least one photo before submitting.';return}if(!row.description||row.description.length<40){m.textContent='Add a description of at least 40 characters.';return}}
    var btns=$$('#lf button');btns.forEach(function(b){b.disabled=true});
    var r;if(isNew){row.agent_id=me.id;row.status=submit?'pending':'draft';r=await sb.from('listings').insert(row).select().single()}
    else{if(l.status!=='live')row.status=submit?'pending':(l.status==='pending'?'draft':l.status);r=await sb.from('listings').update(row).eq('id',l.id).select().single()}
    btns.forEach(function(b){b.disabled=false});
    if(r.error){m.textContent=r.error.message;return}
    toast(submit?'Submitted for review ✓':'Saved ✓');await loadListings();vListings()};
  $('#lsave').onclick=function(){save(false)};
  $('#lf').addEventListener('submit',function(e){e.preventDefault();save(true)})}

function csvGen(cols,rows,name){var q=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var txt=[cols.join(',')].concat(rows.map(function(r){return cols.map(function(c){return q(r[c])}).join(',')})).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download=name+'-'+new Date().toISOString().slice(0,10)+'.csv';a.click()}
function vEnq(){
  $('#main').innerHTML=banner()+'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h1 style="margin:0">Buyer enquiries</h1>'+(enqs.length?'<button class="btn ghost" id="ecsv">Download CSV</button>':'')+'</div><p style="color:#5E5862">Reply fast. Buyers move on quickly. Replies go straight to the buyer by email.</p>'+(enqs.length?'<div class="tbl"><table><thead><tr><th>Received</th><th>Property</th><th>Buyer</th><th>Message</th><th>Status</th><th>My notes</th><th></th></tr></thead><tbody>'+enqs.map(function(e){var sub='Re: '+(e.listings&&e.listings.title||'your enquiry');return '<tr><td>'+fmt(e.created_at)+'</td><td>'+esc(e.listings&&e.listings.title)+'<br><span class="small">'+esc(e.listings&&e.listings.suburb)+'</span></td><td><b>'+esc(e.name)+'</b><br><a href="mailto:'+esc(e.email)+'?subject='+encodeURIComponent(sub)+'">Reply by email</a>'+(e.phone?'<br><a href="tel:'+esc(e.phone)+'">'+esc(e.phone)+'</a>':'')+'</td><td style="white-space:pre-line;max-width:300px">'+esc(e.message)+'</td><td><select data-es="'+e.id+'" aria-label="Status">'+['new','contacted','done'].map(function(s){return '<option'+(s===e.status?' selected':'')+'>'+s+'</option>'}).join('')+'</select></td><td><textarea data-en="'+e.id+'" rows="2" maxlength="1000" aria-label="Notes">'+esc(e.agent_notes)+'</textarea></td><td><button class="btn sm" data-esave="'+e.id+'">Save</button></td></tr>'}).join('')+'</tbody></table></div>':'<div class="tbl"><div class="empty">No enquiries yet. They also arrive by email.</div></div>');
  if($('#ecsv'))$('#ecsv').onclick=function(){csvGen(['created_at','status','name','email','phone','message','agent_notes'],enqs,'my-enquiries')};
  $$('[data-esave]').forEach(function(b){b.onclick=async function(){var id=b.dataset.esave;var r=await sb.from('listing_enquiries').update({status:$('[data-es="'+id+'"]').value,agent_notes:$('[data-en="'+id+'"]').value.trim()||null}).eq('id',id);if(r.error)return toast(r.error.message,true);toast('Saved ✓');await loadListings()}})}

function vProfile(){var a=me;
  var inp=function(id,label,val,type,full){return '<div'+(full?' class="full"':'')+'><label for="'+id+'">'+label+'</label><input id="'+id+'" '+(type?'type="'+type+'" ':'')+'value="'+esc(val)+'"></div>'};
  $('#main').innerHTML=banner()+'<h1>My profile</h1><form class="box" style="max-width:820px" id="pf">'+
   '<div style="display:flex;gap:16px;align-items:center;margin-bottom:8px">'+(a.photo_url?'<img src="'+esc(a.photo_url)+'" alt="" style="width:84px;height:84px;border-radius:50%;object-fit:cover">':'<div style="width:84px;height:84px;border-radius:50%;background:#7A1F33;color:#fff;display:grid;place-items:center;font-weight:800;font-size:28px">'+esc((a.name||'?').slice(0,1))+'</div>')+
   '<div><label for="pphoto" style="margin-top:0">Profile photo</label><input id="pphoto" type="file" accept="image/png,image/jpeg,image/webp"><div style="font-size:12px;color:#5E5862">Square photo, under 2 MB.</div></div></div>'+
   '<div class="grid2">'+inp('pname','Name',a.name)+inp('pphone','Phone',a.phone)+inp('pagency','Agency',a.agency)+
   '<div><label for="pregion">Main region</label><select id="pregion">'+REGIONS.map(function(r){return '<option'+(r===a.region?' selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
   inp('psub','Suburbs you cover (comma separated)',(a.suburbs||[]).join(', '),'',1)+inp('pspec','Specialty',a.specialty)+inp('pfee','Typical fees',a.commission)+
   inp('pyears','Years in real estate',a.years,'number')+inp('psold','Sold in last 12 months',a.sold_12m,'number')+inp('pdays','Average days on market',a.avg_days,'number')+inp('pweb','Website',a.website,'url')+
   '<div class="full"><label for="pbio">Bio</label><textarea id="pbio" rows="4">'+esc(a.bio)+'</textarea></div></div>'+
   '<p style="font-size:13px;color:#5E5862">Email, licence, rating and reviews are managed by QLD Agent Finder. Contact us to change them. Please keep sales figures accurate; we may verify them.</p>'+
   '<div class="row"><button class="btn" type="submit">Save profile</button></div><p class="msg err" id="pmsg"></p></form>';
  $('#pf').addEventListener('submit',async function(e){e.preventDefault();$('#pmsg').textContent='';var btn=this.querySelector('[type=submit]');btn.disabled=true;
    var n=function(id){return parseInt($(id).value,10)||0};
    var row={name:$('#pname').value.trim(),phone:$('#pphone').value.trim(),agency:$('#pagency').value.trim(),region:$('#pregion').value,suburbs:$('#psub').value.split(',').map(function(x){return x.trim()}).filter(Boolean),
      specialty:$('#pspec').value.trim(),commission:$('#pfee').value.trim(),years:n('#pyears'),sold_12m:n('#psold'),avg_days:Math.max(1,n('#pdays')),website:$('#pweb').value.trim(),bio:$('#pbio').value.trim()};
    var file=$('#pphoto').files[0];
    if(file){if(file.size>2*1024*1024){$('#pmsg').textContent='Photo must be under 2 MB.';btn.disabled=false;return}
      var uid=(await sb.auth.getUser()).data.user.id,path=uid+'/photo-'+Date.now()+'.'+(file.type.split('/')[1]||'jpg');
      var up=await sb.storage.from('agent-photos').upload(path,file,{upsert:true,contentType:file.type});
      if(up.error){$('#pmsg').textContent=up.error.message;btn.disabled=false;return}
      row.photo_url=sb.storage.from('agent-photos').getPublicUrl(path).data.publicUrl}
    if(!row.name){$('#pmsg').textContent='Name is required.';btn.disabled=false;return}
    var r=await sb.from('agents').update(row).eq('id',me.id).select().single();btn.disabled=false;
    if(r.error){$('#pmsg').textContent=r.error.message;return}me=r.data;toast('Profile saved ✓');vProfile()})}

sb.auth.onAuthStateChange(function(ev){if(ev==='SIGNED_IN'){if(location.hash)history.replaceState(null,'',location.pathname);if(!me)boot()}});
boot();
})();
