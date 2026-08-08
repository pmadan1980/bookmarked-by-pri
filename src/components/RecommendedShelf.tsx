"use client";
import { RecItem } from "@/lib/utils";
import { removeRecommendation } from "@/app/actions";

const COVERS = ["linear-gradient(160deg,#d8c3a0,#c4a071)", "linear-gradient(160deg,#b3bda6,#98a086)", "linear-gradient(160deg,#c48f7d,#a76d5e)"];
const ROTS = ["-1.5deg", "1.2deg", "-0.8deg", "1.8deg", "-2deg", "0.7deg"];
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function stepCover(img: HTMLImageElement) {
  const s = img.getAttribute("src") || "";
  if (/-L\.jpg$/.test(s)) { img.src = s.replace("-L.jpg", "-M.jpg"); return; }
  if (/-M\.jpg$/.test(s)) { img.src = s.replace("-M.jpg", "-S.jpg"); return; }
  img.style.display = "none";
  const j = img.closest(".jacket") as HTMLElement | null;
  if (j) j.style.background = COVERS[1];
}

export default function RecommendedShelf({ items, owner }: { items: RecItem[]; owner: boolean }) {
  if (items.length === 0) {
    return <div className="f-hand" style={{ fontSize: 20, color: "#8a7660" }}>Nothing here yet. Recommend me something below and I&apos;ll add the good ones.</div>;
  }
  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start", paddingBottom: 12, borderBottom: "5px solid #846044", boxShadow: "0 7px 12px -7px rgba(58,43,34,.5)" }}>
      {items.map((r, i) => (
        <div key={r.id} className="book" style={{ width: 132 }}>
          <div className="jacket" style={{ background: r.coverUrl ? "transparent" : COVERS[Math.abs(hash(r.id)) % COVERS.length], transform: `rotate(${ROTS[Math.abs(hash(r.id)) % ROTS.length]})` }}>
            {r.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.coverUrl} alt={`${r.title} cover`} referrerPolicy="no-referrer" draggable={false} onError={(e) => stepCover(e.currentTarget)} />
            )}
            <div className="spine" /><div className="tape" />
          </div>
          <div className="f-disp" style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.08, color: "#3a2c22", marginTop: 11 }}>{r.title}</div>
          <div className="f-mono" style={{ fontSize: 9.5, color: "#8a7660", marginTop: 3 }}>{r.author}</div>
          <div className="f-hand" style={{ fontSize: 17, lineHeight: 1.2, color: "#5c4838", marginTop: 6 }}>recommended by {r.by}</div>
          {owner && (
            <button onClick={() => { if (confirm(`Remove “${r.title}” from recommended?`)) removeRecommendation(r.id); }}
              className="f-mono" style={{ marginTop: 6, fontSize: 11, background: "none", border: 0, borderBottom: "1px solid #846044", color: "#846044", cursor: "pointer", padding: 0 }}>remove</button>
          )}
        </div>
      ))}
    </div>
  );
}
