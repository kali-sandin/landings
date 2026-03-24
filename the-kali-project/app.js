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
  const imgs = document.querySelectorAll('.gallery-item img, .models-shot img');
  imgs.forEach((img) => {
    const markEmpty = () => {
      const fig = img.closest('figure, .gallery-item, .prototype-group');
      if (!fig) return;
      if (fig.classList.contains('models-shot')) {
        fig.classList.add('is-empty');
      } else {
        const item = img.closest('.gallery-item');
        if (item) item.classList.add('is-empty');
      }
    };
    img.addEventListener('error', markEmpty, { once: true });
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });

  document.querySelectorAll('.prototype-group').forEach((group) => {
    const items = [...group.querySelectorAll('.prototype-item')];
    const checkGroup = () => {
      const visible = items.some((item) => !item.classList.contains('is-empty'));
      group.classList.toggle('is-hidden', !visible);
    };
    items.forEach((item) => {
      const img = item.querySelector('img');
      if (!img) return;
      img.addEventListener('error', () => {
        item.classList.add('is-empty', 'is-missing');
        checkGroup();
      }, { once: true });
      if (img.complete && img.naturalWidth === 0) {
        item.classList.add('is-empty', 'is-missing');
      }
    });
    checkGroup();
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
  const demoWrap = document.getElementById('demoGridWrap');
  const demoRoot = document.getElementById('demoDiagram');
  const svg = document.getElementById('demoSvg');
  if (!demoWrap || !demoRoot || !svg) return;

  const screenVideo = document.getElementById('demoScreenVideo');
  const screenLabel = document.getElementById('demoScreenLabel');
  const caption = document.getElementById('demoCaption');
  const chip = document.getElementById('demoStepChip');
  const playBtn = document.getElementById('demoPlayBtn');
  const pauseBtn = document.getElementById('demoPauseBtn');
  const nextBtn = document.getElementById('demoNextBtn');
  const prevBtn = document.getElementById('demoPrevBtn');
  const resetBtn = document.getElementById('demoResetBtn');
  const requestAudio = document.getElementById('demoRequestAudio');
  const responseAudio = document.getElementById('demoResponseAudio');

  const STEP_MS = 5000;
  const avatarBase = 'assets/videos/avatar/';

  const links = [
    { id: 'user-ovos', from: 'demo-user-speaker', to: 'demo-ovos', label: 'voz' },
    { id: 'ovos-broker', from: 'demo-ovos', to: 'demo-broker', label: 'texto' },
    { id: 'broker-screen', from: 'demo-broker', to: 'demo-screen', label: 'estado' },
    { id: 'broker-openclaw', from: 'demo-broker', to: 'demo-openclaw', label: 'evento' },
    { id: 'openclaw-gpt', from: 'demo-openclaw', to: 'demo-gpt54', label: 'razona' },
    { id: 'gpt-openclaw', from: 'demo-gpt54', to: 'demo-openclaw', label: 'plan' },
    { id: 'openclaw-edit', from: 'demo-openclaw', to: 'demo-edit', label: 'tool' },
    { id: 'edit-openclaw', from: 'demo-edit', to: 'demo-openclaw', label: 'resultado' },
    { id: 'openclaw-git', from: 'demo-openclaw', to: 'demo-git', label: 'tool' },
    { id: 'git-github', from: 'demo-git', to: 'demo-github', label: 'push' },
    { id: 'openclaw-ovos', from: 'demo-openclaw', to: 'demo-ovos', label: 'respuesta' },
    { id: 'ovos-user', from: 'demo-ovos', to: 'demo-user-speaker', label: 'audio' },
  ];

  const steps = [
    {
      label: 'Paso 1 / 11',
      active: ['demo-user-speaker'],
      edges: ['user-ovos'],
      screen: 'cara-sleep2-lowres.mp4',
      screenLabel: 'Esperando mi invocación.',
      caption: 'Empieza todo cuando dices: “Hey Kali, haz los cambios en la web, súbelos y despliégala.”',
      audio: requestAudio,
    },
    {
      label: 'Paso 2 / 11',
      active: ['demo-ovos'],
      edges: ['user-ovos', 'ovos-broker'],
      screen: 'cara-listen-lowres.mp4',
      screenLabel: 'Paso a escucha activa.',
      caption: 'OVOS detecta la wake word, transcribe la orden y la pasa al resto del sistema.',
    },
    {
      label: 'Paso 3 / 11',
      active: ['demo-broker', 'demo-screen'],
      edges: ['ovos-broker', 'broker-screen', 'broker-openclaw'],
      screen: 'cara-think-lowres.mp4',
      screenLabel: 'Mi pantalla refleja el cambio de estado.',
      caption: 'Mi broker sincroniza estado, voz y pantalla antes de entregarle el trabajo a OpenClaw.',
    },
    {
      label: 'Paso 4 / 11',
      active: ['demo-openclaw'],
      edges: ['broker-openclaw', 'openclaw-gpt'],
      screen: 'cara-think-lowres.mp4',
      screenLabel: 'Entro en fase de razonamiento.',
      caption: 'OpenClaw abre la ejecución, prepara la sesión y decide qué pasos hay que resolver.',
    },
    {
      label: 'Paso 5 / 11',
      active: ['demo-gpt54'],
      edges: ['openclaw-gpt', 'gpt-openclaw'],
      screen: 'cara-think-lowres.mp4',
      screenLabel: 'Razonamiento remoto con GPT-5.4.',
      caption: 'GPT-5.4 analiza la tarea, planifica la edición y devuelve una estrategia de ejecución.',
    },
    {
      label: 'Paso 6 / 11',
      active: ['demo-openclaw', 'demo-edit'],
      edges: ['gpt-openclaw', 'openclaw-edit', 'edit-openclaw'],
      screen: 'cara-work-lowres.mp4',
      screenLabel: 'Paso a trabajo local sobre mis ficheros.',
      caption: 'OpenClaw ejecuta la tool Edit y modifica index.html, app.js, styles.css y otros recursos locales.',
    },
    {
      label: 'Paso 7 / 11',
      active: ['demo-gpt54'],
      edges: ['edit-openclaw', 'openclaw-gpt', 'gpt-openclaw'],
      screen: 'cara-think-lowres.mp4',
      screenLabel: 'Evalúo el resultado de la tool.',
      caption: 'GPT-5.4 revisa lo que devolvió la tool, compara contra la planificación y decide el siguiente paso.',
    },
    {
      label: 'Paso 8 / 11',
      active: ['demo-openclaw', 'demo-git'],
      edges: ['gpt-openclaw', 'openclaw-git', 'git-github'],
      screen: 'cara-work-lowres.mp4',
      screenLabel: 'Preparo el commit y el push.',
      caption: 'OpenClaw usa la tool Git para dejar el cambio versionado y listo para salir al repositorio.',
    },
    {
      label: 'Paso 9 / 11',
      active: ['demo-github'],
      edges: ['git-github'],
      screen: 'cara-work-lowres.mp4',
      screenLabel: 'El push sale hacia GitHub.',
      caption: 'La tool Git hace commit + push y GitHub recibe la nueva versión del código.',
    },
    {
      label: 'Paso 10 / 11',
      active: ['demo-openclaw', 'demo-ovos', 'demo-user-speaker'],
      edges: ['openclaw-ovos', 'ovos-user'],
      screen: 'cara-speak-lowres.mp4',
      screenLabel: 'Estoy hablando contigo y cerrando la tarea.',
      caption: 'OpenClaw cierra la tarea, OVOS prepara la locución y en este paso escuchas mi respuesta final completa.',
      audio: responseAudio,
    },
    {
      label: 'Paso 11 / 11',
      active: ['demo-screen'],
      edges: [],
      screen: 'cara-sleep2-lowres.mp4',
      screenLabel: 'Vuelvo a reposo y escucha pasiva.',
      caption: 'Termino, vuelvo al estado de reposo y me quedo lista para la siguiente orden.',
    },
  ];

  let currentStep = 0;
  let timer = null;
  let playing = false;

  function stopAudio() {
    [requestAudio, responseAudio].forEach((audioEl) => {
      if (!audioEl) return;
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch (_) {}
    });
  }

  async function tryPlayAudio(audioEl) {
    if (!audioEl) return;
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
      await audioEl.play();
    } catch (_) {}
  }

  function setVideo(file, label) {
    if (!screenVideo || !file) return;
    const nextSrc = `${avatarBase}${file}`;
    if (!screenVideo.getAttribute('src') || !screenVideo.getAttribute('src').endsWith(file)) {
      screenVideo.setAttribute('src', nextSrc);
      screenVideo.load();
    }
    screenVideo.loop = true;
    screenVideo.muted = true;
    screenVideo.currentTime = 0;
    screenVideo.play().catch(() => {});
    if (screenLabel) screenLabel.textContent = label || '';
  }

  function centerOf(el, root) {
    const r = el.getBoundingClientRect();
    const c = root.getBoundingClientRect();
    return {
      x: r.left - c.left + r.width / 2,
      y: r.top - c.top + r.height / 2,
      w: r.width,
      h: r.height,
    };
  }

  function edgePoint(box, target) {
    const dx = target.x - box.x;
    const dy = target.y - box.y;
    const halfW = box.w / 2;
    const halfH = box.h / 2;
    const adx = Math.abs(dx) || 0.0001;
    const ady = Math.abs(dy) || 0.0001;
    const t = Math.min(halfW / adx, halfH / ady);
    return { x: box.x + dx * t, y: box.y + dy * t };
  }

  function buildPath(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const c1 = { x: start.x + dx * 0.35, y: start.y + (Math.abs(dx) > Math.abs(dy) ? 0 : dy * 0.25) };
    const c2 = { x: end.x - dx * 0.35, y: end.y - (Math.abs(dx) > Math.abs(dy) ? 0 : dy * 0.25) };
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }

  function ensureDemoDefs() {
    if (svg.querySelector('defs')) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'demoArrowHead');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '4');
    marker.setAttribute('markerHeight', '4');
    marker.setAttribute('orient', 'auto');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M 0 1.5 L 6 5 L 0 8.5 z');
    p.setAttribute('fill', 'rgba(79, 172, 254, 0.9)');
    marker.appendChild(p);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  function renderDemoLinks(activeEdges = []) {
    ensureDemoDefs();
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    const w = demoWrap.clientWidth;
    const h = demoWrap.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    links.forEach((link) => {
      const fromEl = document.getElementById(link.from);
      const toEl = document.getElementById(link.to);
      if (!fromEl || !toEl) return;
      const fromBox = centerOf(fromEl, demoWrap);
      const toBox = centerOf(toEl, demoWrap);
      const start = edgePoint(fromBox, toBox);
      const end = edgePoint(toBox, fromBox);
      const isActive = activeEdges.includes(link.id);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', buildPath(start, end));
      path.setAttribute('marker-end', 'url(#demoArrowHead)');
      path.setAttribute('class', isActive ? 'demo-link demo-link-active' : 'demo-link');
      svg.appendChild(path);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', ((start.x + end.x) / 2).toFixed(1));
      text.setAttribute('y', (((start.y + end.y) / 2) - 8).toFixed(1));
      text.setAttribute('class', isActive ? 'demo-link-text demo-link-text-active' : 'demo-link-text');
      text.textContent = link.label;
      svg.appendChild(text);
    });
  }

  function renderStep(index, { playAudio = true } = {}) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[currentStep];

    demoRoot.querySelectorAll('.demo-node').forEach((node) => {
      node.classList.toggle('is-active', step.active.includes(node.id));
    });

    if (caption) caption.textContent = step.caption;
    if (chip) chip.textContent = step.label;
    setVideo(step.screen, step.screenLabel);
    renderDemoLinks(step.edges || []);

    stopAudio();
    if (playAudio && step.audio) tryPlayAudio(step.audio);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleNext() {
    clearTimer();
    if (!playing) return;
    timer = setTimeout(() => {
      if (currentStep >= steps.length - 1) {
        playing = false;
        syncPlayButton();
        return;
      }
      renderStep(currentStep + 1);
      scheduleNext();
    }, STEP_MS);
  }

  function playSequence() {
    playing = true;
    renderStep(currentStep);
    scheduleNext();
  }

  function pauseSequence() {
    playing = false;
    clearTimer();
    stopAudio();
    screenVideo?.pause();
  }

  function goRelative(offset) {
    pauseSequence();
    renderStep(Math.max(0, Math.min(currentStep + offset, steps.length - 1)));
  }

  function resetSequence({ autoplay = false } = {}) {
    playing = autoplay;
    clearTimer();
    renderStep(0, { playAudio: autoplay });
    if (autoplay) scheduleNext();
  }

  playBtn?.addEventListener('click', playSequence);
  pauseBtn?.addEventListener('click', pauseSequence);
  nextBtn?.addEventListener('click', () => goRelative(1));
  prevBtn?.addEventListener('click', () => goRelative(-1));
  resetBtn?.addEventListener('click', () => resetSequence({ autoplay: false }));
  window.addEventListener('resize', () => renderDemoLinks(steps[currentStep].edges || []), { passive: true });
  window.addEventListener('load', () => renderDemoLinks(steps[currentStep].edges || []), { passive: true });

  renderStep(0, { playAudio: false });
})();

(() => {
  const diagram = document.getElementById('diagram');
  const svg = document.getElementById('diagramSvg');
  const resetBtn = document.getElementById('resetLayoutBtn');
  if (!diagram || !svg || !resetBtn) return;

  const links = [
    { from: 'user', to: 'ovos', label: 'voz', style: 'solid' },
    { from: 'user', to: 'screen', label: 'visual, táctil', style: 'solid' },
    { from: 'screen', to: 'user', label: '', style: 'solid' },
    { from: 'ovos', to: 'broker', label: 'audio / texto', style: 'solid' },
    { from: 'broker', to: 'screen', label: 'estado', style: 'solid' },
    { from: 'broker', to: 'openclaw', label: 'eventos', style: 'solid' },
    { from: 'whatsapp', to: 'openclaw', label: 'mensajes', style: 'solid' },
    { from: 'openclaw', to: 'whatsapp', label: 'mensajes', style: 'solid' },
    { from: 'openclaw', to: 'ha', label: 'IoT', style: 'solid' },
    { from: 'openclaw', to: 'pcollama', label: 'LLM', style: 'solid' },
    { from: 'pcollama', to: 'ministral', label: 'local', style: 'solid' },
    { from: 'openclaw', to: 'gpt', label: 'frontera', style: 'dashed' },
    { from: 'pcollama', to: 'qwen', label: 'cloud', style: 'dashed' },
    { from: 'openclaw', to: 'mistral', label: 'ligero', style: 'dashed' },
    { from: 'openclaw', to: 'chatmodels', label: 'chat', style: 'dashed' },
    { from: 'openclaw', to: 'github', label: 'código', style: 'dashed' },
    { from: 'openclaw', to: 'gmail', label: 'emails', style: 'dashed' },
    { from: 'openclaw', to: 'gcal', label: 'calendario', style: 'dashed' },
    { from: 'openclaw', to: 'gdocs', label: 'docs', style: 'dashed' },
  ];

  const nodeIds = ['user','screen','ovos','broker','openclaw','ha','whatsapp','pcollama','ministral','gpt','qwen','mistral','chatmodels','github','gmail','gcal','gdocs'];
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
      if (link.label) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (((start.x + end.x) / 2)).toFixed(1));
        text.setAttribute('y', ((((start.y + end.y) / 2) - 6)).toFixed(1));
        text.setAttribute('class', 'arrow-text');
        text.textContent = link.label;
        svg.appendChild(text);
      }
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
  window.addEventListener('resize', render, { passive: true });
  window.addEventListener('scroll', render, { passive: true });
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
  const tiltX = 0;

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
    const h = Math.max(280, inner.scrollHeight + 2);
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
    const face = norm === 0 ? 'voz' : norm === 270 ? 'capacidades' : norm === 180 ? 'mejoras' : 'imagina';
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
      blobs.push({ x: rand(0, window.innerWidth), y: rand(0, window.innerHeight), r: rand(140, 260), vx: rand(-0.08, 0.08), vy: rand(-0.06, 0.06), hue: rand(185, 235), alpha: rand(BLOB_A_MIN, BLOB_A_MAX) });
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
  resize(); init(); step();
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
})();
