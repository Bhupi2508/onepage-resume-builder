import { Check } from "lucide-react";
import { TEMPLATES } from "../../../shared/templates.js";

export default function DesignStep({ templateId, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Choose a template</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">All templates are single-column, A4, and ATS-friendly (real text, no tables or images). Switching never changes your content.</p>
      </div>
      <div role="radiogroup" aria-label="Template" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={templateId === t.id} onClick={() => onChange(t.id)} className={"relative rounded-xl border p-3 text-left transition-colors " + (templateId === t.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
            <span className="block pr-6 text-sm font-semibold">{t.label}</span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{t.description}</span>
            {templateId === t.id ? <Check className="absolute right-3 top-3 h-4 w-4 text-indigo-600" aria-hidden /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
