/* QLD Agent Finder — main website script */
function toggleMenu(b){var m=document.getElementById('menu');var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)}
document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var money=function(v){return '$'+Math.round(v).toLocaleString('en-AU')};
var params=new URLSearchParams(location.search);
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var CFG=window.QAF_CONFIG||{};var LIVE=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey);
function api(path,opt){opt=opt||{};var h={apikey:CFG.supabaseAnonKey,'Content-Type':'application/json'};if(/^eyJ/.test(CFG.supabaseAnonKey))h.Authorization='Bearer '+CFG.supabaseAnonKey;opt.headers=Object.assign(h,opt.headers||{});return fetch(CFG.supabaseUrl.replace(/\/$/,'')+'/rest/v1/'+path,opt)}

/* ---------- forms: save to the database ---------- */
var FORM_TABLE={'list-my-home':'leads','agent-enquiry':'leads','agent-signup':'agents','contact':'contacts'};
var ARR_FIELDS={suburbs:1},INT_FIELDS={years:1,sold_12m:1,avg_days:1},BOOL_FIELDS={consent:1};
function formRow(form){var row={},skip={'form-name':1,hp:1,company:1,company2:1,confirm:1};
  $$('input,select,textarea',form).forEach(function(f){if(!f.name||skip[f.name]||f.type==='file')return;
    if((f.type==='radio'||f.type==='checkbox')&&!f.checked){if(BOOL_FIELDS[f.name])row[f.name]=false;return}
    var v=f.value.trim();if(v==='')return;
    if(ARR_FIELDS[f.name])v=v.split(',').map(function(x){return x.trim()}).filter(Boolean);
    else if(INT_FIELDS[f.name])v=parseInt(v,10)||0;
    else if(BOOL_FIELDS[f.name])v=true;
    row[f.name]=v});
  return row}
function submitForm(form,e){var name=form.getAttribute('name'),table=FORM_TABLE[name];
  var hp=form.querySelector('[name=hp],[name=company],[name=company2]');if(hp&&hp.value){e.preventDefault();location.href='thank-you.html';return}
  if(!LIVE||!table)return; /* demo mode: normal submit to thank-you page */
  e.preventDefault();var row=formRow(form);if(table==='leads')row.source=name;
  var btn=form.querySelector('[type=submit]'),old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Sending…'}
  api(table,{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(row)}).then(function(r){
    if(r.ok){location.href='thank-you.html'+(table==='agents'?'?type=agent':'');return}
    return r.json().catch(function(){return{}}).then(function(j){var msg=(j&&j.code==='23505')?'An application with this email already exists. Log in to the agent portal or contact us.':'Sorry, something went wrong. Please try again or email contact@qldagentfinder.com.au';throw new Error(msg)})
  }).catch(function(err){if(btn){btn.disabled=false;btn.textContent=old}var box=form.querySelector('.step.active .err')||form.querySelector('.err');if(!box){box=document.createElement('p');box.className='err';btn?btn.parentNode.insertBefore(box,btn):form.appendChild(box)}box.textContent=err.message})}

/* ---------- multi-step forms ---------- */
$$('form[data-steps]').forEach(function(form){
  var steps=$$('.step',form),bars=$$('.steps-bar i',form.parentNode);
  function show(n){steps.forEach(function(s,i){s.classList.toggle('active',i===n)});bars.forEach(function(b,i){b.classList.toggle('on',i<=n)});form.dataset.cur=n}
  function valid(n){var s=steps[n],ok=true,msg='';
    $$('[required]',s).forEach(function(f){
      if(f.type==='radio'){if(!$('input[name="'+f.name+'"]:checked',s)){ok=false;msg='Please choose an option.'}}
      else if(f.type==='checkbox'){if(!f.checked){ok=false;msg=msg||'Please tick the box to continue.'}}
      else if(!f.value.trim()){ok=false;msg=msg||'Please fill in all required fields.'}
      else if(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value)){ok=false;msg='Please enter a valid email.'}
      else if(f.type==='tel'&&f.value.replace(/\D/g,'').length<8){ok=false;msg='Please enter a valid phone number.'}
    });
    var e=$('.err',s);if(e)e.textContent=ok?'':msg;return ok}
  $$('[data-next]',form).forEach(function(b){b.addEventListener('click',function(){var n=+form.dataset.cur||0;if(valid(n))show(n+1)})});
  $$('[data-back]',form).forEach(function(b){b.addEventListener('click',function(){show((+form.dataset.cur||0)-1)})});
  form.addEventListener('submit',function(e){if(!valid(steps.length-1)){e.preventDefault();return}submitForm(form,e)});
  ['suburb','agent','region'].forEach(function(k){var f=form.elements[k];if(f&&params.get(k))f.value=params.get(k)});
  if(params.get('goal')==='appraisal'){var g=form.querySelector('input[name=goal][value^="Know"]');if(g)g.checked=true}
  show(0);
});
$$('form[data-netlify]:not([data-steps])').forEach(function(form){form.addEventListener('submit',function(e){submitForm(form,e)})});
var ty=$('#tyAgent');if(ty&&params.get('type')==='agent')ty.hidden=false;

/* ---------- agents: load from database (or demo data) ---------- */
function mapAgent(r){return {id:r.id,name:r.name,agency:r.agency||'',region:r.region||'',suburbs:r.suburbs||[],sold12m:r.sold_12m||0,avgDays:Math.max(1,r.avg_days||30),rating:Number(r.rating)||0,reviews:r.reviews||0,commission:r.commission||'Ask agent',years:r.years||0,specialty:r.specialty||'Residential sales',bio:r.bio||'',photo:r.photo_url||'',verified:!!r.verified,featured:!!r.featured,demo:false}}
function loadAgents(){
  if(!LIVE)return Promise.resolve(window.QAF_AGENTS||[]);
  return api('public_agents?select=*').then(function(r){return r.ok?r.json():[]}).then(function(rows){return rows.map(mapAgent)}).catch(function(){return []})}


function glance(list){var L=[],best=function(f,dir,min){var c=list.filter(function(a){return f(a)>(min||0)||(dir<0&&f(a)>0)});if(c.length<1)return null;c.sort(function(x,y){return dir*(f(y)-f(x))});if(c.length>1&&f(c[0])===f(c[1]))return null;return c[0]};
 var feeN=function(a){var m=String(a.commission||'').match(/\d+(\.\d+)?/);return m?parseFloat(m[0]):0};
 var r;
 if(r=best(function(a){return a.sold12m>0?a.avgDays:0},-1))L.push('<b>'+esc(r.name)+'</b> sells fastest, averaging '+r.avgDays+' days.');
 if(r=best(function(a){return a.sold12m},1))L.push('<b>'+esc(r.name)+'</b> has the most recent sales ('+r.sold12m+' in 12 months).');
 if(r=best(feeN,-1))L.push('<b>'+esc(r.name)+'</b> lists the lowest commission ('+feeN(r)+'%).');
 if(r=best(function(a){return a.years},1))L.push('<b>'+esc(r.name)+'</b> has the most experience ('+r.years+' years).');
 if(r=best(function(a){return a.rating},1))L.push('<b>'+esc(r.name)+'</b> has the highest rating ('+r.rating.toFixed(1)+'★).');
 return '<div class="glance"><h2>At a glance</h2>'+(L.length?'<ul>'+L.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>':'<p>These agents are too similar, or too new, to pick a clear winner on the numbers yet.</p>')+'<p class="small">Based on the details agents have supplied. Ask each agent for evidence.</p><p><a class="btn btn-gold" href="sell.html">Get matched free</a></p></div>'}
function stat(v){return v?v:'—'}
function days(a){return a.sold12m>0&&a.avgDays?a.avgDays:'—'}
function revTxt(a){return a.reviews?a.reviews+' review'+(a.reviews===1?'':'s'):'No reviews'}
function rankBadge(a,r,cls){return qafHasData(a)?'<span class="badge '+(cls||'rank')+'">#'+r+' in '+esc(a.region)+'</span>':'<span class="badge '+(cls||'rank')+'">New on QLD Agent Finder</span>'}
function ranked(list){return list.slice().sort(function(a,b){return (qafScore(b)-qafScore(a))||((b.featured?1:0)-(a.featured?1:0))||a.name.localeCompare(b.name,undefined,{numeric:true})})}
function avatar(a,big){return a.photo?'<img class="avatar" src="'+esc(a.photo)+'" alt="'+esc(a.name)+'" style="object-fit:cover'+(big?';width:96px;height:96px':'')+'" loading="lazy">':'<div class="avatar" aria-hidden="true">'+esc(qafInitials(a.name))+'</div>'}
function card(a,opts){opts=opts||{};var im=QAF_REGION_IMG[a.region];
  return '<article class="agent">'+(im?'<div class="cover"><img src="'+QAF_IMG(im,600)+'" alt="'+esc(a.region)+'" loading="lazy" width="600" height="220" onerror="this.parentNode.style.display=\'none\'"></div>':'')+
  '<div class="agent-top">'+avatar(a)+'<div><h3><a href="agent.html?id='+encodeURIComponent(a.id)+'" style="color:inherit;text-decoration:none">'+esc(a.name)+'</a></h3><div class="ag">'+esc(a.agency)+' · '+esc(a.region)+'</div></div></div>'+
  '<div class="badges">'+(opts.rank?rankBadge(a,opts.rank):'')+(a.verified?'<span class="badge">✓ Verified</span>':'')+(a.featured?'<span class="badge">★ Featured</span>':'')+(a.demo?'<span class="badge demo">Demo profile</span>':'')+'</div>'+
  '<div class="kpis"><div><b>'+(a.rating?a.rating.toFixed(1)+'★':'New')+'</b><span>'+revTxt(a)+'</span></div><div><b>'+stat(a.sold12m)+'</b><span>sold (12m)</span></div><div><b>'+days(a)+'</b><span>avg days</span></div></div>'+
  '<div class="small"><b>Suburbs:</b> '+esc(a.suburbs.join(', '))+'<br><b>Fees:</b> '+esc(a.commission)+'</div>'+
  (opts.compare?'<label class="chk"><input type="checkbox" data-cmp="'+esc(a.id)+'"> Add to compare</label>':'')+
  '<div class="row"><a class="btn btn-ghost" href="agent.html?id='+encodeURIComponent(a.id)+'">View profile</a><a class="btn btn-maroon" href="sell.html?agent='+encodeURIComponent(a.name)+'">Contact agent</a></div></article>'}

function renderAgents(AG){
  window.QAF_AGENTS=AG;
  function regionRank(a){var r=ranked(AG.filter(function(x){return x.region===a.region}));return r.indexOf(a)+1}
  var empty='<div class="tile empty-pin" style="grid-column:1/-1"><img src="pinny-wave.png" alt="Pinny the QLD Agent Finder mascot" width="110" height="145"><div><h3>Founding agents are joining now</h3><p>We are verifying the first partner agents across Queensland. Tell us about your property and we will match you with a local agent.</p><div class="btns"><a class="btn btn-maroon" href="sell.html">Get matched for free</a><a class="btn btn-ghost" href="join.html">I am an agent, join free</a></div></div></div>';

  var topEl=$('#topAgents');if(topEl){topEl.innerHTML=AG.length?ranked(AG).slice(0,3).map(function(a){return card(a,{rank:regionRank(a)})}).join(''):empty}

  var dir=$('#directory');
  if(dir){var q=$('#fQuery'),rg=$('#fRegion'),so=$('#fSort'),cnt=$('#fCount'),sel=[];
    rg.innerHTML='<option value="">All Queensland</option>'+QAF_REGIONS.map(function(r){return '<option>'+r+'</option>'}).join('');
    if(params.get('q'))q.value=params.get('q');if(params.get('region'))rg.value=params.get('region');
    var bar=function(){var b=$('#cmpbar');b.classList.toggle('on',sel.length>0);$('#cmpCount').textContent=sel.length+' of 3 selected';$('#cmpGo').href='compare.html?ids='+sel.join(',')};
    var draw=function(){var t=q.value.trim().toLowerCase(),r=rg.value;
      var list=AG.filter(function(a){return (!r||a.region===r)&&(!t||(a.name+' '+a.agency+' '+a.region+' '+a.suburbs.join(' ')).toLowerCase().indexOf(t)>-1)});
      var s=so.value;list.sort(function(a,b){return s==='rating'?b.rating-a.rating:s==='sold'?b.sold12m-a.sold12m:s==='days'?a.avgDays-b.avgDays:qafScore(b)-qafScore(a)});
      cnt.textContent=list.length+' agent'+(list.length===1?'':'s')+' found';
      dir.innerHTML=list.length?list.map(function(a){return card(a,{rank:regionRank(a),compare:true})}).join(''):empty;
      $$('[data-cmp]',dir).forEach(function(c){c.checked=sel.indexOf(c.dataset.cmp)>-1;c.addEventListener('change',function(){if(c.checked){if(sel.length>=3){c.checked=false;alert('You can compare up to 3 agents.');return}sel.push(c.dataset.cmp)}else sel=sel.filter(function(x){return x!==c.dataset.cmp});bar()})})};
    var chips=$('#regionChips');
    if(chips){chips.innerHTML=['All Queensland'].concat(QAF_REGIONS).map(function(r,i){var v=i?r:'';return '<button type="button" data-r="'+v+'" aria-pressed="'+(v===rg.value)+'" class="'+(v===rg.value?'on':'')+'">'+r+'</button>'}).join('');
      chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;rg.value=b.dataset.r;$$('button',chips).forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});draw()})}
    [q,rg,so].forEach(function(e){e.addEventListener('input',draw)});draw()}

  var cmp=$('#compareTable');
  if(cmp){var ids=(params.get('ids')||'').split(',').filter(Boolean),list=AG.filter(function(a){return ids.indexOf(a.id)>-1});
    if(list.length<2){cmp.innerHTML='<p>Select 2 or 3 agents on the <a href="find-agents.html">Find Agents</a> page to compare them side by side.</p>'}
    else{var rows=[['Agency',function(a){return esc(a.agency)}],['Region',function(a){return esc(a.region)}],['Ranking score',function(a){return qafHasData(a)?'<b>'+qafScore(a)+'/100</b>':'New'}],['Rating',function(a){return a.rating?a.rating.toFixed(1)+'★ ('+a.reviews+')':'New'}],['Sold last 12 months',function(a){return stat(a.sold12m)}],['Average days on market',function(a){return days(a)}],['Experience',function(a){return a.years?a.years+' years':'—'}],['Typical fees',function(a){return esc(a.commission)}],['Specialty',function(a){return esc(a.specialty)}],['Suburbs',function(a){return esc(a.suburbs.join(', '))}],['',function(a){return '<a class="btn btn-maroon" href="sell.html?agent='+encodeURIComponent(a.name)+'">Contact agent</a>'}]];
      cmp.innerHTML='<div class="table-box"><table class="compare"><thead><tr><th scope="col">Compare</th>'+list.map(function(a){return '<th scope="col">'+esc(a.name)+(a.demo?' <small>(demo)</small>':'')+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr><td><b>'+r[0]+'</b></td>'+list.map(function(a){return '<td>'+r[1](a)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+glance(list)}}

  var prof=$('#profile');
  if(prof){var a=AG.filter(function(x){return x.id===params.get('id')})[0];
    if(!a){prof.innerHTML='<h1>Agent not found</h1><p>This profile may have been removed or the link is wrong.</p><p><a class="btn btn-gold" href="find-agents.html">Browse all agents</a></p>';var bd=prof.closest('section');if(bd&&bd.nextElementSibling)bd.nextElementSibling.hidden=true}
    else{document.title=a.name+' | '+a.agency+' | QLD Agent Finder';
      $('#pName').textContent=a.name;$('#pAgency').textContent=a.agency+' · '+a.region;
      if(a.photo){$('#pInit').outerHTML=avatar(a,true)}else $('#pInit').textContent=qafInitials(a.name);
      $('#pBadges').innerHTML=rankBadge(a,regionRank(a))+(a.verified?'<span class="badge">✓ Verified</span>':'')+(a.demo?'<span class="badge demo">Demo profile</span>':'');
      $('#pKpis').innerHTML='<div><b>'+(qafHasData(a)?qafScore(a):'New')+'</b><span>'+(qafHasData(a)?'score /100':'no score yet')+'</span></div><div><b>'+(a.rating?a.rating.toFixed(1)+'★':'New')+'</b><span>'+revTxt(a)+'</span></div><div><b>'+stat(a.sold12m)+'</b><span>sold (12m)</span></div><div><b>'+days(a)+'</b><span>avg days</span></div><div><b>'+stat(a.years)+'</b><span>years</span></div><div><b>'+esc(a.commission)+'</b><span>typical fees</span></div>';
      $('#pAbout').textContent=a.bio||(a.name+' is a '+a.region+' agent'+(a.years?' with '+a.years+' years of experience':'')+', specialising in '+a.specialty.toLowerCase()+'. Active in '+a.suburbs.join(', ')+'.');
      $('#pSuburbs').innerHTML=a.suburbs.map(function(s){return '<a href="find-agents.html?q='+encodeURIComponent(s)+'">'+esc(s)+'</a>'}).join('');
      var f=$('#pAgentField');if(f)f.value=a.name+' ('+a.agency+')';
      if(a.demo)$('#pDemo').hidden=false;}}

  var rk=$('#rankList');
  if(rk){var tabs=$('#rankTabs'),cur=params.get('region')||'';
    tabs.innerHTML=['All Queensland'].concat(QAF_REGIONS).map(function(r,i){var v=i?r:'';return '<button type="button" data-r="'+v+'" class="'+(v===cur?'on':'')+'">'+r+'</button>'}).join('');
    var drawR=function(){var list=ranked(AG.filter(function(a){return !cur||a.region===cur}));
      rk.innerHTML=list.length?list.map(function(a,i){return '<a class="rank-row" href="agent.html?id='+encodeURIComponent(a.id)+'"><div class="rank-no">'+(qafHasData(a)?'#'+(i+1):'—')+'</div><div><b>'+esc(a.name)+'</b>'+(a.demo?' <span class="badge demo">Demo</span>':'')+'<div class="small">'+esc(a.agency)+' · '+esc(a.region)+' · '+(a.rating?a.rating.toFixed(1)+'★':'New')+(a.sold12m>0?' · '+a.sold12m+' sold · '+a.avgDays+' avg days':' · profile just added')+'</div></div><div class="score">'+(qafHasData(a)?qafScore(a)+'<small>/100</small>':'<small>New</small>')+'</div></a>'}).join(''):'<p>No ranked agents in this area yet.</p>'};
    tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cur=b.dataset.r;$$('button',tabs).forEach(function(x){x.classList.toggle('on',x===b)});drawR()});drawR()}

  var at=$('#areaTiles');if(at){at.innerHTML=QAF_REGIONS.map(function(r){var n=AG.filter(function(a){return a.region===r}).length;return '<a class="area" href="real-estate-agents-'+r.toLowerCase().replace(/ /g,'-')+'.html"><img src="'+QAF_IMG(QAF_REGION_IMG[r],600)+'" alt="'+r+', Queensland" loading="lazy" width="600" height="450"><span>'+r+'<small>'+(n?n+' agent'+(n===1?'':'s')+' · ':'')+'View agents →</small></span></a>'}).join('')}
}
loadAgents().then(renderAgents).then(function(){if(window.qafReveal)window.qafReveal()});

/* ---------- static bits ---------- */
var hs=$('#homeSearch');if(hs){var hr=$('#hsRegion');hr.innerHTML='<option value="">All QLD</option>'+QAF_REGIONS.map(function(x){return '<option>'+x+'</option>'}).join('')}
var fh=$('#findHero');if(fh&&params.get('region')&&QAF_REGION_IMG[params.get('region')]){fh.classList.add('photo');fh.style.backgroundImage='linear-gradient(rgba(79,18,32,.88),rgba(122,31,51,.8)),url('+QAF_IMG(QAF_REGION_IMG[params.get('region')],1400)+')';var ft=$('#findTitle');if(ft)ft.textContent='Top real estate agents in '+params.get('region')}
(function(){var p=$('#price'),r=$('#rate');
  if(p&&r){var f=function(){$('#priceOut').textContent=money(+p.value);$('#rateOut').textContent=(+r.value).toFixed(1)+'%';$('#feeOut').textContent=money(p.value*r.value/100*1.1);$('#diffOut').textContent=money(p.value*0.005*1.1)};[p,r].forEach(function(e){e.addEventListener('input',f)});f()}
  var sp=$('#scPrice');
  if(sp){var g=function(){var v=+sp.value||0,rate=+$('#scRate').value||0,mk=+$('#scMarketing').value||0,le=+$('#scLegal').value||0,ot=+$('#scOther').value||0;var com=v*rate/100*1.1,tot=com+mk+le+ot;
    $('#scCom').textContent=money(com);$('#scTotal').textContent=money(tot);$('#scNet').textContent=money(v-tot)};$$('#sellCalc input').forEach(function(e){e.addEventListener('input',g)});g()}})();
if(document.querySelector('form[data-steps],form[name=contact],#profile'))document.body.classList.add('no-sticky');
/* region landing pages: preset region + photo */
var fr=document.getElementById('fRegion');if(fr&&fr.dataset.default&&!params.get('region'))params.set('region',fr.dataset.default);
var rh=document.querySelector('[data-region-img]');if(rh&&QAF_REGION_IMG[rh.dataset.regionImg])rh.style.backgroundImage='linear-gradient(rgba(79,18,32,.9),rgba(122,31,51,.82)),url('+QAF_IMG(QAF_REGION_IMG[rh.dataset.regionImg],1400)+')';
$$('[data-portal]').forEach(function(a){a.href=CFG.agentPortalUrl||'#'});

/* ---------- motion: typed city line + scroll reveal ---------- */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t=document.getElementById('typed');
  if(t){var words=['in Brisbane','on the Gold Coast','in Logan','on the Sunshine Coast','in Ipswich','in Moreton Bay','in Redlands','in Toowoomba'],w=0,c=0,del=false;
    if(reduce){t.textContent=words[0]}
    else{(function tick(){var full=words[w];t.textContent=full.slice(0,c);var d=del?32:75;
      if(!del&&c===full.length){del=true;d=1700}else if(del&&c===0){del=false;w=(w+1)%words.length;d=350}else c+=del?-1:1;
      setTimeout(tick,d)})()}}
  window.qafReveal=function(){
    if(reduce||!('IntersectionObserver' in window))return;
    var io=window.qafIO=window.qafIO||new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');window.qafIO.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    var sel='main section h2, .choice, .why li, .agent, .area, details, .guide, .split>*, .matchband, .cta-band, .agent-band, .tile';
    var n=0;document.querySelectorAll(sel).forEach(function(el){if(el.closest('.home-hero')||el.classList.contains('reveal'))return;
      el.classList.add('reveal');el.style.setProperty('--d',(n%4)*80+'ms');n++;io.observe(el)});
    document.querySelectorAll('.stepper').forEach(function(el){if(!el.dataset.io){el.dataset.io=1;io.observe(el)}});
  };
  window.qafReveal();
})();

(function(){var f=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('#menu a').forEach(function(a){var h=a.getAttribute('href').split('#')[0].split('?')[0];if(h===f||(f.indexOf('real-estate-agents-')===0&&h==='areas.html')||(f==='agent.html'&&h==='find-agents.html')||(f==='rankings.html'&&h==='find-agents.html')||(f==='join.html'&&h==='for-agents.html')||(f==='property.html'&&h==='for-sale.html')||((f==='match.html'||f==='compare.html')&&h==='find-agents.html')||((f==='tools.html')&&h==='guides.html'))a.setAttribute('aria-current','page')})})();

/* premium touches: header shadow on scroll, count-up numbers */
(function(){var hd=document.querySelector('header');if(hd){var f=function(){hd.classList.toggle('scrolled',window.scrollY>12)};f();window.addEventListener('scroll',f,{passive:true})}
var nums=document.querySelectorAll('.cnt[data-to]');if(!nums.length||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);var n=e.target,to=+n.dataset.to,t0=performance.now();(function step(t){var p=Math.min(1,(t-t0)/1100);n.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)})(t0)})},{threshold:.6});nums.forEach(function(n){io.observe(n)})})();
