// Hand-built SVG art: the vault door, icons and the treasure room.
// Everything is drawn in code so it scales crisply and works offline.

let uid = 0;
const id = (p) => `${p}${++uid}`;

const GOLD = "#3ef2b4", GOLD_HI = "#b5ffe6", GOLD_LO = "#0b7a57";
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
  ${glow ? `<circle cx="${c}" cy="${c}" r="198" fill="none" stroke="#5aa9ff" stroke-width="2" opacity=".5"/>` : ""}
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
    <path d="M${c} ${c - 8} a5 5 0 1 1 0.01 0 M${c - 2.5} ${c - 2} h5 l1.5 9 h-8z" fill="#032118"/>
  </g>
</svg>`;
}

// ---------- small icons (24×24 unless noted) ----------
export const icon = {
  shield: (on = true) => `<svg viewBox="0 0 22 24" aria-hidden="true"><path d="M11 1.5 20 4.5v6.8c0 5.6-3.8 9.8-9 11.2C5.8 21.1 2 16.9 2 11.3V4.5z" fill="${on ? "url(#shieldG)" : "none"}" stroke="${on ? "#0fae7d" : "#5b6576"}" stroke-width="1.5"/>${on ? `<path d="M11 8a2.2 2.2 0 0 1 1.1 4.1l.7 3.9h-3.6l.7-3.9A2.2 2.2 0 0 1 11 8z" fill="#05301f"/>` : `<path d="M6 7l10 10M16 7 6 17" stroke="#5b6576" stroke-width="1.3"/>`}<defs><linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b5ffe6"/><stop offset="1" stop-color="#12b886"/></linearGradient></defs></svg>`,
  gadget: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" fill="#2a5fb0" stroke="#5aa9ff" stroke-width="1.4"/><rect x="9" y="3.5" width="6" height="3" rx="1" fill="none" stroke="#5aa9ff" stroke-width="1.4"/><circle cx="12" cy="12.5" r="3" fill="#0b1528" stroke="#9ad6ff" stroke-width="1.2"/><path d="M12 11v1.5" stroke="#9ad6ff" stroke-width="1.2"/></svg>`,
  loot: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="9" width="17" height="10" rx="1.5" fill="#0b7a57"/><rect x="4" y="6" width="17" height="10" rx="1.5" fill="#3ef2b4" stroke="#0b7a57" stroke-width=".8"/><circle cx="12.5" cy="11" r="2.6" fill="none" stroke="#032118" stroke-width="1.3"/><path d="M6 8.5h1.5M17.5 13.5H19" stroke="#032118" stroke-width="1.2"/></svg>`,
  region: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#5aa9ff" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#5aa9ff" stroke-width="1.1"/><path d="M3 12h18M5 7h14M5 17h14" stroke="#5aa9ff" stroke-width="1.1"/><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="#3ef2b4" opacity=".55"/></svg>`,
  locate: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="#5aa9ff" stroke-width="1.5"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="#5aa9ff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.4" fill="#3ef2b4"/></svg>`,
  letter: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3" width="19" height="18" rx="3" fill="none" stroke="#5aa9ff" stroke-width="1.4"/><path d="M6.5 16l3.2-9 3.2 9M7.6 13h4.2" fill="none" stroke="#3ef2b4" stroke-width="1.6" stroke-linecap="round"/><path d="M14.5 16h3.5" stroke="#5aa9ff" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  intel: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h9a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z" fill="#1d3b5e" stroke="#5aa9ff" stroke-width="1.3"/><rect x="6" y="11" width="12" height="2" rx="1" fill="#3ef2b4"/><rect x="6" y="15" width="8" height="1.6" rx=".8" fill="#5aa9ff"/></svg>`,
  help: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#c6ceda" stroke-width="1.6"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.8" fill="none" stroke="#c6ceda" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#c6ceda"/></svg>`,
  clue: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="rgba(62,242,180,.15)" stroke="#3ef2b4" stroke-width="2"/><path d="M15 15l6 6" stroke="#3ef2b4" stroke-width="2.6" stroke-linecap="round"/><path d="M8 8.5a2.3 2.3 0 1 1 2.6 2.2v1" fill="none" stroke="#b5ffe6" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  flagSign: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="8" width="4" height="50" rx="2" fill="#c6ceda"/><path d="M16 10 C 28 4, 38 18, 54 10 V 34 C 38 42, 28 28, 16 34 Z" fill="#3ef2b4"/><path d="M16 22 C 28 16, 38 30, 54 22" fill="none" stroke="#5aa9ff" stroke-width="5"/></svg>`,
  sweep: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="2" fill="#13203a" stroke="#5aa9ff" stroke-width="1.2"/><rect x="6" y="14" width="26" height="36" fill="#3ef2b4"/><rect x="6" y="26" width="26" height="12" fill="#fff"/><path d="M32 8v48" stroke="#f0525a" stroke-width="3"/><path d="M32 8v48" stroke="#ffd0d2" stroke-width="1"/></svg>`,
  team: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="22" r="9" fill="#3ef2b4"/><circle cx="40" cy="22" r="9" fill="#5aa9ff"/><path d="M8 52c0-11 7-18 16-18s16 7 16 18z" fill="#3ef2b4"/><path d="M24 52c0-11 7-18 16-18s16 7 16 18z" fill="#5aa9ff" opacity=".9"/></svg>`,
  versus: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="16" cy="22" r="8" fill="#3ef2b4"/><path d="M2 52c0-10 6-16 14-16s14 6 14 16z" fill="#3ef2b4"/><circle cx="48" cy="22" r="8" fill="#5aa9ff"/><path d="M34 52c0-10 6-16 14-16s14 6 14 16z" fill="#5aa9ff"/><path d="M27 14l10 6-10 6M37 34l-10 6 10 6" fill="none" stroke="#eef5f3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  jackpot: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="20" width="48" height="34" rx="4" fill="#27334a" stroke="#8d99ab" stroke-width="2"/><path d="M8 20 L20 8 H44 L56 20" fill="#1c2638" stroke="#8d99ab" stroke-width="2"/><rect x="18" y="28" width="28" height="12" rx="2" fill="#3ef2b4"/><circle cx="32" cy="34" r="3.5" fill="none" stroke="#032118" stroke-width="1.6"/><rect x="20" y="42" width="28" height="8" rx="2" fill="#12b886"/></svg>`,
  keycard: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="16" width="44" height="30" rx="5" fill="#5aa9ff" transform="rotate(-10 32 31)"/><rect x="16" y="22" width="12" height="9" rx="2" fill="#b5ffe6" transform="rotate(-10 32 31)"/><path d="M18 40h26" stroke="#0b1528" stroke-width="3" transform="rotate(-10 32 31)"/><path d="M48 46l4 6 8-12" fill="none" stroke="#3ef2b4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pass: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="#9aa5b6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  settings: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="#c6ceda" stroke-width="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#c6ceda" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  sound: (on = true) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#c6ceda"/>${on ? `<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#c6ceda" stroke-width="1.6" stroke-linecap="round"/>` : `<path d="M16 9l5 6M21 9l-5 6" stroke="#f0525a" stroke-width="1.8" stroke-linecap="round"/>`}</svg>`,
  lock: (open = false, color = "#3ef2b4") => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${open ? "M15 21v-7a9 9 0 0 1 17.6-2.6" : "M15 21v-7a9 9 0 0 1 18 0v7"}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><rect x="9" y="21" width="30" height="22" rx="4" fill="${color}"/><circle cx="24" cy="30" r="3.2" fill="#0b111d"/><rect x="22.6" y="31" width="2.8" height="7" rx="1.2" fill="#0b111d"/></svg>`,
  granted: () => `<svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="rgba(70,179,255,.15)" stroke="#5aa9ff" stroke-width="2.5"/><path d="M15 28l8 8 16-17" fill="none" stroke="#5aa9ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  denied: () => `<svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="rgba(240,82,90,.15)" stroke="#f0525a" stroke-width="2.5"/><path d="M18 18l18 18M36 18 18 36" stroke="#f0525a" stroke-width="4" stroke-linecap="round"/></svg>`,
  // mechanic illustrations (64×64)
  decrypt: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="2" fill="#c8102e"/><rect x="6" y="26" width="52" height="12" fill="#fff"/>${[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => ((i + j) % 3 ? `<rect x="${6 + i * 8.67}" y="${14 + j * 12}" width="8.67" height="12" fill="#13203a" stroke="#5aa9ff" stroke-width=".6"/>` : "")).join("")).join("")}</svg>`,
  doppel: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><g opacity=".55" transform="translate(-6 -6)"><rect x="14" y="16" width="42" height="28" fill="#002b7f"/><rect x="28" y="16" width="14" height="28" fill="#fcd116"/><rect x="42" y="16" width="14" height="28" fill="#ce1126"/></g><rect x="14" y="22" width="42" height="28" fill="#002664" stroke="#5aa9ff" stroke-width="1.2"/><rect x="28" y="22" width="14" height="28" fill="#fecb00"/><rect x="42" y="22" width="14" height="28" fill="#c60c30"/></svg>`,
  satellite: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="20" fill="#0b1528" stroke="#5aa9ff" stroke-width="1.5"/><path d="M20 30c5 2 6 8 12 8s7-6 12-4M24 46c3-3 8-3 10 0" fill="none" stroke="#5c6f91" stroke-width="2"/><path d="M27 33c2-2 5-2 6 1-1 3-4 4-6 2z" fill="#3ef2b4"/><g transform="translate(40 4) rotate(30)"><rect x="-3" y="0" width="6" height="10" fill="#c6ceda"/><rect x="-14" y="2" width="9" height="6" fill="#2a5fb0" stroke="#5aa9ff" stroke-width=".8"/><rect x="5" y="2" width="9" height="6" fill="#2a5fb0" stroke="#5aa9ff" stroke-width=".8"/></g><path d="M38 16 33 30" stroke="#5aa9ff" stroke-dasharray="2 2"/></svg>`,
  wager: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10v40M16 54h32M14 20h36" stroke="#c6ceda" stroke-width="2.5" stroke-linecap="round"/><path d="M14 20 7 36h14zM50 20l-7 16h14z" fill="none" stroke="#c6ceda" stroke-width="1.5"/><path d="M6 36a8 8 0 0 0 16 0z" fill="#3ef2b4"/><path d="M42 36a8 8 0 0 0 16 0z" fill="#5aa9ff"/><circle cx="32" cy="10" r="3" fill="#3ef2b4"/></svg>`,
  finalLock: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="#141c2b" stroke="#3ef2b4" stroke-width="2.5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="54" y="29" width="8" height="6" rx="1.5" fill="#3ef2b4" transform="rotate(${i * 60 - 90} 32 32)"/>`).join("")}<circle cx="32" cy="32" r="12" fill="none" stroke="#8d99ab" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="#3ef2b4"/></svg>`,
  // security events (64×64)
  laserGrid: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 14 60 30M4 30 60 14M4 38l56 16M4 54l56-16" stroke="#f0525a" stroke-width="2.2" stroke-linecap="round"/><path d="M4 14 60 30M4 30 60 14M4 38l56 16M4 54l56-16" stroke="#ffb4b7" stroke-width=".6"/></svg>`,
  countdown: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="22" fill="#141c2b" stroke="#f0525a" stroke-width="3"/><rect x="27" y="6" width="10" height="6" rx="2" fill="#c6ceda"/><path d="M32 36V22" stroke="#3ef2b4" stroke-width="3" stroke-linecap="round"/><path d="M32 36 42 42" stroke="#c6ceda" stroke-width="2.5" stroke-linecap="round"/><path d="M32 14a22 22 0 0 1 19 11" fill="none" stroke="#f0525a" stroke-width="6" opacity=".5"/></svg>`,
  supplyDrop: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="22" width="48" height="30" rx="4" fill="#27334a" stroke="#8d99ab" stroke-width="2"/><path d="M24 22v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" fill="none" stroke="#8d99ab" stroke-width="2.5"/><rect x="28" y="32" width="8" height="8" rx="1.5" fill="#3ef2b4"/><path d="M8 34h48" stroke="#8d99ab" stroke-width="1.5"/></svg>`,
  checkpoint: () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="40" width="10" height="18" fill="#27334a" stroke="#8d99ab" stroke-width="1.5"/><path d="M11 42 58 28" stroke="#f0525a" stroke-width="7" stroke-linecap="round"/><path d="M20 39.5l6-1.8M34 35.4l6-1.8M48 31.3l6-1.8" stroke="#fff" stroke-width="6"/><circle cx="11" cy="42" r="4" fill="#3ef2b4"/><circle cx="50" cy="14" r="6" fill="#f0525a" opacity=".85"/></svg>`,
};

/** A node in the chamber route: done | current | locked. */
export function routeNode(state, final = false) {
  const ring = state === "done" ? "#3ef2b4" : state === "current" ? "#5aa9ff" : "#4a5568";
  const fill = state === "done" ? "rgba(217,180,106,.18)" : "#0e1626";
  const inner = state === "done"
    ? `<path d="M15 20.5 18.5 24 25 16" fill="none" stroke="#3ef2b4" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
    : final
      ? `<circle cx="20" cy="20" r="6" fill="none" stroke="${ring}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="27" y="19" width="5" height="2" fill="${ring}" transform="rotate(${i * 60} 20 20)"/>`).join("")}`
      : `<rect x="14.5" y="18" width="11" height="9" rx="1.5" fill="${ring}"/><path d="M16.5 18v-2.5a3.5 3.5 0 0 1 7 0V18" fill="none" stroke="${ring}" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${final ? 18 : 16}" fill="${fill}" stroke="${ring}" stroke-width="${final ? 2.5 : 2}"/>${inner}</svg>`;
}

