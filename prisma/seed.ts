import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";
const prisma = new PrismaClient();

const olSearch = async (title: string, author: string): Promise<string | null> => {
  try {
    const r = await fetch("https://openlibrary.org/search.json?limit=1&fields=cover_i&q=" + encodeURIComponent(title + " " + author));
    const d = (await r.json()) as { docs?: Array<{ cover_i?: number }> };
    const id = d.docs?.[0]?.cover_i;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
  } catch { return null; }
};

const BOOKS = [
  { shelf: "reading", title: "The Wedding People", author: "Alison Espach", genre: "contemporary", verdict: "funnier than the premise deserves", rating: "★★★★☆" },
  { shelf: "finished", title: "East of Eden", author: "John Steinbeck", genre: "classic", verdict: "601 pages, not one wasted", rating: "★★★★★" },
  { shelf: "finished", title: "Normal People", author: "Sally Rooney", genre: "literary", verdict: "two people, endlessly mistiming", rating: "★★★★☆" },
  { shelf: "finished", title: "Never Lie", author: "Freida McFadden", genre: "thriller", verdict: "silly, and I finished it in a day", rating: "★★★☆☆" },
  { shelf: "tbr", title: "The Bell Jar", author: "Sylvia Plath", genre: "classic", verdict: "waiting for the right week", rating: "unread" },
  { shelf: "tbr", title: "Wuthering Heights", author: "Emily Brontë", genre: "classic", verdict: "everyone says they're all awful. good.", rating: "unread" },
];

async function main() {
  const count = await prisma.book.count();
  if (count > 0) { console.log("Books already exist, skipping seed."); return; }
  for (const b of BOOKS) {
    const cover = await olSearch(b.title, b.author);
    await prisma.book.create({
      data: { ...b, coverUrl: cover, slug: slugify(b.title), finishedAt: b.shelf === "finished" ? new Date() : null },
    });
  }
  const eoe = await prisma.book.findFirst({ where: { title: "East of Eden" } });
  await prisma.quote.create({ data: { bookId: eoe?.id, text: "\u201cAnd now that you don't have to be perfect, you can be good.\u201d", source: "East of Eden, p. 449" } });
  const np = await prisma.book.findFirst({ where: { title: "Normal People" } });
  await prisma.quote.create({ data: { bookId: np?.id, text: "\u201cIt was culture, not nature, that made people cruel to each other.\u201d", source: "Normal People, underlined twice" } });
  await prisma.setting.createMany({ data: [
    { key: "owner_name", value: "pri" }, { key: "goal", value: "40" },
    { key: "kick_line", value: "Novels where nothing happens, beautifully." },
  ] });
  console.log("Seeded " + BOOKS.length + " books + 2 quotes. The wall starts empty.");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
