// scene.js — relaciona el scroll del documento con la rotación del rectángulo 3D.
import { TOTAL_CARAS } from "./constants.js";

const media = window.matchMedia("(prefers-reduced-motion: reduce)");

let track = null;
let escena = null;
let prism = null;
let notificar = null;
let indice = -1;
let pendiente = false;

// Medidas cacheadas para no leer layout en cada evento de scroll.
let medidas = { inicio: 0, recorrido: 1 };

function medir() {
  if (!track || !escena) return;
  const inicio = track.getBoundingClientRect().top + window.scrollY;
  const recorrido = track.offsetHeight - escena.offsetHeight;
  medidas = { inicio, recorrido: Math.max(recorrido, 1) };
}

function progresoActual() {
  const bruto = (window.scrollY - medidas.inicio) / medidas.recorrido;
  return Math.min(1, Math.max(0, bruto));
}

// Lo usa navigation para decidir el inert antes de que scene pinte.
export function progresoVista() {
  return progresoActual();
}

function pintar() {
  pendiente = false;
  if (!prism) return;

  const progreso = progresoActual();
  prism.style.setProperty("--progreso", progreso.toFixed(4));

  const nuevo = Math.round(progreso * (TOTAL_CARAS - 1));
  if (nuevo !== indice) {
    indice = nuevo;
  }
  // Se notifica en cada frame: navigation decide el inert por ángulo real
  notificar?.(indice, progreso);
}

function programar() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(pintar);
}

export function initScene(alNotificar) {
  track = document.querySelector("[data-track]");
  escena = track?.querySelector(".escena") ?? null;
  prism = document.querySelector("[data-prism]");
  if (!track || !escena || !prism) return;

  notificar = alNotificar;
  medir();
  pintar();

  window.addEventListener("scroll", programar, { passive: true });
  window.addEventListener("resize", () => {
    medir();
    programar();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      medir();
      programar();
    }).observe(track);
  }
}

// Desplaza el documento hasta la posición exacta de la cara i.
export function irAIndice(indiceDeseado, comportamiento) {
  if (!track) return;
  const i = Math.min(TOTAL_CARAS - 1, Math.max(0, indiceDeseado));
  const destino = medidas.inicio + (medidas.recorrido * i) / (TOTAL_CARAS - 1);
  const behavior = comportamiento ?? (media.matches ? "auto" : "smooth");
  window.scrollTo({ top: destino, behavior });
}
