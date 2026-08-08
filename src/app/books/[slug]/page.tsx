import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { visitorHash } from "@/lib/visitor";
import Reactions from "@/components/Reactions";
import { FlowerTag } from "@/components/Decor";

export const dynamic = "force-dynamic";
const KINDS = ["same!", "on my TBR now", "wrecked me", "overrated?"];

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await prisma.book.findUnique({ where: { slug: params.slug }, include: { quotes: true } });
  if (!book) notFound();
  const v = visitorHash();
  const rows = await prisma.reaction.findMany({ where: { bookId: book.id } });
  const counts: Record<string, number> = {};
  const reacted: string[] = [];
  for (const k of KINDS) counts[k] = 0;
  for (const r of rows) { counts[r.kind] = (counts[r.kind] || 0) + 1; if (r.visitorHash === v) reacted.push(r.kind); }

  return (
    <div className="wrap" style={{ position: "relative" }}>
      <div className="sheet">
        <div className="hpad" style={{ paddingTop: 26, paddingBottom: 16, position: "relative", zIndex: 2 }}>
          <Link href="/" className="f-mono" style={{ fontSize: 12 }}>← back to the shelves</Link>
        </div>
        <div className="rule" style={{ height: 2, background: "#3a2c22", opacity: 0.8 }} />
        <div className="book-hero-grid hpad" style={{ paddingTop: 34, paddingBottom: 60, position: "relative", zIndex: 2 }}>
          <div style={{ position: "relative", height: 300, width: "100%", maxWidth: 220, background: "linear-gradient(160deg,#c4a071,#846044)", border: "1px solid rgba(58,43,34,.3)", boxShadow: "0 14px 26px -12px rgba(58,43,34,.6)", transform: "rotate(-2deg)", overflow: "hidden" }}>
            {book.coverUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={book.coverUrl} alt={`${book.title} cover`} referrerPolicy="no-referrer" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : (
                <div style={{ position: "absolute", inset: "22px 20px 22px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div className="f-hand" style={{ fontSize: 18, color: "rgba(36,22,17,.65)" }}>{book.genre}</div>
                  <div><div className="f-disp" style={{ fontSize: 30, lineHeight: 1, color: "#241611" }}>{book.title}</div>
                    <div className="f-hand" style={{ fontSize: 18, color: "rgba(36,22,17,.65)", marginTop: 6 }}>{book.author}</div></div>
                </div>
              )}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: "linear-gradient(90deg,rgba(36,22,17,.34),rgba(36,22,17,.05))" }} />
          </div>
          <div>
            <div className="f-hand" style={{ fontSize: 18, color: "#8a7660" }}>{book.genre}{book.rating !== "unread" ? `, ${book.rating}` : ", on the stack"}</div>
            <h1 className="f-disp" style={{ fontSize: 52, lineHeight: 0.98, margin: "6px 0 2px" }}>{book.title}</h1>
            <div className="f-hand" style={{ fontSize: 22, color: "#5c4838" }}>{book.author}</div>
            <p className="f-body" style={{ fontSize: 18, lineHeight: 1.6, color: "#4a3a2c", maxWidth: "52ch", margin: "14px 0 20px" }}>{book.verdict}</p>
            <Reactions bookId={book.id} counts={counts} reacted={reacted} />
          </div>
          <div className="ruled" style={{ padding: "18px 20px", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: -10 }}><FlowerTag kind="tan" /></div>
            <div className="f-hand" style={{ fontSize: 18, color: "#8a7660", marginBottom: 6 }}>underlined here</div>
            {book.quotes.length === 0 && <div className="f-body" style={{ fontSize: 15, color: "#5c4838" }}>Nothing marked yet.</div>}
            {book.quotes.map((q: { id: string; text: string; source: string }) => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <div className="f-hand" style={{ fontSize: 22, lineHeight: 1.2, color: "#5f4530" }}>{q.text}</div>
                <div className="f-hand" style={{ fontSize: 15, color: "#a08c72", marginTop: 4 }}>{q.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
