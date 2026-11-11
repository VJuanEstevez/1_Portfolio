// main.js — punto de entrada ESM: activa el modo 3D y conecta los módulos.
import { initScene } from "./js/scene.js";
import { initNavigation, sincronizar, aplicarHashInicial } from "./js/navigation.js";
import { initTypewriter } from "./js/typewriter.js";

document.documentElement.classList.add("js");

// El diseño 3D gestiona el scroll: el navegador no debe restaurarlo solo.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

initTypewriter();
initNavigation();
initScene(sincronizar);
aplicarHashInicial();
