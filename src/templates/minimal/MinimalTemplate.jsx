import { formatPhone } from "../../utils/format.js";

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="flex flex-col">
      {title ? (
        <div className="text-xs font-extrabold tracking-wide uppercase text-slate-700 dark:text-slate-200 mb-1">
          {title}
        </div>
      ) : null}
      <div className="text-[var(--resume-font,14px)] text-slate-900 dark:text-slate-50 leading-snug">
        {children}
      </div>
    </div>
  );
}

export default function MinimalTemplate({ values }) {
  const name = (values.fullName || "").trim();
  const email = (values.email || "").trim();
  const mobile = (values.mobile || "").trim();
  const summary = (values.summary || "").trim();

  const skills = (values.skills || "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="p-0 m-0 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-slate-900">
            {name || "Your Name"}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {email ? email : "email@example.com"}
            {mobile ? ` • ${formatPhone(mobile)}` : ""}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Section title="Professional Summary">{summary || null}</Section>

        {skills.length ? (
          <Section title="Skills">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 12).map((s) => (
                <span
                  key={s}
                  className="text-[12px] px-2 py-1 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        ) : null}

        <div className="text-[12px] text-slate-400 mt-1">
          {"Resume type sections will appear as you complete the smart form."}
        </div>
      </div>
    </div>
  );
}
