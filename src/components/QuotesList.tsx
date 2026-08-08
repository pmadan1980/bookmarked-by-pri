"use client";
import { useState } from "react";
import { editQuote, removeQuote, addQuote } from "@/app/actions";

export type QuoteT = { id: string; text: string; source: string };
const strip = (s: string) => s.replace(/^[\u201c\u201d"]+|[\u201c\u201d"]+$/g, "");

export default function QuotesList({ quotes, owner }: { quotes: QuoteT[]; owner: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="two-col">
        {quotes.map((q) =>
          owner && editingId === q.id ? (
            <QuoteEditor key={q.id} quote={q} onDone={() => setEditingId(null)} />
          ) : (
            <div key={q.id} className="ruled" onClick={() => owner && setEditingId(q.id)}
              style={{ padding: "20px 22px", boxShadow: "0 6px 16px -8px rgba(58,43,34,.35)", position: "relative", cursor: owner ? "text" : "default" }}
              title={owner ? "click to edit" : undefined}>
              {owner && (
                <button aria-label="remove line" onClick={(e) => { e.stopPropagation(); if (confirm("Remove this line?")) removeQuote(q.id); }}
                  style={{ position: "absolute", top: 8, right: 10, fontSize: 15, background: "none", border: 0, color: "#846044", cursor: "pointer", lineHeight: 1 }}>×</button>
              )}
              <div className="f-hand" style={{ fontSize: 25, lineHeight: 1.2, color: "#5f4530" }}>{q.text}</div>
              <div className="f-hand" style={{ fontSize: 16, color: "#8a7660", marginTop: 10 }}>{q.source}</div>
              {owner && <div className="f-mono" style={{ fontSize: 9, color: "#a08c72", marginTop: 8, letterSpacing: ".08em" }}>click to edit</div>}
            </div>
          )
        )}
      </div>

      {owner && (
        adding ? (
          <div className="ruled" style={{ padding: "16px 18px", marginTop: 14, maxWidth: 480 }}>
            <QuoteEditor quote={{ id: "", text: "", source: "" }} isNew onDone={() => setAdding(false)} />
          </div>
        ) : (
          <button className="btn" onClick={() => setAdding(true)}
            style={{ display: "inline-block", marginTop: 12, fontSize: 11, padding: "7px 12px", border: "1px solid #846044", color: "#846044", background: "transparent", cursor: "pointer" }}>+ add a line</button>
        )
      )}
    </div>
  );
}

function QuoteEditor({ quote, onDone, isNew = false }: { quote: QuoteT; onDone: () => void; isNew?: boolean }) {
  const [text, setText] = useState(strip(quote.text));
  const [source, setSource] = useState(quote.source);
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!text.trim()) { onDone(); return; }
    setBusy(true);
    if (isNew) await addQuote(text, source);
    else await editQuote({ id: quote.id, text, source });
    setBusy(false); onDone();
  }
  return (
    <div className={isNew ? "" : "ruled"} style={isNew ? {} : { padding: "18px 20px", boxShadow: "0 6px 16px -8px rgba(58,43,34,.35)" }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus placeholder="the line you underlined"
        className="f-hand" style={{ width: "100%", fontSize: 22, lineHeight: 1.2, color: "#5f4530", background: "#f6efdd", border: "1px solid rgba(58,43,34,.28)", padding: "8px 10px", resize: "vertical" }} />
      <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="source, e.g. Stoner, p. 12"
        className="f-hand" style={{ width: "100%", marginTop: 8, fontSize: 16, color: "#8a7660", background: "#f6efdd", border: "1px solid rgba(58,43,34,.28)", padding: "6px 10px" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn btn-accent" style={{ padding: "7px 14px", fontSize: 11, opacity: busy ? 0.6 : 1 }} onClick={save} disabled={busy}>{isNew ? "save the line" : "save"}</button>
        <button className="btn" style={{ padding: "7px 14px", fontSize: 11, background: "transparent", border: "1px solid #846044", color: "#846044", cursor: "pointer" }} onClick={onDone}>cancel</button>
      </div>
    </div>
  );
}
