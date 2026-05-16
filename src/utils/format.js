export function formatPhone(v) {
  const s = String(v || "").replace(/\D/g, "");
  if (s.length !== 10) return v;
  return `${s.slice(0, 5)} ${s.slice(5)}`;
}
