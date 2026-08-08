"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { SHELVES } from "@/lib/utils";
import { moveBook, removeBook, editBook } from "@/app/actions";

export type BookT = {
  id: string; title: string; author: string; genre: string; shelf: string;
  verdict: string; rating: string; jacketIndex: number; coverUrl: string | null; slug: string;
};
const COVERS = [
  "linear-gradient(160deg,#d8c3a0,#c4a071)","linear-gradient(160deg,#bf9a72,#846044)",
  "linear-gradient(160deg,#b3bda6,#98a086)","linear-gradient(160deg,#c48f7d,#a76d5e)",
];
const ROTS = ["-1.5deg","1.2deg","-0.8deg","1.8deg","-2deg","0.7deg"];
function coverIdx(b: BookT) { return (Math.abs(hash(b.id)) + SHELVES.findIndex((s) => s.id === b.shelf)) % COVERS.length; }
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function rot(b: BookT, i: number) { return ROTS[Math.abs(hash(b.id) * 2 + i) % ROTS.length]; }
function stepCover(img: HTMLImageElement) {
  const s = img.getAttribute("src") || "";
  if (/-L\.jpg$/.test(s)) { img.src = s.replace("-L.jpg", "-M.jpg"); return; }
  if (/-M\.jpg$/.test(s)) { img.src = s.replace("-M.jpg", "-S.jpg"); return; }
  img.style.display = "none";
  const j = img.closest(".jacket") as HTMLElement | null;
  if (j) j.style.background = COVERS[2];
}

export default function BookShelves({ books, owner }: { books: BookT[]; owner: boolean }) {
  const [editing, setEditing] = useState<BookT | null>(null);
  const dragId = useRef<string | null>(null);
  const [overShelf, setOverShelf] = useState<string | null>(null);
  const ghost = useRef<HTMLElement | null>(null);
  const start = useRef({ x: 0, y: 0, active: false, offX: 0, offY: 0, src: null as HTMLElement | null });

  function onPointerDown(e: React.PointerEvent, id: string, jacket: HTMLElement) {
    if (!owner) return;
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    dragId.current = id;
    start.current = { x: e.clientX, y: e.clientY, active: false, offX: 0, offY: 0, src: jacket };
    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
  }
  function onMove(e: PointerEvent) {
    if (!dragId.current) return;
    const st = start.current;
    if (!st.active) {
      if (Math.abs(e.clientX - st.x) + Math.abs(e.clientY - st.y) < 7) return;
      st.active = true;
      const r = st.src!.getBoundingClientRect();
      const g = st.src!.cloneNode(true) as HTMLElement;
      g.style.cssText += `;position:fixed;left:0;top:0;width:${r.width}px;height:${r.height}px;margin:0;pointer-events:none;z-index:9999;opacity:.94;transform:rotate(-3deg);box-shadow:0 18px 34px -10px rgba(58,43,34,.6)`;
      document.body.appendChild(g); ghost.current = g;
      st.offX = st.x - r.left; st.offY = st.y - r.top;
      st.src!.style.opacity = ".35"; document.body.style.cursor = "grabbing";
    }
    e.preventDefault();
    ghost.current!.style.left = e.clientX - st.offX + "px";
    ghost.current!.style.top = e.clientY - st.offY + "px";
    const t = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const zone = t?.closest("[data-shelf]") as HTMLElement | null;
    setOverShelf(zone?.getAttribute("data-shelf") || null);
  }
  function onUp() {
    document.removeEventListener("pointermove", onMove, { passive: false } as EventListenerOptions);
    document.removeEventListener("pointerup", onUp, true);
    document.removeEventListener("pointercancel", onUp, true);
    const id = dragId.current; const over = overShelfRef();
    if (ghost.current) ghost.current.remove(); ghost.current = null;
    if (start.current.src) start.current.src.style.opacity = "";
    document.body.style.cursor = "";
    const wasActive = start.current.active;
    dragId.current = null; setOverShelf(null);
    if (wasActive && id && over) {
      const b = books.find((x) => x.id === id);
      if (b && b.shelf !== over) moveBook(id, over);
    }
  }
  // read latest overShelf synchronously via a ref mirror
  const overRef = useRef<string | null>(null); overRef.current = overShelf;
  function overShelfRef() { return overRef.current; }

  return (
    <div>
      {SHELVES.map((def) => {
        const list = books.filter((b) => b.shelf === def.id);
        const hot = overShelf === def.id && dragId.current;
        return (
          <div key={def.id} data-shelf={def.id} style={{ marginBottom: 40, outline: hot ? "2px dashed #846044" : "none", outlineOffset: 6 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, padding: "6px 10px", border: "1px dashed transparent", background: hot ? "rgba(196,160,113,.30)" : "transparent", borderColor: dragId.current ? (hot ? "#846044" : "rgba(132,96,68,.45)") : "transparent" }}>
              <div className="f-disp" style={{ fontSize: 34, lineHeight: 1 }}>{def.label}</div>
              <div style={{ flex: 1, borderBottom: "1px dotted rgba(58,43,34,.35)", transform: "translateY(-6px)" }} />
              <div className="f-hand" style={{ fontSize: 18, color: "#8a7660" }}>{list.length}, {def.meta}</div>
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start", paddingBottom: 12, borderBottom: "5px solid #846044", boxShadow: "0 7px 12px -7px rgba(58,43,34,.5)" }}>
              {list.map((b) => {
                const i = coverIdx(b);
                return (
                  <div key={b.id} className="book" style={{ width: 132 }}>
                    <div className="jacket" style={{ background: b.coverUrl ? "transparent" : COVERS[i], transform: `rotate(${rot(b, i)})` }}
                      onPointerDown={(e) => onPointerDown(e, b.id, e.currentTarget)}>
                      {b.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.coverUrl} alt={`${b.title} cover`} referrerPolicy="no-referrer" draggable={false} onError={(e) => stepCover(e.currentTarget)} />
                      ) : (
                        <div style={{ position: "absolute", inset: "14px 12px 14px 22px", zIndex: 1 }}>
                          <div className="f-mono" style={{ fontSize: 8.5, color: "rgba(36,22,17,.5)" }}>{b.genre}</div>
                        </div>
                      )}
                      <div className="spine" /><div className="tape" />
                    </div>
                    <Link href={`/books/${b.slug}`} className="f-disp" style={{ display: "block", fontWeight: 500, fontSize: 16, lineHeight: 1.08, color: "#3a2c22", marginTop: 11 }}>{b.title}</Link>
                    <div className="f-mono" style={{ fontSize: 9.5, color: "#8a7660", marginTop: 3 }}>{b.author}</div>
                    <div className="f-hand" style={{ fontSize: 18, lineHeight: 1.2, color: "#5c4838", marginTop: 6 }}>{b.verdict}</div>
                    <div className="f-mono" style={{ fontSize: 11, color: "#8a7660", marginTop: 4, letterSpacing: ".06em" }}>{b.rating}</div>
                    {owner && (
                      <div style={{ display: "flex", gap: 10, marginTop: 7, alignItems: "center", flexWrap: "wrap" }}>
                        <button className="f-mono" style={linkBtn} onClick={() => setEditing(b)}>edit</button>
                        <button className="f-mono" style={linkBtn} onClick={() => { if (confirm(`Remove “${b.title}”?`)) removeBook(b.id); }}>remove</button>
                        <select aria-label={`Move ${b.title} to shelf`} defaultValue={b.shelf} onChange={(e) => moveBook(b.id, e.target.value)}
                          className="f-mono" style={{ fontSize: 10, background: "#e6d8bd", border: "1px solid rgba(58,43,34,.3)", color: "#5c4838", padding: "3px 4px", width: "100%" }}>
                          {SHELVES.map((s) => <option key={s.id} value={s.id}>{s.short}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
              {owner && (
                <Link href="#add-a-book" style={{ width: 132, height: 190, display: "grid", placeItems: "center", textAlign: "center", border: "1px dashed rgba(132,96,68,.55)", color: "#846044", padding: 10 }}>
                  <span className="f-hand" style={{ fontSize: 16 }}>add a book →</span>
                </Link>
              )}
            </div>
            {owner && <div className="f-hand" style={{ fontSize: 15, color: "#a08c72", marginTop: 8 }}>grab a book by its cover and drag it onto another shelf to move it</div>}
          </div>
        );
      })}
      {editing && <EditModal book={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

const linkBtn: React.CSSProperties = { fontSize: 11, background: "none", border: 0, borderBottom: "1px solid #846044", color: "#846044", cursor: "pointer", padding: 0 };

function EditModal({ book, onClose }: { book: BookT; onClose: () => void }) {
  const [t, setT] = useState(book.title);
  const [a, setA] = useState(book.author);
  const [g, setG] = useState(book.genre);
  const [v, setV] = useState(book.verdict);
  const [r, setR] = useState(book.rating);
  const [sh, setSh] = useState(book.shelf);
  async function save() { await editBook({ id: book.id, title: t, author: a, genre: g, verdict: v, rating: r, shelf: sh }); onClose(); }
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(36,22,17,.5)", display: "grid", placeItems: "center" }}>
      <div style={{ width: 360, maxWidth: "92vw", padding: 22, background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 8px 20px -10px rgba(58,43,34,.4)" }}>
        <div className="f-disp" style={{ fontSize: 28, marginBottom: 12 }}>Edit book</div>
        {[["title", t, setT], ["author", a, setA], ["genre", g, setG], ["one-liner", v, setV]].map(([lab, val, set]: any) => (
          <label key={lab} className="flabel" style={{ marginBottom: 4, display: "block" }}>{lab}
            <input className="txt" style={{ margin: "4px 0 10px" }} value={val} onChange={(e) => set(e.target.value)} />
          </label>
        ))}
        <label className="flabel">rating
          <select className="txt" style={{ margin: "4px 0 10px" }} value={r} onChange={(e) => setR(e.target.value)}>
            {["★★★★★","★★★★☆","★★★☆☆","★★☆☆☆","★☆☆☆☆","unread"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="flabel">shelf
          <select className="txt" style={{ margin: "4px 0 16px" }} value={sh} onChange={(e) => setSh(e.target.value)}>
            {SHELVES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1, padding: 10, fontSize: 12 }} onClick={save}>save</button>
          <button className="btn" style={{ flex: 1, padding: 10, fontSize: 12, background: "transparent", border: "1px solid #846044", color: "#846044" }} onClick={onClose}>cancel</button>
        </div>
      </div>
    </div>
  );
}
