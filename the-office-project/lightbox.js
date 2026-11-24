/* Native dialog: one image, no navigation, no polling, animated dismissal. */
(function (root, setup) {
  if (typeof module !== 'undefined' && module.exports) module.exports = setup;
  else setup(root.document, root);
})(globalThis, function (document, clock) {
  const dialog = document.getElementById('image-lightbox');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  if (!dialog || !image) return;
  let timer = null, opener = null;
  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    const reduced = clock.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = clock.setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing');
      document.documentElement.classList.remove('image-preview-open');
      image.removeAttribute('src');
      opener?.focus({preventScroll: true});
      timer = null;
    }, reduced ? 0 : 190);
  }
  function open(link) {
    if (timer !== null) clock.clearTimeout(timer);
    timer = null; opener = link;
    const source = link.querySelector('img');
    image.src = link.getAttribute('href');
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
  dialog.addEventListener('click', close); // image, caption and backdrop all dismiss
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  return {open, close};
});
