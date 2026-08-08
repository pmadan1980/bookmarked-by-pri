import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(req: Request) {
  const base = process.env.APP_URL || new URL(req.url).origin;
  clearSession();
  return NextResponse.redirect(base + "/", { status: 303 });
}
