(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
    window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 1800);
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const tiles = [...document.querySelectorAll('.project-tile[data-category]')];
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      tiles.forEach((tile) => {
        const show = value === 'all' || tile.dataset.category === value;
        tile.hidden = !show;
      });
    });
  });

  const lightbox = document.querySelector('.page-lightbox');
  const lightboxImage = lightbox?.querySelector('figure img');
  const lightboxTitle = lightbox?.querySelector('figcaption strong');
  const lightboxCount = lightbox?.querySelector('figcaption span');
  let items = [];
  let index = 0;
  const visibleTiles = () => tiles.filter((tile) => !tile.hidden);
  const render = () => {
    const item = items[index];
    if (!item || !lightboxImage || !lightboxTitle || !lightboxCount) return;
    lightboxImage.classList.add('is-changing');
    window.setTimeout(() => {
      lightboxImage.src = item.dataset.lightbox;
      lightboxImage.alt = item.dataset.title || '';
      lightboxTitle.textContent = item.dataset.title || '';
      lightboxCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      lightboxImage.onload = () => lightboxImage.classList.remove('is-changing');
      lightboxImage.onerror = () => lightboxImage.classList.remove('is-changing');
    }, 80);
  };
  const open = (tile) => {
    if (!lightbox) return;
    items = visibleTiles();
    index = Math.max(0, items.indexOf(tile));
    render();
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function') lightbox.close();
    else lightbox.removeAttribute('open');
    document.body.style.overflow = '';
  };
  const move = (direction) => {
    if (!items.length) return;
    index = (index + direction + items.length) % items.length;
    render();
  };
  tiles.forEach((tile) => tile.addEventListener('click', () => open(tile)));
  lightbox?.querySelector('.page-lightbox__close')?.addEventListener('click', close);
  lightbox?.querySelector('.page-lightbox__nav--prev')?.addEventListener('click', () => move(-1));
  lightbox?.querySelector('.page-lightbox__nav--next')?.addEventListener('click', () => move(1));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  lightbox?.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  window.addEventListener('keydown', (event) => {
    if (!lightbox?.open) return;
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'Escape') close();
  });

  document.querySelectorAll('.faq-list details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => { if (other !== details) other.open = false; });
    });
  });
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
})();
