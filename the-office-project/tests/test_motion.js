const assert=require('node:assert/strict');
const fs=require('node:fs');
const {route,GRID,keyframes}=require('../ambient');
const {STEPS,setup}=require('../diagram-flow');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
for(let n=0;n<100;n++){
  const points=route(320+n*17,Math.random,n%2===0);
  assert.equal(points[0].offset,0);assert.equal(points.at(-1).offset,1);
  for(let i=0;i<points.length;i++){
    const p=points[i];assert.equal(Math.abs(p.x)%GRID,0);assert.equal(Math.abs(p.y)%GRID,0);
    if(i){const q=points[i-1];assert.ok((p.x===q.x)!==(p.y===q.y),'strictly one axis moves');assert.ok(p.offset>q.offset);}
  }
  assert.ok(!keyframes('test',points).includes('rotate'));
}
const ids=[...html.matchAll(/data-flow-edge="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,11);assert.ok(STEPS.every(step=>step.every(id=>ids.includes(id))));
function classes(){const set=new Set();return {add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c),toggle(c,b){b?set.add(c):set.delete(c);}};}
const edges=ids.map(id=>({dataset:{flowEdge:id},classList:classes()}));
let io,mut,mediaChange,ticks=new Map(),counter=0,visibility;
const media={matches:false,addEventListener:(e,fn)=>mediaChange=fn};
const doc={hidden:false,documentElement:{classList:classes()},querySelector:()=>({querySelectorAll:()=>edges}),addEventListener:(e,fn)=>visibility=fn};
const win={matchMedia:()=>media,setInterval:(fn,ms)=>{assert.equal(ms,1500);ticks.set(++counter,fn);return counter;},clearInterval:id=>ticks.delete(id),IntersectionObserver:class{constructor(fn){io=fn;}observe(){}},MutationObserver:class{constructor(fn){mut=fn;}observe(){}}};
setup(doc,win);assert.equal(ticks.size,0);
io([{isIntersecting:true}]);assert.equal(ticks.size,1);assert.ok(edges[0].classList.contains('is-active'));
[...ticks.values()][0]();assert.ok(edges[1].classList.contains('is-active'));assert.ok(!edges[0].classList.contains('is-active'));
mut();assert.equal(ticks.size,1);
doc.hidden=true;visibility();assert.equal(ticks.size,0);assert.ok(edges.every(e=>!e.classList.contains('is-active')));
doc.hidden=false;visibility();assert.equal(ticks.size,1);
media.matches=true;mediaChange();assert.equal(ticks.size,0);
media.matches=false;mediaChange();assert.equal(ticks.size,1);
doc.documentElement.classList.add('image-preview-open');mut();assert.equal(ticks.size,0);
doc.documentElement.classList.remove('image-preview-open');mut();assert.equal(ticks.size,1);
io([{isIntersecting:false}]);assert.equal(ticks.size,0);
console.log('100 orthogonal grid routes, edge coverage, 1500ms sequence and pause lifecycle OK');
