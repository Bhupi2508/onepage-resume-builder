import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { DENSITIES, buildSuggestions } from "../../../shared/fit.js";
import { SECTION_TYPES } from "../../../shared/sections.js";
import { Button } from "../ui.jsx";

const LINE_PX = 15;

export function FitMeter({ fit }) {
  if (!fit) return null;
  const pct = Math.min(100, Math.round(fit.ratio * 100));
  const tone = fit.status === "overflow" ? "bg-red-500" : fit.status === "tight" ? "bg-amber-500" : "bg-emerald-500";
  const Icon = fit.status === "overflow" ? AlertTriangle : fit.status === "tight" ? Info : CheckCircle2;
  const text =
    fit.status === "overflow"
      ? `Over by about ${Math.ceil(fit.overflow / LINE_PX)} lines`
      : fit.status === "tight"
      ? `Tight fit — about ${Math.floor(fit.remaining / LINE_PX)} lines left`
      : `Fits on one page — about ${Math.floor(fit.remaining / LINE_PX)} lines to spare`;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3" data-testid="fit-meter" data-status={fit.status}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold"><Icon className={"h-4 w-4 " + (fit.status === "overflow" ? "text-red-600" : fit.status === "tight" ? "text-amber-600" : "text-emerald-600")} aria-hidden />{text}</span>
        <span className="tabular-nums text-xs text-slate-500">{pct}% of page</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Page used">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Spacing: {DENSITIES[fit.density].label} · text {DENSITIES[fit.density].fontPt}pt base</p>
    </div>
  );
}

export function OverflowHelp({ fit, resume, onHide, onShorten }) {
  if (!fit || fit.status !== "overflow") return null;
  const sections = resume.sections.map((s) => ({ ...s, priority: SECTION_TYPES[s.type].priority }));
  const suggestions = buildSuggestions(fit, sections);
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
      <p className="font-semibold">This resume is longer than one page.</p>
      <p className="mt-1">Your content is safe — nothing has been removed. To download, shorten text or hide something less important (you can unhide it later):</p>
      <ul className="mt-2 space-y-1.5">
        {suggestions.map((s) => (
          <li key={s.kind + s.sectionId} className="flex items-center justify-between gap-2">
            <span>{s.label}{s.kind === "hide" ? ` · frees ~${Math.floor(s.frees / LINE_PX)} lines${s.solves ? " (fixes it)" : ""}` : ""}</span>
            <Button size="sm" onClick={() => (s.kind === "hide" ? onHide(s.sectionId) : onShorten(s.sectionId))}>{s.kind === "hide" ? "Hide" : "Edit"}</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
