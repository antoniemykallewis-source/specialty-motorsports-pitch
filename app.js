/* Vessel deck analytics v1. Prepended before unchanged slide navigation. */
;(function () {
  'use strict';
  if (window.__vesselDeckAnalytics) return;
  const state = window.__vesselDeckAnalytics = {status: 'disabled', counted: false};
  // Empty until the owner supplies their GoatCounter site code; never a password.
  const siteCode = "vessel-decks"; // GOATCOUNTER_SITE_CODE
  const productionHost = 'antoniemykallewis-source.github.io';
  let suppressThisLoad = false;

  function excluded() {
    try { return localStorage.getItem('skipgc') === 't'; }
    catch (_) { state.status = 'storage-unavailable'; return true; }
  }

  // Consume synchronously before app.js can normalize the hash to #1 and before
  // count.js can process it a second time. The toggle page itself never counts.
  function consumeToggle() {
    if (location.hash !== '#toggle-goatcounter') return;
    suppressThisLoad = true;
    let message;
    try {
      const wasExcluded = localStorage.getItem('skipgc') === 't';
      if (wasExcluded) localStorage.removeItem('skipgc');
      else localStorage.setItem('skipgc', 't');
      const nowExcluded = localStorage.getItem('skipgc') === 't';
      if (nowExcluded === wasExcluded) throw new Error('Preference not saved');
      state.status = nowExcluded ? 'excluded' : 'enabled-on-next-load';
      message = 'GoatCounter tracking is now ' + (nowExcluded ? 'DISABLED' : 'ENABLED') +
        ' in this browser for decks on this GitHub Pages origin.' +
        (nowExcluded ? '' : ' It resumes on the next page load.');
    } catch (_) {
      state.status = 'storage-unavailable';
      message = 'This browser could not save the tracking preference. This page load will not be counted. Allow site storage and try again; other loads are not guaranteed to be excluded.';
    }
    history.replaceState(history.state, '', location.pathname + location.search + '#1');
    window.alert(message);
  }
  consumeToggle();
  // Also works when the hash is edited after load, without another page refresh.
  window.addEventListener('hashchange', consumeToggle);

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(siteCode)) return;
  if (location.protocol !== 'https:' || location.hostname !== productionHost) {
    state.status = 'non-production'; return;
  }
  if (suppressThisLoad || excluded()) return;
  if (window.goatcounter || document.querySelector('script[data-goatcounter]')) {
    state.status = 'existing-tracker'; return;
  }

  // One prospect path, independent of slide hashes, queries, and index.html.
  const path = (location.pathname.replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '') + '/';
  window.goatcounter = {path: path, no_onload: true, no_events: true};
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = 'https://' + siteCode + '.goatcounter.com/count';
  script.setAttribute('data-vessel-deck-analytics', '1');

  function countOnce() {
    if (state.counted || suppressThisLoad || excluded()) return;
    if (document.visibilityState && document.visibilityState !== 'visible') return;
    if (!document.body || typeof window.goatcounter.count !== 'function') return;
    // Set first: repeated onload/visibility events cannot duplicate this view.
    state.counted = true;
    document.removeEventListener('visibilitychange', countOnce);
    document.removeEventListener('DOMContentLoaded', countOnce);
    state.status = 'count-attempted';
    try { window.goatcounter.count(); }
    catch (_) { state.status = 'count-failed'; }
  }
  script.onload = function () {
    document.addEventListener('visibilitychange', countOnce);
    document.addEventListener('DOMContentLoaded', countOnce);
    countOnce();
  };
  script.onerror = function () { state.status = 'script-unavailable'; };
  state.status = 'loading';
  document.head.appendChild(script);
})();
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
