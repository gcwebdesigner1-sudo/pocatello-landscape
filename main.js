/* Pocatello Landscape — interactions */
(function () {
  "use strict";

  // Sticky header shadow
  const header = document.getElementById("header");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const body = document.body;
  const openMenu = () => body.classList.add("menu-open");
  const closeMenu = () => body.classList.remove("menu-open");
  document.querySelectorAll("[data-toggle-menu]").forEach((b) =>
    b.addEventListener("click", () =>
      body.classList.contains("menu-open") ? closeMenu() : openMenu()
    )
  );
  document.querySelectorAll("[data-close-menu]").forEach((b) =>
    b.addEventListener("click", closeMenu)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Scroll reveals — jump-safe (works with anchor links / fast scrolling).
  // A plain IntersectionObserver can skip elements that jump straight from
  // below the viewport to above it (e.g. clicking an in-page anchor), leaving
  // them stuck invisible. This measures position on scroll instead.
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  const revealVisible = () => {
    const trigger = window.innerHeight * 0.9;
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  };
  let revealTick = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!revealTick) {
        window.requestAnimationFrame(() => {
          revealVisible();
          revealTick = false;
        });
        revealTick = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("load", revealVisible);
  revealVisible();

  // Lightweight parallax on hero + band images
  const parallaxEls = document.querySelectorAll("[data-parallax] img");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && parallaxEls.length) {
    let ticking = false;
    const update = () => {
      parallaxEls.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const speed = 0.12;
        const offset = (rect.top - window.innerHeight / 2) * -speed;
        img.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.12)`;
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  // FAQ accordion (estimates page)
  document.querySelectorAll(".acc-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".acc-item");
      const answer = item.querySelector(".acc-a");
      const isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".acc-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".acc-a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Estimate form (demo-friendly): validate + show success state
  const form = document.getElementById("estimate-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const card = document.getElementById("form-card-inner");
      const success = document.getElementById("form-success");
      if (card && success) {
        card.style.display = "none";
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      /* NOTE for Jake: to make this actually deliver leads, set the <form>'s
         action to a Formspree endpoint (or similar) and method="POST", then
         remove this e.preventDefault() block. Right now it shows a friendly
         confirmation so the demo feels real without sending anywhere. */
    });
  }

  // Current year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
