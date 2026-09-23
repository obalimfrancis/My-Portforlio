/* ============================================================
   Francis Obalim — Portfolio
   Nav, scroll state, active section, reveal-on-scroll
   ============================================================ */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("nav-list");
  var navLinks = navList ? navList.querySelectorAll("a") : [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!toggle || !navList) return;
    navList.setAttribute("data-open", String(open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    var icon = toggle.querySelector("i");
    if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  }

  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a destination
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when returning to desktop so the panel can't stay stuck open
    window.matchMedia("(min-width: 721px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Header border once scrolled ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealables.forEach(function (el, i) {
      // Stagger siblings slightly so grids cascade instead of popping at once
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      revealObserver.observe(el);
    });
  }

  /* ---------- Active nav link ---------- */
  var sections = Array.prototype.filter.call(
    document.querySelectorAll("main section[id]"),
    function (section) {
      return document.querySelector('.nav-list a[href="#' + section.id + '"]');
    }
  );

  if (sections.length && "IntersectionObserver" in window) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var visible = new Map();

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        // Near the top of the page the hero is the subject, even if a
        // taller section below it happens to expose more area.
        if (window.scrollY < 120) {
          setActive("home");
          return;
        }

        var best = "";
        var bestRatio = 0;
        visible.forEach(function (ratio, id) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });

        if (best) setActive(best);
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: "-20% 0px -40% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    // The observer only fires on intersection changes, so scrolling back to
    // the very top would otherwise leave a lower section marked current.
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY < 120) setActive("home");
      },
      { passive: true }
    );
  }
})();
