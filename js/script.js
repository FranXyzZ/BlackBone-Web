/* =========================================================
   BLACKBONE — script compartido
   Este archivo lo referencian todas las páginas (index.html,
   html/servicios.html, y las que agregues). Contiene:
   1) Interruptor de tema oscuro/claro (con detección automática
      del tema del sistema operativo)
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
  initContactForm();
});

/**
 * Detecta automáticamente si el sistema operativo del usuario
 * está en modo oscuro o claro (prefers-color-scheme) y lo aplica
 * como tema inicial. El botón [data-theme-toggle] sigue
 * funcionando para cambiarlo manualmente durante la visita.
 *
 * Si el usuario usa el botón, se marca "userOverride" para que,
 * mientras siga en la página, su elección manual no se pise si
 * el sistema cambia de tema en caliente (por ejemplo, si el
 * computador pasa a modo oscuro automáticamente al anochecer).
 *
 * Nota: igual que antes, esto no se guarda en localStorage a
 * propósito, así que al recargar la página vuelve a partir del
 * tema del sistema. Si en algún momento quieres que se recuerde
 * la elección manual entre visitas, se puede agregar
 * localStorage.setItem('theme', tema) donde se indica más abajo.
 */
function initThemeToggle() {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  var userOverride = false;

  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  // Tema inicial: el que tenga configurado el sistema operativo.
  // Si el navegador no soporta matchMedia, se deja "dark" (el que
  // ya estaba puesto por defecto en el <html> de cada página).
  if (darkQuery) {
    applyTheme(darkQuery.matches ? 'dark' : 'light');
  }

  // Si el sistema cambia de tema mientras la página sigue abierta
  // (ej. modo oscuro automático del SO al anochecer), lo seguimos
  // reflejando — pero solo si el usuario no lo cambió a mano.
  if (darkQuery) {
    darkQuery.addEventListener('change', function (e) {
      if (userOverride) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  if (!toggle) return;

  toggle.addEventListener('click', function () {
    userOverride = true;
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    // localStorage.setItem('theme', next); // descomenta si quieres que se recuerde entre visitas
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
 * Formulario de contacto de la sección "Empecemos" (index.html).
 * Valida los campos obligatorios en el navegador y deja que el
 * propio navegador envíe el formulario de forma NATIVA (una
 * navegación normal de página) a FormSubmit, que reenvía el
 * contenido por correo al equipo. Se usa envío nativo en vez de
 * fetch/AJAX a propósito: los bloqueadores de anuncios/privacidad
 * suelen interceptar peticiones fetch hacia URLs con un correo en
 * la ruta, pero casi nunca bloquean una navegación normal de
 * formulario, así que este método funciona para todos los
 * visitantes, tengan o no un bloqueador instalado.
 *
 * Como el envío es una navegación real, FormSubmit redirige de
 * vuelta a esta misma página (usando el campo oculto "_next") con
 * "?enviado=1" en la URL. Al cargar la página, si detectamos ese
 * parámetro, mostramos el mensaje de éxito y hacemos scroll al
 * formulario.
 *
 * IMPORTANTE: la primera vez que alguien envíe este formulario en
 * producción, FormSubmit manda un correo de confirmación a la
 * dirección configurada en "action" del <form> — hay que abrir ese
 * correo y confirmar una sola vez para que los envíos empiecen a
 * llegar (ver comentario junto al formulario en index.html).
 */
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

  // Valida todos los campos marcados como "required" en el HTML.
  // Devuelve true si el formulario está listo para enviarse.
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

  // Limpia el error de un campo apenas el usuario empieza a corregirlo.
  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      if (field.closest('.form-field').classList.contains('has-error')) {
        setFieldError(field, null);
      }
    });
  });

  // Si al cargar la página venimos de un envío exitoso (FormSubmit
  // nos redirigió de vuelta con "?enviado=1"), mostramos el mensaje
  // de éxito y limpiamos la URL para que no quede el parámetro.
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
    // Honeypot: si este campo oculto viene lleno, es un bot.
    // Se bloquea el envío en silencio, sin mostrar error al usuario.
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

    // Copia el correo que escribió la persona al campo oculto "_replyto",
    // así el correo que reciben en el equipo trae ese correo como
    // "Responder a" y pueden contestarle directo con un clic.
    var correoField = form.querySelector('#cf-correo');
    var replyToField = form.querySelector('#cf-replyto');
    if (correoField && replyToField) {
      replyToField.value = correoField.value.trim();
    }

    // Arma la URL de vuelta a esta misma página (con el dominio real,
    // sea localhost durante pruebas o el dominio final ya publicado),
    // agregando "?enviado=1" para poder mostrar el mensaje de éxito.
    var nextField = form.querySelector('#cf-next');
    if (nextField) {
      nextField.value = window.location.origin + window.location.pathname + '?enviado=1#propuesta';
    }

    statusEl.textContent = 'Enviando…';
    statusEl.removeAttribute('data-state');

    // No se llama e.preventDefault(): a partir de aquí el navegador
    // envía el formulario de forma normal (navegación de página).
  });
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