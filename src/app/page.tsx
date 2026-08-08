import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getOwner } from "@/lib/auth";
import { SHELVES, wallColor, wallFont, type WallNote, type RecItem } from "@/lib/utils";
import { Decor, FlowerTag } from "@/components/Decor";
import OwnerBadge from "@/components/OwnerBadge";
import BookShelves, { BookT } from "@/components/BookShelves";
import AddBookPanel from "@/components/AddBookPanel";
import GuestbookForm from "@/components/GuestbookForm";
import QuotesList, { QuoteT } from "@/components/QuotesList";
import ThoughtsCorner, { ThoughtT } from "@/components/ThoughtsCorner";
import RecommendPanel from "@/components/RecommendPanel";
import RecommendedShelf from "@/components/RecommendedShelf";
import { Sticker } from "@/components/Sticker";
import { approveNoteAction, rejectNoteAction, hideNoteAction, approveRecAction, rejectRecAction } from "@/app/actions";

export const dynamic = "force-dynamic";
const PAPERS = ["#f4ecdb", "#efe0c8", "#f6efdd", "#ecdcc0"];
const ROTS = ["-1.5deg", "1.2deg", "-0.8deg", "1.8deg", "-2deg", "0.7deg"];

async function readSetting<T>(key: string): Promise<T[]> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return [];
  try { const v = JSON.parse(row.value); return Array.isArray(v) ? (v as T[]) : []; } catch { return []; }
}

export default async function Home() {
  const owner = (await getOwner()) !== null;
  const books = await prisma.book.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "asc" } });
  const wallApproved = await readSetting<WallNote>("wall_approved");
  const wallPending = owner ? await readSetting<WallNote>("wall_pending") : [];
  const recApproved = await readSetting<RecItem>("rec_approved");
  const recPending = owner ? await readSetting<RecItem>("rec_pending") : [];
  const thoughtsRow = await prisma.setting.findUnique({ where: { key: "thoughts" } });
  let thoughts: ThoughtT[] = [];
  try { const v = thoughtsRow ? JSON.parse(thoughtsRow.value) : []; if (Array.isArray(v)) thoughts = v; } catch {}

  const shelvedTitles = books.map((b: { title: string }) => b.title.toLowerCase());

  return (
    <div className="wrap" style={{ position: "relative" }}>
      <div className="sheet">
        <Decor />

        {/* masthead */}
        <div className="masthead hpad" style={{ paddingTop: 30, paddingBottom: 16, position: "relative", zIndex: 2 }}>
          <div className="f-disp mast-title" style={{ marginRight: "auto", lineHeight: 0.92, letterSpacing: "-.01em" }}>
            Bookmarked <span className="f-hand" style={{ color: "#846044", fontSize: 66 }}>by pri</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, paddingBottom: 12 }}>
            <div className="f-hand" style={{ display: "flex", gap: 20, fontSize: 20, color: "#5c4838" }}>
              <span>Shelves</span><span>Underlined</span><span>The wall</span>
            </div>
            <OwnerBadge owner={owner} />
          </div>
        </div>
        <div className="rule" style={{ height: 2, background: "#3a2c22", opacity: 0.8 }} />
        <div className="rule" style={{ height: 1, background: "#3a2c22", marginTop: 3, opacity: 0.3 }} />

        <div className="main-grid hpad vpad" style={{ position: "relative", zIndex: 2 }}>
          <div>
            {/* hero */}
            <div className="hero-grid" style={{ marginBottom: 34 }}>
              <div>
                <h1 className="f-disp hero-title" style={{ lineHeight: 0.94, letterSpacing: "-.015em", margin: 0, maxWidth: "19ch" }}>Coffee stains, dog-ears, and whatever I&apos;m halfway through.</h1>
              </div>
              <div style={{ transform: "rotate(3deg) translateX(-20px)", flex: "none" }}>
                <div style={{ width: 172, padding: "13px 13px 16px", background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 10px 22px rgba(58,43,34,.22)", position: "relative" }}>
                  <div style={{ height: 150, overflow: "hidden", background: "#98a086", position: "relative" }}>
                    <Image src="/pri.jpg" alt="pri" width={172} height={150} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div className="f-hand" style={{ fontSize: 22, textAlign: "center", marginTop: 7, color: "#5c4838" }}>Hiiiii</div>
                </div>
              </div>
            </div>

            <BookShelves books={books as unknown as BookT[]} owner={owner} />

            {/* recommended stack */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <FlowerTag kind="tan" />
                <div className="f-disp" style={{ fontSize: 34, lineHeight: 1 }}>Recommended</div>
                <div style={{ flex: 1, borderBottom: "1px dotted rgba(58,43,34,.35)", transform: "translateY(-6px)" }} />
                <div className="f-hand" style={{ fontSize: 18, color: "#8a7660" }}>{recApproved.length}, and counting</div>
              </div>
              <RecommendedShelf items={recApproved} owner={owner} />

              {owner && recPending.length > 0 && (
                <div style={{ marginTop: 16, padding: 16, background: "#f4ecdb", border: "1px dashed rgba(132,96,68,.5)" }}>
                  <div className="f-disp" style={{ fontSize: 22, marginBottom: 10 }}>Recommendations waiting</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {recPending.map((r: RecItem) => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", background: "#e6d8bd" }}>
                        {r.coverUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.coverUrl} alt="" referrerPolicy="no-referrer" style={{ width: 30, height: 44, objectFit: "cover", border: "1px solid rgba(58,43,34,.2)", flex: "none" }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="f-disp" style={{ fontSize: 16, lineHeight: 1.05 }}>{r.title}</div>
                          <div className="f-mono" style={{ fontSize: 10, color: "#8a7660", marginTop: 2 }}>{r.author} · by {r.by}</div>
                        </div>
                        <form action={approveRecAction}><input type="hidden" name="id" value={r.id} /><button className="btn" style={{ padding: "7px 11px", fontSize: 11, background: "#6f7a5f", color: "#f4f1e6", border: "1px solid #59634b", cursor: "pointer" }}>approve</button></form>
                        <form action={rejectRecAction}><input type="hidden" name="id" value={r.id} /><button className="btn" style={{ padding: "7px 11px", fontSize: 11, background: "transparent", border: "1px solid #a76d5e", color: "#8a4a3b", cursor: "pointer" }}>reject</button></form>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 18, maxWidth: 420 }}>
                <RecommendPanel />
              </div>
            </div>

            {/* lines i underlined */}
            <div style={{ marginBottom: 38 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <FlowerTag kind="rose" />
                <div className="f-disp" style={{ fontSize: 34, lineHeight: 1 }}>Lines I underlined</div>
                <div style={{ flex: 1, borderBottom: "1px dotted rgba(58,43,34,.35)", transform: "translateY(-6px)" }} />
              </div>
              <QuotesList quotes={quotes as QuoteT[]} owner={owner} />
            </div>
          </div>

          {/* sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {owner && <AddBookPanel shelvedTitles={shelvedTitles} />}

            {owner && wallPending.length > 0 && (
              <div style={{ padding: 18, background: "#f4ecdb", border: "1px solid rgba(58,43,34,.18)", boxShadow: "0 8px 20px -10px rgba(58,43,34,.4)" }}>
                <div className="f-disp" style={{ fontSize: 25, lineHeight: 1, marginBottom: 12 }}>Waiting for you</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {wallPending.map((n: WallNote) => (
                    <div key={n.id} style={{ padding: "12px 14px", background: "#e6d8bd", border: "1px dashed rgba(132,96,68,.5)" }}>
                      <div className="f-hand" style={{ fontSize: 22 }}>{n.name}</div>
                      <div className="f-body" style={{ fontSize: 15, color: "#4a3a2c", margin: "5px 0 9px" }}>{n.body}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <form action={approveNoteAction} style={{ flex: 1 }}><input type="hidden" name="id" value={n.id} /><button className="btn" style={{ width: "100%", padding: 7, fontSize: 11, background: "#6f7a5f", color: "#f4f1e6", border: "1px solid #59634b", cursor: "pointer" }}>approve</button></form>
                        <form action={rejectNoteAction} style={{ flex: 1 }}><input type="hidden" name="id" value={n.id} /><button className="btn" style={{ width: "100%", padding: 7, fontSize: 11, background: "transparent", border: "1px solid #a76d5e", color: "#8a4a3b", cursor: "pointer" }}>reject</button></form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ThoughtsCorner thoughts={thoughts} owner={owner} />

            <div style={{ padding: 18, border: "1px solid #98a086", background: "rgba(152,160,134,.12)" }}>
              <div className="f-hand" style={{ fontSize: 18, color: "#6f7a5f" }}>on a kick about</div>
              <div className="f-disp" style={{ fontSize: 28, lineHeight: 1.1, marginTop: 5 }}>Novels where nothing happens, beautifully.</div>
            </div>
          </div>
        </div>

        {/* the wall */}
        <div className="hpad" style={{ background: "#dbc8a7", paddingTop: 36, paddingBottom: 44, borderTop: "1px solid rgba(58,43,34,.18)", position: "relative", zIndex: 2 }}>
          <div className="main-grid" style={{ alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <FlowerTag kind="sage" />
                <div className="f-disp" style={{ fontSize: 44, lineHeight: 1 }}>The wall</div>
                <div style={{ flex: 1, borderBottom: "1px dotted rgba(58,43,34,.35)", transform: "translateY(-8px)" }} />
              </div>
              <p className="f-body" style={{ fontSize: 17, color: "#5c4838", margin: "0 0 20px", maxWidth: "56ch" }}>Leave me recommendations, thoughts, anything :))</p>
              <div className="wall-notes">
                {wallApproved.length === 0 ? (
                  <div style={{ position: "relative", padding: "18px 20px 16px", background: PAPERS[0], border: "1px solid rgba(58,43,34,.14)", boxShadow: "0 7px 16px -9px rgba(58,43,34,.4)", transform: "rotate(-1.2deg)", gridColumn: "1/-1", maxWidth: 440 }}>
                    <div className="f-hand" style={{ fontSize: 24, color: "#5c4838" }}>The wall is bare for now.</div>
                    <div className="f-body" style={{ fontSize: 15.5, color: "#4a3a2c", marginTop: 6 }}>Be the first to leave a note, I&apos;ll pin it up once I&apos;ve read it.</div>
                  </div>
                ) : wallApproved.map((n: WallNote, i: number) => {
                  const wf = wallFont(n.font);
                  return (
                  <div key={n.id} style={{ position: "relative", padding: "18px 20px 16px", background: wallColor(n.color), border: "1px solid rgba(58,43,34,.14)", boxShadow: "0 7px 16px -9px rgba(58,43,34,.4)", transform: `rotate(${ROTS[(i * 3) % ROTS.length]})` }}>
                    <div style={{ position: "absolute", top: -8, left: 26, width: 52, height: 16, background: "rgba(255,250,240,.7)", border: "1px solid rgba(58,43,34,.1)", transform: "rotate(-3deg)" }} />
                    {owner && (
                      <form action={hideNoteAction} style={{ position: "absolute", top: 8, right: 10 }}>
                        <input type="hidden" name="id" value={n.id} />
                        <button className="f-mono" style={{ fontSize: 11, background: "none", border: 0, borderBottom: "1px solid #846044", color: "#846044", cursor: "pointer", padding: 0 }}>remove</button>
                      </form>
                    )}
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: wf.css, fontSize: wf.size, lineHeight: 1.4, color: "#4a3a2c" }}>{n.body}</div>
                      <div className="f-hand" style={{ fontSize: 18, color: "#8a7660", marginTop: 8 }}>&mdash; {n.name}</div>
                    </div>
                    {n.stickers?.map((st, si) => (
                      <div key={si} style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 2 }}>
                        <Sticker kind={st.kind} size={30} />
                      </div>
                    ))}
                  </div>
                  );
                })}
              </div>
            </div>
            <GuestbookForm />
          </div>
        </div>

        {/* footer */}
        <div className="hpad" style={{ background: "#3a2b1f", color: "#e6d7b8", paddingTop: 22, paddingBottom: 22, display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          <div className="f-hand" style={{ fontSize: 24, marginRight: "auto" }}>Bookmarked by pri</div>
          <div className="f-mono" style={{ fontSize: 11, opacity: 0.7 }}>{books.length} books shelved · {wallApproved.length} notes on the wall</div>
        </div>
      </div>
    </div>
  );
}
