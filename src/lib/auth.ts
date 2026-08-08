import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-insecure-secret-change-me");
const COOKIE = "bc_session";

export async function makeToken(payload: Record<string, unknown>, expires: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret);
}

export async function verifyToken<T = Record<string, unknown>>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch {
    return null;
  }
}

export async function setSession(email: string) {
  const token = await makeToken({ email, owner: true }, "30d");
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Server-derived owner state. Never trust the client. */
export async function getOwner(): Promise<{ email: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken<{ email?: string; owner?: boolean }>(token);
  if (!payload?.owner || !payload.email) return null;
  if (payload.email.toLowerCase() !== (process.env.OWNER_EMAIL || "").toLowerCase()) return null;
  return { email: payload.email };
}

export async function isOwner() {
  return (await getOwner()) !== null;
}
