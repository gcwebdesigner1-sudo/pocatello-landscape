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

/* ================= Live seasonal bar ================= */
(function () {
  var tag = document.getElementById("season-tag");
  var msg = document.getElementById("season-msg");
  var cta = document.getElementById("season-cta");
  if (!msg) return;
  var m = new Date().getMonth();
  var seasons = [
    { months: [2, 3, 4], tag: "Spring in Pocatello", msg: "Cleanup, fresh sod, and new-bed season — let's wake your yard back up.", cta: "Book spring work" },
    { months: [5, 6, 7], tag: "Summer in Pocatello", msg: "Peak mowing & irrigation season — let's keep your yard green through the heat.", cta: "Book this season" },
    { months: [8, 9, 10], tag: "Fall in Pocatello", msg: "Leaf cleanup and winter-prep season — let's get the yard buttoned up.", cta: "Book fall cleanup" },
    { months: [11, 0, 1], tag: "Winter in Pocatello", msg: "Snow removal is running — and it's the perfect time to plan next year's yard.", cta: "Snow & planning" }
  ];
  for (var i = 0; i < seasons.length; i++) {
    if (seasons[i].months.indexOf(m) > -1) {
      tag.textContent = seasons[i].tag;
      msg.textContent = seasons[i].msg;
      if (cta && cta.childNodes[0]) cta.childNodes[0].nodeValue = seasons[i].cta + " ";
      break;
    }
  }
})();

/* ================= Instant estimator ================= */
(function () {
  var chips = document.querySelectorAll("#svc-chips .est2-chip");
  var tiles = document.querySelectorAll("#size-tiles .est2-tile");
  var list = document.getElementById("est-list");
  var ctaBtn = document.getElementById("est-cta");
  if (!chips.length || !list) return;
  var mult = 1;

  function fmt(n) {
    n = n >= 1000 ? Math.round(n / 100) * 100 : Math.round(n / 5) * 5;
    return "$" + n.toLocaleString("en-US");
  }

  function render() {
    var active = [];
    chips.forEach(function (c) { if (c.classList.contains("is-active")) active.push(c); });
    if (!active.length) {
      list.innerHTML = '<div class="est2-empty">Pick a service to see your starting range.</div>';
      if (ctaBtn) ctaBtn.href = "estimates.html";
      return;
    }
    var html = "", params = [];
    active.forEach(function (c) {
      var base = parseFloat(c.getAttribute("data-base")) * mult;
      var unit = c.getAttribute("data-unit") || "";
      html += '<div class="est2-row"><span class="rn">' + c.getAttribute("data-name") + "</span>" +
              '<span class="rp">from ' + fmt(base) + (unit ? ' <small>' + unit + "</small>" : "") + "</span></div>";
      params.push(c.getAttribute("data-svc"));
    });
    list.innerHTML = html;
    var size = document.querySelector("#size-tiles .est2-tile.is-active");
    var sizeKey = size ? size.getAttribute("data-size") : "medium";
    if (ctaBtn) ctaBtn.href = "estimates.html?services=" + params.join(",") + "&size=" + sizeKey;
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { c.classList.toggle("is-active"); render(); });
  });
  tiles.forEach(function (t) {
    t.addEventListener("click", function () {
      tiles.forEach(function (x) { x.classList.remove("is-active"); });
      t.classList.add("is-active");
      mult = parseFloat(t.getAttribute("data-mult")) || 1;
      render();
    });
  });
  render();
})();

/* ========== Pre-fill the estimate form from the estimator hand-off ========== */
(function () {
  var form = document.getElementById("estimate-form");
  if (!form) return;
  var params = new URLSearchParams(location.search);
  var svc = params.get("services"), size = params.get("size");
  if (!svc && !size) return;
  var map = { lawn: "s1", design: "s2", wall: "s3", beds: "s5", cleanup: "s6" };
  var picked = [];
  if (svc) {
    svc.split(",").forEach(function (k) {
      var el = document.getElementById(map[k]);
      if (el) { el.checked = true; picked.push(el.value); }
    });
  }
  var details = document.getElementById("details");
  if (details) {
    var sizes = { small: "Small (up to ¼ acre)", medium: "Medium (¼–½ acre)", large: "Large (½ acre +)" };
    var lines = [];
    if (size) lines.push("Yard size: " + (sizes[size] || size));
    if (picked.length) lines.push("Interested in: " + picked.join(", "));
    if (lines.length) details.value = lines.join("\n") + (details.value ? "\n\n" + details.value : "");
  }
  var card = document.getElementById("estimate-card");
  if (card) setTimeout(function () { card.scrollIntoView({ behavior: "smooth", block: "center" }); }, 450);
})();
