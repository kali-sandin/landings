/* Illustrative clock only: CSS paints progress and avatar pulses, never scrolls. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else api.setup(root.document,root);
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const TRAVEL=28,CYCLE=29.5,PULSE=.9;
  function delay(minute){return Math.max(0,Math.min(420,minute))/420*TRAVEL;}
  function setup(doc,win){
    const track=doc.querySelector('.shift-track');if(!track)return;
    track.querySelectorAll('.shift-event').forEach(event=>event.style.setProperty('--pulse-delay',`${delay(Number(event.dataset.minute))}s`));
    const media=win.matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
    function sync(){track.classList.toggle('timeline-playing',visible&&!doc.hidden&&!media.matches&&!doc.documentElement.classList.contains('image-preview-open'));}
    if(win.IntersectionObserver)new win.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();}).observe(track);
    else{visible=true;sync();}
    doc.addEventListener('visibilitychange',sync);media.addEventListener?.('change',sync);
    if(win.MutationObserver)new win.MutationObserver(sync).observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
  }
  return {TRAVEL,CYCLE,PULSE,delay,setup};
});
