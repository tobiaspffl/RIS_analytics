// Design Switcher: toggle hero variants via buttons
// Keeps markup untouched; adds/removes classes on <header class="hero"> and manages optional blobs.

const VARIANTS = [
  "glass",
  "mesh",
  "blobs",
  "parallax",
  "gradienttext",
  "noise",
  "neumorphic",
  "glassborder",
  "fade",
  "wave",
  "overlap",
];

function getHero() {
  return document.querySelector("header.hero");
}

function getHeroOverlay() {
  return document.querySelector("header.hero .hero-overlay");
}

function clearVariants(hero) {
  VARIANTS.forEach(v => hero.classList.remove(`hero--${v}`));
}

function setActiveButton(targetBtn) {
  document.querySelectorAll(".design-btn").forEach(btn => btn.classList.remove("active"));
  if (targetBtn) targetBtn.classList.add("active");
}

function ensureBlobs() {
  const overlay = getHeroOverlay();
  if (!overlay) return;
  // Remove existing blobs first
  overlay.querySelectorAll(".blob").forEach(el => el.remove());
  // Create blobs
  const b1 = document.createElement("span"); b1.className = "blob b1";
  const b2 = document.createElement("span"); b2.className = "blob b2";
  const b3 = document.createElement("span"); b3.className = "blob b3";
  overlay.appendChild(b1);
  overlay.appendChild(b2);
  overlay.appendChild(b3);
}

function removeBlobs() {
  const overlay = getHeroOverlay();
  if (!overlay) return;
  overlay.querySelectorAll(".blob").forEach(el => el.remove());
}

function applyDesign(design, btn) {
  const hero = getHero();
  if (!hero) return;
  clearVariants(hero);
  removeBlobs();

  if (design && design !== "default") {
    hero.classList.add(`hero--${design}`);
    if (design === "blobs") {
      ensureBlobs();
    }
  }
  setActiveButton(btn);
}

function initDesignSwitcher() {
  const container = document.querySelector(".design-switcher");
  if (!container) return;
  const hero = getHero();
  if (!hero) return;

  // Detect current variant on the hero and set as active
  let current = "default";
  for (const v of VARIANTS) {
    if (hero.classList.contains(`hero--${v}`)) { current = v; break; }
  }
  const initialBtn = container.querySelector(`[data-design="${current}"]`) || container.querySelector('[data-design="default"]');
  applyDesign(current, initialBtn);

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".design-btn");
    if (!btn) return;
    const design = btn.getAttribute("data-design");
    applyDesign(design, btn);
  });
}

document.addEventListener("DOMContentLoaded", initDesignSwitcher);
