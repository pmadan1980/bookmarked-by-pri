export type SearchResult = {
  title: string;
  author: string;
  genre: string;
  coverId: number | null;
  coverUrl: string | null; // medium thumb for the picker
};

export function olCover(id: number, size: "S" | "M" | "L" = "M") {
  return `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;
}

export async function searchOpenLibrary(q: string): Promise<SearchResult[]> {
  const url =
    "https://openlibrary.org/search.json?limit=8&fields=title,author_name,cover_i,subject&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    docs?: Array<{ title?: string; author_name?: string[]; cover_i?: number; subject?: string[] }>;
  };
  return (data.docs || [])
    .filter((d) => d.title)
    .map((d) => ({
      title: d.title as string,
      author: d.author_name?.[0] || "unknown",
      genre: d.subject?.[0]?.toLowerCase().slice(0, 16) || "",
      coverId: d.cover_i ?? null,
      coverUrl: d.cover_i ? olCover(d.cover_i, "M") : null,
    }));
}

/** Best large cover for a known title/author (used when shelving without a chosen cover). */
export async function findCover(title: string, author: string): Promise<string | null> {
  const url =
    "https://openlibrary.org/search.json?limit=1&fields=cover_i&q=" +
    encodeURIComponent(title + " " + author);
  try {
    const res = await fetch(url);
    const data = (await res.json()) as { docs?: Array<{ cover_i?: number }> };
    const id = data.docs?.[0]?.cover_i;
    return id ? olCover(id, "L") : null;
  } catch {
    return null;
  }
}
