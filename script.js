(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };
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

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Hero: locked-frame sequence — only the blurred silhouette changes position.
  const frames = [...document.querySelectorAll('.hero__frame')];
  let frameIndex = 0;
  if (frames.length > 1 && !reducedMotion) {
    window.setInterval(() => {
      frames[frameIndex].classList.remove('is-active');
      frameIndex = (frameIndex + 1) % frames.length;
      frames[frameIndex].classList.add('is-active');
    }, 5200);
  }

  // Lightweight reveals.
  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Offer accordion.
  document.querySelectorAll('.offer-row button').forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('.offer-row');
      const list = row?.parentElement;
      if (!row || !list) return;
      const wasOpen = row.classList.contains('is-open');
      list.querySelectorAll('.offer-row').forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        row.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const galleries = {
    apartament: {
      title: 'Światło i miękkie formy',
      images: [
        ['pokojglowny.jpg', 'Jasna strefa dzienna z jadalnią'],
        ['pokojglowny2.jpg', 'Detal salonu w neutralnych tonach']
      ]
    },
    lazienka: {
      title: 'Spokój pod skosem',
      images: [
        ['lazienka1.jpg', 'Łazienka pod skosem z wanną'],
        ['lazienka2.jpg', 'Jasna łazienka z zabudową i lustrem']
      ]
    },
    salon: {
      title: 'Dom w neutralnych tonach',
      images: [
        ['salon1.jpg', 'Salon w jasnych tonach'],
        ['salon2.jpg', 'Strefa telewizyjna z kominkiem'],
        ['salon3.jpg', 'Jadalnia i duże przeszklenie'],
        ['salon4.jpg', 'Salon otwarty na ogród']
      ]
    },
    'kuchnia-salon': {
      title: 'Kontrast i drewno',
      images: [
        ['salonkuchnia1.jpg', 'Strefa dzienna z drewnianą zabudową'],
        ['salonkuchnia2.jpg', 'Kuchnia z czarnymi detalami']
      ]
    },
    sypialnia: {
      title: 'Cisza zapisana w materiale',
      images: [
        ['sypialnia1.jpg', 'Sypialnia w beżowej palecie'],
        ['sypialnia2.jpg', 'Toaletka i zabudowa sypialni'],
        ['sypialnia3.jpg', 'Miękkie tkaniny i światło w sypialni']
      ]
    },
    kuchnia: {
      title: 'Elegancja codzienności',
      images: [
        ['kuchnia1.jpg', 'Kuchnia z jadalnią i drewnianą zabudową']
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
    const item = activeGallery.images[activeImage];
    galleryImage.classList.add('is-changing');
    window.setTimeout(() => {
      galleryImage.src = item[0];
      galleryImage.alt = item[1];
      galleryTitle.textContent = `${activeGallery.title} — ${item[1]}`;
      galleryCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(activeGallery.images.length).padStart(2, '0')}`;
      galleryImage.onload = () => galleryImage.classList.remove('is-changing');
    }, 100);
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

  document.querySelectorAll('[data-project]').forEach((card) => {
    card.querySelector('button')?.addEventListener('click', () => openGallery(card.dataset.project));
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
  });

  // Basic swipe support inside the gallery.
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
