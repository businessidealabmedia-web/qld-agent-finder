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
var me=null,leads=[],tab='leads';

function toast(t,bad){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:'+(bad?'#A3122B':'#0F6B6B')+';color:#fff;padding:12px 20px;border-radius:999px;font-weight:700;z-index:99';document.body.appendChild(d);setTimeout(function(){d.remove()},2800)}

$('#loginForm').addEventListener('submit',async function(e){e.preventDefault();var m=$('#loginMsg');m.className='msg';m.textContent='Sending…';
  var r=await sb.auth.signInWithOtp({email:$('#lEmail').value.trim(),options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});
  if(r.error){m.className='msg err';m.textContent=r.error.message;return}
  m.className='msg ok';m.textContent='Check your inbox. We sent you a login link ✉️'});
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
  await loadLeads();show(tab);
}finally{booting=false}}
async function loadLeads(){var r=await sb.from('leads').select('*').eq('assigned_agent',me.id).order('created_at',{ascending:false});leads=r.data||[];
  var n=leads.filter(function(l){return l.status==='assigned'||l.status==='new'}).length;$('#pLeads').hidden=!n;$('#pLeads').textContent=n}
function show(t){tab=t;$$('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t)});(t==='leads'?vLeads:vProfile)()}

function banner(){if(me.status==='approved')return '';
  return '<div class="box" style="max-width:none;margin-bottom:18px;background:#fdf1dc;border-color:#f3dcb0;box-shadow:none"><b>'+(me.status==='pending'?'Your profile is under review.':'Your profile is not public right now.')+'</b> '+(me.status==='pending'?'Complete your details below. We\'ll email you once it\'s live.':'Contact us at contact@qldagentfinder.com.au')+'</div>'}

function vLeads(){
  $('#main').innerHTML=banner()+'<h1>My leads</h1>'+(leads.length?'<div class="tbl"><table><thead><tr><th>Received</th><th>Seller</th><th>Property</th><th>Goal / timing</th><th>Status</th><th>My notes</th><th></th></tr></thead><tbody>'+
   leads.map(function(l){return '<tr><td>'+fmt(l.created_at)+'</td><td><b>'+esc(l.name)+'</b><br><a href="tel:'+esc(l.phone)+'">'+esc(l.phone)+'</a><br><a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a></td><td>'+esc([l.address,l.suburb,l.postcode].filter(Boolean).join(', '))+'<br>'+esc([l.property_type,l.bedrooms&&l.bedrooms+' bed',l.bathrooms&&l.bathrooms+' bath'].filter(Boolean).join(' · '))+(l.notes?'<br><i>'+esc(l.notes)+'</i>':'')+'</td><td>'+esc(l.goal)+'<br>'+esc(l.timeframe)+'<br>'+esc(l.price_expectation)+'</td>'+
   '<td><select data-st="'+l.id+'" aria-label="Status">'+(AGENT_ST.some(function(s){return s[0]===l.status})?'':'<option value="'+esc(l.status)+'">New</option>')+AGENT_ST.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===l.status?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select></td>'+
   '<td><textarea data-nt="'+l.id+'" rows="2" aria-label="Notes">'+esc(l.agent_notes)+'</textarea></td><td><button class="btn sm" data-save="'+l.id+'">Save</button></td></tr>'}).join('')+'</tbody></table></div>':'<div class="tbl"><div class="empty">No leads yet. When we match a seller to you, they\'ll appear here, and we\'ll let you know.</div></div>');
  $$('[data-save]').forEach(function(b){b.onclick=async function(){var id=b.dataset.save;var r=await sb.from('leads').update({status:$('[data-st="'+id+'"]').value,agent_notes:$('[data-nt="'+id+'"]').value.trim()}).eq('id',id);
    if(r.error)return toast(r.error.message,true);toast('Saved ✓');await loadLeads()}})}

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

sb.auth.onAuthStateChange(function(ev){if(ev==='SIGNED_IN'&&!me)boot()});
boot();
})();
