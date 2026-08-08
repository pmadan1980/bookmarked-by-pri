import { STICKER_KINDS } from "@/lib/utils";

function petals(n: number, ry: number, pc: string, cc: string, cr: number) {
  let p = "";
  for (let i = 0; i < n; i++) {
    p += `<ellipse cx="20" cy="9" rx="4.2" ry="${ry}" fill="${pc}" stroke="rgba(58,43,34,.28)" stroke-width="0.6" transform="rotate(${(i * 360) / n} 20 20)"/>`;
  }
  return p + `<circle cx="20" cy="20" r="${cr}" fill="${cc}"/>`;
}

const SVG: Record<string, string> = {
  "flower-rose": petals(6, 7, "#c48f7d", "#a76d5e", 5),
  "flower-daisy": petals(8, 8, "#f2e6c8", "#c4a071", 5.5),
  cat:
    `<g stroke="#4a3a2c" stroke-width="2" fill="#c4a071" stroke-linejoin="round"><path d="M9 14 L13 6 L19 12 Z"/><path d="M31 14 L27 6 L21 12 Z"/><circle cx="20" cy="22" r="11"/></g>` +
    `<g fill="#4a3a2c"><circle cx="16" cy="21" r="1.6"/><circle cx="24" cy="21" r="1.6"/></g>` +
    `<path d="M17 26 q3 2 6 0" fill="none" stroke="#4a3a2c" stroke-width="1.4" stroke-linecap="round"/>` +
    `<g stroke="#4a3a2c" stroke-width="1" stroke-linecap="round"><path d="M13 25 h-6"/><path d="M13 28 h-6"/><path d="M27 25 h6"/><path d="M27 28 h6"/></g>`,
  bunny:
    `<g fill="#e7d7bd" stroke="#4a3a2c" stroke-width="1.6" stroke-linejoin="round"><ellipse cx="15" cy="10" rx="3.5" ry="9"/><ellipse cx="25" cy="10" rx="3.5" ry="9"/><circle cx="20" cy="26" r="9"/></g>` +
    `<g fill="#4a3a2c"><circle cx="17" cy="25" r="1.4"/><circle cx="23" cy="25" r="1.4"/></g>` +
    `<path d="M20 28 l-2.5 2.5 h5 z" fill="#a76d5e"/>`,
  bird:
    `<path d="M9 24 q0 -11 13 -10 q9 1 11 6 q-3 2 -8 2 q4 4 1 8 q-7 2 -13 -1 q-5 -1 -4 -5 z" fill="#98a086" stroke="#4a3a2c" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<circle cx="27" cy="19" r="1.3" fill="#4a3a2c"/><path d="M33 20 l5 -1 -3 3 z" fill="#c4a071" stroke="#4a3a2c" stroke-width="1"/>`,
  heart: `<path d="M20 32 C 6 22, 8 10, 20 16 C 32 10, 34 22, 20 32 Z" fill="#a76d5e" stroke="#8a4a3b" stroke-width="1.2"/>`,
  star: `<path d="M20 5 L23.7 15.6 L35 16 L26 22.8 L29.4 34 L20 27.3 L10.6 34 L14 22.8 L5 16 L16.3 15.6 Z" fill="#c4a071" stroke="#846044" stroke-width="1.2" stroke-linejoin="round"/>`,
  sparkle: `<path d="M20 6 Q22 18 34 20 Q22 22 20 34 Q18 22 6 20 Q18 18 20 6 Z" fill="#f2e6c8" stroke="#c4a071" stroke-width="1"/>`,
  scribble: `<path d="M5 24 q4 -9 8 0 t8 0 t8 0 t6 0" fill="none" stroke="#c4a071" stroke-width="6" stroke-linecap="round" opacity="0.55"/>`,
  underline: `<path d="M5 22 h30" stroke="#f2cf6b" stroke-width="9" stroke-linecap="round" opacity="0.5"/><path d="M6 27 h26" stroke="#f2cf6b" stroke-width="4" stroke-linecap="round" opacity="0.4"/>`,
  swirl: `<path d="M22 26 a6 6 0 1 1 -5 -8 a10 10 0 1 0 13 12" fill="none" stroke="#a76d5e" stroke-width="2.4" stroke-linecap="round"/>`,
};

export { STICKER_KINDS };
export const STICKER_SETS: { label: string; kinds: string[] }[] = [
  { label: "flowers", kinds: ["flower-rose", "flower-daisy"] },
  { label: "animals", kinds: ["cat", "bunny", "bird"] },
  { label: "hearts & stars", kinds: ["heart", "star", "sparkle"] },
  { label: "highlighter", kinds: ["scribble", "underline", "swirl"] },
];

export function Sticker({ kind, size = 34 }: { kind: string; size?: number }) {
  const inner = SVG[kind];
  if (!inner) return null;
  return <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible" }} dangerouslySetInnerHTML={{ __html: inner }} />;
}
