import { NextResponse } from "next/server";
import { searchOpenLibrary } from "@/lib/covers";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await searchOpenLibrary(q);
  return NextResponse.json({ results });
}
