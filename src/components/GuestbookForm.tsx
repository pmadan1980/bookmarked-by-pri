"use client";
import { useRef, useState } from "react";
import { submitNote } from "@/app/actions";
import { WALL_COLORS, WALL_FONTS, wallFont } from "@/lib/utils";
import { Sticker, STICKER_SETS } from "@/components/Sticker";

type Placed = { id: string; kind: string; x: number; y: number };
const uid = () => Math.random().toString(36).slice(2, 9);

export default function GuestbookForm() {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [color, setColor] = useState("cream");
  const [font, setFont] = useState("hand");
  const [stickers, setStickers] = useState<Placed[]>([]);
  const [status, setStatus] = useState("");
  const canvas = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);
  const f = wallFont(font);

  function addSticker(kind: string) {
    if (stickers.length >= 14) return;
    setStickers((s) => [...s, { id: uid(), kind, x: 46 + Math.random() * 8, y: 42 + Math.random() * 12 }]);
  }
  function onDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    drag.current = { id, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  function onMove(e: PointerEvent) {
    const d = drag.current, box = canvas.current;
    if (!d || !box) return;
    d.moved = true;
    const r = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    setStickers((s) => s.map((st) => (st.id === d.id ? { ...st, x, y } : st)));
  }
  function onUp() {
    const d = drag.current;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (d && !d.moved) setStickers((s) => s.filter((st) => st.id !== d.id)); // tap = remove
    drag.current = null;
  }

  async function send() {
    if (!body.trim()) return;
    const res = await submitNote({ name, body, color, font, stickers: stickers.map(({ kind, x, y }) => ({ kind, x, y })), website });
    if (res.ok) { setName(""); setBody(""); setStickers([]); setStatus("Thank you, pri will read it before it goes up."); setTimeout(() => setStatus(""), 5000); }
    else setStatus(res.error || "Could not send that just now.");
  }

  return (
    <div style={{ padding: 20, background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 8px 20px -10px rgba(58,43,34,.4)" }}>
      <div className="f-disp" style={{ fontSize: 28, lineHeight: 1, marginBottom: 12 }}>Leave a note</div>

      <label className="flabel" style={{ marginBottom: 6 }}>your name</label>
      <input className="txt" placeholder="a stranger" value={name} onChange={(e) => setName(e.target.value)} />
      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ position: "absolute", left: -9999 }} aria-hidden />

      <label className="flabel" style={{ margin: "12px 0 6px" }}>your note</label>
      <textarea className="txt" placeholder="read Stoner next, trust me" value={body} onChange={(e) => setBody(e.target.value)} rows={2}
        style={{ fontFamily: f.css, fontSize: Math.max(14, f.size - 2), lineHeight: 1.3, resize: "vertical" }} />

      <label className="flabel" style={{ margin: "12px 0 6px" }}>paper colour</label>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {WALL_COLORS.map((c) => (
          <button key={c.id} type="button" onClick={() => setColor(c.id)} aria-label={c.id}
            style={{ width: 26, height: 26, borderRadius: "50%", background: c.bg, cursor: "pointer", border: "1px solid rgba(58,43,34,.3)", outline: color === c.id ? "2px solid #846044" : "none", outlineOffset: 2 }} />
        ))}
      </div>

      <label className="flabel" style={{ margin: "12px 0 6px" }}>handwriting</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {WALL_FONTS.map((ff) => (
          <button key={ff.id} type="button" onClick={() => setFont(ff.id)}
            style={{ padding: "6px 10px", cursor: "pointer", fontFamily: ff.css, fontSize: 14, background: font === ff.id ? "#846044" : "transparent", color: font === ff.id ? "#f6eedd" : "#5c4838", border: `1px solid ${font === ff.id ? "#5f4530" : "rgba(58,43,34,.3)"}` }}>
            {ff.label}
          </button>
        ))}
      </div>

      <label className="flabel" style={{ margin: "12px 0 6px" }}>stickers <span className="f-hand" style={{ fontSize: 14, color: "#a08c72" }}>(tap to add, drag on the note, tap a sticker to remove)</span></label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {STICKER_SETS.map((set) => (
          <div key={set.label} style={{ display: "flex", gap: 4 }}>
            {set.kinds.map((k) => (
              <button key={k} type="button" onClick={() => addSticker(k)} title={`add ${k}`}
                style={{ width: 34, height: 34, display: "grid", placeItems: "center", background: "#efe0c8", border: "1px solid rgba(58,43,34,.2)", cursor: "pointer" }}>
                <Sticker kind={k} size={24} />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* live preview = sticker canvas */}
      <div ref={canvas} style={{ position: "relative", marginTop: 14, padding: "16px 18px", minHeight: 96, background: WALL_COLORS.find((c) => c.id === color)?.bg, border: "1px solid rgba(58,43,34,.14)", transform: "rotate(-1deg)", overflow: "hidden", touchAction: "none" }}>
        <div style={{ fontFamily: f.css, fontSize: f.size, lineHeight: 1.35, color: "#4a3a2c", minHeight: 20, position: "relative", zIndex: 1 }}>{body || "your note, your way"}</div>
        <div className="f-hand" style={{ fontSize: 15, color: "#8a7660", marginTop: 6, position: "relative", zIndex: 1 }}>&mdash; {name || "a stranger"}</div>
        {stickers.map((st) => (
          <div key={st.id} onPointerDown={(e) => onDown(e, st.id)}
            style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, transform: "translate(-50%,-50%)", cursor: "grab", zIndex: 2, touchAction: "none" }}>
            <Sticker kind={st.kind} size={32} />
          </div>
        ))}
      </div>

      <button className="btn btn-accent" style={{ width: "100%", marginTop: 14, padding: 11, fontSize: 12, letterSpacing: ".1em" }} onClick={send}>send it to pri</button>
      <div className="f-hand" style={{ fontSize: 17, color: "#846044", marginTop: 9, minHeight: 20 }}>{status}</div>
    </div>
  );
}
