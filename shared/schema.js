import { z } from "zod";
import { BASICS_LIMITS, ITEM_FIELDS, MAX_SECTIONS, MAX_SKILL_LENGTH, SECTION_TYPES, SECTION_TYPE_IDS, sectionHasContent, splitList } from "./sections.js";
import { TEMPLATE_IDS } from "./templates.js";
import { STAGES, CATEGORIES } from "./profiles.js";
import { isSafeUrl } from "./url.js";

// eslint-disable-next-line no-control-regex
const clean = (s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const text = (max) => z.string().max(max).transform(clean).default("");
const urlField = (max) =>
  z.string().max(max).transform(clean).default("").refine(isSafeUrl, "Enter a valid http(s) link");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9()\-.\s]{5,25}$/;

const basicsSchema = z.object({
  name: text(BASICS_LIMITS.name),
  title: text(BASICS_LIMITS.title),
  email: text(BASICS_LIMITS.email).refine((v) => !v || EMAIL_RE.test(v), "Enter a valid email address"),
  phone: text(BASICS_LIMITS.phone).refine((v) => !v || PHONE_RE.test(v), "Enter a valid phone number"),
  location: text(BASICS_LIMITS.location),
  linkedin: urlField(BASICS_LIMITS.linkedin),
  github: urlField(BASICS_LIMITS.github),
  website: urlField(BASICS_LIMITS.website),
  summary: text(BASICS_LIMITS.summary),
});

const idField = z.string().min(1).max(60).regex(/^[\w-]+$/);

const itemSchema = z.object({
  id: idField,
  heading: text(200),
  subheading: text(200),
  date: text(200),
  meta: text(200),
  text: text(2000),
});

const sectionSchema = z
  .object({
    id: idField,
    type: z.enum(SECTION_TYPE_IDS),
    title: text(60),
    visible: z.boolean().default(true),
    items: z.array(itemSchema).max(20),
  })
  .superRefine((section, ctx) => {
    const def = SECTION_TYPES[section.type];
    if (section.items.length > def.maxItems) {
      ctx.addIssue({ code: "custom", path: ["items"], message: `At most ${def.maxItems} entries in this section` });
    }
    section.items.forEach((item, i) => {
      for (const key of ITEM_FIELDS) {
        const field = def.fields[key];
        const value = item[key] ?? "";
        if (!field && value.trim()) {
          ctx.addIssue({ code: "custom", path: ["items", i, key], message: "Field not supported in this section" });
        } else if (field && value.length > field.max) {
          ctx.addIssue({ code: "custom", path: ["items", i, key], message: `${field.label} must be at most ${field.max} characters` });
        }
      }
      if (def.layout === "inline" && splitList(item.text).some((s) => s.length > MAX_SKILL_LENGTH)) {
        ctx.addIssue({ code: "custom", path: ["items", i, "text"], message: `Each item must be at most ${MAX_SKILL_LENGTH} characters` });
      }
    });
  });

export const resumeSchema = z.object({
  version: z.literal(1).default(1),
  templateId: z.enum(TEMPLATE_IDS),
  profile: z.object({
    stage: z.enum(STAGES.map((s) => s.id)),
    category: z.enum(CATEGORIES.map((c) => c.id)),
  }),
  basics: basicsSchema,
  sections: z.array(sectionSchema).max(MAX_SECTIONS),
});

export const resumeTitleSchema = z.string().trim().min(1).max(80);

export function validateResume(data) {
  const r = resumeSchema.safeParse(data);
  if (r.success) return { ok: true, data: r.data, errors: [] };
  return {
    ok: false,
    errors: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  };
}

// Extra requirements before a resume can be exported/downloaded.
export function exportProblems(resume) {
  const problems = [];
  const b = resume.basics || {};
  if (!String(b.name || "").trim()) problems.push("Add your full name.");
  if (!String(b.email || "").trim() && !String(b.phone || "").trim()) problems.push("Add an email address or phone number so employers can reach you.");
  const hasContent = (resume.sections || []).some((s) => s.visible && sectionHasContent(s)) || String(b.summary || "").trim();
  if (!hasContent) problems.push("Add some content to at least one section.");
  return problems;
}
