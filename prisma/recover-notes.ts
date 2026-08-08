/**
 * One-off recovery: pulls any notes from the old `notes` table back onto the wall
 * (which now lives in the Setting store), and prints the current wall so you can see it.
 * Run once:  DATABASE_URL="<your-neon-url>" npx tsx prisma/recover-notes.ts
 * Safe to run more than once — it won't create duplicates.
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
const prisma = new PrismaClient();

type WallNote = { id: string; name: string; body: string; color: string; font: string; stickers: unknown[]; ts: number };

async function readJSON(key: string): Promise<WallNote[]> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return [];
  try { const v = JSON.parse(row.value); return Array.isArray(v) ? v : []; } catch { return []; }
}
async function writeJSON(key: string, list: WallNote[]) {
  await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(list) }, create: { key, value: JSON.stringify(list) } });
}

async function main() {
  const approved = await readJSON("wall_approved");
  const pending = await readJSON("wall_pending");

  let oldNotes: Array<{ name: string; body: string; approved: boolean; hidden: boolean; createdAt: Date }> = [];
  try {
    oldNotes = await prisma.note.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    console.log("• No old `notes` table reachable — skipping migration step.");
  }

  const seen = new Set([...approved, ...pending].map((n) => `${n.name}|${n.body}`));
  let addedA = 0, addedP = 0;
  for (const n of oldNotes) {
    const key = `${n.name}|${n.body}`;
    if (seen.has(key)) continue;
    const item: WallNote = {
      id: randomUUID(),
      name: n.name || "a stranger",
      body: n.body,
      color: "cream",
      font: "hand",
      stickers: [],
      ts: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
    };
    if (n.approved && !n.hidden) { approved.push(item); addedA++; }
    else { pending.push(item); addedP++; }
    seen.add(key);
  }
  approved.sort((a, b) => b.ts - a.ts);
  pending.sort((a, b) => b.ts - a.ts);
  if (addedA || addedP) { await writeJSON("wall_approved", approved); await writeJSON("wall_pending", pending); }

  console.log(`\nFound ${oldNotes.length} note(s) in the old table.`);
  console.log(`Recovered: ${addedA} onto the wall, ${addedP} into your pending queue (already-present ones skipped).\n`);
  console.log(`--- ON THE WALL NOW (${approved.length}) ---`);
  approved.forEach((n) => console.log(`   "${n.body}"  — ${n.name}`));
  console.log(`\n--- WAITING FOR YOUR APPROVAL (${pending.length}) ---`);
  pending.forEach((n) => console.log(`   "${n.body}"  — ${n.name}`));
  console.log("");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
