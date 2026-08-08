"use client";
import { useState } from "react";
import { submitRecommendation } from "@/app/actions";

type R = { title: string; author: string; genre: string; coverId: number | null; coverUrl: string | null };
const FALLBACK = "linear-gradient(160deg,#b3bda6,#98a086)";

export default function RecommendPanel() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<R[]>([]);
  const [picked, setPicked] = useState<R | null>(null);
  const [by, setBy] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
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
        setResults((data.results || []).slice(0, 5));
      } catch { /* ignore */ }
    }, 280);
  }
  async function send() {
    if (!picked) { setStatus("Search and pick a book first."); return; }
    setBusy(true);
    const big = picked.coverId ? `https://covers.openlibrary.org/b/id/${picked.coverId}-L.jpg` : picked.coverUrl;
    const res = await submitRecommendation({ title: picked.title, author: picked.author, genre: picked.genre, coverUrl: big, by, website });
    setBusy(false);
    if (res.ok) { setStatus("Sent, pri will add it once she\u2019s had a look. Thank you :))"); setPicked(null); setQ(""); setResults([]); setBy(""); }
    else setStatus(res.error || "Could not send that just now.");
  }

  return (
    <div style={{ padding: 20, background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 8px 20px -10px rgba(58,43,34,.4)" }}>
      <div className="f-disp" style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>Recommend me a book</div>
      <div className="f-hand" style={{ fontSize: 17, color: "#8a7660", marginBottom: 12 }}>it lands on the stack once I approve it</div>

      <label className="flabel" style={{ marginBottom: 6 }}>find the book</label>
      <input className="txt" placeholder="title or author…" value={q} onChange={(e) => onQuery(e.target.value)} autoComplete="off" />
      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ position: "absolute", left: -9999 }} aria-hidden />

      <div style={{ display: "grid", gap: 5, marginTop: 9 }}>
        {results.map((r, i) => (
          <button key={i} onClick={() => { setPicked(r); setStatus(""); }}
            style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "7px 9px", background: picked?.title === r.title ? "rgba(196,160,113,.35)" : "transparent", border: "1px solid rgba(58,43,34,.18)", cursor: "pointer", fontFamily: "var(--f-body)" }}>
            {r.coverUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.coverUrl} alt="" referrerPolicy="no-referrer" style={{ width: 24, height: 34, objectFit: "cover", border: "1px solid rgba(58,43,34,.2)", flex: "none" }} />
              : <span style={{ width: 24, height: 34, background: FALLBACK, border: "1px solid rgba(58,43,34,.2)", flex: "none" }} />}
            <span style={{ minWidth: 0 }}>
              <span style={{ fontSize: 15, color: "#3a2c22", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
              <span className="f-mono" style={{ fontSize: 10, color: "#8a7660" }}>{r.author}</span>
            </span>
          </button>
        ))}
      </div>

      {picked && (
        <div className="f-hand" style={{ fontSize: 18, color: "#5f4530", marginTop: 10 }}>
          picking: {picked.title} <span style={{ color: "#8a7660" }}>by {picked.author}</span>
        </div>
      )}

      <label className="flabel" style={{ margin: "12px 0 6px" }}>your name</label>
      <input className="txt" placeholder="a reader" value={by} onChange={(e) => setBy(e.target.value)} />

      <button className="btn btn-accent" style={{ width: "100%", marginTop: 14, padding: 11, fontSize: 12, letterSpacing: ".1em", opacity: busy ? 0.6 : 1 }} onClick={send} disabled={busy}>send recommendation</button>
      <div className="f-hand" style={{ fontSize: 17, color: "#846044", marginTop: 9, minHeight: 20, lineHeight: 1.2 }}>{status}</div>
    </div>
  );
}
