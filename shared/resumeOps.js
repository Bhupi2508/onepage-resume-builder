// Pure, immutable operations on a resume object (used by the client reducer).
import { SECTION_TYPES, MAX_SECTIONS } from "./sections.js";
import { blankItem, createSection } from "./profiles.js";

export function move(arr, from, to) {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

const mapSection = (resume, sectionId, fn) => ({
  ...resume,
  sections: resume.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
});

export const setBasics = (r, patch) => ({ ...r, basics: { ...r.basics, ...patch } });
export const setTemplate = (r, templateId) => ({ ...r, templateId });

export function addSection(r, type, title) {
  if (r.sections.length >= MAX_SECTIONS) return r;
  return { ...r, sections: [...r.sections, createSection(type, title)] };
}
export const removeSection = (r, id) => ({ ...r, sections: r.sections.filter((s) => s.id !== id) });
export const moveSection = (r, id, dir) => {
  const i = r.sections.findIndex((s) => s.id === id);
  return i < 0 ? r : { ...r, sections: move(r.sections, i, i + dir) };
};
export const patchSection = (r, id, patch) => mapSection(r, id, (s) => ({ ...s, ...patch }));

export function addItem(r, sectionId) {
  return mapSection(r, sectionId, (s) =>
    s.items.length >= SECTION_TYPES[s.type].maxItems ? s : { ...s, items: [...s.items, blankItem()] }
  );
}
export const removeItem = (r, sectionId, itemId) =>
  mapSection(r, sectionId, (s) => {
    const items = s.items.filter((i) => i.id !== itemId);
    return { ...s, items: items.length ? items : [blankItem()] };
  });
export const moveItem = (r, sectionId, itemId, dir) =>
  mapSection(r, sectionId, (s) => {
    const i = s.items.findIndex((x) => x.id === itemId);
    return i < 0 ? s : { ...s, items: move(s.items, i, i + dir) };
  });
export const patchItem = (r, sectionId, itemId, patch) =>
  mapSection(r, sectionId, (s) => ({ ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }));

// Switch profile without losing anything: existing sections are kept as-is and
// preset sections the resume does not have yet are appended (empty).
export function applyProfile(r, profile, createResumeFn) {
  const preset = createResumeFn(profile, r.templateId);
  const have = new Set(r.sections.map((s) => `${s.type}|${s.title.toLowerCase()}`));
  const extra = preset.sections.filter((s) => !have.has(`${s.type}|${s.title.toLowerCase()}`)).slice(0, Math.max(0, MAX_SECTIONS - r.sections.length));
  return { ...r, profile: preset.profile, sections: [...r.sections, ...extra] };
}
