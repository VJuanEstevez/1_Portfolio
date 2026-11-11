// navigation.js — menú, drawer, estado activo, inert y foco por sección.
import { SECCIONES } from "./constants.js";
import { irAIndice, progresoVista } from "./scene.js";

const media = window.matchMedia("(prefers-reduced-motion: reduce)");
const mediaDrawer = window.matchMedia("(min-width: 56rem)");

let enlaces = [];
let caras = [];
let drawer = null;
let indice = -1;

// En escritorio el <details> va siempre abierto; en móvil se conmuta.
function sincronizarDrawer(evento) {
  if (drawer) drawer.open = evento.matches;
}

function cerrarDrawer() {
  if (drawer && !mediaDrawer.matches) drawer.open = false;
}

function indicePorHash() {
  return SECCIONES.indexOf(window.location.hash.slice(1));
}

// Ángulo de la cara j respecto a su frontal, en grados (0 = de frente).
// El prisma gira progreso × 270 y cada cara está girada j × 90.
function anguloCara(j, progreso) {
  const giro = progreso * 270 - j * 90;
  const normalizado = ((((giro + 180) % 360) + 360) % 360) - 180;
  return Math.abs(normalizado);
}

function aplicar(i, progreso) {
  const cambioIndice = i !== indice;
  if (cambioIndice) {
    indice = i;

    enlaces.forEach((enlace, j) => {
      const activo = j === i;
      enlace.classList.toggle("activo", activo);
      if (activo) {
        enlace.setAttribute("aria-current", "page");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });

    // Avisa a typewriter.js para que revele los párrafos de esta cara
    window.dispatchEvent(new CustomEvent("portfolio:cara", { detail: i }));
  }

  caras.forEach((cara, j) => {
    const activo = j === i;
    if (cambioIndice) {
      cara.classList.toggle("activa", activo);
      // La próxima vez que se vea, el contenido empieza desde arriba
      if (!activo) cara.scrollTop = 0;
    }

    // inert es HTML nativo: fuera del teclado y del lector. Se decide por
    // el ángulo real (a >90° la cara mira hacia atrás), no por el índice:
    // así una cara ya visible sigue siendo clicable mientras gira.
    // La cara destino siempre sale de inert para poder enfocarla.
    const caraVisible = j === i || anguloCara(j, progreso) < 90;
    cara.toggleAttribute("inert", !caraVisible);
  });
}

// Tras navegar, el foco pasa a la sección destino (tabindex="-1").
function enfocarCara(i) {
  const cara = caras[i];
  if (!cara) return;

  if (media.matches) {
    cara.focus({ preventScroll: true });
    return;
  }

  let hecho = false;
  const terminar = () => {
    if (hecho) return;
    hecho = true;
    window.removeEventListener("scrollend", terminar);
    cara.focus({ preventScroll: true });
  };

  window.addEventListener("scrollend", terminar);
  window.setTimeout(terminar, 900);
}

function alPulsar(evento) {
  const enlace = evento.currentTarget;
  const id = (enlace.getAttribute("href") ?? "").slice(1);
  const i = SECCIONES.indexOf(id);
  if (i === -1) return;

  evento.preventDefault();
  if (window.location.hash !== `#${id}`) {
    window.history.pushState({ seccion: id }, "", `#${id}`);
  }
  // Activar ya la cara destino (quita el inert antes de enfocarla)
  aplicar(i, progresoVista());
  cerrarDrawer();
  irAIndice(i);
  enfocarCara(i);
}

function irAlHash() {
  const i = indicePorHash();
  irAIndice(i === -1 ? 0 : i, "auto");
}

export function initNavigation() {
  enlaces = [...document.querySelectorAll(".menu__enlace")];
  caras = SECCIONES.map((id) => document.getElementById(id));
  drawer = document.querySelector("[data-drawer]");

  // Estado inicial: aunque falle la escena, la cara visible queda
  // activa (si no, el fade-in la dejaría en opacity: 0).
  aplicar(Math.max(indicePorHash(), 0), 0);

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", alPulsar);
  });

  if (drawer) {
    sincronizarDrawer(mediaDrawer);
    mediaDrawer.addEventListener("change", sincronizarDrawer);

    // <details> no cierra con Escape por sí solo: se lo indicamos aquí.
    drawer.addEventListener("keydown", (evento) => {
      if (evento.key !== "Escape" || !drawer.open) return;
      drawer.open = false;
      drawer.querySelector("summary")?.focus();
    });
  }

  window.addEventListener("popstate", irAlHash);
  window.addEventListener("hashchange", irAlHash);
}

// Lo llama scene.js en cada frame de scroll: índice y progreso real.
export function sincronizar(i, progreso) {
  aplicar(i, progreso);
}

// Si la URL trae un hash, saltar ahí al cargar (sin animación).
export function aplicarHashInicial() {
  const i = indicePorHash();
  if (i > 0) irAIndice(i, "auto");
}
