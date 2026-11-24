const assert=require('node:assert/strict');
const setup=require('../lightbox.js');
function el(){const classes=new Set();return {style:{},setAttribute(k,v){this[k]=v;},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},events:{},addEventListener(k,fn){this.events[k]=fn;},removeAttribute(k){delete this[k];}};}
const dialog=el(),image=el(),caption=el(),zoom=el(),closeButton=el(),original=el(),stage=el();stage.contains=target=>target===image;stage.scrollLeft=0;stage.scrollTop=0;dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
const html=el(),events={},nodes={'image-lightbox':dialog,'lightbox-image':image,'lightbox-caption':caption,'lightbox-zoom':zoom,'lightbox-close':closeButton,'lightbox-original':original,'lightbox-stage':stage};
const doc={getElementById:k=>nodes[k],documentElement:html,addEventListener(k,fn){events[k]=fn;}};
let focused=0,reduced=false,id=0;const timers=new Map();
const clock={matchMedia:()=>({matches:reduced}),setTimeout(fn,ms){timers.set(++id,{fn,ms});return id;},clearTimeout:i=>timers.delete(i)};
const link={querySelector:()=>({alt:'Office'}),getAttribute:()=>'/image.jpg',dataset:{},focus(){focused++;}};
const api=setup(doc,clock);
let prevented=0;events.click({target:{closest:()=>link},button:0,preventDefault(){prevented++;}});
assert.equal(prevented,1);assert.equal(dialog.open,true);assert.equal(image.src,'/image.jpg');assert.equal(caption.textContent,'Office');
dialog.events.click();assert.equal(dialog.classList.contains('is-closing'),true);assert.equal(timers.size,1);api.close();assert.equal(timers.size,1);
for(const t of timers.values()){assert.equal(t.ms,190);t.fn();}timers.clear();
assert.equal(dialog.open,false);assert.equal(focused,1);assert.equal(html.classList.contains('image-preview-open'),false);
api.open(link);dialog.events.cancel({preventDefault(){prevented++;}});assert.equal(prevented,2);
// Re-opening cancels a pending close, rather than allowing its timer to close a new image.
api.open(link);assert.equal(timers.size,0);assert.equal(dialog.open,true);
assert.equal(original.href,'/image.jpg');
zoom.events.click({stopPropagation(){}});assert.equal(zoom['aria-pressed'],'true');assert.ok(parseInt(image.style.width)>=1000);
stage.events.pointerdown({clientX:80,clientY:70,pointerType:'mouse',button:0,pointerId:1});
stage.events.pointermove({clientX:30,clientY:30,preventDefault(){}});assert.equal(stage.scrollLeft,50);assert.equal(stage.scrollTop,40);
stage.events.pointerup({clientX:30,clientY:30});
dialog.events.click({target:image});assert.ok(!dialog.classList.contains('is-closing'),'zoomed image must pan rather than close');
api.toggleZoom();assert.equal(zoom['aria-pressed'],'false');assert.equal(image.style.width,'');
reduced=true;closeButton.events.click({stopPropagation(){}});assert.equal([...timers.values()][0].ms,0);
console.log('Lightbox: no navigation, fitted-image click + Escape, animated close, focus restore, reduced motion, reopen, explicit zoom/close controls and pan-surface behavior OK');
