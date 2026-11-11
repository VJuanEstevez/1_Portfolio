# AGENTS.md

## Comandos

- `pnpm lint` → `oxlint src/` (solo `src/`, **no** revisa `vite.config.js`)
- `pnpm format` → `oxfmt src/` con **defaults** (no hay config: comillas dobles, punto y coma)
- Verificación: `pnpm format && pnpm lint` (nada más; el dueño corre `pnpm dev` él mismo — no hacer build ni levantar servidores en este repo)
- Solo `pnpm` (fijado en `package.json`: `pnpm@12.18.0`). No usar npm ni añadir dependencias (proyecto sin deps: sin Tailwind ni frameworks).

Ojo: `vite.config.js` está fuera del alcance de lint/format y usa estilo distinto (comillas simples, sin punto y coma). No reformatearlo a mano ni "unificar" estilos.

## Estructura y arquitectura

- Vite con `root: "src"`: el `index.html` vive en `src/`, no en la raíz. Entry: `<script type="module" src="./main.js">`.
- Los CSS se enlazan en `index.html` (`./css/*.css`), **no** se importan desde `main.js`: sin JS debe seguir llegando el CSS para que funcione el fallback apilado (mejora progresiva). No moverlos a imports ESM.
- Módulos ESM: `src/main.js` (entrada) → `src/js/scene.js` (scroll → rotación), `src/js/navigation.js` (menú/estado/foco), `src/js/constants.js` (ids de secciones). El contenido vive en `src/index.html`; estilos en `src/css/global.css` (tokens/página) y `src/css/prism.css` (escena 3D).
- Idioma del repo: español (contenido, comentarios, clases con nombres en español: `cara`, `escena`, `track`...).

## Escena 3D (leer antes de tocar CSS/scroll)

- `main.js` añade la clase `js` a `<html>`; **toda** la maquinaria 3D en `prism.css` está dentro de bloques `.js { ... }`. La CSS base = modo sin JS (secciones apiladas). Si rompes esa separación, degradas el fallback.
- Números que deben mantenerse coherentes entre CSS y JS:
  - `.escena`: `sticky; height: 100vh; margin-bottom: -100vh` + 4 `.marcador` de `100vh` → `track` = 400vh.
  - `scene.js`: `recorrido = track.offsetHeight − escena.offsetHeight` (≈300vh); snap points en 0/100/200/300vh = progreso 0, 1/3, 2/3, 1. Cambiar uno exige cambiar los otros.
  - Rotación: `--progreso` (0→1, lo escribe JS) × 270deg en `rotateX`; caras en `rotateX(0/−90/−180/−270deg) translateZ(calc(var(--cara-alto) / 2))`.
- Geometría de la caja: la profundidad **es** `--cara-alto` (por eso las caras usan `translateZ(--cara-alto/2)` y los laterales `::before/::after` son cuadrados de lado `--cara-alto`). Cambiar una sin la otra abre huecos en la caja.
- `--cara-alto: clamp(18rem, 66vh, 44rem)` y `--cara-ancho: min(84vw, 96rem)` no son arbitrarios: a 45° la proyección mide ≈1.414 × alto, y la perspectiva (200rem) amplía la cara frontal por encima de 100vw. Reducirlos rompe el encuadre; `body { overflow-x: clip }` es solo red de seguridad (clip no rompe sticky; hidden sí puede).

## Accesibilidad / convención del usuario

- **No usar ARIA si existe HTML semántico.** Único ARIA permitido en el repo: `aria-current="page"` (no tiene equivalente nativo). El estado de caras inactivas se maneja con `inert` (nativo), no con `aria-hidden`.
- WCAG AA: contraste ≥4.5:1 (texto), ≥3:1 (gráficos/foco), `:focus-visible` con outline ≥3px, objetivos ≥44px (en `≤34rem` los enlaces de tarjetas bajan a 24px, mínimo AA), `prefers-reduced-motion` desactiva snap/transiciones pero **mantiene** la rotación atada al scroll (decisión del usuario: no "arreglar" el reduced-motion quitando el 3D).
