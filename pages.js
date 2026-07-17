(() => {
  'use strict';

  const filters = [...document.querySelectorAll('[data-filter]')];
  const tiles = [...document.querySelectorAll('.project-tile[data-category]')];

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      tiles.forEach((tile) => {
        const visible = value === 'all' || tile.dataset.category === value;
        tile.hidden = !visible;
      });
    });
  });

  const lightbox = document.querySelector('.page-lightbox');
  const lightboxImage = lightbox?.querySelector('figure img');
  const lightboxTitle = lightbox?.querySelector('figcaption strong');
  const lightboxCount = lightbox?.querySelector('figcaption span');
  let lightboxItems = [];
  let lightboxIndex = 0;

  const visibleTiles = () => tiles.filter((tile) => !tile.hidden);

  const renderLightbox = () => {
    const item = lightboxItems[lightboxIndex];
    if (!item || !lightboxImage || !lightboxTitle || !lightboxCount) return;
    lightboxImage.classList.add('is-changing');
    window.setTimeout(() => {
      lightboxImage.src = item.dataset.lightbox;
      lightboxImage.alt = item.dataset.title || '';
      lightboxTitle.textContent = item.dataset.title || '';
      lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(lightboxItems.length).padStart(2, '0')}`;
      lightboxImage.onload = () => lightboxImage.classList.remove('is-changing');
    }, 100);
  };

  const openLightbox = (tile) => {
    if (!lightbox) return;
    lightboxItems = visibleTiles();
    lightboxIndex = Math.max(0, lightboxItems.indexOf(tile));
    renderLightbox();
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function') lightbox.close();
    else lightbox.removeAttribute('open');
    document.body.style.overflow = '';
  };

  const moveLightbox = (direction) => {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  };

  tiles.forEach((tile) => tile.addEventListener('click', () => openLightbox(tile)));
  lightbox?.querySelector('.page-lightbox__close')?.addEventListener('click', closeLightbox);
  lightbox?.querySelector('.page-lightbox__prev')?.addEventListener('click', () => moveLightbox(-1));
  lightbox?.querySelector('.page-lightbox__next')?.addEventListener('click', () => moveLightbox(1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });

  window.addEventListener('keydown', (event) => {
    if (!lightbox?.open) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  document.querySelectorAll('.page-accordion details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.page-accordion details').forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });

  const toc = document.querySelector('[data-article-toc]');
  if (toc) {
    document.querySelectorAll('.article-content h2[id]').forEach((heading) => {
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      toc.appendChild(link);
    });
  }

  const copyButton = document.querySelector('[data-copy-link]');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const original = copyButton.firstChild?.textContent || 'Skopiuj link';
      copyButton.firstChild.textContent = 'Skopiowano ';
      window.setTimeout(() => { copyButton.firstChild.textContent = original; }, 1800);
    } catch {
      window.prompt('Skopiuj adres strony:', window.location.href);
    }
  });
})();
