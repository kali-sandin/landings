/* Explanatory sequence, not live telemetry. Timer runs only while visible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else api.setup(root.document,root);
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const STEPS = [
    ['human-web'], ['web-api'], ['api-state'], ['api-web'],
    ['api-agents'], ['git-pull'], ['agents-git'], ['git-push'],
    ['agents-api'], ['api-state','api-web'],
    ['remote-api'], ['api-state'], ['remote-git'],
    ['remote-api'], ['api-state','api-web']
  ];
  function setup(doc,win){
    const diagram=doc.querySelector('.architecture-host');
    if(!diagram)return;
    const edges=[...diagram.querySelectorAll('[data-flow-edge]')];
    const media=win.matchMedia('(prefers-reduced-motion: reduce)');
    let step=0,timer=null,visible=false;
    function clear(){edges.forEach(edge=>edge.classList.remove('is-active'));}
    function paint(){clear();const active=STEPS[step];edges.forEach(edge=>edge.classList.toggle('is-active',active.includes(edge.dataset.flowEdge)));step=(step+1)%STEPS.length;}
    function sync(){
      const run=visible&&!doc.hidden&&!media.matches&&!doc.documentElement.classList.contains('image-preview-open');
      if(run && timer===null){paint();timer=win.setInterval(paint,1500);}
      else if(!run && timer!==null){win.clearInterval(timer);timer=null;clear();}
    }
    if(win.IntersectionObserver)new win.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:0}).observe(diagram);
    else {visible=true;sync();}
    doc.addEventListener('visibilitychange',sync);
    media.addEventListener?.('change',sync);
    if(win.MutationObserver)new win.MutationObserver(sync).observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
  }
  return {STEPS,setup};
});
