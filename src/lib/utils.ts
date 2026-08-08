export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80) || "book";
}

export const SHELVES = [
  { id: "reading", label: "Currently reading", short: "Currently reading", meta: "slowly, on purpose" },
  { id: "finished", label: "Finished", short: "Finished", meta: "verdict attached" },
  { id: "tbr", label: "The stack", short: "TBR", meta: "growing, always" },
] as const;

export type ShelfId = (typeof SHELVES)[number]["id"];
export function shelfLabel(id: string) {
  return SHELVES.find((s) => s.id === id)?.label ?? id;
}

// ---- wall note styling options (shared by the form and the render) ----
export const WALL_COLORS = [
  { id: "cream", bg: "#f4ecdb" },
  { id: "rose", bg: "#f3ded7" },
  { id: "sage", bg: "#e5ead8" },
  { id: "sky", bg: "#dde6ee" },
  { id: "butter", bg: "#f7efc8" },
  { id: "lilac", bg: "#e9e1f0" },
] as const;
export const WALL_FONTS = [
  { id: "hand", label: "handwritten", css: "var(--f-hand)", size: 22 },
  { id: "serif", label: "serif", css: "var(--f-disp)", size: 17 },
  { id: "type", label: "typewriter", css: "var(--f-mono)", size: 13 },
] as const;
export function wallColor(id?: string) { return WALL_COLORS.find((c) => c.id === id)?.bg || WALL_COLORS[0].bg; }
export function wallFont(id?: string) { return WALL_FONTS.find((f) => f.id === id) || WALL_FONTS[0]; }

export const STICKER_KINDS = ["flower-rose","flower-daisy","cat","bunny","bird","heart","star","sparkle","scribble","underline","swirl"] as const;
export type StickerKind = (typeof STICKER_KINDS)[number];
export type Sticker = { kind: string; x: number; y: number };
export type WallNote = { id: string; name: string; body: string; color: string; font: string; stickers?: Sticker[]; ts: number };
export type RecItem = { id: string; title: string; author: string; genre: string; coverUrl: string | null; by: string; ts: number };
