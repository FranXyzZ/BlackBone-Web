document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initMobileNav();
  initTabs();
  initFaq();
  initHeroVideoCrossfade();
  initHeaderScrollShrink();
  initSpotlight();
  initCardTilt();
  initScrollReveal();
  initContactForm();
});

function initThemeToggle() {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  applyTheme('dark');

  if (!toggle) return;

  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

function initMobileNav() {
  var button = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');
  if (!button || !links) return;

  button.addEventListener('click', function () {
    var isOpen = links.classList.toggle('is-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

function initTabs() {
  var groups = document.querySelectorAll('[data-tabs]');

  groups.forEach(function (group) {
    var buttons = group.querySelectorAll('[data-tab-target]');
    var panels = group.querySelectorAll('[data-tab-panel]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-tab-target');

        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });

        button.classList.add('is-active');
        var panel = group.querySelector('[data-tab-panel="' + target + '"]');
        if (panel) panel.classList.add('is-active');
      });
    });
  });
}

function initFaq() {
  var items = document.querySelectorAll('[data-faq-item]');

  items.forEach(function (item) {
    var question = item.querySelector('[data-faq-question]');
    if (!question) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
}

function initHeroVideoCrossfade() {
  var videoA = document.getElementById('video-a');
  var videoB = document.getElementById('video-b');
  if (!videoA || !videoB) return;

  var VIDEO_LIST = [
    'video/hero1.mp4',
    'video/hero2.mp4',
    'video/hero3.mp4',
    'video/hero4.mp4',
    'video/hero5.mp4'
  ];

  var PLAYBACK_RATE = 0.75;
  var CHANGE_INTERVAL = 10000;
  var current = 0;
  var showingA = true;

  function setRate(video) {
    video.playbackRate = PLAYBACK_RATE;
  }

  videoA.addEventListener('loadedmetadata', function () { setRate(videoA); });
  videoB.addEventListener('loadedmetadata', function () { setRate(videoB); });

  videoA.src = VIDEO_LIST[0];

  function cycleVideo() {
    current = (current + 1) % VIDEO_LIST.length;
    var nextVideo = showingA ? videoB : videoA;
    var currentVideo = showingA ? videoA : videoB;
    var nextSrc = VIDEO_LIST[current];

    nextVideo.src = nextSrc;
    nextVideo.load();

    nextVideo.oncanplay = function () {
      setRate(nextVideo);
      nextVideo.play();
      nextVideo.classList.add('active');
      currentVideo.classList.remove('active');
      showingA = !showingA;
    };

    nextVideo.onerror = function () {
      console.warn('[hero video] No se pudo cargar: ' + nextSrc + ' — revisa que el archivo exista con ese nombre exacto en la carpeta video/.');
    };
  }

  setInterval(cycleVideo, CHANGE_INTERVAL);

  function playActiveVideo() {
    var active = videoA.classList.contains('active') ? videoA : videoB;
    var playPromise = active.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  window.addEventListener('pageshow', playActiveVideo);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') playActiveVideo();
  });
}

function initSpotlight() {
  var targets = document.querySelectorAll('[data-spotlight]');
  if (!targets.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  targets.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    });
  });
}

function initCardTilt() {
  var cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var MAX_TILT = 6;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;

      var tiltY = (px - 0.5) * (MAX_TILT * 2);
      var tiltX = (0.5 - py) * (MAX_TILT * 2);

      card.style.setProperty('--tilt-x', tiltX + 'deg');
      card.style.setProperty('--tilt-y', tiltY + 'deg');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (item) { observer.observe(item); });
}

function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusEl = form.querySelector('[data-form-status]');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(field, message) {
    var wrapper = field.closest('.form-field');
    if (!wrapper) return;
    var errorEl = wrapper.querySelector('.field-error');
    if (message) {
      wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateForm() {
    var valid = true;
    var requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      var value = (field.value || '').trim();

      if (!value) {
        setFieldError(field, 'Este campo es obligatorio.');
        valid = false;
        return;
      }

      if (field.type === 'email' && !emailPattern.test(value)) {
        setFieldError(field, 'Ingresa un correo válido.');
        valid = false;
        return;
      }

      setFieldError(field, null);
    });

    return valid;
  }

  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      if (field.closest('.form-field').classList.contains('has-error')) {
        setFieldError(field, null);
      }
    });
  });

  if (window.location.search.indexOf('enviado=1') !== -1) {
    statusEl.textContent = '¡Listo! Recibimos tu mensaje, te respondemos dentro de las próximas 24 horas.';
    statusEl.setAttribute('data-state', 'success');
    form.reset();

    var cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);

    window.requestAnimationFrame(function () {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  form.addEventListener('submit', function (e) {

    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) {
      e.preventDefault();
      return;
    }

    if (!validateForm()) {
      e.preventDefault();
      statusEl.textContent = 'Revisa los campos marcados antes de enviar.';
      statusEl.setAttribute('data-state', 'error');
      return;
    }

    var correoField = form.querySelector('#cf-correo');
    var replyToField = form.querySelector('#cf-replyto');
    if (correoField && replyToField) {
      replyToField.value = correoField.value.trim();
    }

    var nextField = form.querySelector('#cf-next');
    if (nextField) {
      nextField.value = window.location.origin + window.location.pathname + '?enviado=1#propuesta';
    }

    statusEl.textContent = 'Enviando…';
    statusEl.removeAttribute('data-state');

  });
}

function initHeaderScrollShrink() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var SCROLL_THRESHOLD = 60;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-compact');
    } else {
      header.classList.remove('is-compact');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
