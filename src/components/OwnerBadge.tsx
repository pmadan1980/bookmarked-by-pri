import Link from "next/link";

export default function OwnerBadge({ owner }: { owner: boolean }) {
  if (!owner) {
    return (
      <Link href="/login" className="btn" style={{ fontSize: 12, padding: "9px 13px", background: "transparent", color: "#5c4838", border: "1px solid #846044", display: "inline-block" }}>
        log in as owner
      </Link>
    );
  }
  return (
    <form action="/api/auth/signout" method="post">
      <button className="btn" type="submit" style={{ fontSize: 12, padding: "9px 13px", background: "#846044", color: "#f6eedd", border: "1px solid #5f4530", cursor: "pointer" }}>
        owner mode: on
      </button>
    </form>
  );
}
