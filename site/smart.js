/* QLD Agent Finder: smart features. Match quiz + selling plan. Free, runs in the browser (no AI service). */
(function(){
var $q=function(s,r){return (r||document).querySelector(s)},$$q=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function e(s){return typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
/* ---------------- match quiz ---------------- */
var quiz=$q('#quiz');
if(quiz){
 var rg=$q('#qRegion');(window.QAF_REGIONS||[]).forEach(function(r){var n=typeof r==='string'?r:(r.name||r.title||'');var o=document.createElement('option');o.value=o.textContent=n;rg.appendChild(o)});
 var p=new URLSearchParams(location.search);if(p.get('region'))rg.value=p.get('region');if(p.get('suburb'))$q('#qSuburb').value=p.get('suburb');
 var cur=0,steps=$$q('.qstep',quiz),bars=$$q('.steps-bar i',quiz);
 function show(n){cur=n;steps.forEach(function(s,i){s.hidden=i!==n});bars.forEach(function(b,i){b.classList.toggle('on',i<=n)});var h=$q('.qh',steps[n]);if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}window.scrollTo({top:quiz.getBoundingClientRect().top+window.scrollY-110,behavior:'smooth'})}
 function ok(n){if(n===0)return true;var s=steps[n],r=$q('input[type=radio]:checked',s);var er=$q('.err',s);if(!r){er.textContent='Please choose an option.';return false}er.textContent='';return true}
 $$q('[data-qnext]',quiz).forEach(function(b){b.addEventListener('click',function(){if(!ok(cur))return;if(cur===3)return results();show(cur+1)})});
 $$q('[data-qback]',quiz).forEach(function(b){b.addEventListener('click',function(){show(cur-1)})});
 function val(n){var r=$q('input[name='+n+']:checked');return r?r.value:''}
 function fee(a){var m=String(a.commission||'').match(/\d+(\.\d+)?/);return m?parseFloat(m[0]):null}
 function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
 function score(a,q){var s=0,why=[],has=typeof qafHasData==='function'?qafHasData(a):(a.sold12m>0||a.rating>0);
  var inRegion=a.region===q.region;if(inRegion){s+=40;why.push('Based in '+q.region)}
  var sub=(q.suburb||'').toLowerCase();if(sub&&(a.suburbs||[]).some(function(x){return String(x).toLowerCase()===sub||String(x).toLowerCase().indexOf(sub)>-1})){s+=22;why.push('Covers '+q.suburb)}
  var sp=String(a.specialty||'').toLowerCase();var tm={house:/house|residential|family|home/,unit:/unit|apartment|inner/,townhouse:/townhouse|residential/,land:/land|acreage|rural|lifestyle/}[q.type];if(tm&&tm.test(sp)){s+=8;why.push('Specialises in '+a.specialty.toLowerCase())}
  var d=a.sold12m>0?a.avgDays:null,f=fee(a),pr=q.pri;
  if(pr==='price'||pr==='reviews'){if(a.rating>0){s+=clamp(a.rating*4,0,20);why.push(a.rating.toFixed(1)+'★ from '+a.reviews+' review'+(a.reviews===1?'':'s'))}}
  if(pr==='fast'||q.when==='asap'){if(d){s+=clamp(25*(1-(d-10)/60),0,pr==='fast'?25:10);why.push('Averages '+d+' days to sell')}}
  if(pr==='fees'){if(f!=null){s+=clamp(25*(1-(f-1)/3),0,25);why.push('Lists a '+f+'% commission')}}
  if(pr==='exp'){if(a.years>0){s+=clamp(a.years*2.5,0,25);why.push(a.years+' years in real estate')}}
  if(pr==='any'||pr==='price'){if(has&&typeof qafScore==='function'){s+=qafScore(a)*(pr==='any'?.25:.1)}}
  if(a.sold12m>0&&pr!=='fast'){why.push(a.sold12m+' sold in the last 12 months')}
  if(has)s+=5;
  return {a:a,s:s,why:why,has:has}}
 function results(){var q={region:rg.value,suburb:$q('#qSuburb').value.trim(),pri:val('pri')||'any',type:val('typ'),when:val('whn')};
  var out=$q('#qResults');out.hidden=false;quiz.hidden=true;out.innerHTML='<p>Finding your matches…</p>';
  loadAgents().then(function(AG){var pool=AG.filter(function(a){return a.region===q.region});var note='';if(!pool.length){pool=AG;note='We don’t have agents listed in '+e(q.region)+' yet, so here are the best of the rest. Or let us match you directly.'}
   var rows=pool.map(function(a){return score(a,q)}).sort(function(x,y){return y.s-x.s||x.a.name.localeCompare(y.a.name)}).slice(0,3);
   var top=rows.length?rows[0].s||1:1;
   var html='<div class="mres-head"><h2>Your best-fit agents</h2><p>'+e(q.region)+(q.suburb?' · '+e(q.suburb):'')+'. Ranked on what you told us.</p>'+(note?'<p class="mnote">'+note+'</p>':'')+'</div>';
   html+=rows.length?rows.map(function(r,i){var a=r.a,fit=clamp(Math.round(r.s/Math.max(top,60)*100),30,99),why=r.why.slice(0,4);
     if(!r.has)why.push('New on QLD Agent Finder, results still building');
     return '<article class="mres'+(i===0?' best':'')+'"><div class="mres-top">'+(i===0?'<span class="badge">Best match</span>':'<span class="badge rank">#'+(i+1)+' match</span>')+'<span class="fit"><b>'+fit+'%</b> fit</span></div><div class="agent-top">'+(typeof avatar==='function'?avatar(a):'')+'<div><h3><a href="agent.html?id='+encodeURIComponent(a.id)+'" style="color:inherit;text-decoration:none">'+e(a.name)+'</a></h3><div class="ag">'+e(a.agency)+' · '+e(a.region)+'</div></div></div><ul class="why-list">'+why.map(function(w){return '<li>'+e(w)+'</li>'}).join('')+'</ul><div class="row"><a class="btn btn-ghost" href="agent.html?id='+encodeURIComponent(a.id)+'">View profile</a><a class="btn btn-maroon" href="sell.html?agent='+encodeURIComponent(a.name)+(q.suburb?'&suburb='+encodeURIComponent(q.suburb):'')+'&region='+encodeURIComponent(q.region)+'">Contact '+e(a.name.split(' ')[0])+'</a></div></article>'}).join(''):'<p>No agents to show yet.</p>';
   html+='<div class="matchband"><div><h3>Want us to pick for you?</h3><p>Send one form and we will match you with local agents. Free, no obligation.</p></div><a class="btn btn-gold" href="sell.html?suburb='+encodeURIComponent(q.suburb)+'&region='+encodeURIComponent(q.region)+'">Get matched free</a></div><p style="text-align:center"><button type="button" class="btn btn-ghost" id="qAgain">Start again</button> <a class="btn btn-ghost" href="find-agents.html">See all agents</a></p>';
   out.innerHTML=html;$q('#qAgain').addEventListener('click',function(){out.hidden=true;quiz.hidden=false;$$q('input[type=radio]',quiz).forEach(function(r){r.checked=false});show(0)});
   window.scrollTo({top:out.getBoundingClientRect().top+window.scrollY-110,behavior:'smooth'})})}
}
/* ---------------- selling plan (tools page) ---------------- */
var pf=$q('#planForm');
if(pf){var out=$q('#planOut');
 pf.addEventListener('submit',function(ev){ev.preventDefault();
  var when=$q('#plWhen').value,live=$q('#plLive').value,goal=$q('#plGoal').value;
  var lead={asap:'Aim to list within 2 to 3 weeks.',soon:'Aim to list in about 4 to 8 weeks.',later:'You have time. Start preparing 3 months before you want to list.'}[when];
  var P=[];
  P.push(['This week',[ 'Compare 2 or 3 local agents (try the <a href="match.html">match quiz</a>).','Ask each agent for a free home valuation and how they arrived at it.','Ask each agent about fees, marketing costs and how long the agreement lasts before you sign anything.','Speak to a conveyancer or solicitor about what you will need for your sale.']]);
  var prep=['Gather paperwork: rates notice, title details and any building or renovation documents.'];
  if(goal==='price')prep.push('Invest in presentation: repairs, paint, garden and professional photos often lift buyer interest.');
  if(goal==='fast')prep.push('Keep prep simple: declutter, deep clean and fix anything buyers will notice first.');
  if(goal==='easy')prep.push('Ask your agent to coordinate trades, styling and photos so you do not have to.');
  if(live==='vacant')prep.push('Ask about styling the empty rooms, since furnished homes often photograph better.');
  if(live==='tenanted')prep.push('Check your lease end date and notice rules, and ask the agent how inspections will work with your tenant.');
  if(live==='living')prep.push('Plan where pets, valuables and daily routines go during inspections.');
  P.push(['Before you list',prep]);
  var camp=['Agree the price strategy with your agent and ask what evidence supports it.','Review the marketing plan and costs in writing.'];
  camp.push(goal==='fast'?'Ask about a shorter campaign and how soon the first inspections can run.':goal==='price'?'Ask about the campaign style and whether it creates competition between buyers.':'Ask for a simple weekly update so you always know where things stand.');
  P.push(['The campaign',camp]);
  P.push(['After an offer',['Have your conveyancer check the contract before you sign.','Ask about deposit, cooling-off and settlement timing.','Ask your lender what you need to arrange for the loan payout.','Use the <a href="#costs">selling costs calculator</a> to see what you could keep.']]);
  out.innerHTML='<p class="plead"><b>'+lead+'</b></p>'+P.map(function(ph){return '<h3>'+ph[0]+'</h3><ul class="plist">'+ph[1].map(function(i){return '<li><label><input type="checkbox"> <span>'+i+'</span></label></li>'}).join('')+'</ul>'}).join('')+'<p class="small">General guide only, not legal or financial advice. Ask your conveyancer and lender about your situation.</p><p><button type="button" class="btn btn-ghost" onclick="window.print()">Print this plan</button> <a class="btn btn-gold" href="sell.html">Get matched with an agent</a></p>';
  out.hidden=false;out.scrollIntoView({behavior:'smooth',block:'start'})})}

/* ---------------- AI bio writer (join page) ---------------- */
var bioBox=document.getElementById('jBio');
if(bioBox){var CFGb=window.QAF_CONFIG||{};
 var wrap=document.createElement('div');wrap.className='aibio';wrap.innerHTML='<button type="button" class="btn btn-ghost" id="aiBioBtn">Write my bio with AI</button> <span class="small" id="aiBioMsg" role="status"></span>';bioBox.parentNode.appendChild(wrap);
 var btn=wrap.querySelector('button'),msg=wrap.querySelector('#aiBioMsg');
 var g=function(id){var el=document.getElementById(id);return el?el.value.trim():''};
 btn.addEventListener('click',function(){var name=g('jN');if(!name){msg.textContent='Add your name in step 1 first.';return}
  btn.disabled=true;msg.textContent='Writing\u2026';
  fetch(CFGb.supabaseUrl+'/functions/v1/qaf-ai',{method:'POST',headers:{'Content-Type':'application/json',apikey:CFGb.supabaseAnonKey},body:JSON.stringify({mode:'bio',name:name,agency:g('jA'),years:g('jY'),region:g('jReg'),suburbs:g('jS'),sold:g('jSold'),days:g('jDays'),notes:bioBox.value})})
  .then(function(r){if(r.status===503){wrap.hidden=true;return null}return r.ok?r.json():null}).catch(function(){return null})
  .then(function(j){btn.disabled=false;if(j&&j.text){bioBox.value=j.text;msg.textContent='Done. Please read it and edit anything that is not right.'}else if(!wrap.hidden)msg.textContent='Sorry, that did not work. Please write your own bio.'})})}
})();
