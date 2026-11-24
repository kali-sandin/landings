/* Layout-time orthogonal routes. No per-frame JS, polling, or network traffic. */
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
        y = Math.max(-144, Math.min(144, y + (random() < .5 ? -1 : 1) * GRID * (1 + Math.floor(random() * 2))));
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
  function keyframes(name, points) {
    return `@keyframes ${name}{${points.map((p,i) => `${(p.offset*100).toFixed(5)}%{transform:translate3d(${p.x}px,${p.y}px,0);opacity:${i===0 || i===points.length-1 ? 0 : .18}}`).join('')}}`;
  }
  function setup(doc, win) {
    doc.querySelectorAll('.hero, .architecture, .team').forEach((section, si) => {
      const layer = doc.createElement('div'); layer.className = 'data-flow'; layer.setAttribute('aria-hidden','true');
      const styles = doc.createElement('style'); layer.appendChild(styles);
      const packets = MESSAGES.map((message,i) => {
        const packet = doc.createElement('span'); packet.className='data-packet'; packet.textContent=message;
        packet.style.setProperty('--top',`${12+i*14}%`);
        packet.style.setProperty('--route',`packet-grid-${si}-${i}`);
        packet.style.setProperty('--duration',`${24+i*3+si*2}s`);
        packet.style.setProperty('--delay',`${-i*7-si*3}s`);
        layer.appendChild(packet); return packet;
      });
      section.prepend(layer);
      let lastWidth = 0;
      function rebuild() {
        const width = Math.ceil(section.clientWidth / GRID) * GRID;
        packets.forEach((packet,i)=>packet.style.setProperty('--top',`${Math.round(section.clientHeight*(.12+i*.14)/GRID)*GRID}px`));
        if (width === lastWidth) return;
        lastWidth=width;
        styles.textContent = packets.map((p,i)=>keyframes(`packet-grid-${si}-${i}`,route(width,Math.random,i%2===1))).join('\n');
      }
      rebuild();
      if (win.ResizeObserver) new win.ResizeObserver(rebuild).observe(section);
    });
  }
  return {GRID, MESSAGES, route, keyframes, setup};
});
