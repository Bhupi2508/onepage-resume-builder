// Builds the self-contained HTML document that headless Chrome prints.
// Same ResumeDocument + resume.css as the live preview; fonts are inlined so
// the PDF never depends on what is installed on the server.
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ResumeDocument from "../../src/resume/ResumeDocument.jsx";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FONT_CSS = [
  ["inter", "latin-400"], ["inter", "latin-600"], ["inter", "latin-700"],
  ["inter", "latin-ext-400"], ["inter", "latin-ext-600"], ["inter", "latin-ext-700"],
  ["source-serif-4", "latin-400"], ["source-serif-4", "latin-600"], ["source-serif-4", "latin-ext-400"],
  ["source-serif-4", "latin-ext-600"], ["source-serif-4", "latin-700"], ["source-serif-4", "latin-ext-700"],
];

let cachedCss;
function buildCss() {
  if (cachedCss) return cachedCss;
  const fonts = FONT_CSS.map(([pkg, file]) => {
    const dir = path.join(ROOT, "node_modules/@fontsource", pkg);
    const css = fs.readFileSync(path.join(dir, `${file}.css`), "utf8");
    return css.replace(/src:\s*url\(\.\/files\/([^)]+\.woff2)\)[^;]*;/g, (_m, f) => {
      const b64 = fs.readFileSync(path.join(dir, "files", f)).toString("base64");
      return `src: url(data:font/woff2;base64,${b64}) format("woff2");`;
    });
  }).join("\n");
  const resumeCss = fs.readFileSync(path.join(ROOT, "src/resume/resume.css"), "utf8");
  cachedCss = `${fonts}\nhtml,body{margin:0;padding:0;background:#fff}\n${resumeCss}`;
  return cachedCss;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function buildHtml(resume) {
  const markup = renderToStaticMarkup(<ResumeDocument resume={resume} density={0} />);
  const title = `${resume.basics.name || "Resume"} - Resume`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:">
<title>${esc(title)}</title><style>${buildCss()}</style></head><body>${markup}</body></html>`;
}
