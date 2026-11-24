import { BASICS_LIMITS } from "../../../shared/sections.js";
import { Field } from "../ui.jsx";

export default function BasicsStep({ basics, errors, onChange }) {
  const f = (key, label, extra = {}) => (
    <Field label={label} name={key} value={basics[key]} max={BASICS_LIMITS[key]} error={errors[`basics.${key}`]} onChange={(e) => onChange({ [key]: e.target.value })} {...extra} />
  );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Personal information</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Only what employers need. Skip date of birth, home address and ID numbers.</p>
      </div>
      {f("name", "Full name *", { autoComplete: "name", placeholder: "Alex Morgan" })}
      {f("title", "Professional title / headline", { placeholder: "Marketing Graduate" })}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {f("email", "Email", { type: "email", autoComplete: "email", placeholder: "alex@example.com" })}
        {f("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+1 555 0100" })}
      </div>
      {f("location", "City, country", { placeholder: "Austin, USA" })}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {f("linkedin", "LinkedIn", { placeholder: "linkedin.com/in/you", inputMode: "url" })}
        {f("github", "GitHub", { placeholder: "github.com/you", inputMode: "url" })}
        {f("website", "Portfolio / website", { placeholder: "yoursite.com", inputMode: "url" })}
      </div>
      {f("summary", "Professional summary (optional)", { multiline: true, hint: "2–3 sentences. Delete it if space is tight." })}
    </div>
  );
}
