// Draws the one-of-a-kind treasure and the vault room it sits in.
// Each object is drawn around (200, 200) in a 400×400 box, filled with the
// treasure's material colors, so every combination looks different.

let n = 0;

function defs(m, id) {
  const stops = m.rainbow
    ? ["#ff7ae6", "#ffd36e", "#7dff9e", "#6ee7ff", "#9b7bff"].map((c, i) => `<stop offset="${i / 4}" stop-color="${c}"/>`).join("")
    : `<stop offset="0" stop-color="${m.hi}"/><stop offset=".5" stop-color="${m.mid}"/><stop offset="1" stop-color="${m.lo}"/>`;
  return `<defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>
    <radialGradient id="${id}r" cx="35%" cy="30%" r="75%">${stops}</radialGradient>
  </defs>`;
}

const SHAPES = {
  crown: (f, fr, m) => `
    <path d="M90 250 L80 140 L130 190 L160 110 L200 175 L240 110 L270 190 L320 140 L310 250 Z" fill="${f}" stroke="${m.lo}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="86" y="240" width="228" height="40" rx="8" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    ${[80, 160, 240, 320].map((x, i) => `<circle cx="${x}" cy="${[140, 110, 110, 140][i]}" r="11" fill="#fff" opacity=".9"/>`).join("")}
    <circle cx="200" cy="260" r="13" fill="#ff4d73"/><circle cx="140" cy="260" r="9" fill="#5c8dff"/><circle cx="260" cy="260" r="9" fill="#3ef2b4"/>`,
  egg: (f, fr, m) => `
    <path d="M200 70 C 270 70 310 180 310 230 C 310 300 260 330 200 330 C 140 330 90 300 90 230 C 90 180 130 70 200 70 Z" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M100 200 L130 180 L160 200 L200 180 L240 200 L270 180 L300 200" fill="none" stroke="#fff" stroke-width="6" opacity=".8"/>
    <path d="M93 250 L130 270 L165 250 L200 270 L235 250 L270 270 L307 250" fill="none" stroke="${m.lo}" stroke-width="6"/>
    ${[130, 165, 200, 235, 270].map((x) => `<circle cx="${x}" cy="225" r="7" fill="#fff"/>`).join("")}
    <ellipse cx="165" cy="130" rx="22" ry="38" fill="#fff" opacity=".35" transform="rotate(-20 165 130)"/>`,
  gem: (f, fr, m) => `
    <path d="M110 150 L150 95 L250 95 L290 150 L200 320 Z" fill="${f}" stroke="${m.lo}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M110 150 H290 M150 95 L175 150 L200 320 L225 150 L250 95 M175 150 L200 95 L225 150" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
    <path d="M150 95 L175 150 L110 150 Z" fill="#fff" opacity=".35"/>`,
  globe: (f, fr, m) => `
    <path d="M110 300 Q200 340 290 300" fill="none" stroke="${m.lo}" stroke-width="10" stroke-linecap="round"/>
    <rect x="190" y="290" width="20" height="30" fill="${m.lo}"/><rect x="140" y="318" width="120" height="16" rx="8" fill="${f}"/>
    <circle cx="200" cy="190" r="110" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <ellipse cx="200" cy="190" rx="48" ry="110" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
    <path d="M90 190 H310 M104 135 H296 M104 245 H296" stroke="#fff" stroke-width="3" opacity=".6"/>
    <path d="M150 150 c20 -14 46 -6 40 18 c-10 14 -32 10 -40 -4 z M220 210 c18 -4 34 8 28 26 c-14 8 -30 0 -30 -14 z" fill="#fff" opacity=".75"/>`,
  trophy: (f, fr, m) => `
    <path d="M130 90 H270 C 270 190 240 230 200 240 C 160 230 130 190 130 90 Z" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M132 110 C 80 110 80 180 145 190 M268 110 C 320 110 320 180 255 190" fill="none" stroke="${f}" stroke-width="14" stroke-linecap="round"/>
    <rect x="186" y="238" width="28" height="50" fill="${f}"/><rect x="140" y="285" width="120" height="34" rx="6" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M200 120 l10 22 24 2 -18 16 6 24 -22 -13 -22 13 6 -24 -18 -16 24 -2 z" fill="#fff" opacity=".85"/>`,
  sword: (f, fr, m) => `
    <path d="M200 50 L222 90 L222 250 L178 250 L178 90 Z" fill="${f}" stroke="${m.lo}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 60 V245" stroke="#fff" stroke-width="4" opacity=".6"/>
    <rect x="120" y="248" width="160" height="22" rx="11" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <rect x="188" y="268" width="24" height="56" fill="${m.lo}"/><circle cx="200" cy="336" r="18" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <circle cx="200" cy="259" r="8" fill="#ff4d73"/>`,
  mask: (f, fr, m) => `
    <path d="M200 70 C 290 70 320 140 310 210 C 300 290 250 330 200 335 C 150 330 100 290 90 210 C 80 140 110 70 200 70 Z" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M125 175 Q155 150 185 178 Q155 200 125 175 Z M215 178 Q245 150 275 175 Q245 200 215 178 Z" fill="#05070d"/>
    <path d="M200 190 L188 245 H212 Z" fill="${m.lo}" opacity=".6"/>
    <path d="M160 280 Q200 300 240 280" fill="none" stroke="${m.lo}" stroke-width="6" stroke-linecap="round"/>
    <path d="M110 120 Q200 95 290 120" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>
    ${[130, 165, 200, 235, 270].map((x, i) => `<circle cx="${x}" cy="${110 - (i % 2) * 6}" r="7" fill="#fff"/>`).join("")}`,
  coin: (f, fr, m) => `
    <circle cx="208" cy="208" r="122" fill="${m.lo}"/>
    <circle cx="200" cy="200" r="122" fill="${fr}" stroke="${m.lo}" stroke-width="5"/>
    <circle cx="200" cy="200" r="96" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="4 8" opacity=".8"/>
    <path d="M170 130 V270" stroke="${m.lo}" stroke-width="10" stroke-linecap="round"/>
    <path d="M175 135 C 210 120 230 150 260 138 V200 C 230 212 210 182 175 197 Z" fill="${m.lo}"/>
    <ellipse cx="160" cy="140" rx="40" ry="18" fill="#fff" opacity=".3" transform="rotate(-30 160 140)"/>`,
  duck: (f, fr, m) => `
    <ellipse cx="190" cy="250" rx="125" ry="75" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <circle cx="250" cy="150" r="66" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M300 160 Q360 165 350 185 Q320 200 295 185 Z" fill="#ff9a3d" stroke="#b85a00" stroke-width="3"/>
    <circle cx="262" cy="135" r="11" fill="#05070d"/><circle cx="266" cy="131" r="4" fill="#fff"/>
    <path d="M110 230 Q150 200 200 240" fill="none" stroke="${m.lo}" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="230" cy="120" rx="18" ry="10" fill="#fff" opacity=".45"/>`,
  robot: (f, fr, m) => `
    <path d="M200 60 V95" stroke="${m.lo}" stroke-width="6"/><circle cx="200" cy="55" r="12" fill="#ff4d73"/>
    <rect x="130" y="95" width="140" height="100" rx="22" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <circle cx="170" cy="140" r="17" fill="#05070d"/><circle cx="230" cy="140" r="17" fill="#05070d"/>
    <circle cx="170" cy="140" r="7" fill="#29fff0"/><circle cx="230" cy="140" r="7" fill="#29fff0"/>
    <rect x="165" y="170" width="70" height="10" rx="5" fill="${m.lo}"/>
    <rect x="120" y="205" width="160" height="110" rx="18" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M120 230 L80 280 M280 230 L320 280" stroke="${f}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="200" cy="255" r="22" fill="#fff" opacity=".8"/><circle cx="200" cy="255" r="10" fill="#ff4d73"/>`,
  rocket: (f, fr, m) => `
    <path d="M200 50 C 260 100 265 200 245 280 H155 C 135 200 140 100 200 50 Z" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M155 230 L110 300 L160 285 Z M245 230 L290 300 L240 285 Z" fill="${f}" stroke="${m.lo}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="160" r="30" fill="#05070d" stroke="#fff" stroke-width="6"/><circle cx="190" cy="150" r="8" fill="#6ee7ff"/>
    <path d="M170 285 Q200 350 230 285 Z" fill="#ff9a3d"/><path d="M185 285 Q200 320 215 285 Z" fill="#ffe46e"/>`,
  teapot: (f, fr, m) => `
    <ellipse cx="200" cy="230" rx="110" ry="85" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M290 220 Q350 200 345 140" fill="none" stroke="${f}" stroke-width="20" stroke-linecap="round"/>
    <path d="M110 200 C 50 190 50 280 115 270" fill="none" stroke="${f}" stroke-width="16"/>
    <path d="M140 155 Q200 120 260 155 Z" fill="${f}" stroke="${m.lo}" stroke-width="4"/><circle cx="200" cy="125" r="14" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M110 240 Q200 270 290 240" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>
    <ellipse cx="160" cy="200" rx="22" ry="12" fill="#fff" opacity=".4"/>`,
  key: (f, fr, m) => `
    <circle cx="200" cy="120" r="70" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <circle cx="200" cy="120" r="30" fill="#05070d"/>
    <rect x="186" y="185" width="28" height="150" fill="${f}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M214 280 H250 V300 H214 Z M214 315 H240 V332 H214 Z" fill="${f}" stroke="${m.lo}" stroke-width="4"/>
    <circle cx="200" cy="120" r="48" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 10" opacity=".7"/>`,
  skull: (f, fr, m) => `
    <path d="M200 70 C 280 70 315 125 310 190 C 306 230 280 250 270 260 V300 H130 V260 C 120 250 94 230 90 190 C 85 125 120 70 200 70 Z" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <ellipse cx="155" cy="185" rx="30" ry="34" fill="#05070d"/><ellipse cx="245" cy="185" rx="30" ry="34" fill="#05070d"/>
    <circle cx="155" cy="185" r="9" fill="#ff4d73"/><circle cx="245" cy="185" r="9" fill="#3ef2b4"/>
    <path d="M200 215 L185 245 H215 Z" fill="#05070d"/>
    ${[150, 175, 200, 225, 250].map((x) => `<rect x="${x - 9}" y="268" width="18" height="30" rx="4" fill="#fff" opacity=".9"/>`).join("")}`,
  pineapple: (f, fr, m) => `
    <path d="M200 140 L170 60 L195 100 L200 45 L210 100 L235 60 Z" fill="#3ef2b4" stroke="#0a6b4a" stroke-width="3"/>
    <ellipse cx="200" cy="235" rx="95" ry="115" fill="${fr}" stroke="${m.lo}" stroke-width="4"/>
    <path d="M120 170 L280 330 M110 220 L250 350 M140 130 L295 285 M280 170 L120 330 M290 220 L150 350 M260 130 L105 285" stroke="${m.lo}" stroke-width="4" opacity=".6"/>
    <ellipse cx="160" cy="180" rx="16" ry="30" fill="#fff" opacity=".35" transform="rotate(20 160 180)"/>`,
};

export function treasureArt(t) {
  const id = `mat${++n}`;
  const draw = SHAPES[t.art] || SHAPES.gem;
  return `${defs(t.material, id)}${draw(`url(#${id})`, `url(#${id}r)`, t.material)}`;
}

/** The whole vault room with the treasure on a pedestal. */
export function treasureRoom(t) {
  const m = t.material, gid = `room${++n}`;
  let shelves = "";
  for (const x0 of [90, 1110]) {
    for (let row = 0; row < 4; row++) {
      const y = 250 + row * 120;
      shelves += `<rect x="${x0}" y="${y + 52}" width="400" height="6" rx="3" fill="#2a3a4a"/>`;
      for (let b = 0; b < 6; b++) shelves += `<rect x="${x0 + 20 + b * 64}" y="${y + 10 + (b % 3) * 8}" width="44" height="${42 - (b % 3) * 8}" rx="6" fill="${(b + row) % 2 ? m.mid : "#3ef2b4"}" opacity=".35"/>`;
    }
  }
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${t.name} on a pedestal in the vault">
    <defs>
      <radialGradient id="${gid}" cx="50%" cy="42%" r="65%"><stop offset="0" stop-color="${m.glow}" stop-opacity=".55"/><stop offset=".45" stop-color="${m.glow}" stop-opacity=".12"/><stop offset="1" stop-color="#03060c" stop-opacity="0"/></radialGradient>
      <linearGradient id="${gid}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1726"/><stop offset="1" stop-color="#020408"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="#050a14"/>
    <rect width="1600" height="900" fill="url(#${gid})"/>
    <path d="M0 700 H1600 V900 H0Z" fill="url(#${gid}f)"/>
    ${shelves}
    ${Array.from({ length: 10 }, (_, i) => `<path d="M800 140 L${560 + i * 53} 700" stroke="${m.glow}" stroke-width="2" opacity=".12"/>`).join("")}
    <path d="M690 700 h220 l-24 -170 h-172z" fill="#0f1c2c" stroke="#3ef2b4" stroke-width="2"/>
    <rect x="668" y="510" width="264" height="24" rx="6" fill="#16283b" stroke="#3ef2b4" stroke-width="2"/>
    <g transform="translate(640 150) scale(0.8)">${treasureArt(t)}</g>
  </svg>`;
}
