(() => {
  const audio = document.getElementById('voiceDemo');
  const playBtn = document.getElementById('playVoiceBtn');
  const stopBtn = document.getElementById('stopVoiceBtn');
  const status = document.getElementById('audioStatus');

  if (!audio || !playBtn || !stopBtn || !status) return;

  function setStatus(text, state) {
    const color = state === 'ok' ? 'var(--c2)' : (state === 'warn' ? '#ffab52' : '#ff6b6b');
    status.innerHTML = `Audio: <strong style="color:${color}">${text}</strong>`;
  }

  playBtn.addEventListener('click', async () => {
    try {
      audio.currentTime = 0;
      await audio.play();
      setStatus('reproduciendo', 'ok');
    } catch (_) {
      setStatus('no disponible', 'warn');
    }
  });

  stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    setStatus('parado', 'ok');
  });

  audio.addEventListener('ended', () => setStatus('listo', 'ok'));
})();

(() => {
  const imgs = document.querySelectorAll('.gallery-item img');
  imgs.forEach((img) => {
    const markEmpty = () => {
      const fig = img.closest('.gallery-item');
      if (fig) fig.classList.add('is-empty');
    };
    img.addEventListener('error', markEmpty, { once: true });
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });
})();

(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(document.querySelectorAll('.scroll-fx'));
  const visible = new Set();
  let ticking = false;

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else {
        visible.delete(entry.target);
        entry.target.style.setProperty('--drift', '0px');
      }
    }
    requestTick();
  }, { threshold: 0.01 });

  items.forEach((el) => io.observe(el));

  function update() {
    const vh = window.innerHeight || 1;
    visible.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const rel = (center - vh / 2) / (vh / 2);
      const clamped = Math.max(-1, Math.min(1, rel));
      const amp = Number(el.dataset.amp || 12);
      const dir = el.dataset.dir === 'right' ? 1 : -1;
      const drift = (-clamped * amp * dir).toFixed(2);
      el.style.setProperty('--drift', `${drift}px`);
    });
    ticking = false;
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  requestTick();
})();

(() => {
  const diagram = document.getElementById('diagram');
  const svg = document.getElementById('diagramSvg');
  const resetBtn = document.getElementById('resetLayoutBtn');
  if (!diagram || !svg || !resetBtn) return;

  const links = [
    { from: 'user', to: 'ovos', label: 'voz', style: 'solid' },
    { from: 'ovos', to: 'user', label: 'audio', style: 'solid' },

    { from: 'user', to: 'whatsapp', label: 'texto', style: 'solid' },
    { from: 'whatsapp', to: 'openclaw', label: 'mensaje', style: 'solid' },

    { from: 'ovos', to: 'openclaw', label: 'STT', style: 'solid' },
    { from: 'openclaw', to: 'ovos', label: 'TTS', style: 'solid' },

    { from: 'openclaw', to: 'ha', label: 'IoT', style: 'solid' },

    { from: 'openclaw', to: 'pcollama', label: 'LLM', style: 'dashed' },
    { from: 'pcollama', to: 'ministral', label: 'heartbeat', style: 'solid' },

    { from: 'openclaw', to: 'gpt', label: 'principal', style: 'dashed' },
    { from: 'pcollama', to: 'qwen', label: 'backup #1', style: 'dashed' },
    { from: 'openclaw', to: 'mistral', label: 'backup #2', style: 'dashed' },

    { from: 'openclaw', to: 'github', label: 'código', style: 'dashed' },
    { from: 'openclaw', to: 'gmail', label: 'emails', style: 'dashed' },
    { from: 'openclaw', to: 'gcal', label: 'calendario', style: 'dashed' },
    { from: 'openclaw', to: 'gdocs', label: 'docs', style: 'dashed' },
  ];

  const nodeIds = [
    'user','ovos','openclaw','ha','whatsapp','pcollama','ministral','gpt','qwen','mistral','github','gmail','gcal','gdocs'
  ];

  const initialPos = new Map();

  function getVarPx(el, name) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v.endsWith('px') ? parseFloat(v) : 0;
  }

  function storeInitialPositions() {
    nodeIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      initialPos.set(id, { x: getVarPx(el, '--tx'), y: getVarPx(el, '--ty') });
    });
  }

  function rectRel(el) {
    const r = el.getBoundingClientRect();
    const c = diagram.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  }

  function centerOf(rr) {
    return { x: rr.x + rr.w / 2, y: rr.y + rr.h / 2 };
  }

  function anchorPoint(fromRect, toCenter) {
    const c = centerOf(fromRect);
    let dx = toCenter.x - c.x;
    let dy = toCenter.y - c.y;
    if (dx === 0 && dy === 0) return c;

    const hw = fromRect.w / 2;
    const hh = fromRect.h / 2;

    const adx = Math.abs(dx) || 0.0001;
    const ady = Math.abs(dy) || 0.0001;

    const tx = hw / adx;
    const ty = hh / ady;
    const t = Math.min(tx, ty);

    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  function makePath(s, e) {
    const dx = e.x - s.x;
    const dy = e.y - s.y;

    let c1, c2;
    if (Math.abs(dx) > Math.abs(dy)) {
      c1 = { x: s.x + dx * 0.35, y: s.y };
      c2 = { x: e.x - dx * 0.35, y: e.y };
    } else {
      c1 = { x: s.x, y: s.y + dy * 0.35 };
      c2 = { x: e.x, y: e.y - dy * 0.35 };
    }

    return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
  }

  function ensureDefs() {
    if (svg.querySelector('defs')) return;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    m.setAttribute('id', 'arrowHead');
    m.setAttribute('viewBox', '0 0 10 10');
    m.setAttribute('refX', '9');
    m.setAttribute('refY', '5');
    m.setAttribute('markerWidth', '7');
    m.setAttribute('markerHeight', '7');
    m.setAttribute('orient', 'auto');

    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    p.setAttribute('fill', 'rgba(79, 172, 254, 0.78)');

    m.appendChild(p);
    defs.appendChild(m);
    svg.appendChild(defs);
  }

  function render() {
    ensureDefs();

    const w = diagram.clientWidth;
    const h = diagram.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    for (const link of links) {
      const a = document.getElementById(link.from);
      const b = document.getElementById(link.to);
      if (!a || !b) continue;

      const ra = rectRel(a);
      const rb = rectRel(b);

      const cb = centerOf(rb);
      const ca = centerOf(ra);

      const start = anchorPoint(ra, cb);
      const end = anchorPoint(rb, ca);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', makePath(start, end));
      path.setAttribute('marker-end', 'url(#arrowHead)');
      path.setAttribute('class', link.style === 'dashed' ? 'arrow-line' : 'arrow-line-solid');
      svg.appendChild(path);

      const tx = (start.x + end.x) / 2;
      const ty = (start.y + end.y) / 2 - 6;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx.toFixed(1));
      text.setAttribute('y', ty.toFixed(1));
      text.setAttribute('class', 'arrow-text');
      text.textContent = link.label;
      svg.appendChild(text);
    }
  }

  function enableDrag(el) {
    let dragging = false;
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;

    function onDown(e) {
      dragging = true;
      el.setPointerCapture?.(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      baseX = getVarPx(el, '--tx');
      baseY = getVarPx(el, '--ty');
    }

    function onMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.setProperty('--tx', `${baseX + dx}px`);
      el.style.setProperty('--ty', `${baseY + dy}px`);
      render();
    }

    function onUp(e) {
      dragging = false;
      try { el.releasePointerCapture?.(e.pointerId); } catch (_) {}
    }

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
  }

  function resetLayout() {
    nodeIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const p = initialPos.get(id) || { x: 0, y: 0 };
      el.style.setProperty('--tx', `${p.x}px`);
      el.style.setProperty('--ty', `${p.y}px`);
    });
    render();
  }

  nodeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) enableDrag(el);
  });

  resetBtn.addEventListener('click', resetLayout);
  window.addEventListener('resize', () => render(), { passive: true });
  window.addEventListener('scroll', () => render(), { passive: true });

  storeInitialPositions();
  requestAnimationFrame(render);
  window.addEventListener('load', () => setTimeout(render, 50), { passive: true });
})();

(() => {
  const cube = document.getElementById('cube3d');
  const scene = document.getElementById('cubeScene');
  const tabs = Array.from(document.querySelectorAll('.cube-tab'));
  if (!cube || !scene || tabs.length === 0) return;

  const faceAngles = { voz: 0, capacidades: -90, mejoras: -180, imagina: 90 };
  let angleY = 0;
  const tiltX = -6;

  function updateDepth() {
    const w = Math.max(320, scene.clientWidth);
    scene.style.setProperty('--cube-depth', `${Math.round(w / 2)}px`);
  }

  function faceInner(face) {
    const faceEl = cube.querySelector(`.cube-face[data-face="${face}"]`);
    return faceEl ? faceEl.querySelector('.cube-face-inner') : null;
  }

  function updateHeight(face) {
    const inner = faceInner(face);
    if (!inner) return;
    const h = Math.max(280, inner.scrollHeight + 2); // más bajo
    cube.style.height = `${h}px`;
  }

  function applyTransform(withTransition = true) {
    cube.style.transition = withTransition
      ? 'transform 650ms cubic-bezier(.2,.8,.2,1), height 300ms cubic-bezier(.2,.8,.2,1)'
      : 'none';
    cube.style.transform = `rotateX(${tiltX}deg) rotateY(${angleY}deg)`;
  }

  function setActive(face) {
    tabs.forEach(b => {
      const on = b.dataset.face === face;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  // Elige el ángulo equivalente más cercano (evita rotaciones largas)
  function closestAngle(current, targetBase) {
    const candidates = [targetBase, targetBase + 360, targetBase - 360, targetBase + 720, targetBase - 720];
    let best = candidates[0];
    let bestDiff = Math.abs(best - current);
    for (const c of candidates) {
      const d = Math.abs(c - current);
      if (d < bestDiff) { bestDiff = d; best = c; }
    }
    return best;
  }

  function goTo(face, updateHash = false) {
    if (!(face in faceAngles)) face = 'voz';
    angleY = closestAngle(angleY, faceAngles[face]);
    setActive(face);
    updateHeight(face);
    applyTransform(true);

    if (updateHash) {
      const h = face === 'voz' ? '#voz' : `#${face}`;
      history.replaceState(null, '', h);
    }
  }

  function snapToNearestFace() {
    angleY = Math.round(angleY / 90) * 90;
    const norm = ((angleY % 360) + 360) % 360;
    const face =
      norm === 0 ? 'voz' :
      norm === 270 ? 'capacidades' :
      norm === 180 ? 'mejoras' :
      'imagina';

    setActive(face);
    updateHeight(face);
    applyTransform(true);
  }

  function faceFromHash() {
    const h = (location.hash || '').replace('#', '');
    if (h === '' || h === 'voz') return 'voz';
    if (h === 'capacidades') return 'capacidades';
    if (h === 'mejoras') return 'mejoras';
    if (h === 'imagina') return 'imagina';
    return 'voz';
  }

  tabs.forEach(btn => btn.addEventListener('click', () => goTo(btn.dataset.face, true)));
  window.addEventListener('hashchange', () => goTo(faceFromHash(), false));

  let dragging = false;
  let startX = 0;
  let startAngle = 0;

  scene.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input, textarea, select, label')) return;
    dragging = true;
    scene.classList.add('is-dragging');
    startX = e.clientX;
    startAngle = angleY;
    scene.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    applyTransform(false);
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    angleY = startAngle + dx * 0.25;
    applyTransform(false);
  }, { passive: true });

  window.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    scene.classList.remove('is-dragging');
    try { scene.releasePointerCapture?.(e.pointerId); } catch (_) {}
    snapToNearestFace();
  }, { passive: true });

  updateDepth();
  window.addEventListener('resize', () => {
    updateDepth();
    updateHeight(faceFromHash());
  }, { passive: true });

  window.addEventListener('load', () => {
    updateDepth();
    updateHeight(faceFromHash());
  }, { passive: true });

  goTo(faceFromHash(), false);
})();

(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  const blobs = [];
  const blobCount = 6;

  const BG_GRAD_ALPHA = 0.04;
  const BLOB_A_MIN = 0.06;
  const BLOB_A_MAX = 0.12;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    blobs.length = 0;
    for (let i = 0; i < blobCount; i++) {
      blobs.push({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        r: rand(140, 260),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.06, 0.06),
        hue: rand(185, 235),
        alpha: rand(BLOB_A_MIN, BLOB_A_MAX)
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const g = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
    g.addColorStop(0, `rgba(79, 172, 254, ${BG_GRAD_ALPHA})`);
    g.addColorStop(1, `rgba(0, 242, 254, ${BG_GRAD_ALPHA})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (const b of blobs) {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < -b.r) b.x = window.innerWidth + b.r;
      if (b.x > window.innerWidth + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = window.innerHeight + b.r;
      if (b.y > window.innerHeight + b.r) b.y = -b.r;

      const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      rg.addColorStop(0, `hsla(${b.hue}, 95%, 60%, ${b.alpha})`);
      rg.addColorStop(1, `hsla(${b.hue}, 95%, 60%, 0)`);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  init();
  step();

  window.addEventListener('resize', () => {
    resize();
    init();
  }, { passive: true });
})();