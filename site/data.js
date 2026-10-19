/* QLD Agent Finder — agent data
   IMPORTANT: every agent below is a DEMO profile (demo:true) so you can see how the site works.
   Replace them with real partner agents (with their permission) before promoting the site.
   Remove an agent by deleting its { ... } block. */
window.QAF_AGENTS = [
{id:"a1",name:"Demo Agent One",agency:"Demo Realty Brisbane",region:"Brisbane",suburbs:["New Farm","Teneriffe","Newstead"],sold12m:41,avgDays:24,rating:4.9,reviews:86,commission:"2.0% – 2.5%",years:12,specialty:"Inner-city apartments",verified:true,demo:true},
{id:"a2",name:"Demo Agent Two",agency:"Demo Property Group",region:"Logan",suburbs:["Springwood","Underwood","Rochedale South"],sold12m:37,avgDays:21,rating:4.8,reviews:64,commission:"2.2% – 2.6%",years:9,specialty:"Family homes",verified:true,demo:true},
{id:"a3",name:"Demo Agent Three",agency:"Demo Coastal Realty",region:"Gold Coast",suburbs:["Burleigh Heads","Palm Beach","Miami"],sold12m:52,avgDays:28,rating:4.7,reviews:112,commission:"2.0% – 2.4%",years:15,specialty:"Beachside homes",verified:true,demo:true},
{id:"a4",name:"Demo Agent Four",agency:"Demo Hinterland Homes",region:"Sunshine Coast",suburbs:["Noosa Heads","Sunshine Beach","Peregian Beach"],sold12m:29,avgDays:33,rating:4.9,reviews:47,commission:"2.3% – 2.8%",years:11,specialty:"Prestige & acreage",verified:true,demo:true},
{id:"a5",name:"Demo Agent Five",agency:"Demo Realty Ipswich",region:"Ipswich",suburbs:["Springfield Lakes","Redbank Plains","Augustine Heights"],sold12m:44,avgDays:19,rating:4.6,reviews:58,commission:"2.4% – 2.8%",years:7,specialty:"First-home sellers",verified:true,demo:true},
{id:"a6",name:"Demo Agent Six",agency:"Demo Bayside Property",region:"Redlands",suburbs:["Cleveland","Wellington Point","Ormiston"],sold12m:33,avgDays:26,rating:4.8,reviews:71,commission:"2.2% – 2.5%",years:14,specialty:"Waterfront homes",verified:true,demo:true},
{id:"a7",name:"Demo Agent Seven",agency:"Demo North Realty",region:"Moreton Bay",suburbs:["North Lakes","Mango Hill","Redcliffe"],sold12m:48,avgDays:22,rating:4.7,reviews:93,commission:"2.1% – 2.5%",years:10,specialty:"New estates",verified:true,demo:true},
{id:"a8",name:"Demo Agent Eight",agency:"Demo Southside Agents",region:"Brisbane",suburbs:["Carindale","Mount Gravatt","Holland Park"],sold12m:39,avgDays:20,rating:4.8,reviews:77,commission:"2.0% – 2.4%",years:13,specialty:"Character homes",verified:true,demo:true},
{id:"a9",name:"Demo Agent Nine",agency:"Demo Logan Living",region:"Logan",suburbs:["Shailer Park","Daisy Hill","Cornubia"],sold12m:31,avgDays:25,rating:4.6,reviews:39,commission:"2.3% – 2.7%",years:6,specialty:"Acreage & lifestyle",verified:false,demo:true},
{id:"a10",name:"Demo Agent Ten",agency:"Demo Gold Coast Prestige",region:"Gold Coast",suburbs:["Broadbeach","Mermaid Beach","Southport"],sold12m:36,avgDays:31,rating:4.9,reviews:58,commission:"1.8% – 2.3%",years:18,specialty:"Luxury & high-rise",verified:true,demo:true},
{id:"a11",name:"Demo Agent Eleven",agency:"Demo Downs Realty",region:"Toowoomba",suburbs:["Rangeville","Highfields","Middle Ridge"],sold12m:27,avgDays:29,rating:4.7,reviews:42,commission:"2.5% – 3.0%",years:9,specialty:"Regional homes",verified:true,demo:true},
{id:"a12",name:"Demo Agent Twelve",agency:"Demo Coast Property Co",region:"Sunshine Coast",suburbs:["Maroochydore","Buderim","Mooloolaba"],sold12m:45,avgDays:23,rating:4.8,reviews:81,commission:"2.0% – 2.5%",years:12,specialty:"Units & townhouses",verified:true,demo:true}
];
window.QAF_REGIONS=["Brisbane","Logan","Gold Coast","Sunshine Coast","Ipswich","Moreton Bay","Redlands","Toowoomba"];
/* Ranking score out of 100: rating 40% · sales volume 30% · speed of sale 20% · experience 10% */
window.qafScore=function(a){var all=window.QAF_AGENTS,maxS=Math.max.apply(null,all.map(function(x){return x.sold12m})),minD=Math.min.apply(null,all.map(function(x){return x.avgDays}));
return Math.round(a.rating/5*40+a.sold12m/maxS*30+minD/a.avgDays*20+Math.min(a.years,20)/20*10)};
window.qafInitials=function(n){return n.split(" ").map(function(w){return w[0]}).slice(0,2).join("")};
/* Photos: Unsplash (free licence). Change any URL to your own photo. */
window.QAF_IMG=function(id,w){return 'https://images.unsplash.com/photo-'+id+'?w='+(w||800)+'&q=60&auto=format&fit=crop'};
window.QAF_REGION_IMG={"Brisbane":"1564379379256-030cc5dabe9c","Gold Coast":"1607309843659-f4ad95cf3277","Sunshine Coast":"1700859347214-095a9dc640d7","Logan":"1560026301-88340cf16be7","Ipswich":"1588012886079-baef0ac45fbd","Moreton Bay":"1584752242818-b4bd7fb3fe10","Redlands":"1613667650324-ed09383eb8e5","Toowoomba":"1605450195878-3b5c4e70163c"};
