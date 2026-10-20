(()=>{
 const slides=[...document.querySelectorAll('.slide')];
 const back=document.getElementById('back'),next=document.getElementById('next');
 const count=document.getElementById('page-number'),live=document.getElementById('page-status');
 const progress=document.getElementById('progress');
 let current=0;
 const validIndex=()=>{const n=Number(location.hash.slice(1));return Number.isInteger(n)&&n>=1&&n<=slides.length?n-1:0};
 function render(focus=false){
  current=validIndex();
  slides.forEach((slide,i)=>{slide.hidden=i!==current;slide.setAttribute('aria-hidden',String(i!==current));if(i===current)slide.scrollTop=0});
  back.disabled=current===0;next.disabled=current===slides.length-1;
  count.textContent=`${current+1} / ${slides.length}`;progress.style.width=`${(current+1)/slides.length*100}%`;
  live.textContent=`Page ${current+1} of ${slides.length}: ${slides[current].querySelector('h1,h2').textContent}`;
  if(focus)slides[current].focus({preventScroll:true});
 }
 function go(index){if(index<0||index>=slides.length||index===current)return;location.hash=String(index+1)}
 back.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
 window.addEventListener('hashchange',()=>render(true));
 document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
  if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(current+1)}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}
  else if(e.key==='End'){e.preventDefault();go(slides.length-1)}
 });
 let touch=null;const deck=document.querySelector('.deck');
 deck.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary&&!e.target.closest('a,button'))touch={x:e.clientX,y:e.clientY,id:e.pointerId}});
 deck.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1))});
 deck.addEventListener('pointercancel',()=>touch=null);
 const n=Number(location.hash.slice(1));if(!Number.isInteger(n)||n<1||n>slides.length)history.replaceState(null,'','#1');
 render();
})();
