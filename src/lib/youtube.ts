const HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"];
const ID = /^[A-Za-z0-9_-]{11}$/;

/** Returns a privacy-friendly embed URL for a YouTube link, or null if it isn't one. */
export function youtubeEmbedUrl(input?: string): string | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (!HOSTS.includes(url.hostname.toLowerCase())) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  if (url.hostname.toLowerCase().endsWith("youtu.be")) id = parts[0];
  else if (parts[0] === "watch") id = url.searchParams.get("v") ?? undefined;
  else if (["embed", "shorts", "live", "v"].includes(parts[0])) id = parts[1];
  if (!id || !ID.test(id)) return null;
  const start = parseInt(url.searchParams.get("t") ?? url.searchParams.get("start") ?? "", 10);
  return `https://www.youtube-nocookie.com/embed/${id}${start > 0 ? `?start=${start}` : ""}`;
}
