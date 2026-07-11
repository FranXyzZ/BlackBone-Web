/* =========================================================
   BLACKBONE — script compartido
   Este archivo lo referencian todas las páginas (index.html,
   html/servicios.html, y las que agregues). Contiene:
   1) Interruptor de tema oscuro/claro
   2) Menú de navegación para móvil
   3) Tabs de "tipos de sitio" (con imagen)
   4) Acordeón de preguntas frecuentes
   5) Crossfade de videos del hero
   6) Header flotante tipo "liquid glass" al hacer scroll
   ========================================================= */

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
});

/**
 * Alterna data-theme="light" / "dark" en <html>.
 * Nota: no se guarda en localStorage a propósito (para que el
 * archivo funcione igual dentro de vistas previas sin storage).
 * Si vas a alojar el sitio en tu propio hosting y quieres que
 * el modo elegido se recuerde entre visitas, se puede agregar
 * localStorage.setItem('theme', tema) aquí sin problema.
 */
function initThemeToggle() {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
  });
}

/**
 * Muestra/oculta el menú de navegación en pantallas angostas
 * (móvil). En modo "píldora" del header (desktop) los links ya
 * quedan siempre visibles, así que esto solo aplica < 860px.
 */
function initMobileNav() {
  var button = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');
  if (!button || !links) return;

  button.addEventListener('click', function () {
    var isOpen = links.classList.toggle('is-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

/**
 * Tabs con imagen (sección "tipos de sitio").
 * Cada botón [data-tab-target] muestra el panel [data-tab-panel]
 * que comparte el mismo valor. Se pueden agregar más tabs solo
 * repitiendo el mismo patrón de atributos en el HTML.
 */
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

/**
 * Acordeón de preguntas frecuentes.
 * Cada [data-faq-item] se abre/cierra al hacer click en su
 * [data-faq-question]. Se puede dejar más de uno abierto a la vez.
 */
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

/**
 * Crossfade de videos en el hero.
 * Requiere en el HTML dos <video> dentro de .hero-media, con
 * ids "video-a" y "video-b" (el primero con clase "active").
 * Cambia el clip cada CHANGE_INTERVAL ms, con fade suave
 * controlado por CSS (.hero-media video { transition: opacity }).
 * Edita el array VIDEO_LIST con las rutas de tus clips.
 * PLAYBACK_RATE controla la velocidad (1 = normal, 0.5 = mitad
 * de velocidad, 0.25 = un cuarto). Bájalo si tus clips son
 * cortos y se repiten mucho antes de cambiar.
 */
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

  var PLAYBACK_RATE = 0.75; // prueba 0.25 / 0.5 / 0.75 / 1
  var CHANGE_INTERVAL = 10000; // 10 segundos
  var current = 0;
  var showingA = true;

  function setRate(video) {
    video.playbackRate = PLAYBACK_RATE;
  }

  // Se re-aplica la velocidad cada vez que el video carga metadata,
  // porque algunos navegadores la resetean al cambiar el src.
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
}

/**
 * "Spotlight" que sigue el mouse sobre una grilla de puntos.
 * Se activa en cualquier elemento con [data-spotlight] (por ahora
 * las secciones de intro de servicios.html y contacto.html).
 * Solo escribe las variables CSS --mx/--my; todo lo visual vive
 * en .intro-section dentro de styles.css. En touch (sin mouse) o
 * con "reducir movimiento" activado, se deja el fondo fijo.
 */
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

/**
 * Inclinación 3D suave (tilt) para tarjetas [.card] al mover el
 * mouse encima. Escribe --tilt-x/--tilt-y, que styles.css usa en
 * la transformación de .card. Rango de inclinación acotado a
 * pocos grados a propósito, para que se sienta minimalista y no
 * como un efecto "gamer". Se desactiva con "reducir movimiento".
 */
function initCardTilt() {
  var cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var MAX_TILT = 6; // grados

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;  // 0 a 1
      var py = (e.clientY - rect.top) / rect.height;  // 0 a 1

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

/**
 * Aparición suave al hacer scroll para cualquier elemento con
 * class="reveal" (agrega esta clase donde quieras el efecto:
 * ya se usa en los .service-item de servicios.html y en las
 * .card de contacto.html). Usa IntersectionObserver, así que no
 * cuesta nada de rendimiento mientras el elemento no es visible.
 */
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

/**
 * Convierte el header en una píldora flotante ("liquid glass")
 * cuando el usuario baja de cierto punto de scroll. Al volver
 * arriba, recupera la barra completa. Los links y el logo (solo
 * ícono) quedan dentro de la misma cápsula, sin colapsar a menú.
 */
function initHeaderScrollShrink() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var SCROLL_THRESHOLD = 60; // px antes de activar el modo píldora

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-compact');
    } else {
      header.classList.remove('is-compact');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // por si la página carga ya scrolleada
}