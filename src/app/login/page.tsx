export const dynamic = "force-dynamic";

export default function Login({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const sent = searchParams.sent === "1";
  const error = searchParams.error;
  return (
    <div className="wrap" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="sheet" style={{ width: 460, maxWidth: "94vw", padding: "40px 40px 44px" }}>
        <div className="f-disp" style={{ fontSize: 42, lineHeight: 0.95 }}>
          Bookmarked <span className="f-hand" style={{ color: "#846044" }}>by pri</span>
        </div>
        <div className="f-hand" style={{ fontSize: 20, color: "#5c4838", margin: "10px 0 22px" }}>owner sign-in</div>

        {sent ? (
          <p className="f-body" style={{ fontSize: 17, color: "#4a3a2c" }}>
            If that address is the owner&apos;s, a sign-in link is on its way. Check your email (and, in local dev, the terminal).
          </p>
        ) : (
          <form action="/api/auth/request" method="post">
            <label className="flabel" htmlFor="email" style={{ marginBottom: 6 }}>your email</label>
            <input className="txt" id="email" name="email" type="email" required placeholder="you@example.com" />
            <button className="btn btn-accent" style={{ width: "100%", marginTop: 14, padding: 12, fontSize: 12, letterSpacing: ".1em" }}>send me a link</button>
            {error === "expired" && <div className="f-hand" style={{ fontSize: 17, color: "#8a4a3b", marginTop: 10 }}>That link expired, request a fresh one.</div>}
          </form>
        )}
        <div style={{ marginTop: 22 }}><a href="/" className="f-mono" style={{ fontSize: 12 }}>← back to the shelves</a></div>
      </div>
    </div>
  );
}
