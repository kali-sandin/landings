/* Same-page preview with explicit close, optional zoom/pan and original link. */
(function (root, setup) {
  if (typeof module !== 'undefined' && module.exports) module.exports = setup;
  else setup(root.document, root);
})(globalThis, function (document, clock) {
  const dialog = document.getElementById('image-lightbox');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  if (!dialog || !image) return;
  const zoomButton = document.getElementById('lightbox-zoom');
  const closeButton = document.getElementById('lightbox-close');
  const original = document.getElementById('lightbox-original');
  const stage = document.getElementById('lightbox-stage');
  let timer = null, opener = null, zoomed = false, drag = null, lastDrag = 0;
  function resetZoom() {
    zoomed = false;
    dialog.classList.remove('is-zoomed');
    if (image.style) image.style.width = '';
    zoomButton?.setAttribute('aria-pressed','false');
    if (zoomButton) zoomButton.textContent = 'Ampliar +';
    if (stage) { stage.scrollLeft = 0; stage.scrollTop = 0; }
  }
  function toggleZoom() {
    if (zoomed) { resetZoom(); return; }
    zoomed = true; dialog.classList.add('is-zoomed');
    image.style.width = `${Math.max((clock.innerWidth || 400) * 2.5, image.naturalWidth || 0)}px`;
    zoomButton?.setAttribute('aria-pressed','true');
    if (zoomButton) zoomButton.textContent = 'Ajustar −';
  }
  zoomButton?.addEventListener('click', event => { event.stopPropagation(); toggleZoom(); });
  closeButton?.addEventListener('click', event => { event.stopPropagation(); close(); });
  original?.addEventListener('click', event => event.stopPropagation());
  stage?.addEventListener('pointerdown', event => {
    if (!zoomed || event.button > 0) return;
    drag = {x:event.clientX, y:event.clientY, left:stage.scrollLeft, top:stage.scrollTop, mouse:event.pointerType === 'mouse'};
    if (drag.mouse) stage.setPointerCapture?.(event.pointerId);
  });
  stage?.addEventListener('pointermove', event => {
    if (!drag || !zoomed || !drag.mouse) return;
    event.preventDefault();
    stage.scrollLeft = drag.left - (event.clientX - drag.x);
    stage.scrollTop = drag.top - (event.clientY - drag.y);
  });
  function stopDrag(event) {
    if (drag && Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6) lastDrag=Date.now();
    drag=null;
  }
  stage?.addEventListener('pointerup', stopDrag);
  stage?.addEventListener('pointercancel', () => { drag=null; });
  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    const reduced = clock.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = clock.setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing');
      document.documentElement.classList.remove('image-preview-open');
      image.removeAttribute('src');
      resetZoom();
      opener?.focus({preventScroll: true});
      timer = null;
    }, reduced ? 0 : 190);
  }
  function open(link) {
    if (timer !== null) clock.clearTimeout(timer);
    timer = null; opener = link; resetZoom();
    const source = link.querySelector('img');
    image.src = link.getAttribute('href');
    if (original) original.href = image.src;
    image.alt = source?.alt || link.dataset.caption || 'Captura de The Office';
    caption.textContent = image.alt;
    dialog.classList.remove('is-closing');
    document.documentElement.classList.add('image-preview-open');
    if (!dialog.open) dialog.showModal();
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('[data-lightbox]');
    if (!link || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); open(link);
  });
  dialog.addEventListener('click', event => {
    if (event?.target?.closest?.('.lightbox-toolbar')) return;
    if (Date.now()-lastDrag<400) return;
    // A zoomed image is a pan surface, not a dismiss button.
    if (zoomed && stage?.contains(event?.target)) return;
    close();
  });
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  return {open, close, toggleZoom};
});
