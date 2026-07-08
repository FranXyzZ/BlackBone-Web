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
   7) Dock inferior "liquid glass" con burbuja arrastrable
      (solo celular, reemplaza al header cuando bajas)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initMobileNav();
  initTabs();
  initFaq();
  initHeroVideoCrossfade();
  initHeaderScrollShrink();
  initLiquidDock();
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

/**
 * DOCK INFERIOR "LIQUID GLASS" (solo celular).
 * Requiere en el HTML un bloque con [data-liquid-dock] que
 * contenga [data-liquid-track] > enlaces [data-liquid-stop]
 * (uno por opción del menú) + un [data-liquid-bubble] con un
 * [data-liquid-bubble-label] adentro. Ver index.html.
 *
 * Comportamiento:
 * - Solo se activa en pantallas <= 860px (mismo corte que el
 *   resto del menú móvil del sitio).
 * - Al bajar el scroll más de SCROLL_THRESHOLD, el header de
 *   arriba se oculta (clase .is-hidden-mobile) y este dock
 *   aparece flotando abajo (clase .is-visible).
 * - La burbuja se puede arrastrar con el dedo (o el mouse, para
 *   probarlo en escritorio simulando un celular) por la barra;
 *   se resalta la opción más cercana en tiempo real y, al
 *   soltar, la burbuja "cae" (spring) sobre esa opción y recién
 *   ahí navega a esa página.
 * - Tocar una opción directamente (sin arrastrar) hace lo mismo:
 *   anima la burbuja hasta ahí y navega.
 */
function initLiquidDock() {
  var dock = document.querySelector('[data-liquid-dock]');
  var track = document.querySelector('[data-liquid-track]');
  var bubble = document.querySelector('[data-liquid-bubble]');
  var bubbleLabel = document.querySelector('[data-liquid-bubble-label]');
  var stops = Array.prototype.slice.call(document.querySelectorAll('[data-liquid-stop]'));
  var header = document.querySelector('.site-header');

  if (!dock || !track || !bubble || !bubbleLabel || !stops.length || !header) return;

  var MOBILE_QUERY = window.matchMedia('(max-width: 860px)');
  var SCROLL_THRESHOLD = 80; // px antes de esconder el header y mostrar el dock

  var activeIndex = stops.findIndex(function (s) {
    return s.getAttribute('aria-current') === 'page';
  });
  if (activeIndex < 0) activeIndex = 0;

  // Centro (en px, relativo a la barra) de cada opción.
  function stopCenters() {
    var trackRect = track.getBoundingClientRect();
    return stops.map(function (stop) {
      var r = stop.getBoundingClientRect();
      return (r.left + r.width / 2) - trackRect.left;
    });
  }

  function nearestIndex(x) {
    var centers = stopCenters();
    var nearest = 0;
    var dist = Infinity;
    centers.forEach(function (c, i) {
      var d = Math.abs(c - x);
      if (d < dist) { dist = d; nearest = i; }
    });
    return nearest;
  }

  function highlight(index) {
    stops.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
    var label = stops[index].querySelector('.liquid-stop-label');
    if (label) bubbleLabel.textContent = label.textContent;
  }

  // Mueve el chip para que su CENTRO quede en x (clamp dentro de la barra).
  // "stretch" es cuánto se movió el dedo desde el frame anterior: con eso
  // se estira/achica el chip un poco, como una gota real, mientras arrastras.
  function placeBubbleAt(x, stretch) {
    var half = bubble.offsetWidth / 2;
    var min = half;
    var max = track.clientWidth - half;
    var clamped = Math.max(min, Math.min(max, x));
    var amount = stretch ? Math.max(0, Math.min(0.32, Math.abs(stretch) * 0.05)) : 0;
    bubble.style.borderRadius = (16 + amount * 26) + 'px';
    bubble.style.transform =
      'translateX(' + (clamped - half) + 'px) scaleX(' + (1 + amount) + ') scaleY(' + (1 - amount * 0.45) + ')';
    return clamped;
  }

  function snapToIndex(index, animate) {
    var centers = stopCenters();
    var half = bubble.offsetWidth / 2;
    var x = Math.max(half, Math.min(track.clientWidth - half, centers[index]));
    if (!animate) bubble.style.transition = 'none';
    bubble.style.borderRadius = '';
    bubble.style.transform = 'translateX(' + (x - half) + 'px)';
    highlight(index);
    if (!animate) {
      void bubble.offsetWidth; // fuerza reflow para aplicar sin transición
      bubble.style.transition = '';
    }
  }

  window.addEventListener('resize', function () { snapToIndex(activeIndex, false); });

  /* ---- Mostrar dock / ocultar header, solo en móvil y al bajar ---- */
  function onScroll() {
    if (!MOBILE_QUERY.matches) {
      dock.classList.remove('is-visible');
      header.classList.remove('is-hidden-mobile');
      return;
    }
    if (window.scrollY > SCROLL_THRESHOLD) {
      dock.classList.add('is-visible');
      header.classList.add('is-hidden-mobile');
    } else {
      dock.classList.remove('is-visible');
      header.classList.remove('is-hidden-mobile');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (MOBILE_QUERY.addEventListener) {
    MOBILE_QUERY.addEventListener('change', onScroll);
  } else if (MOBILE_QUERY.addListener) {
    MOBILE_QUERY.addListener(onScroll); // compatibilidad con navegadores viejos
  }

  /* ---- Arrastrar el chip para elegir una opción ---- */
  var pointerId = null;
  var isDragging = false;
  var justDragged = false; // evita doble navegación (arrastre + click posterior)
  var downX = 0;
  var lastX = 0;

  track.addEventListener('pointerdown', function (e) {
    if (!MOBILE_QUERY.matches) return;
    pointerId = e.pointerId;
    downX = e.clientX;
    lastX = e.clientX;
    isDragging = false;
  });

  track.addEventListener('pointermove', function (e) {
    if (pointerId === null || e.pointerId !== pointerId) return;

    if (!isDragging && Math.abs(e.clientX - downX) > 6) {
      isDragging = true;
      bubble.classList.add('is-dragging');
      if (track.setPointerCapture) track.setPointerCapture(pointerId);
    }
    if (!isDragging) return;

    e.preventDefault();
    var trackRect = track.getBoundingClientRect();
    var x = e.clientX - trackRect.left;
    var frameDelta = e.clientX - lastX; // cuánto se movió el dedo desde el último frame
    lastX = e.clientX;
    placeBubbleAt(x, frameDelta);
    highlight(nearestIndex(x));
  }, { passive: false });

  function endDrag(e) {
    if (pointerId === null || (e.pointerId !== undefined && e.pointerId !== pointerId)) return;

    if (isDragging) {
      var trackRect = track.getBoundingClientRect();
      var x = e.clientX - trackRect.left;
      var index = nearestIndex(x);
      activeIndex = index;
      snapToIndex(index, true);

      justDragged = true;
      var href = stops[index].getAttribute('href');
      window.setTimeout(function () {
        if (href) window.location.href = href;
      }, 240);
      window.setTimeout(function () { justDragged = false; }, 500); // salvaguarda
    }

    pointerId = null;
    isDragging = false;
    bubble.classList.remove('is-dragging');
  }

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Tocar una opción directamente (sin arrastrar) también navega,
  // con la misma animación de "caída" de la burbuja antes de ir.
  stops.forEach(function (stop, i) {
    stop.addEventListener('click', function (e) {
      e.preventDefault();
      if (justDragged) { justDragged = false; return; } // ya navegó endDrag()

      activeIndex = i;
      snapToIndex(i, true);
      var href = stop.getAttribute('href');
      window.setTimeout(function () {
        if (href) window.location.href = href;
      }, 220);
    });
  });

  // Posición inicial de la burbuja (tras el primer layout).
  window.requestAnimationFrame(function () { snapToIndex(activeIndex, false); });
}