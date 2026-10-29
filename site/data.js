/* QLD Agent Finder — shared data and helpers.
   The live site reads real agents from the database (Supabase). QAF_AGENTS is only an offline fallback.
   Demo profiles were removed on 29 Oct 2026. */
window.QAF_AGENTS = [];
window.QAF_REGIONS=["Brisbane","Logan","Gold Coast","Sunshine Coast","Ipswich","Moreton Bay","Redlands","Toowoomba"];
/* Ranking score out of 100: rating 40% · sales volume 30% · speed of sale 20% · experience 10% */
window.qafHasData=function(a){return a.rating>0||a.sold12m>0||a.reviews>0};
window.qafScore=function(a){var all=window.QAF_AGENTS||[],maxS=Math.max(1,Math.max.apply(null,all.map(function(x){return x.sold12m||0}))),ds=all.filter(function(x){return x.sold12m>0&&x.avgDays>0}).map(function(x){return x.avgDays}),minD=ds.length?Math.min.apply(null,ds):30;
var speed=a.sold12m>0&&a.avgDays>0?minD/a.avgDays*20:0;
var s=Math.round((a.rating||0)/5*40+(a.sold12m||0)/maxS*30+speed+Math.min(a.years||0,20)/20*10);return isFinite(s)?s:0};
window.qafInitials=function(n){return n.split(" ").map(function(w){return w[0]}).slice(0,2).join("")};
/* Photos: Unsplash (free licence). Change any URL to your own photo. */
window.QAF_IMG=function(id,w){return 'https://images.unsplash.com/photo-'+id+'?w='+(w||800)+'&q=60&auto=format&fit=crop'};
window.QAF_REGION_IMG={"Brisbane":"1564379379256-030cc5dabe9c","Gold Coast":"1607309843659-f4ad95cf3277","Sunshine Coast":"1700859347214-095a9dc640d7","Logan":"1560026301-88340cf16be7","Ipswich":"1588012886079-baef0ac45fbd","Moreton Bay":"1584752242818-b4bd7fb3fe10","Redlands":"1613667650324-ed09383eb8e5","Toowoomba":"1605450195878-3b5c4e70163c"};
