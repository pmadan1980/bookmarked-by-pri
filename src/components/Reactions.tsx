"use client";
import { useState } from "react";
import { react } from "@/app/actions";

export default function Reactions({ bookId, counts, reacted }: { bookId: string; counts: Record<string, number>; reacted: string[] }) {
  const LABELS = ["same!", "on my TBR now", "wrecked me", "overrated?"];
  const [c, setC] = useState<Record<string, number>>(counts);
  const [done, setDone] = useState<string[]>(reacted);
  async function hit(k: string) {
    if (done.includes(k)) return;
    setDone([...done, k]); setC({ ...c, [k]: (c[k] || 0) + 1 });
    await react(bookId, k);
  }
  return (
    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
      {LABELS.map((k) => (
        <button key={k} className={"pill" + (done.includes(k) ? " hit" : "")} onClick={() => hit(k)}>{k} · {c[k] || 0}</button>
      ))}
    </div>
  );
}
