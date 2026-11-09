/* =========================================================
   Portfolio de Manel Dhaoui : interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  const themeBtn = document.getElementById("themeToggle");

  /* ---------- 1. Thème clair / sombre ---------- */
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* stockage indisponible */ }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  themeBtn.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- 2. Menu mobile ---------- */
  function closeMenu() {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- 3. Ombre de la barre de navigation au scroll ---------- */
  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Lien actif selon la section visible ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav-link");

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. Apparition au scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 6. Texte animé (effet machine à écrire) ---------- */
  const typedEl = document.getElementById("typed");
  const words = ["Full Stack", "Web", "Mobile", "Angular & Spring Boot", "React & Node.js"];
  let w = 0, c = 0, deleting = false;

  function type() {
    const word = words[w];
    c += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, c);

    let delay = deleting ? 50 : 100;
    if (!deleting && c === word.length) { deleting = true; delay = 1600; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(type, delay);
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typedEl.textContent = "";
    type();
  }

  /* ---------- 7. Filtres de projets ---------- */
  const filterBtns = document.querySelectorAll(".filter");
  const projects = document.querySelectorAll(".project");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      projects.forEach(function (p) {
        const cats = p.dataset.category.split(" ");
        const show = filter === "all" || cats.indexOf(filter) !== -1;
        p.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- 8. Formulaire de contact ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const MY_EMAIL = "dhaouimanel05@gmail.com";

  function setError(input, msg) {
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    field.querySelector(".error").textContent = msg || "";
  }

  function validate() {
    let ok = true;
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;

    if (name.value.trim().length < 2) { setError(name, "Veuillez saisir votre nom."); ok = false; }
    else setError(name, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setError(email, "Adresse e-mail invalide."); ok = false; }
    else setError(email, "");

    if (message.value.trim().length < 10) { setError(message, "Le message doit contenir au moins 10 caractères."); ok = false; }
    else setError(message, "");

    return ok;
  }

  function showStatus(msg, ok) {
    status.textContent = msg;
    status.className = "form-status " + (ok ? "ok" : "ko");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    if (!validate()) return;

    const action = form.getAttribute("action") || "";

    // Formspree non configuré : on ouvre l'application e-mail (mailto)
    if (action.indexOf("YOUR_FORM_ID") !== -1) {
      const subject = encodeURIComponent("Contact depuis le portfolio : " + form.elements.name.value.trim());
      const body = encodeURIComponent(
        form.elements.message.value.trim() + "\n\n" +
        form.elements.name.value.trim() + " (" + form.elements.email.value.trim() + ")"
      );
      window.location.href = "mailto:" + MY_EMAIL + "?subject=" + subject + "&body=" + body;
      showStatus("Votre application e-mail va s'ouvrir pour envoyer le message.", true);
      return;
    }

    // Formspree configuré : envoi réel
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          showStatus("Merci ! Votre message a bien été envoyé.", true);
        } else {
          showStatus("Une erreur est survenue. Réessayez ou écrivez-moi directement par e-mail.", false);
        }
      })
      .catch(function () {
        showStatus("Connexion impossible. Vérifiez votre réseau et réessayez.", false);
      })
      .finally(function () { btn.disabled = false; });
  });

  /* ---------- 9. Année du footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();