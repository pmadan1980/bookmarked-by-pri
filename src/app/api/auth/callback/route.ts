import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function GET(req: Request) {
  const base = process.env.APP_URL || new URL(req.url).origin;
  const token = new URL(req.url).searchParams.get("token") || "";
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || row.expires < new Date()) {
    return NextResponse.redirect(`${base}/login?error=expired`, { status: 303 });
  }
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  await setSession(row.email);
  return NextResponse.redirect(base + "/", { status: 303 });
}
