"use client";
import { useState } from "react";
import { SHELVES, shelfLabel } from "@/lib/utils";
import { addBook } from "@/app/actions";

type R = { title: string; author: string; genre: string; coverId: number | null; coverUrl: string | null };
const COVERS = [
  "linear-gradient(160deg,#d8c3a0,#c4a071)","linear-gradient(160deg,#bf9a72,#846044)","linear-gradient(160deg,#b3bda6,#98a086)",
];
const LABELS = ["plain type", "duotone", "hand-drawn"];

export default function AddBookPanel({ shelvedTitles }: { shelvedTitles: string[] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<R[]>([]);
  const [picked, setPicked] = useState<R | null>(null);
  const [useReal, setUseReal] = useState(false);
  const [cover, setCover] = useState(0);
  const [verdict, setVerdict] = useState("");
  const [shelf, setShelf] = useState("tbr");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function onQuery(val: string) {
    setQ(val);
    clearTimeout(timer);
    if (val.trim().length < 2) { setResults([]); return; }
    timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(val.trim()));
        const data = await res.json();
        setResults((data.results || []).filter((r: R) => !shelvedTitles.includes(r.title.toLowerCase())).slice(0, 4));
      } catch { /* ignore */ }
    }, 280);
  }
  async function shelveIt() {
    if (!picked) { setStatus("Pick a title from the search first."); return; }
    setBusy(true);
    await addBook({ title: picked.title, author: picked.author, genre: picked.genre, shelf, verdict, coverId: picked.coverId, useRealCover: useReal });
    setStatus(`“${picked.title}” is on ${shelfLabel(shelf)}.`);
    setPicked(null); setQ(""); setResults([]); setVerdict(""); setUseReal(false); setBusy(false);
  }

  return (
    <div id="add-a-book" style={panel}>
      <div className="f-disp" style={{ fontSize: 28, lineHeight: 1, marginBottom: 12 }}>Add a book</div>
      <label className="flabel" style={{ marginBottom: 6 }}>find a title</label>
      <input className="txt" placeholder="title or author…" value={q} onChange={(e) => onQuery(e.target.value)} autoComplete="off" />
      <div style={{ display: "grid", gap: 5, marginTop: 9 }}>
        {results.map((r, i) => (
          <button key={i} onClick={() => { setPicked(r); setUseReal(!!r.coverUrl); setStatus(""); }}
            style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "7px 9px", background: picked?.title === r.title ? "rgba(196,160,113,.35)" : "transparent", border: "1px solid rgba(58,43,34,.18)", cursor: "pointer", fontFamily: "var(--f-body)" }}>
            {r.coverUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.coverUrl} alt="" referrerPolicy="no-referrer" style={{ width: 24, height: 34, objectFit: "cover", border: "1px solid rgba(58,43,34,.2)", flex: "none" }} />
              : <span style={{ width: 24, height: 34, background: COVERS[2], border: "1px solid rgba(58,43,34,.2)", flex: "none" }} />}
            <span style={{ minWidth: 0 }}>
              <span style={{ fontSize: 15, color: "#3a2c22", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
              <span className="f-mono" style={{ fontSize: 10, color: "#8a7660" }}>{r.author}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flabel" style={{ margin: "14px 0 7px" }}>pick a jacket</div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {picked?.coverUrl && (
          <div onClick={() => setUseReal(true)} title="use the real cover"
            style={{ width: 56, height: 80, background: COVERS[2], border: "1px solid rgba(58,43,34,.22)", outline: useReal ? "2px solid #846044" : "none", outlineOffset: 2, cursor: "pointer", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={picked.coverUrl} alt="real cover" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        {LABELS.map((lab, i) => (
          <div key={i} onClick={() => { setCover(i); setUseReal(false); }}
            style={{ width: 56, height: 80, background: COVERS[i], border: "1px solid rgba(58,43,34,.22)", outline: !useReal && cover === i ? "2px solid #846044" : "none", outlineOffset: 2, cursor: "pointer", display: "grid", placeItems: "end center", paddingBottom: 7 }}>
            <span className="f-hand" style={{ fontSize: 11, color: "rgba(36,22,17,.6)", textAlign: "center" }}>{lab}</span>
          </div>
        ))}
      </div>

      <label className="flabel" style={{ margin: "14px 0 6px" }}>your one-liner</label>
      <input className="txt" placeholder="honest, short, no jacket copy" value={verdict} onChange={(e) => setVerdict(e.target.value)} />

      <div className="flabel" style={{ margin: "14px 0 6px" }}>shelf</div>
      <div style={{ display: "grid", gap: 5 }}>
        {SHELVES.map((s) => (
          <button key={s.id} onClick={() => setShelf(s.id)} className="btn"
            style={{ textAlign: "left", padding: "9px 11px", border: `1px solid ${shelf === s.id ? "#5f4530" : "rgba(58,43,34,.3)"}`, cursor: "pointer", fontSize: 12, background: shelf === s.id ? "#846044" : "transparent", color: shelf === s.id ? "#f6eedd" : "#5c4838" }}>{s.short}</button>
        ))}
      </div>
      <button className="btn btn-accent" style={{ width: "100%", marginTop: 14, padding: 11, fontSize: 12, letterSpacing: ".1em", opacity: busy ? 0.6 : 1 }} onClick={shelveIt} disabled={busy}>shelve it</button>
      <div className="f-hand" style={{ fontSize: 18, color: "#846044", marginTop: 10, minHeight: 24, lineHeight: 1.2 }}>{status}</div>
    </div>
  );
}
const panel: React.CSSProperties = { padding: "18px 18px 20px", background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 8px 20px -10px rgba(58,43,34,.4)", position: "relative" };
