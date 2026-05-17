function Section({ title, children }) {
  return (
    <section className="mt-3">
      <div className="text-[12px] font-extrabold tracking-wide uppercase text-slate-700 dark:text-slate-200">
        {title}
      </div>
      <div className="h-[1px] bg-slate-200 dark:bg-slate-700 mt-1" />
      <div className="mt-2 text-[13.2px] leading-snug text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </section>
  );
}

function TextList({ raw }) {
  const items = (raw || "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return items.length ? (
    <ul className="list-disc pl-4">
      {items.map((it) => (
        <li key={it} className="mb-0.5">
          {it}
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-slate-400">—</div>
  );
}

export default function ResumeFresher({ values }) {
  return (
    <div className="flex-1 mt-3 flex flex-col">
      <Section title="Professional Summary">
        {values.careerObjective ? (
          values.careerObjective
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Section>

      <Section title="Education">
        <div>
          <div className="font-semibold">
            {values.collegeNameFresher || "College Name"}
          </div>
          <div className="text-slate-500 text-[12.5px]">
            {values.degreeFresher || "Degree"}
          </div>
        </div>
      </Section>

      <Section title="Skills">
        <TextList raw={values.skills} />
      </Section>

      <Section title="Projects">
        <div className="mb-2">
          <div className="font-semibold">
            {values.projectTitle || "Project Title"}
          </div>
          <div className="text-[13px] text-slate-600 dark:text-slate-200">
            {values.projectDescription || "Project Description"}
          </div>
        </div>
      </Section>

      {values.internshipFresher ? (
        <Section title="Internship">{values.internshipFresher}</Section>
      ) : null}

      {values.certificationsFresher ? (
        <Section title="Certifications">
          <TextList raw={values.certificationsFresher} />
        </Section>
      ) : null}

      {values.achievementsFresher ? (
        <Section title="Achievements">
          <TextList raw={values.achievementsFresher} />
        </Section>
      ) : null}

      <Section title="Languages">
        <TextList raw={values.languagesFresher} />
      </Section>

      <Section title="Interests">
        <TextList raw={values.interestsFresher} />
      </Section>
    </div>
  );
}
