// typewriter.js — reveal carácter a carácter sin salto de layout.
// El texto ocupa su sitio desde el inicio (spans con opacity), así que
// el párrafo no cambia de tamaño durante la animación. Sin ARIA: los
// spans son texto plano y el lector de pantalla lee el párrafo entero.
import { SECCIONES } from "./constants.js";

const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");
const DURACION = 700; // ms totales por párrafo (independiente de su largo)
const PAUSA = 220; // ms de espera antes de empezar cada párrafo

let porCara = [];

// Un solo reparto de spans por párrafo: se reutiliza en cada activación.
function preparar(parr) {
  if (parr.dataset.typewriter === "listo") return;

  // El HTML trae saltos de línea e indentación: se colapsan igual que
  // haría el navegador al pintar, y así --i cuenta caracteres reales
  const texto = parr.textContent.replace(/\s+/g, " ").trim();
  parr.textContent = "";

  // Agrupa por caracteres reales (respeta las tildes y la ñ)
  for (const caracter of texto) {
    const span = document.createElement("span");
    span.textContent = caracter;
    span.style.setProperty("--i", String(parr.children.length));
    parr.append(span);
  }

  parr.dataset.typewriter = "listo";
}

function revelar(parr) {
  const total = parr.children.length;
  if (!total) return;

  // Primero las variables, después la clase: el delay se lee al iniciar
  const paso = (DURACION - PAUSA) / total;
  parr.style.setProperty("--paso", `${paso}ms`);
  parr.style.setProperty("--pausa", `${PAUSA}ms`);
  parr.classList.add("escribiendo");
}

function ocultar(parr) {
  parr.classList.remove("escribiendo");
}

export function initTypewriter() {
  if (reducido.matches) return;

  porCara = SECCIONES.map((id) => {
    const cara = document.getElementById(id);
    if (!cara) return [];
    const parrafos = [...cara.querySelectorAll(".lead, .sobre__texto p")];
    parrafos.forEach(preparar);
    return parrafos;
  });

  // Revela los párrafos de la cara recién activada; los demás vuelven
  // a su estado inicial para que el reveal se repita en cada visita.
  window.addEventListener("portfolio:cara", (evento) => {
    const i = evento.detail;
    porCara.forEach((parrafos, j) => {
      parrafos.forEach((parr) => (j === i ? revelar(parr) : ocultar(parr)));
    });
  });

  // El texto ya preparado empieza oculto: si la primera cara activa se
  // notificó antes de registrar el listener, se revela aquí.
  const activa = document.querySelector(".cara.activa");
  const i = activa ? SECCIONES.indexOf(activa.id) : -1;
  if (i > -1) porCara[i]?.forEach(revelar);
}
