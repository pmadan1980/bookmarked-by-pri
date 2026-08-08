"use server";

import { prisma } from "@/lib/prisma";
import { getOwner } from "@/lib/auth";
import { visitorHash } from "@/lib/visitor";
import { findCover, olCover } from "@/lib/covers";
import { slugify, STICKER_KINDS, type WallNote, type RecItem, type Sticker } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function requireOwner() {
  if (!(await getOwner())) throw new Error("Not authorized");
}

// ---- generic JSON-in-Setting store (avoids DB migrations for lightweight lists) ----
async function readJSON<T>(key: string): Promise<T[]> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return [];
  try { const v = JSON.parse(row.value); return Array.isArray(v) ? (v as T[]) : []; } catch { return []; }
}
async function writeJSON(key: string, list: unknown[]) {
  await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(list) }, create: { key, value: JSON.stringify(list) } });
  revalidatePath("/");
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base;
  let n = 1;
  // ensure uniqueness
  while (true) {
    const found = await prisma.book.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${++n}`;
  }
}

export async function addBook(input: {
  title: string;
  author: string;
  genre?: string;
  shelf: string;
  verdict?: string;
  coverId?: number | null;
  useRealCover?: boolean;
}) {
  await requireOwner();
  const title = input.title.trim();
  const author = input.author.trim();
  if (!title) return;
  let coverUrl: string | null = null;
  if (input.useRealCover && input.coverId) coverUrl = olCover(input.coverId, "L");
  else coverUrl = await findCover(title, author);
  const slug = await uniqueSlug(slugify(title));
  await prisma.book.create({
    data: {
      title,
      author: author || "unknown",
      genre: (input.genre || "unfiled").trim() || "unfiled",
      shelf: input.shelf,
      verdict: (input.verdict || "").trim() || "no verdict yet",
      rating: input.shelf === "tbr" ? "unread" : "★★★★☆",
      coverUrl,
      slug,
      finishedAt: input.shelf === "finished" ? new Date() : null,
    },
  });
  revalidatePath("/");
}

export async function editBook(input: {
  id: string;
  title: string;
  author: string;
  genre: string;
  verdict: string;
  rating: string;
  shelf: string;
}) {
  await requireOwner();
  const existing = await prisma.book.findUnique({ where: { id: input.id } });
  if (!existing) return;
  const slug =
    input.title.trim() && input.title.trim() !== existing.title
      ? await uniqueSlug(slugify(input.title.trim()), existing.id)
      : existing.slug;
  await prisma.book.update({
    where: { id: input.id },
    data: {
      title: input.title.trim() || existing.title,
      author: input.author.trim() || existing.author,
      genre: input.genre.trim() || existing.genre,
      verdict: input.verdict.trim() || "no verdict yet",
      rating: input.rating,
      shelf: input.shelf,
      slug,
      finishedAt: input.shelf === "finished" ? existing.finishedAt ?? new Date() : null,
    },
  });
  revalidatePath("/");
}

export async function moveBook(id: string, shelf: string) {
  await requireOwner();
  await prisma.book.update({
    where: { id },
    data: { shelf, finishedAt: shelf === "finished" ? new Date() : null },
  });
  revalidatePath("/");
}

export async function removeBook(id: string) {
  await requireOwner();
  await prisma.book.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
}

export async function addQuote(text: string, source: string, bookId?: string) {
  await requireOwner();
  const t = text.trim();
  if (!t) return;
  await prisma.quote.create({
    data: { text: `\u201c${t.replace(/^[\u201c\u201d"]+|[\u201c\u201d"]+$/g, "")}\u201d`, source: source.trim(), bookId: bookId || null },
  });
  revalidatePath("/");
}

export async function removeQuote(id: string) {
  await requireOwner();
  await prisma.quote.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
}

// ---- the wall: public notes held for approval, stored in Setting JSON ----
export async function submitNote(input: { name: string; body: string; color?: string; font?: string; stickers?: Sticker[]; website?: string }) {
  if (input.website && input.website.trim() !== "") return { ok: true }; // honeypot -> silent no-op
  const body = input.body.trim();
  if (!body) return { ok: false };
  const pending = await readJSON<WallNote>("wall_pending");
  if (pending.length > 80) return { ok: false, error: "The queue is full right now, try later." };
  const allowed = new Set<string>(STICKER_KINDS as readonly string[]);
  const stickers: Sticker[] = Array.isArray(input.stickers)
    ? input.stickers
        .filter((st) => st && allowed.has(st.kind))
        .slice(0, 14)
        .map((st) => ({ kind: st.kind, x: Math.max(0, Math.min(100, Number(st.x) || 50)), y: Math.max(0, Math.min(100, Number(st.y) || 50)) }))
    : [];
  pending.unshift({
    id: randomUUID(),
    name: input.name.trim() || "a stranger",
    body,
    color: input.color || "cream",
    font: input.font || "hand",
    stickers,
    ts: Date.now(),
  });
  await writeJSON("wall_pending", pending);
  return { ok: true };
}
export async function approveNote(id: string) {
  await requireOwner();
  const pending = await readJSON<WallNote>("wall_pending");
  const item = pending.find((n) => n.id === id);
  if (!item) return;
  await writeJSON("wall_pending", pending.filter((n) => n.id !== id));
  const approved = await readJSON<WallNote>("wall_approved");
  approved.unshift(item);
  await writeJSON("wall_approved", approved);
}
export async function rejectNote(id: string) {
  await requireOwner();
  const pending = await readJSON<WallNote>("wall_pending");
  await writeJSON("wall_pending", pending.filter((n) => n.id !== id));
}
export async function hideNote(id: string) {
  await requireOwner();
  const approved = await readJSON<WallNote>("wall_approved");
  await writeJSON("wall_approved", approved.filter((n) => n.id !== id));
}

// ---- recommendations: public suggestions held for approval ----
export async function submitRecommendation(input: { title: string; author: string; genre?: string; coverUrl?: string | null; by: string; website?: string }) {
  if (input.website && input.website.trim() !== "") return { ok: true }; // honeypot
  const title = input.title.trim();
  if (!title) return { ok: false };
  const pending = await readJSON<RecItem>("rec_pending");
  if (pending.length > 80) return { ok: false, error: "The queue is full right now, try later." };
  pending.unshift({
    id: randomUUID(),
    title,
    author: input.author.trim() || "unknown",
    genre: (input.genre || "").trim(),
    coverUrl: input.coverUrl || null,
    by: input.by.trim() || "a reader",
    ts: Date.now(),
  });
  await writeJSON("rec_pending", pending);
  return { ok: true };
}
export async function approveRecommendation(id: string) {
  await requireOwner();
  const pending = await readJSON<RecItem>("rec_pending");
  const item = pending.find((r) => r.id === id);
  if (!item) return;
  await writeJSON("rec_pending", pending.filter((r) => r.id !== id));
  const approved = await readJSON<RecItem>("rec_approved");
  approved.unshift(item);
  await writeJSON("rec_approved", approved);
}
export async function rejectRecommendation(id: string) {
  await requireOwner();
  const pending = await readJSON<RecItem>("rec_pending");
  await writeJSON("rec_pending", pending.filter((r) => r.id !== id));
}
export async function removeRecommendation(id: string) {
  await requireOwner();
  const approved = await readJSON<RecItem>("rec_approved");
  await writeJSON("rec_approved", approved.filter((r) => r.id !== id));
}

// ---- reactions (public, one per visitor per kind) ----
export async function react(bookId: string, kind: string) {
  const v = visitorHash();
  try {
    await prisma.reaction.create({ data: { bookId, kind, visitorHash: v } });
  } catch {
    // unique constraint -> already reacted; ignore
  }
  revalidatePath("/");
  revalidatePath(`/books`);
}

// ---- FormData wrappers (let simple UIs work as plain <form action>) ----
export async function approveNoteAction(fd: FormData) { await approveNote(String(fd.get("id"))); }
export async function rejectNoteAction(fd: FormData) { await rejectNote(String(fd.get("id"))); }
export async function hideNoteAction(fd: FormData) { await hideNote(String(fd.get("id"))); }
export async function approveRecAction(fd: FormData) { await approveRecommendation(String(fd.get("id"))); }
export async function rejectRecAction(fd: FormData) { await rejectRecommendation(String(fd.get("id"))); }
export async function removeBookAction(fd: FormData) { await removeBook(String(fd.get("id"))); }
export async function removeQuoteAction(fd: FormData) { await removeQuote(String(fd.get("id"))); }
export async function moveBookAction(fd: FormData) { await moveBook(String(fd.get("id")), String(fd.get("shelf"))); }
export async function addQuoteAction(fd: FormData) {
  await addQuote(String(fd.get("text") || ""), String(fd.get("source") || ""));
}

export async function editQuote(input: { id: string; text: string; source: string }) {
  await requireOwner();
  const t = input.text.trim();
  if (!t) return;
  await prisma.quote.update({
    where: { id: input.id },
    data: { text: `\u201c${t.replace(/^[\u201c\u201d"]+|[\u201c\u201d"]+$/g, "")}\u201d`, source: input.source.trim() },
  });
  revalidatePath("/");
}

// ---- random thoughts (owner-only), stored as JSON in the Setting table (no migration needed) ----

type Thought = { id: string; text: string };

async function readThoughts(): Promise<Thought[]> {
  const row = await prisma.setting.findUnique({ where: { key: "thoughts" } });
  if (!row) return [];
  try { const v = JSON.parse(row.value); return Array.isArray(v) ? v : []; } catch { return []; }
}
async function writeThoughts(list: Thought[]) {
  await prisma.setting.upsert({
    where: { key: "thoughts" },
    update: { value: JSON.stringify(list) },
    create: { key: "thoughts", value: JSON.stringify(list) },
  });
  revalidatePath("/");
}
export async function addThought(text: string) {
  await requireOwner();
  const t = text.trim(); if (!t) return;
  const list = await readThoughts();
  list.unshift({ id: randomUUID(), text: t });
  await writeThoughts(list);
}
export async function editThought(id: string, text: string) {
  await requireOwner();
  const t = text.trim(); if (!t) return;
  const list = await readThoughts().then((l) => l.map((x) => (x.id === id ? { ...x, text: t } : x)));
  await writeThoughts(list);
}
export async function removeThought(id: string) {
  await requireOwner();
  const list = await readThoughts().then((l) => l.filter((x) => x.id !== id));
  await writeThoughts(list);
}
