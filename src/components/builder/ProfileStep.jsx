import { CATEGORIES, STAGES } from "../../../shared/profiles.js";

function Choice({ checked, onChange, title, hint, name, value }) {
  return (
    <label className={"flex cursor-pointer flex-col rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-indigo-500/50 " + (checked ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
      <input type="radio" className="sr-only" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="text-sm font-semibold">{title}</span>
      {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  );
}

export default function ProfileStep({ profile, onChange }) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-base font-bold">What best describes you?</legend>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">This sets which sections you start with. You can add or remove sections any time.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STAGES.map((s) => (
            <Choice key={s.id} name="stage" value={s.id} title={s.label} hint={s.hint} checked={profile.stage === s.id} onChange={() => onChange({ ...profile, stage: s.id })} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-base font-bold">Your field</legend>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Pick the closest match — it only tunes the suggested skill groups.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <Choice key={c.id} name="category" value={c.id} title={c.label} checked={profile.category === c.id} onChange={() => onChange({ ...profile, category: c.id })} />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
