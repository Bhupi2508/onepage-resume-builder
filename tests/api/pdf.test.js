import { afterAll, describe, expect, it } from "vitest";
import { makeApp } from "./helpers.js";
import { DEMO_PROFILES } from "../../shared/demoData.js";
import { TEMPLATES } from "../../shared/templates.js";
import { blankItem, createResume, newId } from "../../shared/profiles.js";
import { SECTION_TYPES } from "../../shared/sections.js";
import { countPdfPages, findChrome } from "../../server/pdf/service.js";

const ctx = makeApp();
afterAll(() => ctx.pdf.close());
const haveChrome = !!findChrome("");
const post = (resume) => ctx.request().post("/api/pdf").buffer(true).parse((res, cb) => { const c = []; res.on("data", (d) => c.push(d)); res.on("end", () => cb(null, Buffer.concat(c))); }).send({ resume });

const item = (o) => ({ ...blankItem(), ...o });
// Content at the documented limits: 60-char name, 70-char title, 350 summary,
// 450-char job descriptions, 300-char projects, 180-char achievements...
function limitsResume() {
  const r = createResume({ stage: "experienced", category: "technical" }, "modern");
  r.basics = { name: "N".repeat(60).replace(/N{5}/g, "Nnnn "), title: "T".repeat(70), email: "max@example.com", phone: "+1 555 0100", location: "City, Country", linkedin: "linkedin.com/in/max", github: "github.com/max", website: "max.example.com", summary: "S".repeat(350).replace(/S{9}/g, "Summary ") };
  const para = (n, line) => Array.from({ length: Math.ceil(n / line) }, () => "w".repeat(line - 1)).join("\n").slice(0, n);
  for (const s of r.sections) {
    if (s.type === "experience") s.items = [0, 1, 2].map((i) => item({ heading: `Role ${i}`.padEnd(80, "r"), subheading: "C".repeat(80), date: "2020 – 2024", meta: "Remote", text: para(450, 90) }));
    if (s.type === "projects") s.items = [0, 1].map(() => item({ heading: "Project", subheading: "A, B, C", text: para(300, 100) }));
    if (s.type === "skills") s.items.forEach((i) => (i.text = "Skill one, Skill two, Skill three, Skill four"));
    if (s.type === "education") s.items = [item({ heading: "University", subheading: "Degree", date: "2012 – 2016", text: "d".repeat(200) })];
    if (s.type === "certifications") s.items = [0, 1, 2].map(() => item({ heading: "C".repeat(100) }));
    if (s.type === "achievements") s.items = [0, 1, 2].map(() => item({ heading: "A".repeat(100), text: "t".repeat(80) }));
  }
  return r;
}
// Every section filled to its absolute maximum: physically cannot fit on a page.
function absoluteMax() {
  const r = createResume({ stage: "experienced", category: "technical" });
  r.basics = { ...limitsResume().basics };
  r.sections = Object.keys(SECTION_TYPES).map((type) => {
    const def = SECTION_TYPES[type];
    return { id: newId("s"), type, title: def.label, visible: true, items: Array.from({ length: def.maxItems }, () => item(Object.fromEntries(Object.entries(def.fields).map(([k, f]) => [k, ((k === "meta" ? "x" : def.layout === "inline" ? "skill, " : "word ")).repeat(f.max).slice(0, f.max)])))) };
  });
  return r;
}

describe.skipIf(!haveChrome)("PDF export (real Chrome)", () => {
  it("is public (demo needs no login) and returns exactly one A4 page for every demo x template", async () => {
    for (const d of DEMO_PROFILES) for (const t of TEMPLATES) {
      const res = await post({ ...d.build(), templateId: t.id });
      expect(res.status, `${d.id}/${t.id}: ${res.body?.toString?.().slice(0, 200)}`).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.body.subarray(0, 5).toString()).toBe("%PDF-");
      expect(countPdfPages(res.body)).toBe(1);
      expect(res.body.toString("latin1")).toMatch(/MediaBox\s*\[\s*0\s+0\s+59[45]\.\d+\s+84[12]\.\d+\s*\]/); // A4
    }
  });
  it("short content: one page", async () => {
    const r = createResume({ stage: "school", category: "general" }, "minimal");
    r.basics.name = "Al"; r.basics.email = "a@example.com"; r.sections[0].items[0].heading = "School";
    const res = await post(r);
    expect(res.status).toBe(200);
    expect(countPdfPages(res.body)).toBe(1);
  });
  it("content at the documented per-field limits: exactly one page (or a clear overflow error, never 2 pages)", async () => {
    for (const t of TEMPLATES) {
      const res = await post({ ...limitsResume(), templateId: t.id });
      if (res.status === 200) expect(countPdfPages(res.body), t.id).toBe(1);
      else expect(JSON.parse(res.body.toString()).error.code, t.id).toBe("OVERFLOW");
    }
  });
  it("absolute-maximum content is refused with OVERFLOW instead of producing a second page or clipping", async () => {
    const res = await post(absoluteMax());
    expect(res.status).toBe(422);
    const body = JSON.parse(res.body.toString());
    expect(body.error.code).toBe("OVERFLOW");
    expect(body.error.details.overflowPx).toBeGreaterThan(0);
  });
  it("embeds real selectable text and preserves unicode names, links stay clickable", async () => {
    const r = DEMO_PROFILES[4].build(); r.basics.name = "Åsa Çelik";
    const res = await post(r);
    expect(res.status).toBe(200);
    const raw = res.body.toString("latin1");
    expect(raw).toContain("/Link");
    expect(raw).toMatch(/mailto:sam\.developer@example\.com/);
    expect(raw).toMatch(/linkedin\.com\/in\/sam-developer/);
    expect(raw).toMatch(/\/ToUnicode/);
  });
  it("reports the same density the live preview algorithm chooses", async () => {
    const res = await post(DEMO_PROFILES[1].build());
    expect(res.headers["x-resume-density"]).toMatch(/^[0-3]$/);
  });
  it("rejects invalid input and incomplete resumes", async () => {
    expect((await ctx.request().post("/api/pdf").send({ resume: { nope: 1 } })).status).toBe(400);
    expect((await ctx.request().post("/api/pdf").send({})).status).toBe(400);
    const empty = await ctx.request().post("/api/pdf").send({ resume: createResume() });
    expect(empty.status).toBe(422);
    expect(empty.body.error.code).toBe("INCOMPLETE");
    const evil = DEMO_PROFILES[0].build(); evil.basics.website = "javascript:alert(1)";
    expect((await ctx.request().post("/api/pdf").send({ resume: evil })).status).toBe(400);
  });
  it("neutralises hostile text (HTML is escaped, nothing executes or fetches)", async () => {
    const r = DEMO_PROFILES[0].build(); r.basics.name = `<img src=x onerror=alert(1)> <script>1</script>`;
    r.basics.title = `"><iframe src="http://127.0.0.1:1/"></iframe>`;
    const res = await post(r);
    expect(res.status).toBe(200);
    expect(countPdfPages(res.body)).toBe(1);
  });
  it("rate limits PDF generation", async () => {
    const c = makeApp({ rateLimits: { authMax: 100, pdfMax: 2, apiMax: 1000 } });
    const body = { resume: createResume() };
    const codes = [];
    for (let i = 0; i < 4; i++) codes.push((await c.request().post("/api/pdf").send(body)).status);
    expect(codes.filter((x) => x === 429).length).toBeGreaterThan(0);
    await c.pdf.close();
  });
});

describe("PDF export when Chrome is missing", () => {
  it("returns a clear 503 so the UI can offer the print fallback", async () => {
    const c = makeApp({ chromePath: "/nonexistent/chrome" });
    const res = await c.request().post("/api/pdf").send({ resume: DEMO_PROFILES[0].build() });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("PDF_UNAVAILABLE");
    expect((await c.request().get("/api/pdf/status")).body.available).toBe(false);
  });
});
