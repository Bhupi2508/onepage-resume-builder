// One-page fit model. Densities only tighten spacing and step the font down
// to a 9pt floor; they never shrink text further. Overflow beyond the last
// density is reported to the user instead of being hidden or clipped.
export const DENSITIES = [
  { id: 0, label: "Comfortable", fontPt: 10 },
  { id: 1, label: "Balanced", fontPt: 10 },
  { id: 2, label: "Compact", fontPt: 9.5 },
  { id: 3, label: "Tight", fontPt: 9 },
];
export const MAX_DENSITY = DENSITIES.length - 1;
// Content is "tight" (warn) when it uses more than this share of the page.
export const TIGHT_RATIO = 0.96;

export function summarizeFit({ density, used, available, sections }) {
  const overflow = Math.max(0, Math.round(used - available));
  const remaining = Math.max(0, Math.round(available - used));
  const ratio = available ? used / available : 0;
  const status = overflow > 0 ? "overflow" : ratio > TIGHT_RATIO || density === MAX_DENSITY ? "tight" : "fits";
  return { density, used: Math.round(used), available: Math.round(available), overflow, remaining, ratio, status, sections: sections || [] };
}

// Ordered suggestions; never destructive - the UI applies "hide", not delete.
export function buildSuggestions(fit, sections) {
  if (!fit || fit.status !== "overflow") return [];
  const byId = new Map((fit.sections || []).map((s) => [s.id, s.height]));
  const rows = sections
    .filter((s) => s.visible && byId.has(s.id))
    .map((s) => ({ section: s, height: byId.get(s.id), priority: s.priority ?? 50 }));
  const out = [];
  [...rows]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .forEach(({ section, height }) =>
      out.push({ kind: "hide", sectionId: section.id, label: `Hide “${section.title}”`, frees: Math.round(height), solves: height >= fit.overflow })
    );
  const largest = [...rows].sort((a, b) => b.height - a.height)[0];
  if (largest) out.push({ kind: "shorten", sectionId: largest.section.id, label: `Shorten “${largest.section.title}” (your longest section)`, frees: 0, solves: false });
  return out;
}
