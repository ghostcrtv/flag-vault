// Builds the Home Screen icons from the same vault-door art used in the game.
// Run: node tools/make-icons.mjs  (then tools/render-icons.py renders the PNGs)
import fs from "node:fs";
import { vaultDoor } from "../js/ui/art.js";

const door = vaultDoor().replace(/<svg[^>]*>/, "").replace("</svg>", "");
const icon = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#16243f"/><stop offset=".6" stop-color="#0a1222"/><stop offset="1" stop-color="#03060c"/></radialGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dca3"/><stop offset="1" stop-color="#b8923f"/></linearGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#46b3ff" stop-opacity=".35"/><stop offset="1" stop-color="#46b3ff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="${200 * scale + 40}" fill="url(#halo)"/>
  <g transform="translate(${512 - 200 * scale} ${512 - 200 * scale}) scale(${scale})">${door.replace(/<g class="wheel">[\s\S]*<\/g>\s*$/, "")}
    <circle cx="200" cy="200" r="104" fill="#0d1423" stroke="#8d99ab" stroke-width="1.5"/>
    <g transform="translate(200 200)">
      <rect x="-30" y="-58" width="7" height="118" rx="3.5" fill="#c6ceda"/>
      <circle cx="-26.5" cy="-60" r="7" fill="url(#fl)"/>
      <path d="M-23 -52 C 0 -64, 18 -38, 44 -50 L 44 6 C 18 18, 0 -8, -23 4 Z" fill="url(#fl)" stroke="#8f6e30" stroke-width="1.5"/>
      <path d="M-23 -24 C 0 -36, 18 -10, 44 -22" fill="none" stroke="#1d6fb8" stroke-width="9"/>
    </g>
  </g>
</svg>`;
fs.writeFileSync("icons/icon.svg", icon(2.25));
fs.writeFileSync("icons/icon-maskable.svg", icon(1.75));
console.log("wrote icons/icon.svg");
