/* QLD Agent Finder: Pinny guide chat (free, rule-based, no AI service). Saves leads to Supabase source=chatbot */
(function(){
var CFG=window.QAF_CONFIG||{},LIVE=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey);
var KB=[
{k:/free|cost|price|pay|charge|fee|commission|how much|money|cheap|expensive|afford/,a:"It's 100% free for sellers. Agents in our network pay us, never you. The agent's own commission is separate, and our calculator shows what to expect.",l:[['Commission calculator','tools.html#commission']]},
{k:/rank|score|best|top|rating|review|trusted|good agent|recommend/,a:"Each agent gets a score out of 100 based on reviews, sales, speed of sale and experience. The method is published.",l:[['See rankings','rankings.html']]},
{k:/worth|value|valu|appraisal|how much is my|price my|estimate/,a:"A local agent can give you a free home valuation. No obligation to list.",l:[['Get my home value','sell.html?goal=appraisal']]},
{k:/join|i am an agent|i'm an agent|im an agent|list myself|for agents|signup|sign up|partner|become|register|my profile|agent login|login|log in|portal/,a:"Agents can create a free profile and be found by sellers in their suburb. We check your licence before approving. Already approved? Use Agent login in the footer.",l:[['Join as an agent','join.html'],['Why join','for-agents.html']]},
{k:/contact|phone|call|email|talk|human|person|speak|staff|team|support/,a:"You can email contact@qldagentfinder.com.au or use the contact form. I'm an automated guide, so a real person replies by email.",l:[['Contact us','contact.html']]},
{k:/privacy|spam|data|safe|share|sell my info|secure|trust us|scam/,a:"Your details only go to the agents you choose or are matched with. We never sell your information.",l:[['Privacy policy','privacy.html']]},
{k:/area|where|region|suburb|brisbane|gold coast|sunshine|logan|ipswich|moreton|redland|toowoomba|cairns|townsville|nsw|sydney|melbourne|victoria|perth|adelaide|interstate|outside/,a:"We cover Brisbane, Gold Coast, Sunshine Coast, Logan, Ipswich, Moreton Bay, Redlands and Toowoomba. Other states aren't covered yet.",l:[['Browse areas','areas.html'],['Find agents','find-agents.html']]},
{k:/how.*work|steps|process|what happens|what is this|what do you do|about/,a:"3 steps: search your suburb, compare and shortlist agents, then hear from the agents you like. No obligation at any point.",l:[['How it works','how-it-works.html'],['Find agents','find-agents.html']]},
{k:/guide|tip|checklist|advice|learn|prepare|ready to sell/,a:"Our guides cover what to ask an agent, selling costs and more.",l:[['Read guides','guides.html']]},
{k:/how long|when|time|quick|fast|wait|soon|hear back|response/,a:"Matching takes about a minute to fill in. Agents usually get in touch soon after. Timing depends on the agent.",l:[['Get matched free','sell.html']]},
{k:/oblig|have to list|commit|contract|must i|forced|lock/,a:"No obligation. Meet the agents, compare them and decide in your own time.",l:[]},
{k:/buy|buying|rent|lease|tenant|landlord|property manag|investor|invest/,a:"We focus on helping sellers choose a listing agent. For leasing or property management, tell us in the form and we'll note it.",l:[['Tell us what you need','sell.html']]},
{k:/licen|verif|real agent|legit|qualified|check/,a:"Agents apply with their QLD licence number and we check it on the register before approving. Approved agents get a Verified badge.",l:[['About us','about.html']]},
{k:/compare|side by side|difference/,a:"Tick up to 3 agents on the Find agents page and press Compare to see them side by side.",l:[['Find agents','find-agents.html']]}
];
var SMALL=[
{k:/^(hi|hello|hey|hiya|yo|gday|g'day|howdy|good (morning|afternoon|evening)|hello there|hi there)$/,a:"Hi! How can I help?"},
{k:/\b(thanks|thank you|thankyou|thx|cheers|ta|appreciate|tysm)\b/,a:"You're welcome! Anything else I can help with?"},
{k:/^(bye|goodbye|see ya|see you|cya|later|that's all|thats all|no thanks|no thank you|nope|nothing|all good|no|nah|i'm good|im good|done)$/,a:"No worries. If you need anything, I'm here. Have a great day!",end:1},
{k:/^((ok|okay|k|cool|great|nice|awesome|good|perfect|got it|alright|sweet|fine|wow|love it|sounds good|thanks|thank you|cheers|ta|ok thanks|thx|very|so|much)\s?)+$/,a:"Glad that helps! Anything else?"},
{k:/^((yes|yeah|yep|yup|sure|please|of course|definitely|ok|okay)\s?)+$/,a:"Great. What would you like help with?"},
{k:/how are you|how r u|hows it going|how's it going|you good|whats up|what's up|sup/,a:"I'm doing well, thanks for asking! What can I help you with?"},
{k:/who are you|what are you|your name|are you (a )?(bot|ai|robot|real|human|person)|is this (a )?(bot|ai|human)|am i talking/,a:"I'm Pinny, the QLD Agent Finder guide. I'm an automated assistant, not a person, and I can help with selling, finding agents, costs and areas."},
{k:/^(help|menu|options|start|start over|restart|what can you do|what can i ask)$/,a:"I can help with these:",menu:1},
{k:/useless|rubbish|stupid|dumb|hate|terrible|not helpful|bad bot|wrong|doesn't work|doesnt work|broken|rude/,a:"Sorry about that. I'm a simple guide, so I can miss things. A real person can help by email.",send:1},
{k:/^(lol|haha|hehe|😂|🙂|😊|👍)+$/,a:"😊 Anything else I can help with?"}
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
function sendMsg(){var m=state.msg,row={name:m.name,email:m.email,type:'Other (chat)',message:m.message};bot('Sending…');
 var fin=function(){state.mode=null;state.step=null;input.type='text';input.placeholder='Ask a question';bot("Thanks "+m.name+"! The team will reply to "+m.email+" soon.",null,[['Another question','menu']])};
 if(!LIVE){fin();return}
 fetch(CFG.supabaseUrl+'/rest/v1/contacts',{method:'POST',headers:{apikey:CFG.supabaseAnonKey,Authorization:/^eyJ/.test(CFG.supabaseAnonKey)?'Bearer '+CFG.supabaseAnonKey:undefined,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)}).then(function(r){if(r.ok)fin();else fail()}).catch(fail)}
function done(){state.mode=null;state.step=null;input.type='text';input.placeholder='Ask a question';bot("Thanks "+(state.lead.name||'')+"! A local agent will contact you soon. It's free and there's no obligation.",[],[['Another question','menu']])}
function fail(){state.mode=null;state.step=null;bot("Sorry, that didn't send. Please use the form instead or email contact@qldagentfinder.com.au.",[['Open the form','sell.html']])}
function route(key,label){
 if(key==='msg')return startMsg();
 if(key==='msgsend')return sendMsg();
 if(key==='send')return sendLead();
 if(key==='cancel'){state.mode=null;state.step=null;bot('No problem. Nothing was sent.',null,CHIPS);return}
 if(key==='menu'){bot('What would you like to know?',null,CHIPS);return}
 if(key==='sell')return startLead('Sell my home');
 if(key==='find')return bot('Pick your area, then compare agents on results, reviews and fees.',[['Find agents','find-agents.html'],['Browse areas','areas.html']],[['Get matched instead','sell']]);
 if(key==='free')return answer('free');
 if(key==='rank')return answer('rank');
 if(key==='agent')return answer("i'm an agent");
 answer(label||key)}
function norm(q){return String(q).toLowerCase().replace(/[“”"]/g,'').replace(/[?!.,;:]+/g,' ').replace(/\s+/g,' ').trim()}
function answer(raw){var q=norm(raw);state.fails=state.fails||0;
 for(var i=0;i<SMALL.length;i++){if(SMALL[i].k.test(q)){var sm=SMALL[i];state.fails=0;
   if(sm.menu)return bot(sm.a,null,CHIPS);
   if(sm.send){state.lastQ='';return bot(sm.a,[['Contact us','contact.html']],[['Send a message to the team','msg'],['Back to menu','menu']])}
   if(sm.end)return bot(sm.a);
   return bot(sm.a,null,CHIPS)}}
 var best=null,bs=0;KB.forEach(function(e){var m=q.match(new RegExp(e.k.source,'g'));if(m&&m.length>bs){bs=m.length;best=e}});
 if(best){state.fails=0;return bot(best.a,best.l,[['Get matched free','sell'],['More questions','menu']])}
 if(/\b(sell|selling|list|listing|match)\b/.test(q)||/\bhome|house|property\b/.test(q))return startLead('Sell my home');
 state.fails++;state.lastQ=raw;
 if(state.fails===1)return bot("I'm not sure about that one. I can help with selling, finding agents, costs, rankings and areas. Try one of these, or ask in different words.",null,CHIPS);
 bot("Sorry, I still can't answer that. I can pass your question to the team and they'll reply by email.",null,[['Send my question to the team','msg'],['Back to menu','menu']])}
function startMsg(){state.mode='msg';state.msg={message:state.lastQ||''};if(state.msg.message)ask("What's your first name?",'mname','Your name');else ask("What would you like to ask the team?",'mtext','Type your question')}
function submit(e){e.preventDefault();var v=input.value.trim();if(!v)return;input.value='';me(v);
 if(state.mode==='msg'){var st=state.step,mm=state.msg;
  if(st==='mtext'){mm.message=v;return ask("What's your first name?",'mname','Your name')}
  if(st==='mname'){mm.name=v;return ask('Your email, so the team can reply.','memail','you@example.com','email')}
  if(st==='memail'){if(!/^\S+@\S+\.\S+$/.test(v)){bot("That doesn't look like an email address. Try again?");return}mm.email=v;state.step='mconsent';var mx=h('div','qc-m qc-bot','By sending, you agree to be contacted by email about your question. ');var pa=h('a','qc-link','Privacy');pa.href='privacy.html';mx.appendChild(pa);log.appendChild(mx);addChips([['Agree and send','msgsend'],['Cancel','cancel']]);return}
  return}
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
