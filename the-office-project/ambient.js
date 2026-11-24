/* SVG text paths: individual glyphs follow each bend, no per-frame JavaScript. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else api.setup(root.document, root);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const GRID = 48;
  const MESSAGES = ['0101 1100 · PROJECT SYNC · 0011', '1010 0011 · TASK ASSIGNED · 0110',
    '0011 1001 · REVIEW PASSED · 1010', '1100 0101 · EVENT RECEIVED · 1001',
    '0110 1010 · TESTS OK · 0011', '1001 0110 · COMMIT VERIFIED · 1100'];
  function route(width, random = Math.random, reverse = false) {
    const end = Math.ceil(width / GRID) * GRID + 384;
    const points = [{x: -384, y: 0}];
    let x = -384, y = 0;
    while (x < end) {
      x = Math.min(end, x + (3 + Math.floor(random() * 5)) * GRID);
      points.push({x, y});
      if (x < end && random() < .65) {
        y = Math.max(-384, Math.min(384, y + (random() < .5 ? -1 : 1) * GRID * (3 + Math.floor(random() * 4))));
        if (y !== points[points.length - 1].y) points.push({x, y});
      }
    }
    if (reverse) points.reverse();
    let length = 0;
    return points.map((point, index) => {
      if (index) length += Math.abs(point.x - points[index-1].x) + Math.abs(point.y - points[index-1].y);
      return {...point, distance: length};
    }).map((point, index, all) => ({...point, offset: point.distance / all[all.length-1].distance}));
  }
  function pathData(points, baseline) {
    return points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y+baseline}`).join(' ');
  }
  function setup(doc, win) {
    const ns='http://www.w3.org/2000/svg';
    function element(name,attrs={}) {
      const node=doc.createElementNS(ns,name);
      Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
      return node;
    }
    doc.querySelectorAll('.hero, .architecture, .team').forEach((section,si)=>{
      const layer=doc.createElement('div');layer.className='data-flow';layer.setAttribute('aria-hidden','true');
      const svg=element('svg',{class:'data-flow-svg',focusable:'false'});
      const defs=element('defs');svg.appendChild(defs);layer.appendChild(svg);section.prepend(layer);
      const packets=MESSAGES.map((message,i)=>{
        const id=`packet-grid-${si}-${i}`,path=element('path',{id});defs.appendChild(path);
        const text=element('text',{class:'data-packet'}),textPath=element('textPath',{href:`#${id}`,startOffset:-384});
        textPath.textContent=message;
        const animate=element('animate',{attributeName:'startOffset',from:-384,repeatCount:'indefinite',calcMode:'linear',begin:`${-i*9-si*5}s`});
        textPath.appendChild(animate);text.appendChild(textPath);svg.appendChild(text);
        return {path,animate};
      });
      let width=0,height=0,visible=true;
      const media=win.matchMedia('(prefers-reduced-motion: reduce)');
      function sync(){
        if(doc.hidden||!visible||media.matches||doc.documentElement.classList.contains('image-preview-open'))svg.pauseAnimations();
        else svg.unpauseAnimations();
      }
      function rebuild(){
        const w=Math.ceil(section.clientWidth/GRID)*GRID,h=section.clientHeight;
        if(w===width&&h===height)return;
        const widthChanged=w!==width;width=w;height=h;
        packets.forEach((packet,i)=>{
          // Reuse the same route on height-only changes (e.g. lazy image loading).
          if(widthChanged)packet.points=route(width);
          const baseline=Math.round(height*(.12+i*.14)/GRID)*GRID;
          packet.path.setAttribute('d',pathData(packet.points,baseline));
          const length=packet.points.at(-1).distance;
          packet.animate.setAttribute('to',length+384);
          packet.animate.setAttribute('dur',`${(length+768)/55}s`);
        });
        sync();
      }
      rebuild();
      if(win.ResizeObserver)new win.ResizeObserver(rebuild).observe(section);
      if(win.IntersectionObserver)new win.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();}).observe(section);
      if(win.MutationObserver)new win.MutationObserver(sync).observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
      doc.addEventListener('visibilitychange',sync);media.addEventListener?.('change',sync);
    });
  }
  return {GRID,MESSAGES,route,pathData,setup};
});
