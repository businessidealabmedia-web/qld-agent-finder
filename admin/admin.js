/* QLD Agent Finder — Admin portal */
(function(){
var CFG=window.QAF_CONFIG||{};
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var fmt=function(d){return d?new Date(d).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''};
var REGIONS=['Brisbane','Logan','Gold Coast','Sunshine Coast','Ipswich','Moreton Bay','Redlands','Toowoomba','Other QLD'];
var LEAD_ST=['new','contacted','assigned','appraisal_booked','listed','sold','lost','spam'];
var nice=function(s){return String(s||'').replace(/_/g,' ')};

if(!CFG.supabaseUrl||!CFG.supabaseAnonKey){$('#setupView').hidden=false;return}
var sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey);
var state={tab:'overview',agents:[],leads:[],msgs:[],listings:[]};

/* ---------- auth ---------- */
async function boot(){
  var s=(await sb.auth.getSession()).data.session;
  if(!s){$('#loginView').hidden=false;$('#appView').hidden=true;return}
  var ok=await sb.from('admins').select('user_id').eq('user_id',s.user.id).maybeSingle();
  if(!ok.data){await sb.auth.signOut();$('#loginView').hidden=false;$('#loginMsg').textContent='This account is not an admin.';return}
  $('#loginView').hidden=true;$('#appView').hidden=false;$('#who').textContent=s.user.email;
  await loadAll();show(state.tab);
}
$('#loginForm').addEventListener('submit',async function(e){e.preventDefault();$('#loginMsg').textContent='';
  var r=await sb.auth.signInWithPassword({email:$('#lEmail').value.trim(),password:$('#lPass').value});
  if(r.error){$('#loginMsg').textContent=r.error.message;return}boot()});
$('#logout').addEventListener('click',async function(){await sb.auth.signOut();location.reload()});

/* ---------- data ---------- */
async function loadAll(){
  var a=await sb.from('agents').select('*').order('created_at',{ascending:false});
  var l=await sb.from('leads').select('*').order('created_at',{ascending:false}).limit(1000);
  var m=await sb.from('contacts').select('*').order('created_at',{ascending:false}).limit(500);
  if(a.error||l.error||m.error){toast((a.error||l.error||m.error).message,true)}
  var li=await sb.from('listings').select('*, agents(name,agency,email)').order('updated_at',{ascending:false}).limit(500);
  state.agents=a.data||[];state.leads=l.data||[];state.msgs=m.data||[];state.listings=li.data||[];
  var pend=state.agents.filter(function(x){return x.status==='pending'}).length,nl=state.leads.filter(function(x){return x.status==='new'}).length,nm=state.msgs.filter(function(x){return x.status==='new'}).length;
  [['#pPending',pend],['#pLeads',nl],['#pMsgs',nm],['#pListings',state.listings.filter(function(x){return x.status==='pending'}).length]].forEach(function(p){var e=$(p[0]);e.hidden=!p[1];e.textContent=p[1]});
}
function agentName(id){var a=state.agents.find(function(x){return x.id===id});return a?a.name:''}
function toast(t,bad){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:'+(bad?'#A3122B':'#0F6B6B')+';color:#fff;padding:12px 20px;border-radius:999px;font-weight:700;z-index:99';document.body.appendChild(d);setTimeout(function(){d.remove()},2800)}

/* ---------- views ---------- */
$('#tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(b.dataset.tab)});
function show(t){state.tab=t;$$('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t)});({overview:vOverview,applications:vApps,agents:vAgents,leads:vLeads,listings:vListings,messages:vMsgs})[t]()}

function vOverview(){var A=state.agents,L=state.leads;
  var c=function(f){return A.filter(f).length};
  $('#main').innerHTML='<h1>Overview</h1><div class="stats">'+
   [['Agent applications',c(function(x){return x.status==='pending'}),'applications'],['Live agents',c(function(x){return x.status==='approved'}),'agents'],['New leads',L.filter(function(x){return x.status==='new'}).length,'leads'],['Total leads',L.length,'leads'],['New messages',state.msgs.filter(function(x){return x.status==='new'}).length,'messages']]
   .map(function(s){return '<div class="stat" data-go="'+s[2]+'"><b>'+s[1]+'</b>'+s[0]+'</div>'}).join('')+'</div>'+
   '<h2>Latest leads</h2>'+leadTable(L.slice(0,8))+'<h2 style="margin-top:24px">Latest applications</h2>'+agentTable(A.filter(function(x){return x.status==='pending'}).slice(0,8),true);
  $$('[data-go]').forEach(function(d){d.addEventListener('click',function(){show(d.dataset.go)})});bindRows()}

function agentTable(list,isApp){if(!list.length)return '<div class="tbl"><div class="empty">Nothing here yet.</div></div>';
  return '<div class="tbl"><table><thead><tr><th>Name</th><th>Agency</th><th>Region</th><th>Contact</th><th>Licence</th><th>Status</th><th>'+(isApp?'Applied':'Score data')+'</th><th></th></tr></thead><tbody>'+
  list.map(function(a){return '<tr><td><b>'+esc(a.name)+'</b>'+(a.verified?' ✓':'')+(a.featured?' ★':'')+'</td><td>'+esc(a.agency)+'</td><td>'+esc(a.region)+'</td><td>'+esc(a.email)+'<br>'+esc(a.phone)+'</td><td>'+esc(a.licence)+'</td><td><span class="tag '+esc(a.status)+'">'+esc(a.status)+'</span></td><td>'+(isApp?fmt(a.created_at):(a.rating+'★ · '+a.sold_12m+' sold · '+a.avg_days+'d'))+'</td><td><button class="btn sm" data-edit-agent="'+a.id+'">'+(isApp?'Review':'Edit')+'</button></td></tr>'}).join('')+'</tbody></table></div>'}

function vApps(){var list=state.agents.filter(function(x){return x.status==='pending'});
  $('#main').innerHTML='<h1>Agent applications</h1><p>Check each licence on the <a href="https://www.qld.gov.au/law/laws-regulated-industries-and-accountability/queensland-laws-and-regulations/check-a-licence-association-charity-or-register" target="_blank" rel="noopener">Queensland licence register</a>, then approve.</p>'+agentTable(list,true);bindRows()}

function vAgents(){
  $('#main').innerHTML='<h1>Agents</h1><div class="bar"><input id="aq" placeholder="Search name, agency, suburb"><select id="as"><option value="">All statuses</option><option>approved</option><option>pending</option><option>hidden</option><option>rejected</option></select><button class="btn gold" id="addAgent">+ Add agent</button></div><div id="alist"></div>';
  var draw=function(){var q=$('#aq').value.toLowerCase(),s=$('#as').value;$('#alist').innerHTML=agentTable(state.agents.filter(function(a){return (!s||a.status===s)&&(!q||(a.name+' '+a.agency+' '+(a.suburbs||[]).join(' ')+' '+a.email).toLowerCase().indexOf(q)>-1)}));bindRows()};
  $('#aq').addEventListener('input',draw);$('#as').addEventListener('input',draw);$('#addAgent').addEventListener('click',function(){agentForm({status:'approved',verified:true,suburbs:[],years:0,sold_12m:0,avg_days:30,rating:0,reviews:0})});draw()}

function leadTable(list){if(!list.length)return '<div class="tbl"><div class="empty">No leads yet.</div></div>';
  return '<div class="tbl"><table><thead><tr><th>Received</th><th>Seller</th><th>Property</th><th>Goal / timing</th><th>Asked for</th><th>Assigned</th><th>Status</th><th></th></tr></thead><tbody>'+
  list.map(function(l){return '<tr><td>'+fmt(l.created_at)+'</td><td><b>'+esc(l.name)+'</b><br>'+esc(l.phone)+'<br>'+esc(l.email)+'</td><td>'+esc([l.address,l.suburb,l.postcode].filter(Boolean).join(', '))+'<br>'+esc([l.property_type,l.bedrooms&&l.bedrooms+' bed'].filter(Boolean).join(' · '))+'</td><td>'+esc(l.goal)+'<br>'+esc(l.timeframe)+'</td><td>'+esc(l.agent)+'</td><td>'+esc(agentName(l.assigned_agent))+'</td><td><span class="tag '+esc(l.status)+'">'+esc(nice(l.status))+'</span></td><td><button class="btn sm" data-edit-lead="'+l.id+'">Open</button></td></tr>'}).join('')+'</tbody></table></div>'}

function vLeads(){
  $('#main').innerHTML='<h1>Leads</h1><div class="bar"><input id="lq" placeholder="Search name, suburb, phone"><select id="ls"><option value="">All statuses</option>'+LEAD_ST.map(function(s){return '<option value="'+s+'">'+nice(s)+'</option>'}).join('')+'</select><button class="btn ghost" id="csv">Download CSV</button></div><div id="llist"></div>';
  var cur=function(){var q=$('#lq').value.toLowerCase(),s=$('#ls').value;return state.leads.filter(function(l){return (!s||l.status===s)&&(!q||[l.name,l.suburb,l.phone,l.email,l.postcode].join(' ').toLowerCase().indexOf(q)>-1)})};
  var draw=function(){$('#llist').innerHTML=leadTable(cur());bindRows()};
  $('#lq').addEventListener('input',draw);$('#ls').addEventListener('input',draw);$('#csv').addEventListener('click',function(){csv(cur())});draw()}

function vMsgs(){var M=state.msgs;
  $('#main').innerHTML='<h1>Messages</h1>'+(M.length?'<div class="tbl"><table><thead><tr><th>Received</th><th>From</th><th>Type</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody>'+M.map(function(m){return '<tr><td>'+fmt(m.created_at)+'</td><td><b>'+esc(m.name)+'</b><br><a href="mailto:'+esc(m.email)+'">'+esc(m.email)+'</a></td><td>'+esc(m.type)+'</td><td style="max-width:420px;white-space:pre-wrap">'+esc(m.message)+'</td><td><span class="tag '+esc(m.status)+'">'+esc(m.status)+'</span></td><td>'+(m.status==='new'?'<button class="btn sm teal" data-done="'+m.id+'">Mark done</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="tbl"><div class="empty">No messages yet.</div></div>');
  $$('[data-done]').forEach(function(b){b.addEventListener('click',async function(){var r=await sb.from('contacts').update({status:'done'}).eq('id',b.dataset.done);if(r.error)return toast(r.error.message,true);await loadAll();vMsgs()})})}


/* ---------- listings (homes for sale) ---------- */
var thumbOf=function(u){return u?u.replace(/\.(jpe?g|png|webp)$/i,'-t.$1'):''};
function vListings(){var pend=state.listings.filter(function(x){return x.status==='pending'}).length;
  $('#main').innerHTML='<h1>Listings</h1><p>Review each listing before it goes public. Check the photos, price wording and that the agent is real.</p><div class="bar"><select id="lst"><option value="pending">Needs review ('+pend+')</option><option value="">All statuses</option><option>live</option><option>sold</option><option>draft</option><option>withdrawn</option><option>rejected</option></select></div><div id="lstlist"></div>';
  var draw=function(){var st=$('#lst').value,list=state.listings.filter(function(l){return !st||l.status===st});
    $('#lstlist').innerHTML=list.length?'<div class="tbl"><table><thead><tr><th></th><th>Listing</th><th>Agent</th><th>Price</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>'+list.map(function(l){return '<tr><td>'+(l.photos&&l.photos[0]?'<img src="'+esc(thumbOf(l.photos[0]))+'" alt="" width="72" height="52" style="border-radius:8px;object-fit:cover" onerror="this.onerror=null;this.src=\''+esc(l.photos[0])+'\'">':'')+'</td><td><b>'+esc(l.title)+'</b><br>'+esc(l.suburb)+' · '+esc(l.property_type)+'</td><td>'+esc(l.agents&&l.agents.name)+'<br><span class="small">'+esc(l.agents&&l.agents.agency)+'</span></td><td>'+esc(l.price_display)+'</td><td><span class="tag '+esc(l.status)+'">'+esc(l.status)+'</span></td><td>'+fmt(l.updated_at)+'</td><td><button class="btn sm" data-review="'+l.id+'">Review</button></td></tr>'}).join('')+'</tbody></table></div>':'<div class="tbl"><div class="empty">Nothing here.</div></div>';
    $$('[data-review]').forEach(function(b){b.onclick=function(){reviewListing(state.listings.find(function(x){return x.id===b.dataset.review}))}})};
  $('#lst').addEventListener('input',draw);draw()}
function reviewListing(l){
  var kv=[['Agent',(l.agents&&l.agents.name)+' · '+(l.agents&&l.agents.agency)+' · '+(l.agents&&l.agents.email)],['Price',l.price_display+(l.price_num?' (filter value $'+l.price_num.toLocaleString()+')':'')],['Address',[l.address_line,l.suburb,l.postcode].filter(Boolean).join(', ')+(l.hide_address?' (street hidden publicly)':'')],['Type',[l.property_type,l.beds+' bed',l.baths+' bath',l.cars+' car',l.land_m2&&l.land_m2+' m²'].filter(Boolean).join(' · ')],['Open home',l.open_homes],['Auction',l.auction_at&&fmt(l.auction_at)],['Features',(l.features||[]).join(', ')]];
  open('<h2>'+esc(l.title)+'</h2><p><span class="tag '+esc(l.status)+'">'+esc(l.status)+'</span></p><div class="phgrid">'+(l.photos||[]).map(function(u){return '<a href="'+esc(u)+'" target="_blank" rel="noopener"><img src="'+esc(thumbOf(u))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(u)+'\'"></a>'}).join('')+'</div>'+(l.photos&&l.photos.length?'':'<p class="msg err">No photos uploaded.</p>')+
   '<div class="kv">'+kv.filter(function(x){return x[1]}).map(function(x){return '<b>'+x[0]+'</b><span>'+esc(x[1])+'</span>'}).join('')+'</div><p style="white-space:pre-line">'+esc(l.description)+'</p>'+
   '<label for="lnote">Note to agent (shown if you reject)</label><textarea id="lnote" rows="2">'+esc(l.admin_notes)+'</textarea>'+
   '<div class="row"><button class="btn red" id="ldelx">Delete</button><button class="btn ghost" id="lcl">Close</button>'+(l.status==='live'?'<button class="btn ghost" id="lwd">Take offline</button><button class="btn ghost" id="lsold">Mark sold</button>':'<button class="btn ghost" id="lrej">Reject</button><button class="btn teal" id="lok">Approve &amp; publish</button>')+'</div><p class="msg err" id="lmsg2"></p>');
  var set=async function(st){var r=await sb.from('listings').update({status:st,admin_notes:$('#lnote').value.trim()||null}).eq('id',l.id);if(r.error){$('#lmsg2').textContent=r.error.message;return}close();toast('Saved ✓');await loadAll();show('listings')};
  $('#lcl').onclick=close;
  if($('#lok'))$('#lok').onclick=function(){set('live')};if($('#lrej'))$('#lrej').onclick=function(){if(!$('#lnote').value.trim()){$('#lmsg2').textContent='Add a short reason for the agent.';return}set('rejected')};
  if($('#lwd'))$('#lwd').onclick=function(){set('withdrawn')};if($('#lsold'))$('#lsold').onclick=function(){set('sold')};
  $('#ldelx').onclick=async function(){if(!confirm('Delete this listing permanently?'))return;var r=await sb.from('listings').delete().eq('id',l.id);if(r.error)return toast(r.error.message,true);close();toast('Deleted');await loadAll();show('listings')}}

function bindRows(){
  $$('[data-edit-agent]').forEach(function(b){b.onclick=function(){agentForm(state.agents.find(function(a){return a.id===b.dataset.editAgent}))}});
  $$('[data-edit-lead]').forEach(function(b){b.onclick=function(){leadForm(state.leads.find(function(l){return l.id===b.dataset.editLead}))}});
}

/* ---------- modals ---------- */
function open(html){$('#sheet').innerHTML=html;$('#modal').classList.add('on');var f=$('#sheet input,#sheet select,#sheet textarea');if(f)f.focus()}
function close(){$('#modal').classList.remove('on')}
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
var inp=function(id,label,val,type,extra){return '<div'+(extra&&extra.full?' class="full"':'')+'><label for="'+id+'">'+label+'</label><input id="'+id+'" '+(type?'type="'+type+'" ':'')+'value="'+esc(val)+'"'+(extra&&extra.step?' step="'+extra.step+'"':'')+'></div>'};

function agentForm(a){var isNew=!a.id;
  open('<h2>'+(isNew?'Add agent':esc(a.name))+'</h2>'+(isNew?'':'<p class="small" style="color:#5E5862">Applied '+fmt(a.created_at)+(a.user_id?' · has portal login':' · not logged in yet')+'</p>')+
  '<form id="af"><div class="grid2">'+inp('fname','Name',a.name)+inp('femail','Email (private)',a.email,'email')+inp('fphone','Phone (private)',a.phone)+inp('flic','Licence no. (private)',a.licence)+
  inp('fagency','Agency',a.agency)+'<div><label for="fregion">Region</label><select id="fregion">'+REGIONS.map(function(r){return '<option'+(r===a.region?' selected':'')+'>'+r+'</option>'}).join('')+'</select></div>'+
  inp('fsub','Suburbs (comma separated)',(a.suburbs||[]).join(', '),'',{full:1})+inp('fspec','Specialty',a.specialty)+inp('ffee','Typical fees',a.commission)+
  inp('fyears','Years',a.years,'number')+inp('fsold','Sold last 12 months',a.sold_12m,'number')+inp('fdays','Avg days on market',a.avg_days,'number')+inp('frating','Rating (0–5)',a.rating,'number',{step:'0.1'})+inp('freviews','Reviews',a.reviews,'number')+inp('fweb','Website',a.website)+
  '<div class="full"><label for="fbio">Bio (public)</label><textarea id="fbio" rows="3">'+esc(a.bio)+'</textarea></div>'+
  '<div class="full"><label for="fnotes">Admin notes (private)</label><textarea id="fnotes" rows="2">'+esc(a.admin_notes)+'</textarea></div>'+
  '<div><label for="fstatus">Status</label><select id="fstatus">'+['pending','approved','hidden','rejected'].map(function(s){return '<option'+(s===a.status?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+
  '<div><label class="chk"><input type="checkbox" id="fver"'+(a.verified?' checked':'')+'> Licence verified</label><label class="chk"><input type="checkbox" id="ffeat"'+(a.featured?' checked':'')+'> Featured</label></div>'+
  '</div><div class="row">'+(isNew?'':'<button type="button" class="btn red" id="adel">Delete</button>')+'<button type="button" class="btn ghost" id="acancel">Cancel</button>'+(a.status==='pending'?'<button type="button" class="btn teal" id="aappr">Approve &amp; verify</button>':'')+'<button class="btn" type="submit">Save</button></div><p class="msg err" id="amsg"></p></form>');
  var val=function(){var n=function(id){return parseFloat($(id).value)||0};return {name:$('#fname').value.trim(),email:$('#femail').value.trim(),phone:$('#fphone').value.trim(),licence:$('#flic').value.trim(),agency:$('#fagency').value.trim(),region:$('#fregion').value,
    suburbs:$('#fsub').value.split(',').map(function(x){return x.trim()}).filter(Boolean),specialty:$('#fspec').value.trim(),commission:$('#ffee').value.trim(),years:n('#fyears')|0,sold_12m:n('#fsold')|0,avg_days:Math.max(1,n('#fdays')|0),rating:Math.min(5,Math.max(0,n('#frating'))),reviews:n('#freviews')|0,website:$('#fweb').value.trim(),
    bio:$('#fbio').value.trim(),admin_notes:$('#fnotes').value.trim(),status:$('#fstatus').value,verified:$('#fver').checked,featured:$('#ffeat').checked}};
  var save=async function(extra){var row=Object.assign(val(),extra||{});if(!row.name||!row.email){$('#amsg').textContent='Name and email are required.';return}
    var r=isNew?await sb.from('agents').insert(row):await sb.from('agents').update(row).eq('id',a.id);
    if(r.error){$('#amsg').textContent=r.error.message;return}close();toast('Saved ✓');await loadAll();show(state.tab)};
  $('#af').addEventListener('submit',function(e){e.preventDefault();save()});
  $('#acancel').onclick=close;
  if($('#aappr'))$('#aappr').onclick=function(){save({status:'approved',verified:true})};
  if($('#adel'))$('#adel').onclick=async function(){if(!confirm('Delete '+a.name+' permanently?'))return;var r=await sb.from('agents').delete().eq('id',a.id);if(r.error)return toast(r.error.message,true);close();toast('Deleted');await loadAll();show(state.tab)};
}

function leadForm(l){var live=state.agents.filter(function(a){return a.status==='approved'});
  var kv=[['Received',fmt(l.created_at)],['Form',l.source],['Goal',l.goal],['Name',l.name],['Phone','<a href="tel:'+esc(l.phone)+'">'+esc(l.phone)+'</a>'],['Email','<a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a>'],['Address',[l.address,l.suburb,l.postcode].filter(Boolean).join(', ')],['Property',[l.property_type,l.bedrooms&&l.bedrooms+' bed',l.bathrooms&&l.bathrooms+' bath',l.car_spaces&&l.car_spaces+' car'].filter(Boolean).join(' · ')],['Timing',l.timeframe],['Price idea',l.price_expectation],['Asked for agent',l.agent],['Seller notes',l.notes],['Agent notes',l.agent_notes]];
  open('<h2>Lead: '+esc(l.name)+'</h2><div class="kv">'+kv.filter(function(x){return x[1]}).map(function(x){return '<b>'+x[0]+'</b><span>'+(x[0]==='Phone'||x[0]==='Email'?x[1]:esc(x[1]))+'</span>'}).join('')+'</div>'+
  '<form id="lf"><div class="grid2"><div><label for="lassign">Assign to agent</label><select id="lassign"><option value="">— Not assigned —</option>'+live.map(function(a){return '<option value="'+a.id+'"'+(a.id===l.assigned_agent?' selected':'')+'>'+esc(a.name+' · '+(a.region||''))+'</option>'}).join('')+'</select></div>'+
  '<div><label for="lstatus">Status</label><select id="lstatus">'+LEAD_ST.map(function(s){return '<option value="'+s+'"'+(s===l.status?' selected':'')+'>'+nice(s)+'</option>'}).join('')+'</select></div>'+
  '<div class="full"><label for="lnotes">Admin notes (private)</label><textarea id="lnotes" rows="3">'+esc(l.admin_notes)+'</textarea></div></div>'+
  '<div class="row"><button type="button" class="btn red" id="ldel">Delete</button><button type="button" class="btn ghost" id="lcancel">Close</button><button class="btn" type="submit">Save</button></div><p class="msg err" id="lmsg"></p></form>');
  $('#lcancel').onclick=close;
  $('#lassign').addEventListener('change',function(){if(this.value&&$('#lstatus').value==='new')$('#lstatus').value='assigned'});
  $('#lf').addEventListener('submit',async function(e){e.preventDefault();var r=await sb.from('leads').update({assigned_agent:$('#lassign').value||null,status:$('#lstatus').value,admin_notes:$('#lnotes').value.trim()}).eq('id',l.id);
    if(r.error){$('#lmsg').textContent=r.error.message;return}close();toast('Saved ✓');await loadAll();show(state.tab)});
  $('#ldel').onclick=async function(){if(!confirm('Delete this lead permanently?'))return;var r=await sb.from('leads').delete().eq('id',l.id);if(r.error)return toast(r.error.message,true);close();toast('Deleted');await loadAll();show(state.tab)};
}

function csv(list){var cols=['created_at','status','name','phone','email','goal','address','suburb','postcode','property_type','bedrooms','bathrooms','car_spaces','timeframe','price_expectation','agent','notes','source'];
  var q=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var txt=[cols.concat(['assigned_agent']).join(',')].concat(list.map(function(l){return cols.map(function(c){return q(l[c])}).concat([q(agentName(l.assigned_agent))]).join(',')})).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download='qaf-leads-'+new Date().toISOString().slice(0,10)+'.csv';a.click()}

sb.auth.onAuthStateChange(function(ev){if(ev==='SIGNED_OUT'){$('#appView').hidden=true;$('#loginView').hidden=false}});
boot();
})();
