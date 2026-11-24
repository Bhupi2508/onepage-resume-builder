import fs from "node:fs";
import puppeteer from "puppeteer-core";
import { MAX_DENSITY, summarizeFit } from "../../shared/fit.js";
import { measureFit } from "../../src/resume/fitDom.js";
import { buildHtml } from "./html.jsx";
import { HttpError } from "../http.js";

const CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

export function findChrome(configured) {
  if (configured) return fs.existsSync(configured) ? configured : null;
  return CANDIDATES.find((p) => fs.existsSync(p)) || null;
}

// Counts pages in a Chrome-generated PDF (Chrome writes /Type /Page objects
// uncompressed; "/Pages" is the tree root and is excluded by the lookahead).
export function countPdfPages(buf) {
  const m = buf.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  return m ? m.length : 0;
}

export function createPdfService(config, { maxConcurrent = 2, timeoutMs = 25000 } = {}) {
  let browserPromise = null;
  let active = 0;
  const queue = [];

  async function getBrowser() {
    const executablePath = findChrome(config.chromePath);
    if (!executablePath) throw new HttpError(503, "PDF_UNAVAILABLE", "PDF generation is not available on this server (Chrome/Chromium not found).");
    if (!browserPromise) {
      browserPromise = puppeteer
        .launch({ executablePath, headless: true, args: ["--disable-gpu", "--font-render-hinting=none", ...(config.pdfNoSandbox ? ["--no-sandbox"] : [])] })
        .then((b) => {
          b.on("disconnected", () => { browserPromise = null; });
          return b;
        })
        .catch((e) => {
          browserPromise = null;
          throw new HttpError(503, "PDF_UNAVAILABLE", `Could not start PDF renderer: ${e.message}`);
        });
    }
    return browserPromise;
  }

  const acquire = () => new Promise((resolve) => (active < maxConcurrent ? (active++, resolve()) : queue.push(resolve)));
  const release = () => { const next = queue.shift(); if (next) next(); else active--; };

  async function render(resume) {
    await acquire();
    let page;
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      page.setDefaultTimeout(timeoutMs);
      await page.evaluateOnNewDocument("window.__name = (f) => f;"); // tsx/esbuild keepNames helper
      await page.setRequestInterception(true);
      page.on("request", (req) => (req.url().startsWith("data:") || req.url() === "about:blank" ? req.continue() : req.abort()));
      await page.setContent(buildHtml(resume), { waitUntil: "load" });
      await page.evaluate("document.fonts.ready.then(() => true)");
      const measured = await page.evaluate(measureFit, 0, MAX_DENSITY);
      const fit = summarizeFit(measured);
      if (fit.status === "overflow") {
        throw new HttpError(422, "OVERFLOW", "This resume does not fit on one page. Shorten or hide some content.", { overflowPx: fit.overflow });
      }
      const pdf = Buffer.from(await page.pdf({ preferCSSPageSize: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }));
      const pages = countPdfPages(pdf);
      if (pages !== 1) throw new HttpError(500, "PAGE_COUNT", `Rendered PDF has ${pages} pages`);
      return { pdf, fit };
    } finally {
      await page?.close().catch(() => {});
      release();
    }
  }

  return {
    render,
    isAvailable: () => !!findChrome(config.chromePath),
    async close() {
      const b = browserPromise && (await browserPromise.catch(() => null));
      browserPromise = null;
      await b?.close().catch(() => {});
    },
  };
}
