import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "crypto";

/** Stable-ish per-visitor id stored in a cookie (for reaction dedupe). */
export function visitorHash(): string {
  const jar = cookies();
  let id = jar.get("bc_visitor")?.value;
  if (!id) {
    id = randomUUID();
    jar.set("bc_visitor", id, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return createHash("sha256").update(id).digest("hex").slice(0, 24);
}

/** Coarse IP hash for guestbook spam control. */
export function ipHash(): string {
  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}
