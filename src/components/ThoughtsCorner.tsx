"use client";
import { useState } from "react";
import { addThought, editThought, removeThought } from "@/app/actions";

export type ThoughtT = { id: string; text: string };
const PAPERS = ["#f4ecdb", "#efe0c8", "#f6efdd", "#ecdcc0"];
const ROTS = ["-1.4deg", "1.1deg", "-0.7deg", "1.6deg"];

export default function ThoughtsCorner({ thoughts, owner }: { thoughts: ThoughtT[]; owner: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div style={{ padding: 18, background: "#3a2b1f" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <div className="f-disp" style={{ fontSize: 25, lineHeight: 1, color: "#eaddbe" }}>Random thoughts</div>
        <div className="f-hand" style={{ fontSize: 15, color: "rgba(234,221,190,.6)" }}>corner</div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {thoughts.length === 0 && !adding && (
          <div className="f-hand" style={{ fontSize: 18, color: "rgba(234,221,190,.55)" }}>
            {owner ? "nothing here yet, add a thought below" : "quiet in here for now"}
          </div>
        )}
        {thoughts.map((t, i) =>
          owner && editingId === t.id ? (
            <Editor key={t.id} initial={t.text} onDone={() => setEditingId(null)} onSave={(txt) => editThought(t.id, txt)} />
          ) : (
            <div key={t.id} onClick={() => owner && setEditingId(t.id)}
              style={{ position: "relative", padding: "13px 15px", background: PAPERS[i % 4], border: "1px solid rgba(58,43,34,.14)", boxShadow: "0 6px 14px -8px rgba(0,0,0,.5)", transform: `rotate(${ROTS[i % 4]})`, cursor: owner ? "text" : "default" }}
              title={owner ? "click to edit" : undefined}>
              {owner && (
                <button aria-label="delete thought" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this thought?")) removeThought(t.id); }}
                  style={{ position: "absolute", top: 6, right: 9, fontSize: 15, lineHeight: 1, background: "none", border: 0, color: "#846044", cursor: "pointer" }}>×</button>
              )}
              <div className="f-hand" style={{ fontSize: 21, lineHeight: 1.25, color: "#4a3a2c" }}>{t.text}</div>
            </div>
          )
        )}
        {owner && adding && (
          <Editor initial="" onDone={() => setAdding(false)} onSave={(txt) => addThought(txt)} />
        )}
      </div>

      {owner && !adding && (
        <button className="btn" onClick={() => setAdding(true)}
          style={{ marginTop: 12, fontSize: 11, padding: "7px 12px", border: "1px solid rgba(234,221,190,.5)", color: "#eaddbe", background: "transparent", cursor: "pointer" }}>
          + add a thought
        </button>
      )}
    </div>
  );
}

function Editor({ initial, onDone, onSave }: { initial: string; onDone: () => void; onSave: (text: string) => Promise<void> | void }) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!text.trim()) { onDone(); return; }
    setBusy(true);
    await onSave(text.trim());
    setBusy(false); onDone();
  }
  return (
    <div style={{ background: PAPERS[0], border: "1px solid rgba(58,43,34,.2)", padding: "12px 12px 10px" }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus placeholder="a passing thought…"
        className="f-hand" style={{ width: "100%", fontSize: 20, lineHeight: 1.25, color: "#4a3a2c", background: "#f6efdd", border: "1px solid rgba(58,43,34,.25)", padding: "8px 10px", resize: "vertical" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn-accent" style={{ padding: "6px 13px", fontSize: 11, opacity: busy ? 0.6 : 1 }} onClick={save} disabled={busy}>save</button>
        <button className="btn" style={{ padding: "6px 13px", fontSize: 11, background: "transparent", border: "1px solid #846044", color: "#846044", cursor: "pointer" }} onClick={onDone}>cancel</button>
      </div>
    </div>
  );
}
