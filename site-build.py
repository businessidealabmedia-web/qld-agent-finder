import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'site')
PIN='<svg width="34" height="38" viewBox="0 0 96 104" aria-hidden="true"><path d="M48 0C21.5 0 0 21 0 47c0 33 48 57 48 57s48-24 48-57C96 21 74.5 0 48 0z" fill="#7A1F33"/><path d="M24 50 48 30 72 50" fill="none" stroke="#E8A33D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><rect x="34" y="50" width="28" height="22" rx="3" fill="#FBF6EF"/></svg>'
TICK='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A33D" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>'

def head(title,desc,path):
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://qldagentfinder.com.au/{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://qldagentfinder.com.au/og-image.png">
<meta property="og:type" content="website">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="topbar"><div class="wrap"><span>Free for Queensland home sellers<span class="hide-sm"> · No obligation</span></span><a href="contact.html">Contact us</a></div></div>
<header>
<div class="wrap nav">
<a class="logo" href="index.html" aria-label="QLD Agent Finder home">{PIN}<span><b>QLD</b> Agent Finder</span></a>
<button class="menu-btn" aria-label="Open menu" aria-expanded="false" onclick="toggleMenu(this)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1C1A1F" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
<ul id="menu">
<li class="dd"><a href="find-agents.html">Find agents</a><ul><li><a href="find-agents.html">Search local agents</a></li><li><a href="rankings.html">Agent rankings</a></li><li><a href="find-agents.html#compare">Compare agents</a></li><li><a href="areas.html">Browse by area</a></li></ul></li>
<li class="dd"><a href="sell.html">Sellers</a><ul><li><a href="sell.html">List / sell your home</a></li><li><a href="sell.html?goal=appraisal">Free appraisal</a></li><li><a href="how-it-works.html">How it works</a></li></ul></li>
<li class="dd"><a href="tools.html">Tools</a><ul><li><a href="tools.html#commission">Commission calculator</a></li><li><a href="tools.html#costs">Selling costs calculator</a></li></ul></li>
<li><a href="areas.html">Areas</a></li>
<li><a href="services.html">Services</a></li>
<li><a href="guides.html">Guides</a></li>
<li class="dd"><a href="for-agents.html">For agents</a><ul><li><a href="for-agents.html">Why join</a></li><li><a href="join.html">List yourself as an agent</a></li><li><a href="for-agents.html#pricing">Pricing</a></li><li><a data-portal href="#">Agent login</a></li></ul></li>
</ul>
<div class="actions"><a class="btn btn-ghost" href="join.html">I'm an agent</a><a class="btn btn-maroon" href="sell.html">Free appraisal</a></div>
</div>
</header>
<main>
'''

AREA_LINKS=''.join(f'<li><a href="real-estate-agents-{x}.html">{n}</a></li>' for n,x in [('Brisbane','brisbane'),('Gold Coast','gold-coast'),('Sunshine Coast','sunshine-coast'),('Logan','logan'),('Ipswich','ipswich'),('Moreton Bay','moreton-bay'),('Redlands','redlands'),('Toowoomba','toowoomba')])
FOOT='''</main>
<footer>
<div class="wrap">
<div class="foot">
<div><a class="logo" href="index.html" style="color:#F5EFE6"><span><b style="color:#E8A33D">QLD</b> Agent Finder</span></a><p>Find the right agent. Locally.<br>Helping Queensland homeowners compare trusted local real estate agents.</p></div>
<div><h4>Sellers</h4><ul><li><a href="sell.html">List your home</a></li><li><a href="find-agents.html">Find agents</a></li><li><a href="rankings.html">Agent rankings</a></li><li><a href="tools.html">Calculators</a></li><li><a href="guides.html">Guides</a></li></ul></div>
<div><h4>Top areas</h4><ul>{AREA_LINKS}</ul></div>
<div><h4>Agents</h4><ul><li><a href="join.html">List yourself</a></li><li><a href="for-agents.html">Why join</a></li><li><a href="for-agents.html#pricing">Pricing</a></li><li><a href="faq.html#agents">Agent FAQ</a></li><li><a data-portal href="#">Agent login</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="services.html">Services</a></li><li><a href="areas.html">Areas</a></li><li><a href="about.html">About us</a></li><li><a href="about.html#money">How we make money</a></li><li><a href="faq.html">FAQ</a></li><li><a href="contact.html">Contact</a></li><li><a href="https://www.facebook.com/qldagentfinder.au/" rel="noopener">Facebook</a> · <a href="https://www.instagram.com/qldagentfinder/" rel="noopener">Instagram</a></li></ul></div>
</div>
<div class="legal">© <span data-year>2026</span> QLD Agent Finder · <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms of Use</a><br>Photos via <a href="https://unsplash.com">Unsplash</a>. QLD Agent Finder is an agent referral and comparison service, not a licensed real estate agency. Agent order and rankings are not an endorsement; see how rankings work on our <a href="rankings.html#method">rankings page</a>.</div>
</div>
</footer>
<a class="btn btn-gold sticky-cta" href="sell.html">Get my free appraisal</a>
<script src="config.js"></script>
<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
'''

def hero(eyebrow,h1,lead,crumb=''):
    c=f'<div class="breadcrumb"><a href="index.html">Home</a> › {crumb}</div>' if crumb else ''
    return f'<section class="page-hero"><div class="wrap">{c}<div class="eyebrow">{eyebrow}</div><h1>{h1}</h1><p style="font-size:20px;max-width:680px;opacity:.92;margin:0">{lead}</p></div></section>'

import json, datetime
SITE='https://qldagentfinder.com.au'
NOINDEX={'thank-you.html','404.html','compare.html','agent.html'}
ORG={"@context":"https://schema.org","@type":"Organization","@id":SITE+"/#org","name":"QLD Agent Finder","url":SITE+"/","logo":SITE+"/icon-512.png","email":"contact@qldagentfinder.com.au","slogan":"Find the right agent. Locally.","areaServed":{"@type":"State","name":"Queensland"},"sameAs":["https://www.facebook.com/qldagentfinder.au/","https://www.instagram.com/qldagentfinder/"]}
WEBSITE={"@context":"https://schema.org","@type":"WebSite","@id":SITE+"/#website","name":"QLD Agent Finder","url":SITE+"/","publisher":{"@id":SITE+"/#org"},"potentialAction":{"@type":"SearchAction","target":SITE+"/find-agents?q={search_term_string}","query-input":"required name=search_term_string"}}
def clean(fn): return '' if fn=='index.html' else fn[:-5]
def faq_ld(items): return {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in items]}
def crumbs_ld(fn,name): return {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":SITE+"/"},{"@type":"ListItem","position":2,"name":name,"item":SITE+"/"+clean(fn)}]}
def page(fn,title,desc,body,ld=None,crumb=None):
    html=(head(title,desc,clean(fn))+body+FOOT).replace('{AREA_LINKS}',AREA_LINKS)
    url=SITE+'/'+clean(fn)
    lds=list(ld or [])
    if fn=='index.html': lds=[ORG,WEBSITE]+lds
    elif fn not in NOINDEX: lds.append(crumbs_ld(fn,crumb or title.split(' | ')[0]))
    extra=f"""<meta property="og:url" content="{url}">
<meta property="og:site_name" content="QLD Agent Finder">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE}/og-image.png">
<meta name="theme-color" content="#7A1F33">
<link rel="icon" href="favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
"""+('<meta name="robots" content="noindex,follow">\n' if fn in NOINDEX else '<meta name="robots" content="index,follow,max-image-preview:large">\n')
    extra+=''.join('<script type="application/ld+json">'+json.dumps(x,ensure_ascii=False)+'</script>\n' for x in lds)
    if fn=='index.html': extra+='<link rel="preload" as="image" href="https://images.unsplash.com/photo-1725406029499-c18ff37c534f?w=1600&q=55&auto=format&fit=crop" fetchpriority="high">\n'
    html=html.replace('</head>',extra+'</head>',1)
    open(os.path.join(D,fn),'w').write(html)


FAQ_SELL=[("Is QLD Agent Finder really free for sellers?","Yes. It is 100% free for home sellers. Agents in our network pay us, never you."),
("Do I have to list with an agent you match me with?","No. There is no obligation. Meet the agents, compare them and decide in your own time."),
("How are agents ranked?","Each agent gets a score out of 100 based on reviews, sales volume, speed of sale and experience. See the full method on our rankings page."),
("Who sees my details?","Only the agents you choose or are matched with. We never sell your information."),
("Can I just find out what my home is worth?","Yes. Choose “Know my home's value” in the form and a local agent can give you a free appraisal.")]
FAQ_AGENT=[("Who can join?","Licensed Queensland real estate agents and property managers with a current registration."),
("How much does it cost?","Founding partners get a free profile during our launch. See the pricing section on the For Agents page."),
("How are enquiries shared?","Seller enquiries are matched to agents by suburb, property type and performance. You are notified by email and phone."),
("Can I improve my ranking?","Rankings are based on reviews, sales, speed of sale and experience. Keeping your results up to date helps sellers see your track record.")]
def faq(items):
    return ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in items)

# ---------------- HOME ----------------
page('index.html','QLD Agent Finder | Compare & Find Top Real Estate Agents in Queensland','Compare top-rated local real estate agents in Queensland. See agent rankings, fees and results, list your home, and get a free appraisal. Free for sellers.',f'''
<section class="hero photo" style="padding-bottom:120px">
<svg class="pin" viewBox="0 0 96 104" aria-hidden="true"><path d="M48 0C21.5 0 0 21 0 47c0 33 48 57 48 57s48-24 48-57C96 21 74.5 0 48 0z" fill="#FBF6EF"/></svg>
<div class="wrap" style="position:relative">
<div class="eyebrow">Queensland's agent finder</div>
<h1 style="max-width:820px">Find the right agent. Locally.</h1>
<p class="lead" style="margin-bottom:28px">Compare top local agents by results, reviews and fees. Free for sellers, no obligation.</p>
<form class="search" id="homeSearch" action="find-agents.html" role="search">
<label for="hsQ" class="sr" style="position:absolute;left:-9999px">Suburb or agent</label>
<input id="hsQ" name="q" placeholder="Enter your suburb, e.g. Springwood">
<select id="hsRegion" name="region" aria-label="Region"></select>
<button class="btn btn-gold" type="submit">Find agents</button>
</form>
<div class="trust"><span>{TICK}100% free for sellers</span><span>{TICK}Ranked on real results</span><span>{TICK}Local QLD agents</span></div>
</div>
</section>

<div class="wrap paths">
<a class="path" href="sell.html"><b>I'm selling my home</b><span>List your property and get matched with top local agents. Free appraisal.</span><span class="go">List my home →</span></a>
<a class="path" href="find-agents.html"><b>I want to compare agents</b><span>Search by suburb, see rankings, and compare up to 3 agents side by side.</span><span class="go">Compare agents →</span></a>
<a class="path" href="join.html"><b>I'm a real estate agent</b><span>Create your profile and get in front of motivated local sellers.</span><span class="go">List myself →</span></a>
</div>

<section id="how">
<div class="wrap">
<div class="center"><div class="eyebrow">How it works</div><h2>3 simple steps. Zero cost to you.</h2></div>
<div class="grid3">
<div class="tile"><div class="num">1</div><h3>Search your suburb</h3><p>See the agents who are active and successful where you live.</p></div>
<div class="tile"><div class="num">2</div><h3>Compare &amp; shortlist</h3><p>Check rankings, sales, days on market, reviews and typical fees.</p></div>
<div class="tile"><div class="num gold">3</div><h3>Get free appraisals</h3><p>Request appraisals from the agents you like. No obligation to list.</p></div>
</div>
</div>
</section>

<section class="white">
<div class="wrap">
<div style="display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap;margin-bottom:28px"><div><div class="eyebrow">Agent rankings</div><h2 style="margin:0">Top-ranked agents in Queensland</h2></div><a class="btn btn-ghost" href="rankings.html">See all rankings</a></div>
<div class="grid3" id="topAgents"></div>
</div>
</section>

<section class="white"><div class="wrap split">
<img src="https://images.unsplash.com/photo-1492889971304-ac16ab4a4a5a?w=900&q=60&auto=format&fit=crop" alt="Two-storey family home" loading="lazy" width="900" height="675">
<div><div class="eyebrow">Selling in Queensland</div><h2>Your home deserves the right agent</h2><p>The agent you choose can change your sale price, how long it takes, and how stressful it feels. We help you choose on real local results, not a letterbox flyer.</p><p><a class="btn btn-maroon" href="sell.html">List my home free</a> <a class="btn btn-ghost" href="services.html">Our services</a></p></div>
</div></section>
<section>
<div class="wrap">
<div class="center"><div class="eyebrow">Why QLD Agent Finder</div><h2>Built for Queensland sellers</h2><p>The big portals show you listings. We help you choose the person who sells your home.</p></div>
<div class="grid4">
<div class="tile"><h3>Local first</h3><p>Matched on suburb knowledge, not just a postcode.</p></div>
<div class="tile"><h3>Transparent rankings</h3><p>Scores based on reviews, sales, speed and experience. Method published.</p></div>
<div class="tile"><h3>Always free</h3><p>No cost to sellers, ever. Agents fund the service.</p></div>
<div class="tile"><h3>No spam</h3><p>Your details only go to the agents you choose.</p></div>
</div>
</div>
</section>

<section class="white">
<div class="wrap">
<div class="center"><div class="eyebrow">Free tools</div><h2>Plan your sale with confidence</h2></div>
<div class="grid3">
<a class="guide" href="tools.html#commission"><div class="tag">Calculator</div><h3>Commission calculator</h3><p>Estimate agent fees on your sale price.</p></a>
<a class="guide" href="tools.html#costs"><div class="tag">Calculator</div><h3>Selling costs calculator</h3><p>See what you could walk away with.</p></a>
<a class="guide" href="guides.html#questions"><div class="tag">Checklist</div><h3>5 questions to ask an agent</h3><p>Know what to ask before you sign.</p></a>
</div>
</div>
</section>

<section id="areas">
<div class="wrap">
<div class="center"><div class="eyebrow">Where we help</div><h2>Find agents across Queensland</h2></div>
<div class="areas" id="areaTiles"></div><p style="text-align:center;margin-top:24px"><a class="btn btn-ghost" href="areas.html">All areas</a></p>
</div>
</section>

<section class="white">
<div class="wrap" style="max-width:820px">
<div class="center"><div class="eyebrow">FAQ</div><h2>Questions sellers ask</h2></div>
{faq(FAQ_SELL)}
<p style="text-align:center;margin-top:20px"><a href="faq.html">See all FAQs →</a></p>
</div>
</section>

<section>
<div class="wrap"><div class="cta-band"><h2>Ready to find your agent?</h2><p style="font-size:19px;max-width:560px;margin:0 auto 24px">It takes under a minute, it's free, and there's no obligation.</p><a class="btn btn-gold" href="sell.html">List my home free</a></div></div>
</section>''',ld=[faq_ld(FAQ_SELL)])

# ---------------- FIND AGENTS ----------------
page('find-agents.html','Find & Compare Real Estate Agents in Queensland | QLD Agent Finder','Search Queensland real estate agents by suburb or region. Compare rankings, sales, days on market, reviews and fees.',(hero('Find agents','Find &amp; compare local agents','Search by suburb, sort by what matters to you, and compare up to 3 agents side by side.','Find agents')).replace('<section class="page-hero">','<section class="page-hero" id="findHero">',1).replace('<h1>','<h1 id="findTitle">',1)+'''
<section style="padding-top:40px" id="compare">
<div class="wrap">
<div class="filters">
<div class="field"><label for="fQuery">Suburb, agent or agency</label><input id="fQuery" placeholder="e.g. Springwood"></div>
<div class="field"><label for="fRegion">Region</label><select id="fRegion"></select></div>
<div class="field"><label for="fSort">Sort by</label><select id="fSort"><option value="score">Ranking score</option><option value="rating">Highest rated</option><option value="sold">Most sales</option><option value="days">Fastest sales</option></select></div>
</div>
<p class="small" id="fCount" aria-live="polite"></p>
<div class="grid3" id="directory"></div>
<div class="tile" style="margin-top:32px;text-align:center"><h3>Can't decide? Let us match you.</h3><p>Tell us about your property and we'll suggest the best local agents for you.</p><a class="btn btn-maroon" href="sell.html">Get matched free</a></div>
</div>
</section>
<div class="cmpbar" id="cmpbar"><div class="wrap"><span id="cmpCount">0 selected</span><a class="btn btn-gold" id="cmpGo" href="compare.html">Compare now</a></div></div>''')

# ---------------- COMPARE ----------------
page('compare.html','Compare Agents Side by Side | QLD Agent Finder','Compare Queensland real estate agents side by side.',hero('Compare','Agents side by side','Results, reviews, speed and fees in one view.','<a href="find-agents.html">Find agents</a> › Compare')+'<section><div class="wrap" id="compareTable"></div></section>')

# ---------------- AGENT PROFILE ----------------
page('agent.html','Agent Profile | QLD Agent Finder','Real estate agent profile on QLD Agent Finder.','''
<section class="page-hero"><div class="wrap" id="profile">
<div class="breadcrumb"><a href="index.html">Home</a> › <a href="find-agents.html">Find agents</a> › Profile</div>
<div class="agent-top"><div class="avatar" id="pInit" style="width:96px;height:96px;font-size:34px;background:#FBF6EF;color:#7A1F33"></div><div><h1 id="pName" style="margin:0"></h1><div id="pAgency" style="font-size:18px;opacity:.9"></div></div></div>
<div class="badges" id="pBadges" style="margin-top:16px"></div>
</div></section>
<section><div class="wrap profile">
<div>
<div class="notice" id="pDemo" hidden>This is a demo profile to show how agent pages work. Real partner agents will appear here.</div>
<div class="kpis" id="pKpis" style="grid-template-columns:repeat(3,minmax(0,1fr));padding:20px;gap:16px;background:#fff;border:1px solid #E6DDD0"></div>
<h2 style="margin-top:40px;font-size:30px">About</h2><p id="pAbout"></p>
<h2 style="font-size:30px">Suburbs covered</h2><div class="chips" id="pSuburbs" style="justify-content:flex-start"></div>
<h2 style="margin-top:40px;font-size:30px">How this agent is scored</h2><p>Scores combine reviews (40%), sales volume (30%), speed of sale (20%) and experience (10%). <a href="rankings.html#method">Full method</a>.</p>
</div>
<div class="card" style="position:sticky;top:96px">
<h3>Request a free appraisal</h3>
<form name="agent-enquiry" method="POST" action="thank-you.html" data-netlify="true" netlify-honeypot="hp">
<input type="hidden" name="form-name" value="agent-enquiry"><p hidden><label>Leave empty <input name="hp"></label></p>
<input type="hidden" name="agent" id="pAgentField">
<div class="field"><label for="eN">Your name</label><input id="eN" name="name" required autocomplete="name"></div>
<div class="field"><label for="eP">Mobile</label><input id="eP" name="phone" type="tel" required autocomplete="tel"></div>
<div class="field"><label for="eE">Email</label><input id="eE" name="email" type="email" required autocomplete="email"></div>
<div class="field"><label for="eA">Property address or suburb</label><input id="eA" name="address" required autocomplete="street-address"></div>
<button class="btn btn-gold" type="submit" style="width:100%">Send request</button>
<p class="small">Free and no obligation. <a href="privacy.html">Privacy</a></p>
</form>
</div>
</div></section>''')

# ---------------- RANKINGS ----------------
page('rankings.html','Top Real Estate Agent Rankings in Queensland | QLD Agent Finder','See the top-ranked real estate agents in Queensland by region, scored on reviews, sales, speed and experience.',hero('Agent rankings','Top agents in Queensland','Ranked by real performance, not who pays the most.','Agent rankings')+'''
<section><div class="wrap" style="max-width:920px">
<div class="tabs" id="rankTabs" role="group" aria-label="Filter by region"></div>
<div id="rankList"></div>
<div class="tile" id="method" style="margin-top:40px">
<h2 style="font-size:30px">How rankings work</h2>
<p>Every agent gets a score out of 100:</p>
<ul><li><b>Reviews (40%)</b> — average star rating from sellers</li><li><b>Sales volume (30%)</b> — properties sold in the last 12 months</li><li><b>Speed of sale (20%)</b> — average days on market</li><li><b>Experience (10%)</b> — years selling (capped at 20)</li></ul>
<p>Paid placement never changes an agent's score. Any sponsored listing will be clearly labelled.</p>
</div>
</div></section>''')

# ---------------- SELL / LIST HOME ----------------
page('sell.html','List Your Home & Get a Free Appraisal | QLD Agent Finder','List your Queensland property and get matched with top local agents for a free, no-obligation appraisal.',hero('For sellers','List your home. Get matched free.','Tell us about your property and we will connect you with the best local agents. Takes about 1 minute.','List your home')+f'''
<section><div class="wrap calc" style="align-items:start">
<div class="card">
<div class="steps-bar" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<form name="list-my-home" method="POST" action="thank-you.html" data-netlify="true" netlify-honeypot="hp" data-steps novalidate>
<input type="hidden" name="form-name" value="list-my-home"><p hidden><label>Leave empty <input name="hp"></label></p>
<input type="hidden" name="agent">
<div class="step"><h3>What would you like to do?</h3>
<div class="choices">
<label><input type="radio" name="goal" value="Sell my home" required><span>Sell my home</span></label>
<label><input type="radio" name="goal" value="Know my home's value"><span>Know my home's value</span></label>
<label><input type="radio" name="goal" value="Sell and buy"><span>Sell &amp; buy</span></label>
<label><input type="radio" name="goal" value="Lease / property management"><span>Lease / manage</span></label>
</div><div class="err" role="alert"></div>
<div class="form-nav"><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>Where is the property?</h3>
<div class="field"><label for="sAddr">Street address (optional)</label><input id="sAddr" name="address" autocomplete="street-address"></div>
<div class="field"><label for="sSub">Suburb</label><input id="sSub" name="suburb" required autocomplete="address-level2"></div>
<div class="field"><label for="sPc">Postcode</label><input id="sPc" name="postcode" inputmode="numeric" maxlength="4" required></div>
<div class="err" role="alert"></div>
<div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>About the property</h3>
<div class="field"><label for="sType">Property type</label><select id="sType" name="property_type" required><option value="">Select…</option><option>House</option><option>Townhouse</option><option>Unit / Apartment</option><option>Land</option><option>Acreage</option><option>Other</option></select></div>
<div class="choices" style="grid-template-columns:1fr 1fr 1fr">
<div class="field" style="margin:0"><label for="sBed">Beds</label><select id="sBed" name="bedrooms"><option></option><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></div>
<div class="field" style="margin:0"><label for="sBath">Baths</label><select id="sBath" name="bathrooms"><option></option><option>1</option><option>2</option><option>3</option><option>4+</option></select></div>
<div class="field" style="margin:0"><label for="sCar">Cars</label><select id="sCar" name="car_spaces"><option></option><option>0</option><option>1</option><option>2</option><option>3+</option></select></div>
</div>
<div class="field"><label for="sWhen">When do you want to sell?</label><select id="sWhen" name="timeframe" required><option value="">Select…</option><option>ASAP</option><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option><option>Just researching</option></select></div>
<div class="field"><label for="sPrice">Price expectation (optional)</label><select id="sPrice" name="price_expectation"><option></option><option>Under $500k</option><option>$500k – $750k</option><option>$750k – $1m</option><option>$1m – $1.5m</option><option>$1.5m – $2m</option><option>$2m+</option><option>Not sure</option></select></div>
<div class="err" role="alert"></div>
<div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>Where should we send your matches?</h3>
<div class="field"><label for="sN">Full name</label><input id="sN" name="name" required autocomplete="name"></div>
<div class="field"><label for="sM">Mobile</label><input id="sM" name="phone" type="tel" placeholder="04xx xxx xxx" required autocomplete="tel"></div>
<div class="field"><label for="sE">Email</label><input id="sE" name="email" type="email" required autocomplete="email"></div>
<div class="field"><label for="sNote">Anything agents should know? (optional)</label><textarea id="sNote" name="notes" rows="3"></textarea></div>
<label class="chk" style="margin-bottom:12px"><input type="checkbox" name="consent" value="yes" required> I agree to be contacted by QLD Agent Finder and matched agents. <a href="privacy.html">Privacy</a></label>
<div class="err" role="alert"></div>
<div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="submit" class="btn btn-gold">Get my free matches</button></div></div>
</form>
</div>
<div>
<img src="https://images.unsplash.com/photo-1635315891380-f70330a5b41b?w=800&q=60&auto=format&fit=crop" alt="Bright, styled bedroom ready for sale" loading="lazy" width="800" height="500" style="width:100%;border-radius:20px;aspect-ratio:16/10;object-fit:cover;margin-bottom:24px">
<h2>What happens next?</h2>
<div class="tile" style="margin-bottom:14px"><div class="num">1</div><h3>We review your property</h3><p>Our team looks at your suburb, property type and timing.</p></div>
<div class="tile" style="margin-bottom:14px"><div class="num">2</div><h3>We match top local agents</h3><p>Usually within 1 business day, by phone or email.</p></div>
<div class="tile"><div class="num gold">3</div><h3>You choose</h3><p>Meet the agents, compare appraisals and fees. No obligation.</p></div>
<div class="trust" style="color:#1C1A1F"><span>{TICK}Free</span><span>{TICK}No obligation</span><span>{TICK}No spam</span></div>
</div>
</div></section>''')

# ---------------- HOW IT WORKS ----------------
page('how-it-works.html','How It Works | QLD Agent Finder','How QLD Agent Finder helps Queensland sellers find and compare the right real estate agent, free.',hero('How it works','Choosing an agent, made simple','Here is exactly how we help you find the right agent, and how we keep it free.','How it works')+'''
<section><div class="wrap" style="max-width:860px">
<div class="tile" style="margin-bottom:16px"><div class="num">1</div><h3>Search or tell us about your home</h3><p>Search agents by suburb yourself, or fill in our 1-minute form and we will do the matching for you.</p></div>
<div class="tile" style="margin-bottom:16px"><div class="num">2</div><h3>Compare agents on real results</h3><p>Every agent profile shows a ranking score, reviews, sales in the last 12 months, average days on market, experience and typical fees. Compare up to 3 side by side.</p></div>
<div class="tile" style="margin-bottom:16px"><div class="num">3</div><h3>Get free appraisals</h3><p>Request appraisals from the agents you like. Ask the right questions using our free checklist.</p></div>
<div class="tile"><div class="num gold">4</div><h3>Choose with confidence</h3><p>Pick the agent who fits you best. There is no obligation, and our service is always free for sellers.</p></div>
<p style="text-align:center;margin-top:32px"><a class="btn btn-maroon" href="sell.html">Get started free</a> <a class="btn btn-ghost" href="find-agents.html">Search agents</a></p>
</div></section>''')

# ---------------- TOOLS ----------------
page('tools.html','Commission & Selling Costs Calculators | QLD Agent Finder','Free Queensland real estate commission calculator and selling costs calculator.',hero('Free tools','Calculators for sellers','Estimate agent fees and what you could walk away with.','Tools')+'''
<section id="commission" class="white"><div class="wrap calc">
<div><div class="eyebrow">Commission calculator</div><h2>How much could agent fees cost?</h2>
<div class="field"><label for="price">Expected sale price: <span id="priceOut"></span></label><input type="range" id="price" min="300000" max="3000000" step="10000" value="850000"></div>
<div class="field"><label for="rate">Commission rate: <span id="rateOut"></span></label><input type="range" id="rate" min="1" max="4" step="0.1" value="2.5"></div></div>
<div class="calc-out" aria-live="polite"><div class="small" style="color:#F5EFE6">Estimated commission (incl. GST)</div><div class="big" id="feeOut"></div>
<p>A 0.5% difference on this price is <b id="diffOut"></b>.</p><p class="small" style="color:#e9dfe1">Estimate only. Fees depend on each agent's agreement.</p><a class="btn btn-gold" href="find-agents.html">Compare agent fees</a></div>
</div></section>
<section id="costs"><div class="wrap calc" id="sellCalc">
<div><div class="eyebrow">Selling costs calculator</div><h2>What could you walk away with?</h2>
<div class="field"><label for="scPrice">Sale price ($)</label><input id="scPrice" type="number" value="850000" min="0"></div>
<div class="field"><label for="scRate">Commission rate (%)</label><input id="scRate" type="number" value="2.5" step="0.1" min="0"></div>
<div class="field"><label for="scMarketing">Marketing ($)</label><input id="scMarketing" type="number" value="4000" min="0"></div>
<div class="field"><label for="scLegal">Conveyancing / legal ($)</label><input id="scLegal" type="number" value="1500" min="0"></div>
<div class="field"><label for="scOther">Other costs, e.g. styling, repairs ($)</label><input id="scOther" type="number" value="0" min="0"></div></div>
<div class="calc-out" aria-live="polite"><div class="small" style="color:#F5EFE6">Commission (incl. GST)</div><div style="font-size:26px;font-weight:800" id="scCom"></div>
<div class="small" style="color:#F5EFE6;margin-top:12px">Total selling costs</div><div style="font-size:26px;font-weight:800" id="scTotal"></div>
<div class="small" style="color:#F5EFE6;margin-top:12px">Estimated amount after costs</div><div class="big" id="scNet"></div>
<p class="small" style="color:#e9dfe1">Estimate only, before mortgage payout and tax. Get personal advice.</p></div>
</div></section>''')

# ---------------- GUIDES ----------------
page('guides.html','Seller Guides & Tips | QLD Agent Finder','Free guides for Queensland home sellers: how to choose an agent, questions to ask, and preparing to sell.',hero('Guides','Seller guides','Plain-English help for selling in Queensland.','Guides')+'''
<section><div class="wrap" style="max-width:820px">
<article class="tile" id="questions" style="margin-bottom:20px"><div class="eyebrow">Checklist</div><h2 style="font-size:30px">5 questions to ask before you sign with an agent</h2>
<ol><li>How many homes have you sold in my suburb this year?</li><li>How did you arrive at this price estimate? Can I see comparable sales?</li><li>What is your commission and what exactly is included?</li><li>What is your marketing plan, and what will it cost me?</li><li>Can I speak with some of your recent sellers?</li></ol></article>
<article class="tile" id="choose" style="margin-bottom:20px"><div class="eyebrow">Guide</div><h2 style="font-size:30px">How to choose the right agent</h2>
<p><b>Look local.</b> An agent who sells regularly in your suburb knows the buyers and the prices.</p><p><b>Don't just chase the highest appraisal.</b> An inflated price can win the listing but leave your home sitting on the market.</p><p><b>Compare results, not promises.</b> Look at recent sales, average days on market and reviews.</p><p><b>Understand the fees.</b> Ask for commission and marketing costs in writing before you sign.</p><p><a href="find-agents.html">Compare local agents →</a></p></article>
<article class="tile" id="prepare"><div class="eyebrow">Guide</div><h2 style="font-size:30px">Getting your home ready to sell</h2>
<p>Declutter and deep clean. Fix small repairs. Tidy the garden and entry. Think about styling for photos. Gather documents like rates notices and any building approvals, and speak with a conveyancer early.</p><p><a href="sell.html">Get a free appraisal →</a></p></article>
</div></section>''')

# ---------------- FOR AGENTS ----------------
page('for-agents.html','For Real Estate Agents | Join QLD Agent Finder','Join QLD Agent Finder and get in front of motivated Queensland home sellers in your suburbs.',hero('For agents','Win more listings in the suburbs you know best','Create your profile, get ranked on your real results, and receive seller enquiries in your area.','For agents')+f'''
<section style="padding-bottom:0"><div class="wrap"><a class="btn btn-gold" href="join.html">List myself as an agent</a></div></section>
<section><div class="wrap"><div class="grid3">
<div class="tile"><div class="num">1</div><h3>Create your profile</h3><p>Add your agency, licence, suburbs and recent results.</p></div>
<div class="tile"><div class="num">2</div><h3>Get verified &amp; ranked</h3><p>We check your licence and rank you on reviews, sales, speed and experience.</p></div>
<div class="tile"><div class="num gold">3</div><h3>Receive seller enquiries</h3><p>Sellers find you in search and rankings, or we match them to you.</p></div>
</div></div></section>
<section class="white"><div class="wrap"><div class="center"><div class="eyebrow">Benefits</div><h2>Why agents join</h2></div><div class="grid4">
<div class="tile"><h3>Motivated sellers</h3><p>Homeowners actively comparing agents.</p></div>
<div class="tile"><h3>Your own profile</h3><p>Showcase results, suburbs and fees.</p></div>
<div class="tile"><h3>Fair rankings</h3><p>Scored on performance, not ad spend.</p></div>
<div class="tile"><h3>No lock-in</h3><p>Leave anytime.</p></div>
</div></div></section>
<section id="pricing"><div class="wrap" style="max-width:760px"><div class="center"><div class="eyebrow">Pricing</div><h2>Simple, fair pricing</h2></div>
<div class="price-card"><div class="eyebrow">Founding partner offer</div><div class="big">Free</div><p style="font-size:19px">Free profile and enquiries during our Queensland launch.</p>
<p>✓ Agent profile &amp; ranking<br>✓ Seller enquiries in your suburbs<br>✓ Founding partner badge<br>✓ No lock-in contract</p>
<a class="btn btn-maroon" href="join.html">Claim your free profile</a><p class="small" style="margin-top:12px">Ongoing pricing will be announced to partners before any fees apply.</p></div>
</div></section>
<section class="white" id="faq"><div class="wrap" style="max-width:820px"><div class="center"><h2>Agent FAQ</h2></div>{faq(FAQ_AGENT)}</div></section>''')

# ---------------- JOIN ----------------
page('join.html','List Yourself as an Agent | QLD Agent Finder','Create your QLD Agent Finder agent profile. Free for founding partners.',hero('For agents','List yourself on QLD Agent Finder','Create your profile in about 3 minutes. Free for founding partners.','<a href="for-agents.html">For agents</a> › Join')+'''
<section><div class="wrap" style="max-width:720px">
<div class="card">
<div class="steps-bar" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<form name="agent-signup" method="POST" action="thank-you.html" data-netlify="true" netlify-honeypot="hp" data-steps novalidate>
<input type="hidden" name="form-name" value="agent-signup"><p hidden><label>Leave empty <input name="hp"></label></p>
<div class="step"><h3>Your details</h3>
<div class="field"><label for="jN">Full name</label><input id="jN" name="name" required autocomplete="name"></div>
<div class="field"><label for="jM">Mobile</label><input id="jM" name="phone" type="tel" required autocomplete="tel"></div>
<div class="field"><label for="jE">Email</label><input id="jE" name="email" type="email" required autocomplete="email"></div>
<div class="field"><label for="jR">Role</label><select id="jR" name="role" required><option value="">Select…</option><option>Sales agent</option><option>Principal / Licensee</option><option>Property manager</option><option>Agency (multiple agents)</option></select></div>
<div class="err" role="alert"></div><div class="form-nav"><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>Agency &amp; licence</h3>
<div class="field"><label for="jA">Agency name</label><input id="jA" name="agency" required autocomplete="organization"></div>
<div class="field"><label for="jL">QLD licence / registration number</label><input id="jL" name="licence" required></div>
<div class="field"><label for="jY">Years in real estate</label><input id="jY" name="years" type="number" min="0" required></div>
<div class="field"><label for="jW">Website or listings page (optional)</label><input id="jW" name="website" type="url" placeholder="https://"></div>
<div class="err" role="alert"></div><div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>Areas &amp; results</h3>
<div class="field"><label for="jReg">Main region</label><select id="jReg" name="region" required><option value="">Select…</option><option>Brisbane</option><option>Logan</option><option>Gold Coast</option><option>Sunshine Coast</option><option>Ipswich</option><option>Moreton Bay</option><option>Redlands</option><option>Toowoomba</option><option>Other QLD</option></select></div>
<div class="field"><label for="jS">Suburbs you cover</label><input id="jS" name="suburbs" placeholder="e.g. Rochedale, Springwood, Underwood" required></div>
<div class="field"><label for="jSold">Properties sold in last 12 months</label><input id="jSold" name="sold_12m" type="number" min="0"></div>
<div class="field"><label for="jDays">Average days on market</label><input id="jDays" name="avg_days" type="number" min="0"></div>
<div class="field"><label for="jFee">Typical commission range</label><input id="jFee" name="commission" placeholder="e.g. 2.0% – 2.5%"></div>
<div class="err" role="alert"></div><div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-maroon" data-next>Continue</button></div></div>

<div class="step"><h3>Profile &amp; confirm</h3>
<div class="field"><label for="jBio">Short bio</label><textarea id="jBio" name="bio" rows="4" placeholder="What makes you the right agent for local sellers?"></textarea></div>
<p class="small">You can add your photo after approval, in the agent portal.</p>
<label class="chk" style="margin-bottom:12px"><input type="checkbox" name="confirm" value="yes" required> I confirm I hold a current QLD licence/registration and my details are accurate. I agree to the <a href="terms.html">Terms</a>.</label>
<div class="err" role="alert"></div><div class="form-nav"><button type="button" class="btn btn-ghost" data-back>Back</button><button type="submit" class="btn btn-gold">Create my profile</button></div></div>
</form></div></div></section>''')

# ---------------- ABOUT ----------------
page('about.html','About Us | QLD Agent Finder','About QLD Agent Finder, a Queensland real estate agent comparison service.',hero('About us','Helping Queenslanders choose the right agent','Built in Queensland, for Queensland sellers.','About')+'''
<section><div class="wrap prose">
<h2>Our mission</h2><p>Selling a home is one of the biggest financial decisions most people make. Yet many sellers choose an agent by chance: a sign on the street, a letterbox flyer, or the highest appraisal. We built QLD Agent Finder so every Queensland seller can compare agents on real results, for free.</p>
<h2 id="money">How we make money</h2><p>Our service is always free for sellers. Agents in our network fund QLD Agent Finder. Paying agents never get a higher ranking score, and any sponsored placement is clearly labelled.</p>
<h2>Our values</h2><p><b>Local.</b> We focus on Queensland only.<br><b>Transparent.</b> We publish how rankings work.<br><b>Seller first.</b> No pressure, no obligation, no spam.</p>
<p><a class="btn btn-maroon" href="contact.html">Get in touch</a></p>
</div></section>''')

# ---------------- FAQ ----------------
page('faq.html','FAQ | QLD Agent Finder','Frequently asked questions from Queensland home sellers and agents.',hero('FAQ','Frequently asked questions','Answers for sellers and agents.','FAQ')+f'''
<section><div class="wrap" style="max-width:820px"><h2 id="sellers">For sellers</h2>{faq(FAQ_SELL)}<h2 id="agents" style="margin-top:48px">For agents</h2>{faq(FAQ_AGENT)}
<p style="margin-top:32px">Still have a question? <a href="contact.html">Contact us</a>.</p></div></section>''',ld=[faq_ld(FAQ_SELL+FAQ_AGENT)])

# ---------------- CONTACT ----------------
page('contact.html','Contact Us | QLD Agent Finder','Contact QLD Agent Finder.',hero('Contact','We are here to help','Questions from sellers, agents or partners. We reply within 1 business day.','Contact')+'''
<section><div class="wrap calc" style="align-items:start">
<form class="card" name="contact" method="POST" action="thank-you.html" data-netlify="true" netlify-honeypot="hp">
<input type="hidden" name="form-name" value="contact"><p hidden><label>Leave empty <input name="hp"></label></p>
<div class="field"><label for="cN">Name</label><input id="cN" name="name" required autocomplete="name"></div>
<div class="field"><label for="cE">Email</label><input id="cE" name="email" type="email" required autocomplete="email"></div>
<div class="field"><label for="cT">I am a…</label><select id="cT" name="type"><option>Home seller</option><option>Real estate agent</option><option>Partner / media</option><option>Other</option></select></div>
<div class="field"><label for="cM">Message</label><textarea id="cM" name="message" rows="5" required></textarea></div>
<button class="btn btn-maroon" type="submit" style="width:100%">Send message</button>
</form>
<div><h2>Other ways to reach us</h2><p><b>Email:</b> <a href="mailto:contact@qldagentfinder.com.au">contact@qldagentfinder.com.au</a></p><p><b>Facebook:</b> <a href="https://www.facebook.com/qldagentfinder.au/">@qldagentfinder.au</a></p><p><b>Instagram:</b> <a href="https://www.instagram.com/qldagentfinder/">@qldagentfinder</a></p><p><b>Service area:</b> Queensland, Australia</p></div>
</div></section>''')

# ---------------- LEGAL ----------------
page('privacy.html','Privacy Policy | QLD Agent Finder','How QLD Agent Finder handles your personal information.',hero('Legal','Privacy Policy','Last updated: 29 October 2026','Privacy')+'''
<section><div class="wrap prose">
<p>QLD Agent Finder ("we", "us") is an agent comparison and referral service for Queensland property owners. We handle personal information in line with the Australian Privacy Principles (APPs) under the <i>Privacy Act 1988</i> (Cth).</p>
<h3>What we collect</h3><p>Information you give us through our forms: name, phone, email, property address and details, your timeframe and price expectations, and anything you write in notes or messages. For agents, we also collect agency, licence number, contact details, profile information and performance details such as sales and days on market. We also collect basic website usage data (see Cookies and analytics).</p>
<h3>Why we collect it</h3><p>To match sellers with agents, arrange appraisals, display agent profiles and rankings, respond to enquiries, run and improve our service, and meet our legal obligations. If you are an agent, we also use your details to verify your licence and manage your profile.</p>
<h3>Who we share it with</h3><p>Seller details are shared only with the agents you choose or are matched with, so they can contact you about your enquiry. We never sell personal information. We use trusted service providers to run the site: Supabase (database), Cloudflare (website hosting), Resend (email delivery), and Google and Meta (analytics and advertising measurement). They may only use your information to provide their service to us.</p>
<h3>Overseas disclosure</h3><p>Some of these providers store information outside Australia, including in India. Our team also accesses information from outside Australia, including from Pakistan. By submitting a form you agree to this. We take reasonable steps to make sure overseas recipients protect your information, but they may not be bound by the Australian Privacy Principles.</p>
<h3>Marketing</h3><p>We may contact you about your enquiry and, with your consent, about related services. You can opt out at any time by emailing us.</p>
<h3>Cookies and analytics</h3><p>We may use cookies and tools such as Google Analytics and Meta Pixel to understand how the site is used and to measure and improve our advertising. You can block cookies in your browser settings, or use the ad settings on Google and Meta to limit tracking.</p>
<h3>How long we keep it, and security</h3><p>We keep information only as long as we need it for the purposes above or the law requires. We use access controls and encrypted connections to protect it, but no online system is completely secure. If a data breach is likely to cause you serious harm, we will notify you and the Office of the Australian Information Commissioner as required by law.</p>
<h3>Access, correction and deletion</h3><p>You can ask to see, correct or delete the personal information we hold about you at any time. Email <a href="mailto:contact@qldagentfinder.com.au">contact@qldagentfinder.com.au</a> and we will respond within a reasonable time.</p>
<h3>Complaints</h3><p>Contact us first at <a href="mailto:contact@qldagentfinder.com.au">contact@qldagentfinder.com.au</a>. If you are not satisfied, you can contact the Office of the Australian Information Commissioner (<a href="https://www.oaic.gov.au">oaic.gov.au</a>).</p>
</div></section>''')
page('terms.html','Terms of Use | QLD Agent Finder','Terms of use for QLD Agent Finder.',hero('Legal','Terms of Use','Last updated: 29 October 2026','Terms')+'''
<section><div class="wrap prose">
<h3>Our service</h3><p>QLD Agent Finder is a free comparison and referral service that helps Queensland property owners find real estate agents. We are not a licensed real estate agency and do not sell, lease, appraise or value property. Any appraisal or sale is between you and the agent.</p>
<h3>Information on this site</h3><p>Agent information, rankings and calculator results are a guide only. Rankings are based on the factors described on our rankings page and are not an endorsement. We aim to keep information accurate but do not guarantee it. Always check details, including licences, directly with the agent and the Queensland licence register. Some profiles may be marked as samples and are for demonstration only.</p>
<h3>Using the site</h3><p>Use the site lawfully and honestly. Do not submit false, misleading or spam enquiries, copy or scrape our content, or interfere with how the site works. We may block access for misuse.</p>
<h3>Sellers</h3><p>When you submit a form you agree to be contacted by us and by agents we match you with, and you confirm the details you give are accurate. We cannot guarantee that an agent will contact you or accept your property. Sellers are never obliged to engage any agent introduced through our service.</p>
<h3>Agents</h3><p>Agents must hold a current Queensland real estate licence or registration and provide accurate, up-to-date information. You must have the right to use any photo or text you upload. We may approve, edit, hide or remove any profile at our discretion, for example if details are inaccurate or we receive valid complaints.</p>
<h3>Third-party links</h3><p>The site may link to other websites. We are not responsible for their content or practices.</p>
<h3>Liability</h3><p>To the extent permitted by law, we are not liable for any loss arising from use of this site or dealings with agents. Nothing in these terms excludes, restricts or modifies rights you have under the Australian Consumer Law that cannot be excluded.</p>
<h3>Changes and governing law</h3><p>We may update these terms and our privacy policy from time to time; the date at the top shows the latest version. These terms are governed by the laws of Queensland, Australia.</p>
<h3>Contact</h3><p><a href="mailto:contact@qldagentfinder.com.au">contact@qldagentfinder.com.au</a></p>
</div></section>''')
page('thank-you.html','Thank You | QLD Agent Finder','Thanks for contacting QLD Agent Finder.','''
<section style="padding:120px 0"><div class="wrap center"><div class="num gold" style="margin:0 auto 20px">✓</div><h1 style="color:#7A1F33">Thank you!</h1><p style="font-size:20px">We've received your details. Our team will be in touch within 1 business day.</p><p id="tyAgent" hidden><b>Agents:</b> once we approve your profile, log in to the <a data-portal href="#">agent portal</a> with the same email to add your photo and see your leads.</p><p><a class="btn btn-maroon" href="index.html">Back to home</a> <a class="btn btn-ghost" href="guides.html">Read seller guides</a></p></div></section>''')
page('404.html','Page Not Found | QLD Agent Finder','Page not found.','<section style="padding:120px 0"><div class="wrap center"><h1 style="color:#7A1F33">Page not found</h1><p>Let\'s get you back on track.</p><p><a class="btn btn-maroon" href="index.html">Go home</a> <a class="btn btn-ghost" href="find-agents.html">Find agents</a></p></div></section>')


# ---------------- AREAS ----------------
page('areas.html','Real Estate Agents by Area | Queensland | QLD Agent Finder','Find top real estate agents by area across Queensland: Brisbane, Gold Coast, Sunshine Coast, Logan, Ipswich, Moreton Bay, Redlands and Toowoomba.',hero('Areas','Find agents by area','Choose your region to see the top local agents and their results.','Areas')+"""
<section><div class="wrap"><div class="areas" id="areaTiles"></div>
<div class="tile" style="margin-top:32px;text-align:center"><h3>Don't see your area?</h3><p>We cover all of Queensland. Tell us your suburb and we will find local agents for you.</p><a class="btn btn-maroon" href="sell.html">Get matched free</a></div></div></section>""")

# ---------------- SERVICES ----------------
def svc(img,t,d,link,label):
    return f'<div class="tile svc"><img src="https://images.unsplash.com/photo-{img}?w=600&q=60&auto=format&fit=crop" alt="" loading="lazy" width="600" height="338"><h3>{t}</h3><p>{d}</p><a href="{link}"><b>{label} →</b></a></div>'
page('services.html','Our Services | QLD Agent Finder','Free services for Queensland home sellers and growth services for real estate agents.',hero('Services','How we help','Free for sellers. Growth tools for agents.','Services')+f"""
<section><div class="wrap"><div class="center"><div class="eyebrow">For home sellers · always free</div><h2>Seller services</h2></div>
<div class="grid3">
{svc('1560026301-88340cf16be7','Agent matching','Tell us about your home and we connect you with the best local agents for your suburb and property.','sell.html','Get matched')}
{svc('1492889971304-ac16ab4a4a5a','Free property appraisal','Find out what your home could sell for, from agents who sell in your street.','sell.html','Book appraisal')}
{svc('1613667650324-ed09383eb8e5','Agent comparison & rankings','Compare scores, sales, days on market, reviews and fees side by side.','find-agents.html','Compare agents')}
{svc('1588012886079-baef0ac45fbd','Selling cost estimates','Use our calculators to estimate commission and total selling costs.','tools.html','Open calculators')}
{svc('1635315891380-f70330a5b41b','Seller guides','Plain-English checklists and guides for selling in Queensland.','guides.html','Read guides')}
{svc('1584752242818-b4bd7fb3fe10','Leasing & property management','Looking to rent out instead? We can match you with local property managers.','sell.html','Find a manager')}
</div></div></section>
<section class="white"><div class="wrap"><div class="center"><div class="eyebrow">For real estate agents</div><h2>Agent services</h2></div>
<div class="grid3">
<div class="tile"><h3>Agent profile</h3><p>Your own profile page with results, suburbs, fees and an appraisal request form.</p></div>
<div class="tile"><h3>Seller enquiries</h3><p>Receive appraisal requests from homeowners in the suburbs you cover.</p></div>
<div class="tile"><h3>Rankings &amp; badges</h3><p>Get ranked on performance, plus Verified and Founding Partner badges.</p></div>
</div><p style="text-align:center;margin-top:28px"><a class="btn btn-maroon" href="join.html">List myself as an agent</a></p></div></section>""")

REGIONS={
'Brisbane':("brisbane","From inner-city apartments to leafy character homes, every Brisbane suburb moves a little differently. The right local agent knows your street, your buyers and what recent sales really tell you.",["New Farm","Paddington","Bulimba","Carindale","Indooroopilly","Chermside","Ashgrove","Mount Gravatt","Sunnybank","Toowong","Wynnum","Kedron"]),
'Logan':("logan","Logan mixes established family suburbs with fast-growing new estates. A local agent who sells here week in, week out knows which features Logan buyers pay for.",["Springwood","Shailer Park","Daisy Hill","Underwood","Rochedale South","Beenleigh","Browns Plains","Logan Reserve","Yarrabilba","Jimboomba","Loganholme","Waterford"]),
'Gold Coast':("gold-coast","Beachside units, canal homes and hinterland acreage all sell to different buyers. On the Gold Coast, choosing an agent who specialises in your type of property matters.",["Burleigh Heads","Palm Beach","Broadbeach","Southport","Robina","Coomera","Hope Island","Helensvale","Mermaid Beach","Varsity Lakes","Nerang","Currumbin"]),
'Sunshine Coast':("sunshine-coast","Coastal homes, hinterland acreage and brand-new communities: the Sunshine Coast is many markets in one. A local specialist helps you price and market for the right buyers.",["Noosa Heads","Maroochydore","Buderim","Mooloolaba","Caloundra","Sippy Downs","Peregian Beach","Coolum Beach","Nambour","Birtinya","Pelican Waters","Kawana Island"]),
'Ipswich':("ipswich","Ipswich blends heritage Queenslanders with new estates in the Springfield and Ripley growth corridor. Local agents know how each pocket compares.",["Springfield Lakes","Redbank Plains","Augustine Heights","Brassall","Ripley","Bellbird Park","Goodna","Yamanto","Raceview","Booval","Rosewood","Karalee"]),
'Moreton Bay':("moreton-bay","From North Lakes estates to Redcliffe waterfront and Caboolture acreage, Moreton Bay buyers vary a lot. Compare agents who sell in your exact area.",["North Lakes","Mango Hill","Redcliffe","Caboolture","Morayfield","Narangba","Kallangur","Strathpine","Scarborough","Burpengary","Bray Park","Albany Creek"]),
'Redlands':("redlands","Bayside living, canal homes and island properties make the Redlands unique. A Redlands specialist knows how to present your home to the right buyers.",["Cleveland","Wellington Point","Ormiston","Capalaba","Alexandra Hills","Victoria Point","Thornlands","Birkdale","Redland Bay","Thorneside","Sheldon","Mount Cotton"]),
'Toowoomba':("toowoomba","Queensland's Garden City has character homes, family suburbs and acreage on the range. A local Toowoomba agent understands buyers from both town and country.",["Rangeville","Highfields","Middle Ridge","Kearneys Spring","Centenary Heights","East Toowoomba","Harristown","Glenvale","Westbrook","Darling Heights","Newtown","Cranley"]),
}
for rname,(slug,intro,subs) in REGIONS.items():
    fn=f'real-estate-agents-{slug}.html'
    fq=[(f"How do I find the best real estate agent in {rname}?",f"Look for an agent who sells regularly in your suburb, then compare their recent sales, average days on market, reviews and fees. QLD Agent Finder lets you compare {rname} agents side by side for free."),
        (f"How much do real estate agents charge in {rname}?","Commission varies by agent, property and price, and it is negotiable. Ask each agent for their commission and marketing costs in writing, and use our free commission calculator to compare."),
        (f"Is QLD Agent Finder free for {rname} sellers?","Yes. It is 100% free for home sellers, with no obligation to list with any agent.")]
    img=f'https://images.unsplash.com/photo-{{}}?w=1400&q=55&auto=format&fit=crop'
    body=f"""<section class="page-hero photo" id="findHero" data-region-img="{rname}"><div class="wrap"><div class="breadcrumb"><a href="index.html">Home</a> › <a href="areas.html">Areas</a> › {rname}</div><div class="eyebrow">{rname}, Queensland</div><h1>Top real estate agents in {rname}</h1><p style="font-size:20px;max-width:680px;opacity:.92;margin:0">Compare local {rname} agents on real results: sales, days on market, reviews and fees. Free for sellers.</p><p style="margin:24px 0 0"><a class="btn btn-gold" href="sell.html?region={rname}">Get a free {rname} appraisal</a></p></div></section>
<section style="padding-top:40px"><div class="wrap">
<p style="font-size:19px;max-width:820px">{intro}</p>
<div class="filters"><div class="field"><label for="fQuery">Suburb, agent or agency</label><input id="fQuery" placeholder="e.g. {subs[0]}"></div><div class="field"><label for="fRegion">Region</label><select id="fRegion" data-default="{rname}"></select></div><div class="field"><label for="fSort">Sort by</label><select id="fSort"><option value="score">Ranking score</option><option value="rating">Highest rated</option><option value="sold">Most sales</option><option value="days">Fastest sales</option></select></div></div>
<p class="small" id="fCount" aria-live="polite"></p><div class="grid3" id="directory"></div>
</div></section>
<section class="white"><div class="wrap"><h2>Suburbs we cover in {rname}</h2><div class="chips" style="justify-content:flex-start">"""+''.join(f'<a href="find-agents.html?q={x.replace(" ","%20")}">{x}</a>' for x in subs)+f"""</div></div></section>
<section><div class="wrap" style="max-width:820px"><h2>Choosing an agent in {rname}</h2>
<ol><li><b>Shortlist 3 local agents</b> who sell homes like yours in your suburb.</li><li><b>Compare results,</b> not promises: recent sales, days on market and reviews.</li><li><b>Get free appraisals</b> and ask how each price was worked out.</li><li><b>Compare fees in writing,</b> including marketing costs.</li></ol>
<p><a href="guides.html#questions">5 questions to ask before you sign →</a> · <a href="tools.html#commission">Commission calculator →</a></p>
<h2 style="margin-top:40px">{rname} FAQs</h2>"""+faq(fq)+f"""</div></section>
<section style="padding-top:0"><div class="wrap"><div class="cta-band"><h2>Selling in {rname}?</h2><p style="font-size:19px;max-width:560px;margin:0 auto 24px">Get matched with top local agents. Free, no obligation.</p><a class="btn btn-gold" href="sell.html?region={rname}">Get my free appraisal</a></div></div></section>
<div class="cmpbar" id="cmpbar"><div class="wrap"><span id="cmpCount">0 selected</span><a class="btn btn-gold" id="cmpGo" href="compare.html">Compare now</a></div></div>"""
    page(fn,f'Top Real Estate Agents in {rname}, QLD | Compare Free | QLD Agent Finder',f'Compare the best real estate agents in {rname}, Queensland. See rankings, recent sales, days on market, reviews and fees, and get a free appraisal.',body,ld=[faq_ld(fq)],crumb=f'Real estate agents in {rname}')

urls=[f'real-estate-agents-{v[0]}.html' for v in REGIONS.values()]+['','areas.html','services.html','find-agents.html','rankings.html','sell.html','how-it-works.html','tools.html','guides.html','for-agents.html','join.html','about.html','faq.html','contact.html','privacy.html','terms.html']
TODAY=datetime.date.today().isoformat()
open(os.path.join(D,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{SITE}/{clean(u) if u else ""}</loc><lastmod>{TODAY}</lastmod><priority>{"1.0" if not u else ("0.9" if u.startswith("real-estate") else "0.7")}</priority></url>' for u in urls)+'</urlset>\n')
open(os.path.join(D,'robots.txt'),'w').write('User-agent: *\nAllow: /\nSitemap: https://qldagentfinder.com.au/sitemap.xml\n')
print('built')
