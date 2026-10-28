// World map rendering from the generated map data.
import { MAP } from "../data/map-data.js";

/**
 * @param {object} o
 *   lit     code to light up in gold (after a correct answer)
 *   target  code to highlight in blue (map questions)
 *   ping    code to mark with a pulsing ring (locator gadget, tiny places)
 *   focus   code to zoom around; zoom = how tight (1 = whole world)
 *   aspect  width/height of the box it will sit in
 */
export function worldMap({ lit, target, ping, focus, zoom = 1, aspect = MAP.width / MAP.height, label = "World map" } = {}) {
  let vb = [0, 0, MAP.width, MAP.height];
  if (focus) {
    const pt = MAP.points[focus];
    const box = MAP.boxes[focus];
    let cx = pt[0], cy = pt[1], w, h;
    if (box && zoom === "fit") {
      cx = (box[0] + box[2]) / 2; cy = (box[1] + box[3]) / 2;
      w = Math.max(box[2] - box[0], (box[3] - box[1]) * aspect) * 2.6;
      w = Math.max(w, 140);
    } else {
      w = MAP.width / (zoom === "fit" ? 4 : zoom);
    }
    h = w / aspect;
    w = Math.min(w, MAP.width); h = Math.min(h, MAP.height);
    vb = [clamp(cx - w / 2, 0, MAP.width - w), clamp(cy - h / 2, 0, MAP.height - h), w, h];
  }
  const scale = vb[2] / MAP.width; // keep strokes and pings a sensible size when zoomed
  let shapes = `<path class="land" d="${MAP.other}"/>`;
  for (const [code, d] of Object.entries(MAP.paths)) {
    const cls = code === target ? "target" : code === lit ? "lit" : "land";
    if (cls === "land") shapes += `<path class="land" d="${d}"/>`;
  }
  // Highlighted shapes last so they draw on top.
  for (const code of [lit, target]) if (code && MAP.paths[code]) shapes += `<path class="${code === target ? "target" : "lit"}" d="${MAP.paths[code]}" style="stroke-width:${1.2 * scale}"/>`;
  let marks = "";
  const markCode = ping || (lit && !MAP.paths[lit] ? lit : null) || (lit && smallShape(lit) ? lit : null);
  if (markCode) {
    const [x, y] = MAP.points[markCode];
    const r = 7 * Math.max(scale, 0.35);
    marks = `<circle class="ping-wave" cx="${x}" cy="${y}" r="${r}"/><circle class="ping" cx="${x}" cy="${y}" r="${r}"/><circle class="ping-core" cx="${x}" cy="${y}" r="${r * 0.35}"/>`;
  }
  return `<svg class="map-svg" viewBox="${vb.map((v) => v.toFixed(1)).join(" ")}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}">
    <path class="sea" d="${MAP.sphere}" style="stroke-width:${scale}"/>${shapes}${marks}</svg>`;
}

export function hasShape(code) { return !!MAP.paths[code]; }

function smallShape(code) {
  const b = MAP.boxes[code];
  return !b || (b[2] - b[0]) * (b[3] - b[1]) < 60;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
