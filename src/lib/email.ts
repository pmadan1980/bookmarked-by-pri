import { Resend } from "resend";

export async function sendMagicLink(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Bookmarked <onboarding@resend.dev>";
  if (!key) {
    // Dev fallback: no email provider configured — print the link so you can sign in locally.
    console.log("\n\u2709  MAGIC LINK (dev, no RESEND_API_KEY set):\n   " + link + "\n");
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to,
    subject: "Your sign-in link for Bookmarked",
    html:
      '<div style="font-family:Georgia,serif;color:#3a2c22;font-size:16px;line-height:1.6">' +
      '<p>Here\u2019s your one-time link to sign in as the owner:</p>' +
      '<p><a href="' + link + '" style="color:#846044">Sign in \u2192</a></p>' +
      '<p style="color:#8a7660;font-size:13px">This link expires in 15 minutes. If you didn\u2019t request it, ignore this email.</p>' +
      "</div>",
  });
}
