import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const owner = (process.env.OWNER_EMAIL || "").toLowerCase();
  const base = process.env.APP_URL || new URL(req.url).origin;

  // Only the owner email gets a link — but always respond the same way.
  if (email && email === owner) {
    const token = randomUUID();
    await prisma.verificationToken.create({
      data: { token, email, expires: new Date(Date.now() + 15 * 60 * 1000) },
    });
    const link = `${base}/api/auth/callback?token=${token}`;
    await sendMagicLink(email, link);
  }
  return NextResponse.redirect(`${base}/login?sent=1`, { status: 303 });
}
