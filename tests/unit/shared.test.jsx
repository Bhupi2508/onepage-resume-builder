import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ResumeDocument from "../../src/resume/ResumeDocument.jsx";
import { CATEGORIES, STAGES, blankItem, createResume } from "../../shared/profiles.js";
import { DEMO_PROFILES } from "../../shared/demoData.js";
import { exportProblems, validateResume } from "../../shared/schema.js";
import * as ops from "../../shared/resumeOps.js";
import { SECTION_TYPES } from "../../shared/sections.js";
import { TEMPLATES } from "../../shared/templates.js";
import { buildSuggestions, summarizeFit } from "../../shared/fit.js";
import { isSafeUrl, normalizeUrl } from "../../shared/url.js";

const withName = (r) => ({ ...r, basics: { ...r.basics, name: "Test Person", email: "t@example.com" } });
const render = (r) => renderToStaticMarkup(createElement(ResumeDocument, { resume: r, density: 0 }));

describe("profiles", () => {
  it("every stage x category creates a valid resume", () => {
    for (const s of STAGES) for (const c of CATEGORIES) {
      const r = createResume({ stage: s.id, category: c.id });
      const v = validateResume(r);
      expect(v.ok, `${s.id}/${c.id}: ${JSON.stringify(v.errors)}`).toBe(true);
    }
  });
  it("school students are not forced into work experience or projects", () => {
    const types = createResume({ stage: "school", category: "general" }).sections.map((s) => s.type);
    expect(types).toContain("school");
    expect(types).not.toContain("experience");
    expect(types).not.toContain("projects");
  });
  it("technical profiles get technical skill groups, non-technical do not", () => {
    const groups = (c) => createResume({ stage: "experienced", category: c }).sections.find((s) => s.type === "skills").items.map((i) => i.heading);
    expect(groups("technical")).toContain("Databases");
    expect(groups("finance")).not.toContain("Databases");
  });
  it("experienced professionals start with experience first", () => {
    expect(createResume({ stage: "experienced", category: "business" }).sections[0].type).toBe("experience");
  });
});

describe("demo data", () => {
  it.each(DEMO_PROFILES.map((d) => [d.id, d]))("%s demo is valid, complete and fictional", (_id, d) => {
    const r = d.build();
    expect(validateResume(r).ok).toBe(true);
    expect(exportProblems(r)).toEqual([]);
    expect(r.basics.email.endsWith("@example.com")).toBe(true);
  });
});

describe("schema", () => {
  const base = () => withName(createResume({ stage: "entry", category: "technical" }));
  it("rejects over-limit fields", () => {
    const r = base(); r.basics.name = "x".repeat(61);
    expect(validateResume(r).ok).toBe(false);
  });
  it("rejects unsafe links but accepts bare domains", () => {
    const r = base(); r.basics.website = "javascript:alert(1)";
    expect(validateResume(r).ok).toBe(false);
    r.basics.website = "example.com/me";
    expect(validateResume(r).ok).toBe(true);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });
  it("rejects bad email, phone, template, unknown section type and too many items", () => {
    let r = base(); r.basics.email = "nope"; expect(validateResume(r).ok).toBe(false);
    r = base(); r.basics.phone = "call me"; expect(validateResume(r).ok).toBe(false);
    r = base(); r.templateId = "fancy"; expect(validateResume(r).ok).toBe(false);
    r = base(); r.sections[0].type = "hax"; expect(validateResume(r).ok).toBe(false);
    r = base(); const s = r.sections.find((x) => x.type === "education");
    s.items = Array.from({ length: SECTION_TYPES.education.maxItems + 1 }, blankItem);
    expect(validateResume(r).ok).toBe(false);
  });
  it("rejects an over-long skill and strips control characters", () => {
    const r = base(); r.sections.find((x) => x.type === "skills").items[0].text = `ok, ${"y".repeat(41)}`;
    expect(validateResume(r).ok).toBe(false);
    const r2 = base(); r2.basics.name = "A\u0000B";
    expect(validateResume(r2).data.basics.name).toBe("AB");
  });
  it("export needs a name and a contact method", () => {
    expect(exportProblems(createResume())).toHaveLength(3);
    const r = withName(createResume()); r.sections[0].items[0].heading = "Uni";
    expect(exportProblems(r)).toEqual([]);
  });
});

describe("resume operations", () => {
  const r0 = () => withName(createResume({ stage: "experienced", category: "technical" }));
  it("reorders sections and items without losing data", () => {
    const r = r0(); const [a, b] = r.sections.map((s) => s.id);
    const moved = ops.moveSection(r, a, 1);
    expect(moved.sections[1].id).toBe(a); expect(moved.sections[0].id).toBe(b);
    expect(ops.moveSection(r, a, -1)).toEqual(r);
    const withItems = ops.addItem(r, a); const ids = withItems.sections[0].items.map((i) => i.id);
    expect(ops.moveItem(withItems, a, ids[0], 1).sections[0].items.map((i) => i.id)).toEqual([ids[1], ids[0]]);
  });
  it("removing the last item leaves one blank entry", () => {
    const r = r0(); const s = r.sections[0];
    expect(ops.removeItem(r, s.id, s.items[0].id).sections[0].items).toHaveLength(1);
  });
  it("adds custom sections and respects item caps", () => {
    let r = ops.addSection(r0(), "custom", "My Custom");
    expect(r.sections.at(-1).title).toBe("My Custom");
    const id = r.sections.at(-1).id;
    for (let i = 0; i < 20; i++) r = ops.addItem(r, id);
    expect(r.sections.at(-1).items).toHaveLength(SECTION_TYPES.custom.maxItems);
    expect(validateResume(r).ok).toBe(true);
  });
  it("switching template keeps all content", () => {
    const r = r0(); r.basics.summary = "Hello";
    for (const t of TEMPLATES) {
      const n = ops.setTemplate(r, t.id);
      expect(n.basics).toEqual(r.basics); expect(n.sections).toEqual(r.sections);
    }
  });
  it("changing profile keeps existing content and only adds sections", () => {
    const r = r0(); r.sections[0].items[0].heading = "Keep me";
    const n = ops.applyProfile(r, { stage: "college", category: "technical" }, createResume);
    expect(n.sections[0].items[0].heading).toBe("Keep me");
    expect(n.sections.length).toBeGreaterThanOrEqual(r.sections.length);
    expect(n.profile.stage).toBe("college");
  });
});

describe("rendering", () => {
  const filled = () => DEMO_PROFILES[4].build();
  it("every template renders every demo", () => {
    for (const t of TEMPLATES) for (const d of DEMO_PROFILES) {
      const html = render({ ...d.build(), templateId: t.id });
      expect(html).toContain(`tpl-${t.id}`);
      expect(html).toContain("<h1");
    }
  });
  it("empty and hidden sections create no markup (no gaps)", () => {
    const r = filled(); r.sections.push({ id: "empty1", type: "custom", title: "EmptyThing", visible: true, items: [blankItem()] });
    r.sections[0].visible = false;
    const html = render(r);
    expect(html).not.toContain("EmptyThing");
    expect(html).not.toContain(`data-section-id="${r.sections[0].id}"`);
  });
  it("missing optional fields render gracefully", () => {
    const r = withName(createResume({ stage: "school", category: "general" })); r.sections[0].items[0].heading = "School";
    const html = render(r);
    expect(html).toContain("School");
    expect(html).not.toContain("undefined");
  });
  it("escapes HTML and never renders javascript: links", () => {
    const r = filled(); r.basics.name = "<script>alert(1)</script>"; r.basics.website = "javascript:alert(1)";
    const html = render(r);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('href="javascript:');
  });
  it("preserves unicode text", () => {
    const r = filled(); r.basics.name = "Åsa Çelik Дмитрий 王小明";
    expect(render(r)).toContain("Åsa Çelik Дмитрий 王小明");
  });
});

describe("fit model", () => {
  const sections = [
    { id: "a", title: "Interests", visible: true, priority: 10 },
    { id: "b", title: "Experience", visible: true, priority: 95 },
  ];
  it("classifies fits / tight / overflow", () => {
    expect(summarizeFit({ density: 0, used: 500, available: 1000 }).status).toBe("fits");
    expect(summarizeFit({ density: 1, used: 990, available: 1000 }).status).toBe("tight");
    expect(summarizeFit({ density: 3, used: 800, available: 1000 }).status).toBe("tight");
    expect(summarizeFit({ density: 3, used: 1100, available: 1000 }).overflow).toBe(100);
  });
  it("suggests hiding low-priority sections first and never when it fits", () => {
    const fit = summarizeFit({ density: 3, used: 1100, available: 1000, sections: [{ id: "a", height: 120 }, { id: "b", height: 400 }] });
    const s = buildSuggestions(fit, sections);
    expect(s[0]).toMatchObject({ kind: "hide", sectionId: "a", solves: true });
    expect(s.at(-1).kind).toBe("shorten");
    expect(buildSuggestions(summarizeFit({ density: 0, used: 1, available: 2 }), sections)).toEqual([]);
  });
});

describe("regression: seeded skill group labels", () => {
  it("a skills section with only group labels renders nothing and does not count as content", () => {
    const r = withName(createResume({ stage: "experienced", category: "technical" }));
    expect(render(r)).not.toContain("data-section-id=\"" + r.sections.find((s) => s.type === "skills").id + "\"");
    expect(exportProblems(r)).toEqual(["Add some content to at least one section."]);
  });
});
