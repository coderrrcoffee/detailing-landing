/* Motion layer — без зависимостей. Работает на всех четырёх сайтах. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var header = document.querySelector(".site-header");
  var burger = document.querySelector(".burger");
  var meter = document.querySelector(".meter");
  var heroMedia = document.querySelector("[data-hero-frame]");
  var pin = document.querySelector("[data-pin]");
  var parallax = [].slice.call(document.querySelectorAll("[data-parallax]"));

  /* Мобильное меню */
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  [].slice.call(document.querySelectorAll(".nav a")).forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });

  /* Появление блоков */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    [].slice.call(reveals).forEach(function (el) { io.observe(el); });
  } else {
    [].slice.call(reveals).forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Счётчики */
  [].slice.call(document.querySelectorAll("[data-count]")).forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var done = false;
    function run() {
      if (done) return;
      done = true;
      var t0 = performance.now(), dur = 1400;
      function step(t) {
        var p = Math.min(1, (t - t0) / dur);
        var v = target * (1 - Math.pow(1 - p, 3));
        var out = Number.isInteger(target) ? Math.round(v) : v.toFixed(1).replace(".", ",");
        el.textContent = out.toLocaleString("ru-RU") + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); o.disconnect(); } });
      }, { threshold: 0.4 });
      o.observe(el);
    } else { run(); }
  });

  /* Слайдер «до/после» */
  var ba = document.querySelector(".ba");
  if (ba) {
    var range = ba.querySelector(".ba-range");
    var set = function (v) { ba.style.setProperty("--pos", v + "%"); };
    if (range) { range.addEventListener("input", function () { set(range.value); }); set(range.value); }
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Скролл-привод */
  function onFrame() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);

    if (meter) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      meter.style.transform = "scaleX(" + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0) + ")";
    }

    if (heroMedia && !reduce) {
      var t = clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1);
      heroMedia.style.transform = "scale(" + (0.9 + 0.1 * t) + ")";
      var him = heroMedia.querySelector("img");
      if (him) him.style.transform = "scale(1.12) translateY(" + ((t - 0.5) * -6) + "%)";
    }

    if (pin && !reduce) {
      var r = pin.getBoundingClientRect();
      var total = pin.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / (total || 1), 0, 1);
      var track = pin.querySelector(".pin-track");
      if (track) {
        var dist = track.scrollWidth - window.innerWidth;
        if (dist > 0) track.style.transform = "translateX(" + (-p * dist) + "px)";
      }
    }

    if (!reduce) {
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var t = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
        var im = el.querySelector("img");
        if (im) im.style.transform = "scale(1.14) translateY(" + ((t - 0.5) * -8) + "%)";
      });
    }

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
})();
