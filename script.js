const timelineEl = document.getElementById("timeline");
const searchInput = document.getElementById("searchInput");
const decadeSelect = document.getElementById("decadeSelect");
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

// Menú mobile
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
navToggle?.addEventListener("click", () => {
  const open = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

let events = [];

function normalize(str){
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function getDecade(year){
  return Math.floor(year / 10) * 10;
}

function render(list){
  timelineEl.innerHTML = "";
  if (!list.length){
    timelineEl.innerHTML = `<div class="card"><p class="muted">No se encontraron eventos con ese filtro.</p></div>`;
    return;
  }

  list
    .sort((a,b) => a.year - b.year)
    .forEach(ev => {
      const tags = (ev.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
      const node = document.createElement("article");
      node.className = "event";
      node.innerHTML = `
        <div class="event__year">${ev.year}</div>
        <div>
          <h3 class="event__title">${ev.title}</h3>
          <p class="event__text">${ev.text}</p>
          <div class="event__tags">${tags}</div>
        </div>
      `;
      timelineEl.appendChild(node);
    });
}

function applyFilters(){
  const q = normalize(searchInput.value);
  const decade = decadeSelect.value;

  let filtered = [...events];

  if (decade !== "all"){
    const d = Number(decade);
    filtered = filtered.filter(e => getDecade(Number(e.year)) === d);
  }

  if (q){
    filtered = filtered.filter(e => {
      const hay = normalize(`${e.year} ${e.title} ${e.text} ${(e.tags||[]).join(" ")}`);
      return hay.includes(q);
    });
  }

  render(filtered);
}

async function init(){
  try{
    const res = await fetch("timeline.json", { cache: "no-cache" });
    events = await res.json();
    render(events);

    searchInput.addEventListener("input", applyFilters);
    decadeSelect.addEventListener("change", applyFilters);
  } catch (e){
    timelineEl.innerHTML = `<div class="card"><p class="muted">No se pudo cargar timeline.json. Revisá que exista el archivo y el nombre esté bien.</p></div>`;
  }
}
init();

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, caption){
  lightboxImg.src = src;
  lightboxCaption.textContent = caption || "";
  lightbox.classList.add("is-open");
}

function closeLightbox(){
  lightbox.classList.remove("is-open");
  lightboxImg.src = "";
}

document.querySelectorAll("[data-lightbox]").forEach(el => {
  el.addEventListener("click", () => {
    const src = el.getAttribute("data-src");
    const caption = el.getAttribute("data-caption") || "";
    openLightbox(src, caption);
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
});

// ===== Theme toggle (Día / Noche) =====
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');

  // Determina tema inicial:
  // 1) si el usuario ya lo guardó en localStorage → usarlo
  // 2) si no → usar prefers-color-scheme del sistema
  function getInitialTheme() {
    const saved = localStorage.getItem('theme'); // "dark" o "light"
    if (saved) return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      btn.setAttribute('aria-pressed', 'true');
      icon.textContent = '☀️'; // muestra sol para invitar a cambiar a claro
    } else {
      root.removeAttribute('data-theme');
      btn.setAttribute('aria-pressed', 'false');
      icon.textContent = '🌙'; // muestra luna para invitar a cambiar a oscuro
    }
  }

  // Inicializa
  const initial = getInitialTheme();
  applyTheme(initial);

  // Listener del botón
  btn.addEventListener('click', () => {
    const current = document.documentElement.hasAttribute('data-theme') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Si el usuario cambia preferencia del sistema, y no hay choice guardada, actualizamos.
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const saved = localStorage.getItem('theme');
    if (!saved) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
