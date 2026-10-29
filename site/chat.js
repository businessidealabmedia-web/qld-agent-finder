/* QLD Agent Finder: Pinny guide chat (free, rule-based, no AI service). Saves leads to Supabase source=chatbot */
(function(){
var CFG=window.QAF_CONFIG||{},LIVE=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey);
var KB=[
{k:/free|cost|price|pay|charge|fee|commission|how much|money/,a:"It's 100% free for sellers. Agents in our network pay us, never you. The agent's own commission is separate, and our calculator shows what to expect.",l:[['Commission calculator','tools.html#commission']]},
{k:/rank|score|best|top|rating|review/,a:"Each agent gets a score out of 100 based on reviews, sales, speed of sale and experience. The method is published.",l:[['See rankings','rankings.html']]},
{k:/worth|value|valu|price my|how much is my/,a:"A local agent can give you a free home valuation. No obligation to list.",l:[['Get my home value','sell.html?goal=appraisal']]},
{k:/join|i am an agent|i'm an agent|list myself|for agents|signup|sign up|partner/,a:"Agents can create a free profile and be found by sellers in their suburb. We check your licence before approving.",l:[['Join as an agent','join.html'],['Why join','for-agents.html']]},
{k:/contact|phone|call|email|talk|human|person|speak/,a:"You can email contact@qldagentfinder.com.au or use the contact form. I'm an automated guide, so a real person replies by email.",l:[['Contact us','contact.html']]},
{k:/privacy|spam|details|data|safe|share|sell my info/,a:"Your details only go to the agents you choose or are matched with. We never sell your information.",l:[['Privacy policy','privacy.html']]},
{k:/area|where|region|suburb|brisbane|gold coast|sunshine|logan|ipswich|moreton|redland|toowoomba/,a:"We cover Brisbane, Gold Coast, Sunshine Coast, Logan, Ipswich, Moreton Bay, Redlands and Toowoomba.",l:[['Browse areas','areas.html'],['Find agents','find-agents.html']]},
{k:/how.*work|steps|process|what happens/,a:"3 steps: search your suburb, compare and shortlist agents, then hear from the agents you like. No obligation at any point.",l:[['Find agents','find-agents.html']]},
{k:/guide|tip|question.*agent|checklist|advice/,a:"Our guides cover what to ask an agent, selling costs and more.",l:[['Read guides','guides.html']]}
];
var CHIPS=[['Sell my home','sell'],['Find an agent','find'],['Is it really free?','free'],['How are agents ranked?','rank'],["I'm an agent",'agent']];
var el={},log,form,input,state={mode:null,lead:{}},opened=false;
function h(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function scroll(){log.scrollTop=log.scrollHeight}
function bot(text,links,chips){var m=h('div','qc-m qc-bot',text);if(links&&links.length){var r=h('div','qc-links');links.forEach(function(l){var a=h('a','qc-link',l[0]);a.href=l[1];r.appendChild(a)});m.appendChild(r)}log.appendChild(m);if(chips)addChips(chips);scroll()}
function me(text){log.appendChild(h('div','qc-m qc-me',text));scroll()}
function addChips(list){var r=h('div','qc-chips');list.forEach(function(c){var b=h('button','qc-chip',c[0]);b.type='button';b.addEventListener('click',function(){r.remove();me(c[0]);route(c[1],c[0])});r.appendChild(b)});log.appendChild(r);scroll()}
function menu(){addChips(CHIPS)}
function ask(prompt,key,ph,type){state.step=key;input.placeholder=ph||'Type here';input.type=type||'text';input.setAttribute('autocomplete',key==='phone'?'tel':key==='name'?'name':key==='email'?'email':'off');bot(prompt);input.focus()}
function startLead(goal){state.mode='lead';state.lead={goal:goal||'Sell my home'};ask('Great. Which suburb is the property in?','suburb','e.g. Springwood')}
function sendLead(){var l=state.lead,row={source:'chatbot',goal:l.goal,suburb:l.suburb,name:l.name,phone:l.phone,email:l.email||null,notes:'Via Pinny chat',consent:true};
bot('Sending…');
if(!LIVE){done();return}
fetch(CFG.supabaseUrl+'/rest/v1/leads',{method:'POST',headers:{apikey:CFG.supabaseAnonKey,Authorization:/^eyJ/.test(CFG.supabaseAnonKey)?'Bearer '+CFG.supabaseAnonKey:undefined,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)}).then(function(r){if(r.ok)done();else fail()}).catch(fail)}
function done(){state.mode=null;state.step=null;input.type='text';input.placeholder='Ask a question';bot("Thanks "+(state.lead.name||'')+"! A local agent will contact you soon. It's free and there's no obligation.",[],[['Another question','menu']])}
function fail(){state.mode=null;state.step=null;bot("Sorry, that didn't send. Please use the form instead or email contact@qldagentfinder.com.au.",[['Open the form','sell.html']])}
function route(key,label){
 if(key==='send')return sendLead();
 if(key==='cancel'){state.mode=null;state.step=null;bot('No problem. Nothing was sent.',null,CHIPS);return}
 if(key==='menu'){bot('What would you like to know?',null,CHIPS);return}
 if(key==='sell')return startLead('Sell my home');
 if(key==='find')return bot('Pick your area, then compare agents on results, reviews and fees.',[['Find agents','find-agents.html'],['Browse areas','areas.html']],[['Get matched instead','sell']]);
 if(key==='free')return answer('free');
 if(key==='rank')return answer('rank');
 if(key==='agent')return answer("i'm an agent");
 answer(label||key)}
function answer(q){q=String(q).toLowerCase();
 for(var i=0;i<KB.length;i++){if(KB[i].k.test(q)){bot(KB[i].a,KB[i].l,[['Get matched free','sell'],['More questions','menu']]);return}}
 if(/sell|list|match|appraisal|home/.test(q))return startLead('Sell my home');
 bot("I'm not sure about that one. I can help with selling, finding agents, costs, rankings and areas.",[['Contact us','contact.html']],CHIPS)}
function submit(e){e.preventDefault();var v=input.value.trim();if(!v)return;input.value='';me(v);
 if(state.mode==='lead'){var s=state.step,l=state.lead;
  if(s==='suburb'){l.suburb=v;return ask("What's your first name?",'name','Your name')}
  if(s==='name'){l.name=v;return ask('Best mobile number for the agent to reach you?','phone','04xx xxx xxx','tel')}
  if(s==='phone'){if(v.replace(/\D/g,'').length<8){bot("That doesn't look like a phone number. Try again?");return}l.phone=v;return ask('Email (optional, type "skip" to skip).','email','you@example.com')}
  if(s==='email'){l.email=/^\S+@\S+\.\S+$/.test(v)?v:'';state.step='consent';var m=h('div','qc-m qc-bot','By sending, you agree to be contacted by QLD Agent Finder and matched agents. ');var a=h('a','qc-link','Privacy');a.href='privacy.html';m.appendChild(a);log.appendChild(m);addChips([['Agree and send','send'],['Cancel','cancel']]);return}
  return}
 answer(v)}
function build(){
 var b=h('button','qc-launch');b.type='button';b.setAttribute('aria-label','Chat with Pinny');b.setAttribute('aria-expanded','false');
 var i=h('img');i.src='pinny-wave.png';i.alt='';i.width=44;i.height=58;b.appendChild(i);b.appendChild(h('span','qc-lt','Need help?'));
 var p=h('div','qc-panel');p.setAttribute('role','dialog');p.setAttribute('aria-label','Chat with Pinny, automated guide');p.hidden=true;
 var hd=h('div','qc-hd');var av=h('img');av.src='pinny-wave.png';av.alt='';hd.appendChild(av);var t=h('div','qc-ht');t.appendChild(h('b',null,'Pinny'));t.appendChild(h('small',null,'Automated guide. Replies instantly.'));hd.appendChild(t);var x=h('button','qc-x','×');x.type='button';x.setAttribute('aria-label','Close chat');hd.appendChild(x);
 log=h('div','qc-log');log.setAttribute('aria-live','polite');
 form=h('form','qc-form');input=h('input');input.placeholder='Ask a question';input.setAttribute('aria-label','Your message');input.maxLength=200;var sb=h('button','qc-send','Send');sb.type='submit';form.appendChild(input);form.appendChild(sb);
 p.appendChild(hd);p.appendChild(log);p.appendChild(form);document.body.appendChild(b);document.body.appendChild(p);
 function open(o){opened=o;p.hidden=!o;b.setAttribute('aria-expanded',o);b.classList.toggle('on',o);if(o){if(!log.children.length){bot("Hi, I'm Pinny, the QLD Agent Finder guide. I'm automated, not a person. What can I help with?",null,CHIPS)}input.focus()}else b.focus()}
 b.addEventListener('click',function(){open(!opened)});x.addEventListener('click',function(){open(false)});
 p.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});
 form.addEventListener('submit',submit);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
