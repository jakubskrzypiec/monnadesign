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

  // V25 major-grade cinematic entry — only once per session, clean transition from hero image
  const initMajorEntryV25 = () => {
    if (reducedMotion) {
      document.body.classList.add('entry-v25-finished');
      return;
    }
    try {
      if (window.sessionStorage?.getItem('monnaEntrySeenV25') === '1') {
        document.body.classList.add('entry-v25-finished');
        return;
      }
      window.sessionStorage?.setItem('monnaEntrySeenV25', '1');
    } catch (error) {}

    const heroImage =
      document.querySelector('.hero__frame.is-active') ||
      document.querySelector('.sub-hero-v16__image img') ||
      document.querySelector('.page-hero > img') ||
      document.querySelector('.page-hero img') ||
      document.querySelector('main img');

    const source = heroImage?.currentSrc || heroImage?.src || 'hero-01.jpg';
    const gate = document.createElement('div');
    gate.className = 'premium-entry-v25';
    gate.style.setProperty('--entry-bg', `url("${source}")`);
    gate.innerHTML = `
      <div class="premium-entry-v25__bg" aria-hidden="true"></div>
      <div class="premium-entry-v25__grid" aria-hidden="true"></div>
      <div class="premium-entry-v25__panel premium-entry-v25__panel--top" aria-hidden="true"></div>
      <div class="premium-entry-v25__panel premium-entry-v25__panel--bottom" aria-hidden="true"></div>
      <div class="premium-entry-v25__content">
        <img src="monogram-white.png" alt="" class="premium-entry-v25__mark">
        <span>MONIKA SERBISTA</span>
        <strong>Projektowanie wnętrz</strong>
        <i></i>
      </div>`;
    document.body.classList.add('entry-v25-active');
    document.body.prepend(gate);
    requestAnimationFrame(() => gate.classList.add('is-ready'));
    window.setTimeout(() => gate.classList.add('is-split'), 980);
    window.setTimeout(() => gate.classList.add('is-leaving'), 1480);
    window.setTimeout(() => {
      gate.remove();
      document.body.classList.remove('entry-v25-active');
      document.body.classList.add('entry-v25-finished');
      window.dispatchEvent(new CustomEvent('monna:entry-complete'));
    }, 2300);
  };
  initMajorEntryV25();

  const initBriefPopup = () => {
    if (window.localStorage?.getItem('monnaBriefPopupClosed') === '1') return;
    const popup = document.createElement('aside');
    popup.className = 'premium-brief-popup';
    popup.innerHTML = '<button type="button" aria-label="Zamknij">×</button><small>Brief</small><strong>Masz metraż i kilka zdjęć?</strong><p>Wyślij krótki opis, a wrócimy z uporządkowanym zakresem rozmowy.</p><a href="kontakt.html">Wyślij zapytanie ↗</a>';
    const show = () => popup.classList.add('is-visible');
    const hide = () => { popup.classList.remove('is-visible'); window.localStorage?.setItem('monnaBriefPopupClosed','1'); };
    popup.querySelector('button')?.addEventListener('click', hide);
    document.body.appendChild(popup);
    let triggered = false;
    const trigger = () => { if (triggered) return; triggered = true; show(); };
    window.setTimeout(trigger, 5200);
    window.addEventListener('scroll', () => { if (window.scrollY > window.innerHeight * 0.7) trigger(); }, { passive:true });
  };
  initBriefPopup();

  document.querySelectorAll('.scope-image-bars-v23 details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.scope-image-bars-v23 details').forEach((other) => { if (other !== details) other.open = false; });
    });
  });

  document.querySelectorAll('.scope-showcase-v24 details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.scope-showcase-v24 details').forEach((other) => { if (other !== details) other.open = false; });
    });
  });


  // V25 premium interactions: progress, cursor glow, magnetic buttons, scope/axis motion
  const initMajorInteractionsV25 = () => {
    document.body.classList.add('lux-v25-ready');

    const progress = document.createElement('div');
    progress.className = 'scroll-progress-v25';
    document.body.appendChild(progress);
    const updateProgress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });

    if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
      const glow = document.createElement('div');
      glow.className = 'cursor-glow-v25';
      document.body.appendChild(glow);
      let gx = window.innerWidth / 2;
      let gy = window.innerHeight / 2;
      let tx = gx;
      let ty = gy;
      const moveGlow = () => {
        gx += (tx - gx) * 0.12;
        gy += (ty - gy) * 0.12;
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        requestAnimationFrame(moveGlow);
      };
      moveGlow();
      window.addEventListener('pointermove', (event) => { tx = event.clientX; ty = event.clientY; }, { passive: true });

      const magnetSelectors = [
        '.hero-btn', '.header-cta', '.line-link', '.editorial-link', '.submit-btn',
        '.scope-showcase-v24 summary', '.scope-showcase-v24__panel a',
        '.process-orbit-v16__line article', '.contact-direct-v23 a', '.contact-socials-v21 a', '.contact-socials-v23 a', '.premium-brief-popup a'
      ].join(',');

      document.querySelectorAll(magnetSelectors).forEach((target) => {
        let raf = null;
        target.addEventListener('pointermove', (event) => {
          const rect = target.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
          target.style.setProperty('--mx', `${x.toFixed(3)}`);
          target.style.setProperty('--my', `${y.toFixed(3)}`);
          if (target.matches('.hero-btn, .header-cta, .line-link, .editorial-link, .submit-btn, .scope-showcase-v24__panel a, .contact-direct-v23 a, .contact-socials-v21 a, .contact-socials-v23 a')) {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              target.style.transform = `translate3d(${x * 10}px, ${y * 9}px, 0)`;
            });
          }
        });
        target.addEventListener('pointerleave', () => {
          target.style.removeProperty('--mx');
          target.style.removeProperty('--my');
          target.style.transform = '';
        });
      });
    }

    document.querySelectorAll('.scope-showcase-v24 details').forEach((details) => {
      const summary = details.querySelector('summary');
      summary?.setAttribute('aria-expanded', String(details.open));
      details.addEventListener('toggle', () => {
        summary?.setAttribute('aria-expanded', String(details.open));
        if (details.open) details.classList.add('has-opened');
      });
    });
  };
  initMajorInteractionsV25();

})();
