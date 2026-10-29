/* QLD Agent Finder: homeowner posts a home (no login). Listing is saved as pending; admin approves. */
(function(){
var CFG=window.QAF_CONFIG||{},$=function(i){return document.getElementById(i)},form=$('ownerForm');if(!form)return;
var photos=[],busy=false,BASE=(CFG.supabaseUrl||'').replace(/\/$/,''),PUB=BASE+'/storage/v1/object/public/listing-photos/';
(window.QAF_REGIONS||[]).concat(['Other QLD']).forEach(function(r){var o=document.createElement('option');o.textContent=r;$('oReg').appendChild(o)});
function hdr(extra){var h={apikey:CFG.supabaseAnonKey};if(/^eyJ/.test(CFG.supabaseAnonKey))h.Authorization='Bearer '+CFG.supabaseAnonKey;return Object.assign(h,extra||{})}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function resizeTo(file,max,q){return new Promise(function(res,rej){var im=new Image(),u=URL.createObjectURL(file);im.onload=function(){var k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej(new Error('Could not read that photo'))},'image/jpeg',q)};im.onerror=function(){rej(new Error('That file is not a usable photo'))};im.src=u})}
function put(path,blob){return fetch(BASE+'/storage/v1/object/listing-photos/'+path,{method:'POST',headers:hdr({'Content-Type':'image/jpeg','x-upsert':'false'}),body:blob}).then(function(r){if(!r.ok)throw new Error('Photo upload failed. Try a smaller photo.')})}
function thumb(u){return u.replace(/\.jpg$/,'-t.jpg')}
function draw(){$('oPhs').innerHTML=photos.map(function(u,i){return '<div class="ph"><img src="'+esc(thumb(u))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(u)+'\'">'+(i===0?'<span class="cv">Cover</span>':'')+'<button type="button" data-x="'+i+'" aria-label="Remove photo">×</button></div>'}).join('');
  Array.prototype.forEach.call($('oPhs').querySelectorAll('[data-x]'),function(b){b.onclick=function(){photos.splice(+b.dataset.x,1);draw()}})}
function err(m){var e=$('oErr');e.textContent=m||'';e.style.color='#A3122B'}
$('oFiles').addEventListener('change',async function(){var files=Array.prototype.slice.call(this.files);this.value='';err('');
  if(photos.length+files.length>8){err('You can add up to 8 photos.');return}
  busy=true;$('oGo').disabled=true;err('');$('oErr').style.color='#5E5862';$('oErr').textContent='Uploading '+files.length+' photo'+(files.length>1?'s':'')+'…';
  try{for(var i=0;i<files.length;i++){var big=await resizeTo(files[i],1600,.82),sm=await resizeTo(files[i],640,.78);var base='owner/'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
    await put(base+'.jpg',big);await put(base+'-t.jpg',sm);photos.push(PUB+base+'.jpg')}
    $('oErr').textContent='';draw()}catch(e){err(e.message||'Upload failed')}
  busy=false;$('oGo').disabled=false});
function n(id){var v=$(id).value.trim();return v===''?null:parseInt(v,10)}
form.addEventListener('submit',async function(e){e.preventDefault();err('');if(busy)return;
  if($('oHp').value)return;
  var row={seller_type:'owner',status:'pending',owner_name:$('oN').value.trim(),owner_email:$('oE').value.trim(),owner_phone:$('oP').value.trim()||null,owner_consent:$('oConsent').checked,
    title:$('oT').value.trim(),property_type:$('oType').value,region:$('oReg').value,suburb:$('oSub').value.trim(),postcode:$('oPc').value.trim()||null,address_line:$('oAddr').value.trim()||null,hide_address:$('oHide').checked,
    price_display:$('oPrice').value.trim(),price_num:n('oPnum'),beds:n('oBeds'),baths:n('oBaths'),cars:n('oCars'),land_m2:n('oLand'),open_homes:$('oOpen').value.trim()||null,
    features:$('oFeat').value.split(',').map(function(x){return x.trim()}).filter(Boolean).slice(0,20),description:$('oDesc').value.trim()||null,photos:photos};
  if(row.owner_name.length<2)return err('Enter your name.');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.owner_email))return err('Enter a valid email so buyers can reach you.');
  if(row.title.length<5)return err('Add a headline (at least 5 characters).');
  if(!row.suburb||!row.price_display)return err('Suburb and price wording are required.');
  if(row.postcode&&!/^\d{4}$/.test(row.postcode))return err('Postcode must be 4 digits.');
  if(!photos.length)return err('Add at least one photo.');
  if(!row.description||row.description.length<40)return err('Add a description of at least 40 characters.');
  if(!row.owner_consent)return err('Please tick the confirmation box.');
  $('oGo').disabled=true;$('oGo').textContent='Submitting…';
  try{var r=await fetch(BASE+'/rest/v1/listings',{method:'POST',headers:hdr({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify(row)});
    if(!r.ok){var j={};try{j=await r.json()}catch(x){}throw new Error(j.message||'Could not submit. Please try again.')}
    form.hidden=true;$('oOk').hidden=false;$('oOk').scrollIntoView({behavior:'smooth',block:'center'})}
  catch(x){err(x.message);$('oGo').disabled=false;$('oGo').textContent='Submit my home'}});
})();
