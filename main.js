/* Navigation, scroll state, lightbox, image reveals, contact form, home testimonials */
const hd=document.querySelector('header'),mb=document.getElementById('mb'),nv=document.getElementById('nv');
const onScroll=()=>hd.classList.toggle('sc',scrollY>24);onScroll();addEventListener('scroll',onScroll,{passive:true});
const setMenu=o=>{nv.classList.toggle('on',o);mb.setAttribute('aria-expanded',o);hd.classList.toggle('open',o);document.body.style.overflow=o?'hidden':''};
mb.onclick=()=>setMenu(!nv.classList.contains('on'));
nv.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

/* Lightbox with previous/next across the page's images */
const lb=document.getElementById('lb'),li=lb.querySelector('img');
lb.insertAdjacentHTML('beforeend','<button class="pv" aria-label="Previous image">‹</button><button class="nx" aria-label="Next image">›</button><div class="cp" aria-live="polite"></div>');
lb.querySelector('button').className='x';
const items=[...document.querySelectorAll('[data-lb]')];let cur=0,lastFocus=null;
const show=n=>{cur=(n+items.length)%items.length;const i=items[cur];li.src=i.dataset.full||i.src;li.alt=i.alt;lb.querySelector('.cp').textContent=i.alt;};
const open=n=>{lastFocus=document.activeElement;show(n);lb.classList.add('on');lb.querySelector('.x').focus()};
const cl=()=>{lb.classList.remove('on');if(lastFocus)lastFocus.focus()};
items.forEach((i,n)=>{i.tabIndex=0;i.onclick=()=>open(n);i.addEventListener('keydown',e=>{if(e.key==='Enter')open(n)})});
lb.onclick=e=>{if(e.target===lb)cl()};
lb.querySelector('.x').onclick=cl;lb.querySelector('.pv').onclick=()=>show(cur-1);lb.querySelector('.nx').onclick=()=>show(cur+1);
document.addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')cl();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});

/* Image reveal on scroll (one-shot, lightweight) */
const rv=document.querySelectorAll('.rv-im');
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelector('.rv-im').classList.add('in');io.unobserve(e.target)}}),{threshold:.12});rv.forEach(x=>io.observe(x.parentElement))}else rv.forEach(x=>x.classList.add('in'));

/* Contact form (Netlify Forms) — unchanged behaviour */
const f=document.getElementById('cf');
if(f)f.onsubmit=async e=>{e.preventDefault();const s=document.getElementById('fs');s.className='';let ok=true;
f.querySelectorAll('[data-req]').forEach(i=>{const m=i.parentNode.querySelector('.err');let msg='';if(!i.value.trim())msg='This field is required.';else if(i.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value))msg='Enter a valid email address.';m.textContent=msg;if(msg)ok=false});
const u=f.querySelector('[name=website]');if(u.value&&!/^https?:\/\/.+\..+/.test(u.value)){u.parentNode.querySelector('.err').textContent='Use a full URL starting with https://';ok=false}else u.parentNode.querySelector('.err').textContent='';
if(!ok)return;try{const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()});if(!r.ok)throw 0;f.reset();s.className='ok';s.textContent='Thank you! Your enquiry has been sent. I will reply by email.'}catch(x){s.className='bad';s.textContent='Sorry, the message could not be sent (the form only works on the deployed Netlify site). Please email robiullahshofi2023@gmail.com instead.'}};

/* Home page: real client reviews from reviews-data.js, shown in full */
(()=>{const q=document.getElementById('hq');if(!q||!window.REVIEWS)return;
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=[0,1,2].map(i=>window.REVIEWS[i]).filter(Boolean);if(pick.length<3)return;
const who=r=>`<div class="who"><img src="https://flagcdn.com/w40/${E(r.code)}.png" width="26" height="19" alt="" loading="lazy"><div><b>${E(r.name)}</b>${E(r.country)}</div></div>`;
const a=window.REVIEWS;const avg=a.reduce((t,x)=>t+x.rating,0)/a.length;
q.innerHTML=`<div><p class="big">${E(pick[0].message)}</p>${who(pick[0])}<div class="sum"><b>${avg.toFixed(1)}</b><span class="sr" role="img" aria-label="${avg.toFixed(1)} out of 5 stars">★★★★★</span><span>${a.length} client reviews</span></div></div><div class="side">${pick.slice(1).map(r=>`<figure><p>${E(r.message)}</p>${who(r)}</figure>`).join('')}</div>`})();
