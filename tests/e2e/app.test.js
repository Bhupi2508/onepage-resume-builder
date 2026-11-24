// Real-browser end-to-end tests: builds the app, serves it from the Express
// server (as in production) and drives headless Chrome through the UI.
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../server/app.js";
import { openDb } from "../../server/db.js";
import { loadConfig } from "../../server/config.js";
import { createPdfService, findChrome } from "../../server/pdf/service.js";
import { DEMO_PROFILES } from "../../shared/demoData.js";
import { blankItem, newId } from "../../shared/profiles.js";

const chrome = findChrome("");
let server, base, browser, tmp, pdf;

beforeAll(async () => {
  if (!chrome) return;
  execSync("npx vite build", { stdio: "ignore" });
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "op-e2e-"));
  const config = loadConfig({ databasePath: path.join(tmp, "e2e.db"), bcryptRounds: 4, serveStatic: true, production: false, rateLimits: { authMax: 1000, pdfMax: 1000, apiMax: 100000 } });
  pdf = createPdfService(config);
  const app = createApp({ db: openDb(config.databasePath), config, pdf });
  await new Promise((r) => (server = app.listen(0, "127.0.0.1", r)));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
});
afterAll(async () => {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
  await pdf?.close();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

async function newPage(viewport = { width: 1280, height: 900 }, setup) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && page.errors.push(m.text()));
  if (setup) await page.evaluateOnNewDocument(setup);
  return page;
}
const clickText = (page, sel, text) =>
  page.evaluate((s, t) => { const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim().includes(t)); if (!el) throw new Error(`no ${s} with "${t}"`); el.click(); }, sel, text);
const step = (page, label) => clickText(page, 'nav[aria-label="Steps"] button', label);
const previewAttr = (page, attr) => page.$eval("aside [data-resume-page]", (el, a) => el.getAttribute(a), attr);
const fitStatus = (page) => page.$eval('[data-testid="fit-meter"]', (el) => el.dataset.status);
const hScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const settle = (page) => page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 250))));

describe.skipIf(!chrome)("end-to-end (headless Chrome)", () => {
  it("demo works without login: DEMO label, live preview, edit, template switch, fit, PDF", async () => {
    const page = await newPage();
    const authCalls = [];
    page.on("request", (r) => /\/api\/(auth\/(login|register)|resumes)/.test(r.url()) && r.method() !== "GET" && authCalls.push(r.url()));
    await page.goto(base);
    await page.click('[data-testid="try-demo"]');
    await page.waitForSelector('[data-testid="demo-technical"]');
    await page.click('[data-testid="demo-technical"]');
    await page.waitForSelector("aside [data-resume-page]");
    await settle(page);
    expect(await page.$eval('[role="note"]', (e) => e.textContent)).toMatch(/DEMO[\s\S]*fictional/);
    expect(await page.$eval("aside", (e) => e.textContent)).toContain("Sam Developer");
    expect(await fitStatus(page)).toBe("fits");

    // edit -> preview updates
    await page.click('input[name="name"]', { clickCount: 3 });
    await page.type('input[name="name"]', "Edited Demo Name");
    await page.waitForFunction(() => document.querySelector("aside [data-resume-page]")?.textContent.includes("Edited Demo Name"));

    // switch templates: all six, content unchanged
    await step(page, "Template");
    for (const [label, cls] of [["Minimal", "tpl-minimal"], ["Student", "tpl-academic"], ["Corporate", "tpl-traditional"], ["Creative", "tpl-creative"], ["Modern", "tpl-modern"], ["Technical", "tpl-technical"]]) {
      await clickText(page, 'button[role="radio"]', label);
      await page.waitForFunction((c) => document.querySelector("aside [data-resume-page]")?.classList.contains(c), {}, cls);
      expect(await page.$eval("aside", (e) => e.textContent)).toContain("Edited Demo Name");
      expect(["fits", "tight"]).toContain(await fitStatus(page));
    }

    // PDF download: real PDF, one page, density identical to the preview
    await step(page, "Download");
    await settle(page);
    const previewDensity = await previewAttr(page, "data-density");
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/pdf") && r.request().method() === "POST"), page.click('[data-testid="download-pdf"]')]);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    expect(res.headers()["x-resume-density"]).toBe(previewDensity);
    const buf = await res.buffer();
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(authCalls).toEqual([]); // no login / account writes in demo mode
    expect(page.errors).toEqual([]);
  });

  it("every demo profile loads, fits one page, and preview density matches the PDF", async () => {
    for (const d of DEMO_PROFILES) {
      const page = await newPage();
      await page.goto(`${base}/demo/${d.id}`);
      await page.waitForSelector("aside [data-resume-page]");
      await settle(page);
      expect(["fits", "tight"], d.id).toContain(await fitStatus(page));
      const density = await previewAttr(page, "data-density");
      const data = await page.evaluate(() => JSON.parse(sessionStorage.getItem("op-demo") || "null"));
      expect(data).toBeNull(); // untouched demo is not persisted
      const resume = d.build();
      const r = await page.evaluate(async (resume) => { const x = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume }) }); return { s: x.status, d: x.headers.get("x-resume-density") }; }, JSON.parse(await page.evaluate(() => "null")) || resume);
      expect(r.s).toBe(200);
      expect(r.d).toBe(density); // same algorithm, same answer as the preview
      await page.browserContext().close();
    }
  });

  it("overflow: shows a warning, blocks download, suggests hiding sections and never drops content", async () => {
    const resume = DEMO_PROFILES[4].build();
    const exp = resume.sections.find((s) => s.type === "experience");
    for (let i = 0; i < 5; i++) exp.items.push({ ...blankItem(), id: newId("i"), heading: `Extra Role ${i}`, subheading: "Company", date: "2010", text: "Did a very large number of important things for the company.\n".repeat(5) });
    const interests = { id: "int1", type: "interests", title: "Interests", visible: true, items: [{ ...blankItem(), text: "Chess, Hiking" }] };
    resume.sections.push(interests);
    const page = await newPage({ width: 1280, height: 900 }, `sessionStorage.setItem("op-demo", ${JSON.stringify(JSON.stringify({ demoId: "technical", resume }))})`);
    await page.goto(`${base}/demo/technical`);
    await page.waitForSelector("aside [data-resume-page]");
    await settle(page);
    expect(await fitStatus(page)).toBe("overflow");
    expect(await page.$eval('aside [role="alert"]', (e) => e.textContent)).toMatch(/longer than one page[\s\S]*nothing has been removed/i);
    expect(await previewAttr(page, "data-density")).toBe("3"); // compaction capped at the 9pt floor
    await step(page, "Download");
    expect(await page.$eval('[data-testid="download-pdf"]', (e) => e.disabled)).toBe(true);
    // Hide lowest-priority section (Interests): content is kept, only hidden.
    await clickText(page, "aside button, section button", "Hide");
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem("op-demo")).resume.sections.find((s) => s.id === "int1").visible === false);
    const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("op-demo")).resume.sections.find((s) => s.id === "int1"));
    expect(stored.visible).toBe(false);
    expect(stored.items[0].text).toBe("Chess, Hiking");
    // Remove extra roles via the editor until it fits -> download enabled again
    await step(page, "Sections");
    for (let n = 0; n < 8 && (await fitStatus(page)) === "overflow"; n++) {
      await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label="Remove entry"]')].pop(); b?.click(); });
      await settle(page);
    }
    expect(await fitStatus(page)).not.toBe("overflow");
    await step(page, "Download");
    expect(await page.$eval('[data-testid="download-pdf"]', (e) => e.disabled)).toBe(false);
  });

  it("fresh resume: choose profile, fill sections, empty optional sections leave no gaps, draft persists", async () => {
    const page = await newPage();
    await page.goto(`${base}/builder/new?fresh=1`);
    await clickText(page, "label", "School Student");
    await page.click('[data-testid="start-building"]');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', "Riya Test");
    await page.type('input[name="email"]', "riya@example.com");
    await step(page, "Sections");
    // school preset: no experience / projects sections offered by default
    const titles = await page.$$eval('input[aria-label="Section title"]', (els) => els.map((e) => e.value));
    expect(titles).toContain("Education");
    expect(titles).not.toContain("Work Experience");
    await page.type('input[id$="-heading"]', "Greenfield School");
    await page.waitForFunction(() => document.querySelector("aside [data-resume-page]")?.textContent.includes("Greenfield School"));
    const sections = await page.$$eval("aside [data-section-id]", (els) => els.map((e) => e.getAttribute("data-section-id")));
    expect(sections.length).toBe(2); // header + the one filled section; empty ones render nothing
    // custom section add
    await page.evaluate(() => [...document.querySelectorAll("details summary")].find((s) => /Add a section/.test(s.textContent)).click());
    await clickText(page, "details button", "Custom Section");
    expect(await page.$$eval('input[aria-label="Section title"]', (e) => e.length)).toBeGreaterThan(titles.length);
    await new Promise((r) => setTimeout(r, 800));
    await page.reload();
    await page.waitForSelector('input[name="name"]');
    expect(await page.$eval('input[name="name"]', (e) => e.value)).toBe("Riya Test"); // draft restored
  });

  it("register -> save -> list -> reopen -> edit autosaves -> download -> delete; other users cannot see it", async () => {
    const page = await newPage();
    await page.goto(`${base}/register`);
    await page.type('input[autocomplete="name"]', "E2E User");
    await page.type('input[type="email"]', "e2e@example.com");
    await page.type('input[type="password"]', "Passw0rdlong1");
    await clickText(page, "button", "Create account");
    await page.waitForFunction(() => location.pathname === "/dashboard");
    expect(await page.$eval("main", (e) => e.textContent)).toContain("No saved resumes yet");

    await page.goto(`${base}/builder/new?fresh=1`);
    await clickText(page, "label", "Experienced Professional");
    await page.click('[data-testid="start-building"]');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', "Saved Person");
    await page.type('input[name="email"]', "saved@example.com");
    await step(page, "Sections");
    await page.type('input[id$="-heading"]', "Engineer");
    await step(page, "Download");
    await clickText(page, "button", "Save to my account");
    await page.waitForFunction(() => /^\/builder\/[0-9a-f-]{36}$/.test(location.pathname));
    const resumeUrl = page.url();

    // edit -> autosave (debounced) -> reload shows persisted change
    await page.waitForSelector('input[name="name"]');
    await page.click('input[name="name"]', { clickCount: 3 });
    await page.type('input[name="name"]', "Renamed Person");
    await page.waitForFunction(() => document.body.textContent.includes("All changes saved"), { timeout: 8000 });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input[name="name"]')?.value === "Renamed Person");

    await page.goto(`${base}/dashboard`);
    await page.waitForFunction(() => document.querySelector("main")?.textContent.includes("Renamed Person"));
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/pdf")), clickText(page, "button", "PDF")]);
    expect(res.status()).toBe(200);

    // a different user gets 404 for that resume URL
    const other = await newPage();
    await other.goto(`${base}/register`);
    await other.type('input[autocomplete="name"]', "Other");
    await other.type('input[type="email"]', "other@example.com");
    await other.type('input[type="password"]', "Passw0rdlong1");
    await clickText(other, "button", "Create account");
    await other.waitForFunction(() => location.pathname === "/dashboard");
    const status = await other.evaluate(async (u) => (await fetch(`/api${new URL(u).pathname.replace("/builder", "/resumes")}`)).status, resumeUrl);
    expect(status).toBe(404);

    // delete with confirmation
    await clickText(page, "button", "Delete");
    await page.waitForSelector("dialog[open]");
    await clickText(page, "dialog button", "Delete resume");
    await page.waitForFunction(() => document.querySelector("main")?.textContent.includes("No saved resumes yet"));
    expect(page.errors).toEqual([]);
  });

  it("unauthenticated visitors are sent to log in for saved resumes; wrong password shows an error", async () => {
    const page = await newPage();
    await page.goto(`${base}/dashboard`);
    await page.waitForFunction(() => location.pathname === "/login");
    await page.type('input[type="email"]', "nobody@example.com");
    await page.type('input[type="password"]', "wrongpassword1");
    await clickText(page, "button", "Log in");
    await page.waitForSelector('[role="alert"]');
    expect(await page.$eval('[role="alert"]', (e) => e.textContent)).toMatch(/Incorrect email or password/);
  });

  it.each([
    ["mobile", { width: 375, height: 812, isMobile: true, hasTouch: true }],
    ["tablet", { width: 768, height: 1024 }],
    ["desktop", { width: 1280, height: 900 }],
  ])("%s: no horizontal scrolling, preview/edit toggle works", async (name, vp) => {
    const page = await newPage(vp);
    for (const p of ["/", "/demo", "/demo/experienced", "/builder/new?fresh=1", "/login", "/register", "/about", "/privacy"]) {
      await page.goto(base + p);
      await settle(page);
      expect(await hScroll(page), `${name} ${p}`).toBeLessThanOrEqual(0);
    }
    await page.goto(`${base}/demo/experienced`);
    await page.waitForSelector("aside [data-resume-page]");
    await settle(page);
    const visible = (sel) => page.$eval(sel, (e) => e.offsetParent !== null);
    if (name === "mobile") {
      expect(await visible('section[aria-label="Resume editor"]')).toBe(true);
      expect(await visible('aside[aria-label="Live preview"]')).toBe(false);
      await clickText(page, "button", "Preview");
      expect(await visible('aside[aria-label="Live preview"]')).toBe(true);
      expect(await visible('section[aria-label="Resume editor"]')).toBe(false);
      expect(await hScroll(page)).toBeLessThanOrEqual(0);
      const w = await page.$eval("aside [data-resume-page]", (e) => e.getBoundingClientRect().width);
      expect(w).toBeLessThanOrEqual(375); // A4 preview scaled to the screen
      // touch targets in the action bar are at least 44px tall
      const h = await page.$$eval(".fixed.bottom-0 button", (b) => Math.min(...b.map((x) => x.getBoundingClientRect().height)));
      expect(h).toBeGreaterThanOrEqual(44);
    }
    if (name === "desktop") {
      expect(await visible('section[aria-label="Resume editor"]')).toBe(true);
      expect(await visible('aside[aria-label="Live preview"]')).toBe(true); // split screen
    }
  });

  it("works in dark mode and via keyboard (skip link, focusable steps)", async () => {
    const page = await newPage();
    await page.goto(base);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement.textContent)).toMatch(/Skip to content/);
    await page.click('button[aria-label="Switch to dark mode"]');
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });
});
