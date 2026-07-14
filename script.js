(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    mobileMenu.hidden = !open;
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const frames = [...document.querySelectorAll('.hero__frame')];
  let frameIndex = 0;
  if (frames.length > 1 && !reducedMotion) {
    window.setInterval(() => {
      frames[frameIndex].classList.remove('is-active');
      frameIndex = (frameIndex + 1) % frames.length;
      frames[frameIndex].classList.add('is-active');
    }, 2700);
  }


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
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.07 });
    revealItems.forEach((item) => observer.observe(item));
    window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 2200);
  }

  const serviceItems = [...document.querySelectorAll('.service-item')];
  serviceItems.forEach((item) => {
    const button = item.querySelector('button');
    button?.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      serviceItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (opening) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const marquee = document.querySelector('[data-project-marquee]');
  const rail = document.querySelector('[data-project-rail]');
  let resumeTimer = null;

  if (marquee && rail) {
    const originals = [...rail.children];
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      rail.appendChild(clone);
    });

    const measureMarquee = () => {
      if (!originals.length || window.innerWidth <= 820 || reducedMotion) {
        rail.classList.remove('is-running');
        return;
      }
      const first = originals[0];
      const firstClone = rail.children[originals.length];
      if (!first || !firstClone) return;
      const distance = firstClone.offsetLeft - first.offsetLeft;
      if (distance <= 0) return;
      rail.style.setProperty('--marquee-distance', `${distance}px`);
      rail.style.setProperty('--marquee-shift', `${-distance}px`);
      rail.style.setProperty('--marquee-duration', `${Math.max(34, distance / 48)}s`);
      rail.classList.remove('is-running');
      void rail.offsetWidth;
      rail.classList.add('is-running');
    };

    const pause = () => marquee.classList.add('is-paused');
    const resume = () => marquee.classList.remove('is-paused');

    marquee.addEventListener('pointerenter', pause);
    marquee.addEventListener('pointerleave', resume);
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', resume);
    marquee.addEventListener('touchstart', () => {
      pause();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(resume, 2600);
    }, { passive: true });

    window.requestAnimationFrame(measureMarquee);
    window.setTimeout(measureMarquee, 450);
    rail.querySelectorAll('img').forEach((image) => {
      image.addEventListener('load', measureMarquee, { once: true });
      image.addEventListener('error', measureMarquee, { once: true });
    });
    window.addEventListener('resize', () => window.requestAnimationFrame(measureMarquee), { passive: true });
  }

  document.querySelectorAll('.faq-list details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });

  const galleries = {
    apartament: {
      title: 'Apartament — Warszawa, 78 m²',
      images: [
        ['pokojglowny.jpg', 'Jasna strefa dzienna z jadalnią'],
        ['pokojglowny2.jpg', 'Detal salonu w neutralnych tonach']
      ]
    },
    salon: {
      title: 'Dom — Ciechanów, 142 m²',
      images: [
        ['salon1.jpg', 'Salon w jasnych tonach'],
        ['salon2.jpg', 'Strefa telewizyjna z kominkiem'],
        ['salon3.jpg', 'Jadalnia i duże przeszklenie'],
        ['salon4.jpg', 'Salon otwarty na ogród']
      ]
    },
    'kuchnia-salon': {
      title: 'Strefa dzienna — Płock, 56 m²',
      images: [
        ['salonkuchnia1.jpg', 'Strefa dzienna z drewnianą zabudową'],
        ['salonkuchnia2.jpg', 'Kuchnia z czarnymi detalami'],
        ['kuchnia1.jpg', 'Kuchnia z jadalnią']
      ]
    },
    lazienka: {
      title: 'Łazienka — Legionowo, 12 m²',
      images: [
        ['lazienka1.jpg', 'Łazienka pod skosem z wanną'],
        ['lazienka2.jpg', 'Jasna łazienka z zabudową i lustrem']
      ]
    },
    sypialnia: {
      title: 'Sypialnia — Olsztyn, 18 m²',
      images: [
        ['sypialnia1.jpg', 'Sypialnia w neutralnej palecie'],
        ['sypialnia2.jpg', 'Toaletka i zabudowa sypialni'],
        ['sypialnia3.jpg', 'Miękkie tkaniny i światło']
      ]
    }
  };

  const dialog = document.querySelector('.gallery');
  const galleryImage = dialog?.querySelector('figure img');
  const galleryTitle = dialog?.querySelector('.gallery__title');
  const galleryCount = dialog?.querySelector('.gallery__count');
  let activeGallery = null;
  let activeImage = 0;

  const renderGallery = () => {
    if (!activeGallery || !galleryImage || !galleryTitle || !galleryCount) return;
    const [source, alt] = activeGallery.images[activeImage];
    galleryImage.classList.add('is-changing');
    window.setTimeout(() => {
      galleryImage.src = source;
      galleryImage.alt = alt;
      galleryTitle.textContent = `${activeGallery.title} — ${alt}`;
      galleryCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(activeGallery.images.length).padStart(2, '0')}`;
      galleryImage.onload = () => galleryImage.classList.remove('is-changing');
      galleryImage.onerror = () => galleryImage.classList.remove('is-changing');
    }, 90);
  };

  const openGallery = (key) => {
    if (!dialog || !galleries[key]) return;
    activeGallery = galleries[key];
    activeImage = 0;
    renderGallery();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.style.overflow = '';
  };

  const moveGallery = (direction) => {
    if (!activeGallery) return;
    activeImage = (activeImage + direction + activeGallery.images.length) % activeGallery.images.length;
    renderGallery();
  };

  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-project]');
    if (card) openGallery(card.dataset.project);
  });

  dialog?.querySelector('.gallery__close')?.addEventListener('click', closeGallery);
  dialog?.querySelector('.gallery__nav--prev')?.addEventListener('click', () => moveGallery(-1));
  dialog?.querySelector('.gallery__nav--next')?.addEventListener('click', () => moveGallery(1));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeGallery();
  });
  dialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeGallery();
  });

  window.addEventListener('keydown', (event) => {
    if (!dialog?.open) return;
    if (event.key === 'ArrowLeft') moveGallery(-1);
    if (event.key === 'ArrowRight') moveGallery(1);
    if (event.key === 'Escape') closeGallery();
  });

  let touchStartX = 0;
  dialog?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  dialog?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) moveGallery(delta > 0 ? -1 : 1);
  }, { passive: true });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
