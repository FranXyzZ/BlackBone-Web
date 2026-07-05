/* =========================================================
   BLACKBONE — script compartido
   Este archivo lo referencian todas las páginas (index.html,
   html/servicios.html, y las que agregues). Contiene:
   1) Interruptor de tema oscuro/claro
   2) Menú de navegación para móvil
   3) Tabs de "tipos de sitio" (con imagen)
   4) Acordeón de preguntas frecuentes
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initMobileNav();
  initTabs();
  initFaq();
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
 * Muestra/oculta el menú de navegación en pantallas angostas.
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
