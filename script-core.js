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
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 0.05, 0.25)}s`);
  });
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

  const rotator = document.querySelector('[data-rotator]');
  const rotatorLines = rotator ? [...rotator.querySelectorAll('.studio-rotator__line')] : [];

  rotatorLines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.style.setProperty('--word-count', words.length);
    line.innerHTML = words.map((word, index) =>
      `<span class="studio-rotator__word" style="--word-index:${index}">${word}</span>`
    ).join(' ');
  });

  if (rotator) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => rotator.classList.add('is-ready'));
    });
  }

  if (rotatorLines.length > 1 && !reducedMotion) {
    let rotatorIndex = 0;
    let rotationTimer = null;

    const changeLine = () => {
      const current = rotatorLines[rotatorIndex];
      const nextIndex = (rotatorIndex + 1) % rotatorLines.length;
      const next = rotatorLines[nextIndex];

      current.classList.add('is-leaving');
      window.setTimeout(() => {
        current.classList.remove('is-active', 'is-leaving');
        next.classList.add('is-active');
        rotatorIndex = nextIndex;
      }, 520);
    };

    window.setTimeout(() => {
      rotationTimer = window.setInterval(changeLine, 3400);
    }, 1600);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rotationTimer) {
        window.clearInterval(rotationTimer);
        rotationTimer = null;
      } else if (!document.hidden && !rotationTimer) {
        rotationTimer = window.setInterval(changeLine, 3400);
      }
    });
  }


  // V24 keep landing accordions closed on first paint
  document.querySelectorAll('.service-item.is-open').forEach((item) => {
    item.classList.remove('is-open');
    item.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });

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

  const parallaxAreas = document.querySelectorAll('[data-parallax-area]');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    parallaxAreas.forEach((area) => {
      let raf = null;
      const layers = [...area.querySelectorAll('[data-parallax]')];
      const update = (event) => {
        const rect = area.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5);
        const y = ((event.clientY - rect.top) / rect.height - 0.5);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          layers.forEach((layer) => {
            const depth = Number(layer.dataset.parallax || 0);
            layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
          });
        });
      };
      area.addEventListener('pointermove', update);
      area.addEventListener('pointerleave', () => {
        layers.forEach((layer) => { layer.style.transform = ''; });
      });
    });
  }

  const magneticTargets = document.querySelectorAll('.hero-btn, .line-link, .social-showcase__links a, .submit-btn');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    magneticTargets.forEach((target) => {
      let raf = null;
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          target.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
      target.addEventListener('pointerleave', () => {
        target.style.transform = '';
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // V31 studio-only entry — clean fade over hero, no black bars
  const initMajorEntryV25 = () => {
    const isStudioPage =
      !document.body.classList.contains('subpage') &&
      (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || document.querySelector('.hero'));

    if (reducedMotion || !isStudioPage) {
      document.body.classList.add('entry-v25-finished');
      return;
    }

    const heroImage =
      document.querySelector('.hero__frame.is-active') ||
      document.querySelector('.hero__frame img') ||
      document.querySelector('main img');

    const source = heroImage?.currentSrc || heroImage?.src || 'hero-01.jpg';
    const gate = document.createElement('div');
    gate.className = 'premium-entry-v25 premium-entry-v31';
    gate.style.setProperty('--entry-bg', `url("${source}")`);
    gate.innerHTML = `
      <div class="premium-entry-v25__bg" aria-hidden="true"></div>
      <div class="premium-entry-v31__veil" aria-hidden="true"></div>
      <div class="premium-entry-v25__content">
        <img src="monogram-white.png" alt="" class="premium-entry-v25__mark">
        <span>MONIKA SERBISTA</span>
        <strong>Projektowanie wnętrz</strong>
        <i></i>
      </div>`;
    document.body.classList.add('entry-v25-active');
    document.body.prepend(gate);
    requestAnimationFrame(() => gate.classList.add('is-ready'));
    window.setTimeout(() => gate.classList.add('is-leaving'), 1180);
    window.setTimeout(() => {
      gate.remove();
      document.body.classList.remove('entry-v25-active');
      document.body.classList.add('entry-v25-finished');
      window.dispatchEvent(new CustomEvent('monna:entry-complete'));
    }, 1840);
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


  // V25 premium interactions: progress, magnetic buttons, scope/axis motion
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
      // V26: cursor glow removed. Magnetic interactions stay active.
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
