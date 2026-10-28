// Hand-built SVG art: the vault door, icons and the treasure room.
// Everything is drawn in code so it scales crisply and works offline.

let uid = 0;
const id = (p) => `${p}${++uid}`;

const GOLD = "#d9b46a", GOLD_HI = "#f3dca3", GOLD_LO = "#8f6e30";
const STEEL_HI = "#dfe5ee", STEEL = "#8d99ab", STEEL_LO = "#2b3547";

/** The vault door. `retracted` bolts are drawn pulled in (used by the final lock). */
export function vaultDoor({ bolts = 6, retracted = 0, spin = false, glow = false } = {}) {
  const g = { rim: id("rim"), body: id("body"), hub: id("hub"), gold: id("gold"), shine: id("shine") };
  const c = 200;
  let rivets = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    rivets += `<circle cx="${(c + Math.cos(a) * 183).toFixed(1)}" cy="${(c + Math.sin(a) * 183).toFixed(1)}" r="3.2" fill="url(#${g.shine})"/>`;
  }
  let ticks = "";
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2, long = i % 6 === 0;
    const r1 = 128, r2 = long ? 116 : 122;
    ticks += `<line x1="${(c + Math.cos(a) * r1).toFixed(1)}" y1="${(c + Math.sin(a) * r1).toFixed(1)}" x2="${(c + Math.cos(a) * r2).toFixed(1)}" y2="${(c + Math.sin(a) * r2).toFixed(1)}" stroke="${long ? GOLD : STEEL}" stroke-width="${long ? 2 : 1}" opacity=".8"/>`;
  }
  let boltSvg = "";
  for (let i = 0; i < bolts; i++) {
    const deg = (i / bolts) * 360 - 90;
    const a = (deg * Math.PI) / 180;
    const pulled = i < retracted;
    const dx = (-Math.cos(a) * 30).toFixed(1), dy = (-Math.sin(a) * 30).toFixed(1);
    const tf = pulled ? `transform="translate(${dx} ${dy})"` : "";
    boltSvg += `<g class="bolt" data-i="${i}" style="--retract: translate(${dx}px, ${dy}px)" ${tf}>
      <rect x="${c + 150}" y="${c - 9}" width="44" height="18" rx="4" transform="rotate(${deg} ${c} ${c})" fill="url(#${g.gold})" stroke="${GOLD_LO}" stroke-width="1"/>
    </g>`;
  }
  let spokes = "";
  for (let i = 0; i < 5; i++) {
    const deg = i * 72;
    spokes += `<g transform="rotate(${deg} ${c} ${c})">
      <rect x="${c - 5}" y="${c - 92}" width="10" height="70" rx="5" fill="url(#${g.rim})" stroke="${STEEL_LO}" stroke-width="1"/>
      <circle cx="${c}" cy="${c - 94}" r="11" fill="url(#${g.gold})" stroke="${GOLD_LO}"/>
    </g>`;
  }
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vault door">
  <defs>
    <radialGradient id="${g.rim}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${STEEL_HI}"/><stop offset=".45" stop-color="${STEEL}"/><stop offset="1" stop-color="${STEEL_LO}"/></radialGradient>
    <radialGradient id="${g.body}" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="#5e6a7e"/><stop offset=".55" stop-color="#2c374b"/><stop offset="1" stop-color="#141c2b"/></radialGradient>
    <radialGradient id="${g.hub}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3b4760"/><stop offset="1" stop-color="#0d1423"/></radialGradient>
    <linearGradient id="${g.gold}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD_HI}"/><stop offset=".5" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD_LO}"/></linearGradient>
    <radialGradient id="${g.shine}" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#5b6576"/></radialGradient>
  </defs>
  ${glow ? `<circle cx="${c}" cy="${c}" r="198" fill="none" stroke="#46b3ff" stroke-width="2" opacity=".5"/>` : ""}
  <circle cx="${c}" cy="${c}" r="198" fill="#0a101c"/>
  <circle cx="${c}" cy="${c}" r="194" fill="url(#${g.rim})"/>
  <circle cx="${c}" cy="${c}" r="174" fill="#0b111d"/>
  ${rivets}
  ${boltSvg}
  <circle cx="${c}" cy="${c}" r="168" fill="url(#${g.body})" stroke="${GOLD}" stroke-width="2.5"/>
  <circle cx="${c}" cy="${c}" r="150" fill="none" stroke="${STEEL}" stroke-width="1" opacity=".5"/>
  <circle cx="${c}" cy="${c}" r="140" fill="none" stroke="#000" stroke-width="6" opacity=".25"/>
  ${ticks}
  <circle cx="${c}" cy="${c}" r="104" fill="url(#${g.hub})" stroke="${STEEL}" stroke-width="1.5"/>
  <g class="wheel${spin ? " spinning" : ""}">${spokes}
    <circle cx="${c}" cy="${c}" r="30" fill="url(#${g.rim})" stroke="${STEEL_LO}" stroke-width="2"/>
    <circle cx="${c}" cy="${c}" r="15" fill="url(#${g.gold})" stroke="${GOLD_LO}"/>
    <path d="M${c} ${c - 8} a5 5 0 1 1 0.01 0 M${c - 2.5} ${c - 2} h5 l1.5 9 h-8z" fill="#1a1408"/>
  </g>
</svg>`;
}

// ---------- small icons (24×24 unless noted) ----------
export const icon = {
  shield: (on = true) => `<svg viewBox="0 0 22 24" aria-hidden="true"><path d="M11 1.5 20 4.5v6.8c0 5.6-3.8 9.8-9 11.2C5.8 21.1 2 16.9 2 11.3V4.5z" fill="${on ? "url(#shieldG)" : "none"}" stroke="${on ? "#a7843f" : "#5b6576"}" stroke-width="1.5"/>${on ? `<path d="M11 8a2.2 2.2 0 0 1 1.1 4.1l.7 3.9h-3.6l.7-3.9A2.2 2.2 0 0 1 11 8z" fill="#3a2b10"/>` : `<path d="M6 7l10 10M16 7 6 17" stroke="#5b6576" stroke-width="1.3"/>`}<defs><linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dca3"/><stop offset="1" stop-color="#b8923f"/></linearGradient></defs></svg>`,
  gadget: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" fill="#1d6fb8" stroke="#46b3ff" stroke-width="1.4"/><rect x="9" y="3.5" width="6" height="3" rx="1" fill="none" stroke="#46b3ff" stroke-width="1.4"/><circle cx="12" cy="12.5" r="3" fill="#0b1528" stroke="#9ad6ff" stroke-width="1.2"/><path d="M12 11v1.5" stroke="#9ad6ff" stroke-width="1.2"/></svg>`,
  loot: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19h8l-1.6-5H4.6zM13 19h8l-1.6-5h-4.8zM8 13h8l-1.6-5H9.6z" fill="#d9b46a" stroke="#8f6e30" stroke-width=".8"/><path d="M10.2 9.2h3.2M5.4 15.2h3M15.4 15.2h3" stroke="#f3dca3" stroke-width=".9"/></svg>`,
  region: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#46b3ff" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#46b3ff" stroke-width="1.1"/><path d="M3 12h18M5 7h14M5 17h14" stroke="#46b3ff" stroke-width="1.1"/><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="#d9b46a" opacity=".55"/></svg>`,
  locate: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="#46b3ff" stroke-width="1.5"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="#46b3ff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.4" fill="#d9b46a"/></svg>`,
  letter: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3" width="19" height="18" rx="3" fill="none" stroke="#46b3ff" stroke-width="1.4"/><path d="M6.5 16l3.2-9 3.2 9M7.6 13h4.2" fill="none" stroke="#d9b46a" stroke-width="1.6" stroke-linecap="round"/><path d="M14.5 16h3.5" stroke="#46b3ff" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  intel: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h9a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z" fill="#1d3b5e" stroke="#46b3ff" stroke-width="1.3"/><rect x="6" y="11" width="12" height="2" rx="1" fill="#d9b46a"/><rect x="6" y="15" width="8" height="1.6" rx=".8" fill="#46b3ff"/></svg>`,
  pass: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="#9aa5b6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  settings: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="#c6ceda" stroke-width="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#c6ceda" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  sound: (on = true) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#c6ceda"/>${on ? `<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#c6ceda" stroke-width="1.6" stroke-linecap="round"/>` : `<path d="M16 9l5 6M21 9l-5 6" stroke="#f0525a" stroke-width="1.8" stroke-linecap="round"/>`}</svg>`,
  lock: (open = false, color = "#d9b46a") => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${open ? "M15 21v-7a9 9 0 0 1 17.6-2.6" : "M15 21v-7a9 9 0 0 1 18 0v7"}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><rect x="9" y="21" width="30" height="22" rx="4" fill="${color}"/><circle cx="24" cy="30" r="3.2" fill="#0b111d"/><rect x="22.6" y="31" width="2.8" height="7" rx="1.2" fill="#0b111d"/></svg>`,
  granted: () => `<svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="rgba(70,179,255,.15)" stroke="#46b3ff" stroke-width="2.5"/><path d="M15 28l8 8 16-17" fill="none" stroke="#46b3ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  denied: () => `<svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="rgba(240,82,90,.15)" stroke="#f0525a" stroke-width="2.5"/><path d="M18 18l18 18M36 18 18 36" stroke="#f0525a" stroke-width="4" stroke-linecap="round"/></svg>`,
  // mechanic illustrations (64×64)
  decrypt: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="2" fill="#c8102e"/><rect x="6" y="26" width="52" height="12" fill="#fff"/>${[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => ((i + j) % 3 ? `<rect x="${6 + i * 8.67}" y="${14 + j * 12}" width="8.67" height="12" fill="#13203a" stroke="#46b3ff" stroke-width=".6"/>` : "")).join("")).join("")}</svg>`,
  doppel: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><g opacity=".55" transform="translate(-6 -6)"><rect x="14" y="16" width="42" height="28" fill="#002b7f"/><rect x="28" y="16" width="14" height="28" fill="#fcd116"/><rect x="42" y="16" width="14" height="28" fill="#ce1126"/></g><rect x="14" y="22" width="42" height="28" fill="#002664" stroke="#46b3ff" stroke-width="1.2"/><rect x="28" y="22" width="14" height="28" fill="#fecb00"/><rect x="42" y="22" width="14" height="28" fill="#c60c30"/></svg>`,
  satellite: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="20" fill="#0b1528" stroke="#46b3ff" stroke-width="1.5"/><path d="M20 30c5 2 6 8 12 8s7-6 12-4M24 46c3-3 8-3 10 0" fill="none" stroke="#5c6f91" stroke-width="2"/><path d="M27 33c2-2 5-2 6 1-1 3-4 4-6 2z" fill="#d9b46a"/><g transform="translate(40 4) rotate(30)"><rect x="-3" y="0" width="6" height="10" fill="#c6ceda"/><rect x="-14" y="2" width="9" height="6" fill="#1d6fb8" stroke="#46b3ff" stroke-width=".8"/><rect x="5" y="2" width="9" height="6" fill="#1d6fb8" stroke="#46b3ff" stroke-width=".8"/></g><path d="M38 16 33 30" stroke="#46b3ff" stroke-dasharray="2 2"/></svg>`,
  wager: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10v40M16 54h32M14 20h36" stroke="#c6ceda" stroke-width="2.5" stroke-linecap="round"/><path d="M14 20 7 36h14zM50 20l-7 16h14z" fill="none" stroke="#c6ceda" stroke-width="1.5"/><path d="M6 36a8 8 0 0 0 16 0z" fill="#d9b46a"/><path d="M42 36a8 8 0 0 0 16 0z" fill="#46b3ff"/><circle cx="32" cy="10" r="3" fill="#d9b46a"/></svg>`,
  finalLock: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="#141c2b" stroke="#d9b46a" stroke-width="2.5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="54" y="29" width="8" height="6" rx="1.5" fill="#d9b46a" transform="rotate(${i * 60 - 90} 32 32)"/>`).join("")}<circle cx="32" cy="32" r="12" fill="none" stroke="#8d99ab" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="#d9b46a"/></svg>`,
  // security events (64×64)
  laserGrid: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 14 60 30M4 30 60 14M4 38l56 16M4 54l56-16" stroke="#f0525a" stroke-width="2.2" stroke-linecap="round"/><path d="M4 14 60 30M4 30 60 14M4 38l56 16M4 54l56-16" stroke="#ffb4b7" stroke-width=".6"/></svg>`,
  countdown: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="22" fill="#141c2b" stroke="#f0525a" stroke-width="3"/><rect x="27" y="6" width="10" height="6" rx="2" fill="#c6ceda"/><path d="M32 36V22" stroke="#d9b46a" stroke-width="3" stroke-linecap="round"/><path d="M32 36 42 42" stroke="#c6ceda" stroke-width="2.5" stroke-linecap="round"/><path d="M32 14a22 22 0 0 1 19 11" fill="none" stroke="#f0525a" stroke-width="6" opacity=".5"/></svg>`,
  supplyDrop: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="22" width="48" height="30" rx="4" fill="#27334a" stroke="#8d99ab" stroke-width="2"/><path d="M24 22v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" fill="none" stroke="#8d99ab" stroke-width="2.5"/><rect x="28" y="32" width="8" height="8" rx="1.5" fill="#d9b46a"/><path d="M8 34h48" stroke="#8d99ab" stroke-width="1.5"/></svg>`,
  checkpoint: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="40" width="10" height="18" fill="#27334a" stroke="#8d99ab" stroke-width="1.5"/><path d="M11 42 58 28" stroke="#f0525a" stroke-width="7" stroke-linecap="round"/><path d="M20 39.5l6-1.8M34 35.4l6-1.8M48 31.3l6-1.8" stroke="#fff" stroke-width="6"/><circle cx="11" cy="42" r="4" fill="#d9b46a"/><circle cx="50" cy="14" r="6" fill="#f0525a" opacity=".85"/></svg>`,
};

/** A node in the chamber route: done | current | locked. */
export function routeNode(state, final = false) {
  const ring = state === "done" ? "#d9b46a" : state === "current" ? "#46b3ff" : "#4a5568";
  const fill = state === "done" ? "rgba(217,180,106,.18)" : "#0e1626";
  const inner = state === "done"
    ? `<path d="M15 20.5 18.5 24 25 16" fill="none" stroke="#d9b46a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
    : final
      ? `<circle cx="20" cy="20" r="6" fill="none" stroke="${ring}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="27" y="19" width="5" height="2" fill="${ring}" transform="rotate(${i * 60} 20 20)"/>`).join("")}`
      : `<rect x="14.5" y="18" width="11" height="9" rx="1.5" fill="${ring}"/><path d="M16.5 18v-2.5a3.5 3.5 0 0 1 7 0V18" fill="none" stroke="${ring}" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${final ? 18 : 16}" fill="${fill}" stroke="${ring}" stroke-width="${final ? 2.5 : 2}"/>${inner}</svg>`;
}

/** The treasure room revealed when the vault opens. */
export function treasureRoom(prizeName) {
  const g = { wall: id("wall"), bar: id("bar"), glow: id("glow"), orb: id("orb"), floor: id("floor") };
  let shelves = "";
  for (const side of [-1, 1]) {
    for (let row = 0; row < 4; row++) {
      const y = 250 + row * 120, x0 = side < 0 ? 120 : 1080;
      shelves += `<rect x="${x0}" y="${y + 52}" width="400" height="8" fill="#3b2d16"/>`;
      for (let b = 0; b < 7; b++) {
        const bx = x0 + 18 + b * 54;
        shelves += `<path d="M${bx} ${y + 52} l8 -22 h30 l8 22z" fill="url(#${g.bar})" stroke="#7a5a22" stroke-width="1"/>`;
        if ((b + row) % 2) shelves += `<path d="M${bx + 10} ${y + 30} l6 -18 h22 l6 18z" fill="url(#${g.bar})" stroke="#7a5a22" stroke-width="1"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-label="The vault's treasure room with ${prizeName}" role="img">
  <defs>
    <radialGradient id="${g.wall}" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3b2f1a"/><stop offset=".55" stop-color="#17120b"/><stop offset="1" stop-color="#05070d"/></radialGradient>
    <linearGradient id="${g.bar}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7b0"/><stop offset=".45" stop-color="#d9b46a"/><stop offset="1" stop-color="#8f6e30"/></linearGradient>
    <radialGradient id="${g.glow}"><stop offset="0" stop-color="#fff2cc" stop-opacity=".9"/><stop offset="1" stop-color="#d9b46a" stop-opacity="0"/></radialGradient>
    <radialGradient id="${g.orb}" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".5" stop-color="#1d6fb8"/><stop offset="1" stop-color="#071a33"/></radialGradient>
    <linearGradient id="${g.floor}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c160c"/><stop offset="1" stop-color="#050505"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#${g.wall})"/>
  <path d="M0 700 L1600 700 L1600 900 L0 900Z" fill="url(#${g.floor})"/>
  ${shelves}
  <circle cx="800" cy="400" r="320" fill="url(#${g.glow})" opacity=".55"/>
  <path d="M700 700 h200 l-20 -170 h-160z" fill="#2a2217" stroke="#d9b46a" stroke-width="2"/>
  <rect x="680" y="510" width="240" height="24" rx="4" fill="#d9b46a"/>
  <circle cx="800" cy="410" r="96" fill="url(#${g.orb})" stroke="#f3dca3" stroke-width="3"/>
  <ellipse cx="800" cy="410" rx="40" ry="96" fill="none" stroke="#f3dca3" stroke-width="1.5" opacity=".7"/>
  <path d="M704 410h192M716 362h168M716 458h168" stroke="#f3dca3" stroke-width="1.5" opacity=".7"/>
  <path d="M770 380c18-8 38 4 30 22-10 10-26 6-34-4zM820 430c14 0 26 8 22 22-12 6-24-2-26-14z" fill="#d9b46a" opacity=".9"/>
  <path d="M800 314v-36M800 278l38 12-38 12" fill="#d9b46a" stroke="#d9b46a" stroke-width="3"/>
</svg>`;
}
