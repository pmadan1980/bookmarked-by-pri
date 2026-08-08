// Server component: hand-drawn flowers, coffee cups and handwritten scribbles.
function flower(cx: number, cy: number, s: number, pc: string, cc: string, petals = 6) {
  const p = Array.from({ length: petals }, (_, k) =>
    `<ellipse cx="0" cy="-13" rx="7" ry="13" fill="${pc}" transform="rotate(${(k * 360) / petals})"/>`
  ).join("");
  return `<g transform="translate(${cx},${cy}) scale(${s})">${p}<circle r="6" fill="${cc}"/></g>`;
}
const leaf = (cx: number, cy: number, r: number, s: number, c: string) =>
  `<g transform="translate(${cx},${cy}) rotate(${r}) scale(${s})"><path d="M0 0 Q 12 -9 24 0 Q 12 9 0 0 Z" fill="${c}"/></g>`;
const stem = (d: string) =>
  `<path d="${d}" fill="none" stroke="#6f7a5f" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
const spray = () =>
  stem("M18 8 C 46 40, 60 78, 66 150") + leaf(30, 44, 25, 1, "#8b9479") + leaf(40, 80, 15, 1.1, "#98a086") +
  leaf(52, 116, 5, 1, "#8b9479") + flower(70, 150, 1.25, "#a76d5e", "#c4a071") +
  flower(46, 120, 0.9, "#c48f7d", "#c4a071") + flower(92, 132, 0.8, "#c4a071", "#846044");
const cup = (c: string) =>
  `<g fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">` +
  `<path d="M16 34 h44 v13 a22 15 0 0 1 -44 0 z"/><path d="M60 37 q16 0 15 13 q-1 9 -15 8"/><path d="M12 60 h52"/>` +
  `<path d="M28 24 q-6 -8 2 -15" opacity=".85"/><path d="M42 26 q-6 -8 2 -15" opacity=".85"/></g>`;

function S({ vb, style, inner }: { vb: string; style: React.CSSProperties; inner: string }) {
  return <svg viewBox={vb} aria-hidden style={{ position: "absolute", pointerEvents: "none", zIndex: 0, ...style }} dangerouslySetInnerHTML={{ __html: inner }} />;
}

export function Decor() {
  return (
    <>
      <div className="ring" style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", zIndex: 0, top: 120, right: 66, width: 210, height: 210, border: "18px solid rgba(132,96,68,.11)", filter: "blur(1.5px)", transform: "rotate(-12deg) scale(1.04,.93)" }} />
      <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", zIndex: 0, bottom: 250, left: -46, width: 300, height: 300, border: "24px solid rgba(132,96,68,.06)", filter: "blur(2px)", transform: "rotate(18deg) scale(1,.92)" }} />
      <S vb="0 0 200 200" style={{ left: -18, top: 120, width: 180, height: 180, opacity: 0.55 }} inner={spray()} />
      <S vb="0 0 200 200" style={{ right: -16, bottom: 360, width: 170, height: 170, opacity: 0.5, transform: "scale(-1,1)" }} inner={spray()} />
      <S vb="0 0 90 70" style={{ right: 150, top: 300, width: 120, height: 94, opacity: 0.1, transform: "rotate(-8deg)" }} inner={cup("#846044")} />
      <S vb="0 0 90 70" style={{ left: 40, top: 660, width: 104, height: 82, opacity: 0.1, transform: "rotate(6deg)" }} inner={cup("#a76d5e")} />
      <S vb="0 0 90 70" style={{ right: 60, bottom: 150, width: 130, height: 100, opacity: 0.09, transform: "rotate(4deg)" }} inner={cup("#6f7a5f")} />
      <div className="doodle" style={{ right: 210, top: 250, fontSize: 34, transform: "rotate(-7deg)", color: "#a76d5e" }}>one more chapter</div>
      <div className="doodle" style={{ left: 60, top: 600, fontSize: 30, transform: "rotate(5deg)", color: "#6f7a5f" }}>just one more page…</div>
      <div className="doodle" style={{ right: 90, bottom: 210, fontSize: 28, transform: "rotate(3deg)", color: "#846044" }}>don&apos;t lend this one out</div>
    </>
  );
}

export function FlowerTag({ kind = "rose" }: { kind?: "rose" | "sage" | "tan" }) {
  const pc = kind === "rose" ? "#a76d5e" : kind === "sage" ? "#98a086" : "#c4a071";
  const cc = kind === "sage" ? "#c4a071" : "#846044";
  return <svg viewBox="0 0 22 22" aria-hidden style={{ width: 22, height: 22, flex: "none", transform: "translateY(4px)" }} dangerouslySetInnerHTML={{ __html: flower(11, 11, 0.7, pc, cc) }} />;
}
