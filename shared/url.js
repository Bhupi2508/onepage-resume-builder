// URL helpers shared by validation and rendering. Only http(s) links are ever
// rendered as anchors; anything else (javascript:, data:, ...) is rejected.
export function normalizeUrl(value) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
}

export function isSafeUrl(value) {
  const v = String(value ?? "").trim();
  if (!v) return true;
  if (/\s/.test(v)) return false;
  try {
    const u = new URL(normalizeUrl(v));
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export const displayUrl = (value) =>
  String(value ?? "").trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
