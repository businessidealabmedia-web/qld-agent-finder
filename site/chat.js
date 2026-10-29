/* QLD Agent Finder: Pinny guide chat. Free, rule-based, no AI service. Saves leads to Supabase (source=chatbot) and questions to contacts. */
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
{w:6,k:/auction|private treaty|expression of interest|eoi|how (do|does) (you |a |an )?sell/,a:"Homes in Queensland are usually sold by auction or private treaty (a set price with offers). Which suits you depends on your home and market. A good agent will explain both and why they suggest one.",l:[['Questions to ask an agent','guides.html#questions']]},
{w:6,k:/choose|pick|select|which agent|right agent|what to ask|questions to ask|interview/,a:"Compare 2 or 3 agents on recent local sales, days to sell, reviews and fees. Ask each how they got to their price and what marketing costs. Our quiz can shortlist for you.",l:[['Take the match quiz','match.html'],['Questions to ask','guides.html#questions']]},
{w:6,k:/conveyanc|solicitor|lawyer|legal|contract/,a:"A conveyancer or solicitor checks your contract and handles settlement. It's wise to speak to one before you list. I can't give legal advice, so ask them about your situation.",l:[['Selling plan','tools.html#plan']]},
{w:6,k:/stamp duty|tax|cgt|capital gain|gst|mortgage|loan|bank/,a:"I can't give tax or finance advice. Your accountant and lender can help with that. Our calculator shows agent fees and other selling costs so you can see what you might keep.",l:[['Selling costs calculator','tools.html#costs']]},
{w:6,k:/open home|inspection|photo|styling|stage|staging|declutter|renovat|repair|paint/,a:"Good presentation helps. Tidy up, fix the obvious things and get strong photos. Ask your agent what is worth doing for your home before you spend money.",l:[['Selling plan','tools.html#plan']]},
{w:6,k:/best time|when should i sell|spring|season|market (is|now)|property market/,a:"The best time depends on your home and your plans, and it differs by suburb. A local agent can tell you what buyers are doing in your area right now.",l:[['Get matched free','sell.html']]},
{w:6,k:/without an agent|private sale|sell myself|fsbo|diy/,a:"Some people sell privately, but most use an agent for pricing, marketing and negotiating. Ask a few agents what they would do for you and what it costs, then decide.",l:[['Compare agents','find-agents.html']]},
{w:6,k:/negotiat|lower (the )?(fee|commission)|discount|cheaper agent/,a:"Commission and marketing costs can often be discussed. Ask each agent for their fee in writing and what is included before you sign.",l:[['Commission calculator','tools.html#commission']]},
{w:6,k:/multiple agents|more than one agent|two agents|several agents|exclusive|agreement|term of/,a:"Agents usually ask you to sign an agreement for a set period. Read the length, fees and cancellation terms before signing, and ask a conveyancer if unsure.",l:[]},
{w:6,k:/sold|sale history|recent sales|comparable|comps|neighbour/,a:"Ask each agent to show recent sales near you and how long they took. Our agent profiles show sales in the last 12 months and average days on market.",l:[['Find agents','find-agents.html']]},
{w:6,k:/how long (does it|to) sell|days on market|time to sell/,a:"It varies by suburb, price and how the home is presented. Agent profiles show their average days on market so you can compare.",l:[['Agent rankings','rankings.html']]},
{w:6,k:/remove|delete|unsubscribe|stop (contact|calling|emailing)|opt out|my details/,a:"To have your details changed or removed, email contact@qldagentfinder.com.au and we'll sort it out.",l:[['Contact us','contact.html']]},
{w:6,k:/facebook|instagram|social|follow/,a:"You can find us on Facebook and Instagram as QLD Agent Finder. Links are at the bottom of every page.",l:[]},
{w:6,k:/who (owns|runs|made|built)|about (you|us)|company|abn/,a:"QLD Agent Finder is a Queensland referral and comparison service, not a real estate agency. Agents pay to be listed. Sellers never pay.",l:[['About us','about.html'],['How we make money','about.html#money']]},
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
var QUICK=[['Sell my home','sell'],['Find an agent','find'],['Costs','free'],['Rankings','rank'],["I'm an agent",'agent'],['Areas','areas']];
var log,input,panel,launch,nudge,state,opened=false,queue=[],busy=false,hist=[];
function fresh(){state={mode:null,step:null,lead:{},msg:{},fails:0,lastQ:''}}fresh();
function h(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function save(){try{sessionStorage.setItem('qcH',JSON.stringify({h:hist.slice(-40),o:opened}))}catch(e){}}
function scroll(){log.scrollTop=log.scrollHeight}
function clearChips(){Array.prototype.forEach.call(log.querySelectorAll('.qc-chips'),function(n){n.remove()})}
function addMsg(kind,text,links,norec){var m=h('div','qc-m '+kind,text);if(links&&links.length){var r=h('div','qc-links');links.forEach(function(l){var a=h('a','qc-link',l[0]);a.href=l[1];r.appendChild(a)});m.appendChild(r)}log.appendChild(m);if(!norec){hist.push({k:kind,t:text,l:links||null});save()}scroll()}
function addChips(list){clearChips();var r=h('div','qc-chips');list.forEach(function(c){var b=h('button','qc-chip',c[0]);b.type='button';b.addEventListener('click',function(){me(c[0]);route(c[1],c[0])});r.appendChild(b)});log.appendChild(r);scroll()}
function me(t){clearChips();addMsg('qc-me',t)}
function bot(text,links,chips){queue.push({text:text,links:links,chips:chips});run()}
function run(){if(busy||!queue.length)return;busy=true;var it=queue.shift();var t=h('div','qc-m qc-bot qc-typing');t.setAttribute('aria-hidden','true');t.innerHTML='<i></i><i></i><i></i>';log.appendChild(t);scroll();
 setTimeout(function(){t.remove();addMsg('qc-bot',it.text,it.links);if(it.chips)addChips(it.chips);busy=false;run()},Math.min(800,260+it.text.length*4))}
function ask(prompt,key,ph,type){state.step=key;input.placeholder=ph||'Type here';input.type=type||'text';input.setAttribute('autocomplete',key==='phone'?'tel':key==='name'||key==='mname'?'name':key==='email'||key==='memail'?'email':'off');bot(prompt);input.focus()}
function resetInput(){state.mode=null;state.step=null;input.type='text';input.placeholder='Type a question';input.setAttribute('autocomplete','off')}
function startLead(goal){state.mode='lead';state.lead={goal:goal||'Sell my home'};ask('Great, let’s find your agent. Which suburb is the property in?','suburb','e.g. Springwood')}
function post(table,row,okFn){if(!LIVE){okFn();return}
 fetch(CFG.supabaseUrl+'/rest/v1/'+table,{method:'POST',headers:{apikey:CFG.supabaseAnonKey,Authorization:/^eyJ/.test(CFG.supabaseAnonKey)?'Bearer '+CFG.supabaseAnonKey:undefined,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)}).then(function(r){if(r.ok)okFn();else fail()}).catch(fail)}
function sendLead(){var l=state.lead;bot('Sending…');post('leads',{source:'chatbot',goal:l.goal,suburb:l.suburb,name:l.name,phone:l.phone,email:l.email||null,notes:'Via Pinny chat',consent:true},function(){resetInput();bot('Thanks '+(l.name||'')+'! A local agent will contact you soon. It’s free and there’s no obligation.',null,[['Ask something else','menu']])})}
function sendMsg(){var m=state.msg;bot('Sending…');post('contacts',{name:m.name,email:m.email,type:'Other (chat)',message:m.message},function(){resetInput();bot('Thanks '+m.name+'! The team will reply to '+m.email+' soon.',null,[['Ask something else','menu']])})}
function fail(){resetInput();bot('Sorry, that didn’t send. Please use the form instead or email contact@qldagentfinder.com.au.',[['Open the form','sell.html']])}
function startMsg(){state.mode='msg';state.msg={message:state.lastQ||''};if(state.msg.message)ask('What’s your first name?','mname','Your name');else ask('What would you like to ask the team?','mtext','Type your question')}
function consent(kind){state.step='consent';bot('By sending, you agree to be contacted '+(kind==='lead'?'by QLD Agent Finder and matched agents.':'by email about your question.'),[['Privacy policy','privacy.html']],[['Agree and send',kind==='lead'?'send':'msgsend'],['Cancel','cancel']])}
function route(key,label){
 if(key!=='send'&&key!=='msgsend'&&key!=='cancel'&&state.mode){resetInput()}
 if(key==='msg')return startMsg();
 if(key==='msgsend')return sendMsg();
 if(key==='send')return sendLead();
 if(key==='cancel'){resetInput();return bot('No problem, nothing was sent.')}
 if(key==='menu')return bot('Ask me about costs, rankings, areas, home value, how it works or joining as an agent. Or tap a button below.');
 if(key==='sell')return startLead('Sell my home');
 if(key==='find')return bot('Pick your area, then compare agents on results, reviews and fees.',[['Find agents','find-agents.html'],['Browse areas','areas.html']],[['Get matched instead','sell']]);
 if(key==='areas')return answer('areas');
 if(key==='free')return answer('free');
 if(key==='rank')return answer('rank');
 if(key==='agent')return answer("i'm an agent");
 answer(label||key)}
function norm(q){return String(q).toLowerCase().replace(/[“”"]/g,'').replace(/[?!.,;:]+/g,' ').replace(/\s+/g,' ').trim()}
var aiOff=!LIVE;
function askAI(raw){var msgs=hist.filter(function(m){return m.k==='qc-me'||m.k==='qc-bot'}).slice(-5).map(function(m){return {role:m.k==='qc-me'?'user':'assistant',content:m.t}});
 var t=h('div','qc-m qc-bot qc-typing');t.setAttribute('aria-hidden','true');t.innerHTML='<i></i><i></i><i></i>';log.appendChild(t);scroll();
 var ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},15000);
 fetch(CFG.supabaseUrl+'/functions/v1/qaf-ai',{method:'POST',headers:{'Content-Type':'application/json',apikey:CFG.supabaseAnonKey},body:JSON.stringify({mode:'chat',messages:msgs}),signal:ctl?ctl.signal:undefined})
 .then(function(r){clearTimeout(to);if(r.status===503||r.status===403||r.status===404)aiOff=true;return r.ok?r.json():null}).catch(function(){return null})
 .then(function(j){t.remove();if(j&&j.text){state.fails=0;bot(j.text,null,[['Get matched free','sell']])}else fallback(raw)})}
function answer(raw){var q=norm(raw);
 for(var i=0;i<SMALL.length;i++){if(SMALL[i].k.test(q)){var sm=SMALL[i];state.fails=0;
   if(sm.menu)return bot(sm.a+' costs, rankings, areas, home value, how it works, joining as an agent.');
   if(sm.send){state.lastQ='';return bot(sm.a,[['Contact us','contact.html']],[['Send a message to the team','msg']])}
   return bot(sm.a)}}
 var best=null,bs=0;KB.forEach(function(e){var m=q.match(new RegExp(e.k.source,'g'));if(!m)return;var sc=m.join('').length+(e.w||0);if(sc>bs){bs=sc;best=e}});
 if(best){state.fails=0;return bot(best.a,best.l,[['Get matched free','sell']])}
 if(/\b(sell|selling|list|listing|match)\b/.test(q))return startLead('Sell my home');
 if(!aiOff)return askAI(raw);
 return fallback(raw)}
function fallback(raw){state.fails++;state.lastQ=raw;
 if(state.fails===1)return bot('I’m not sure about that one. I can help with selling, finding agents, costs, rankings and areas. Try the buttons below or ask in different words.');
 bot('Sorry, I still can’t answer that. I can pass your question to the team and they’ll reply by email.',null,[['Send my question to the team','msg']])}
function submit(e){e.preventDefault();var v=input.value.trim();if(!v)return;input.value='';me(v);
 if(state.mode==='msg'){var st=state.step,mm=state.msg;
  if(st==='mtext'){mm.message=v;return ask('What’s your first name?','mname','Your name')}
  if(st==='mname'){mm.name=v;return ask('Your email, so the team can reply.','memail','you@example.com','email')}
  if(st==='memail'){if(!/^\S+@\S+\.\S+$/.test(v)){bot('That doesn’t look like an email address. Try again?');return}mm.email=v;return consent('msg')}
  return}
 if(state.mode==='lead'){var s=state.step,l=state.lead;
  if(s==='suburb'){l.suburb=v;return ask('What’s your first name?','name','Your name')}
  if(s==='name'){l.name=v;return ask('Best mobile number for the agent to reach you?','phone','04xx xxx xxx','tel')}
  if(s==='phone'){if(v.replace(/\D/g,'').length<8){bot('That doesn’t look like a phone number. Try again?');return}l.phone=v;return ask('Email (optional). Type "skip" to skip.','email','you@example.com')}
  if(s==='email'){l.email=/^\S+@\S+\.\S+$/.test(v)?v:'';return consent('lead')}
  return}
 answer(v)}
function greet(){var p=location.pathname.split('/').pop();var t='Hi, I’m Pinny, the QLD Agent Finder guide. I’m automated, not a person. What can I help with?';
 if(/^real-estate-agents-/.test(p))t='Hi, I’m Pinny. Looking for an agent in this area? I can match you with one for free.';
 else if(p==='tools.html')t='Hi, I’m Pinny. Want help with the calculators or choosing an agent?';
 bot(t,null,QUICK.slice(0,3))}
function reset(){queue=[];busy=false;hist=[];log.innerHTML='';fresh();resetInput();save();greet()}
function open(o){opened=o;panel.hidden=!o;launch.setAttribute('aria-expanded',o);launch.classList.toggle('on',o);if(nudge)nudge.hidden=true;
 if(o){if(!log.children.length)greet();setTimeout(scroll,0);input.focus()}else launch.focus();save()}
function build(){
 launch=h('button','qc-launch');launch.type='button';launch.setAttribute('aria-label','Chat with Pinny');launch.setAttribute('aria-expanded','false');
 var i=h('img');i.src='pinny-wave.png';i.alt='';i.width=44;i.height=58;launch.appendChild(i);launch.appendChild(h('span','qc-lt','Need help?'));
 panel=h('div','qc-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Chat with Pinny, automated guide');panel.hidden=true;
 var hd=h('div','qc-hd');var av=h('img');av.src='pinny-wave.png';av.alt='';hd.appendChild(av);var t=h('div','qc-ht');t.appendChild(h('b',null,'Pinny'));t.appendChild(h('small',null,'Automated guide · replies instantly'));hd.appendChild(t);
 var rs=h('button','qc-ic','↻');rs.type='button';rs.title='Start over';rs.setAttribute('aria-label','Start over');hd.appendChild(rs);
 var x=h('button','qc-ic','×');x.type='button';x.setAttribute('aria-label','Close chat');hd.appendChild(x);
 log=h('div','qc-log');log.setAttribute('role','log');log.setAttribute('aria-live','polite');
 var bar=h('div','qc-quick');QUICK.forEach(function(c){var b=h('button','qc-pill',c[0]);b.type='button';b.addEventListener('click',function(){me(c[0]);route(c[1],c[0])});bar.appendChild(b)});
 var form=h('form','qc-form');input=h('input');input.placeholder='Type a question';input.setAttribute('aria-label','Your message');input.maxLength=200;var sb=h('button','qc-send','Send');sb.type='submit';form.appendChild(input);form.appendChild(sb);
 panel.appendChild(hd);panel.appendChild(log);panel.appendChild(bar);panel.appendChild(form);document.body.appendChild(launch);document.body.appendChild(panel);
 launch.addEventListener('click',function(){open(!opened)});x.addEventListener('click',function(){open(false)});rs.addEventListener('click',reset);
 panel.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});form.addEventListener('submit',submit);
 try{var s=JSON.parse(sessionStorage.getItem('qcH')||'null');if(s&&s.h&&s.h.length){hist=s.h;hist.forEach(function(m){addMsg(m.k,m.t,m.l,true)});if(s.o)open(true)}}catch(e){}
 /* gentle nudge, once per visit, only on browsing pages */
 var pg=location.pathname.split('/').pop()||'index.html';
 if(!opened&&!/^(sell|join|contact|thank-you|privacy|terms|404)/.test(pg)){try{if(sessionStorage.getItem('qcN'))return}catch(e){}
  setTimeout(function(){if(opened)return;nudge=h('div','qc-nudge');var b=h('button','qc-nb','Not sure which agent to pick? Ask Pinny.');b.type='button';b.addEventListener('click',function(){open(true)});var c=h('button','qc-nx','×');c.type='button';c.setAttribute('aria-label','Dismiss');c.addEventListener('click',function(){nudge.hidden=true});nudge.appendChild(b);nudge.appendChild(c);document.body.appendChild(nudge);try{sessionStorage.setItem('qcN','1')}catch(e){}setTimeout(function(){if(nudge)nudge.hidden=true},14000)},12000)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
