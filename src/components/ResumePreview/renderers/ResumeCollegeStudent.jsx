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

export default function ResumeCollegeStudent({ values }) {
  return (
    <div className="flex-1 mt-3 flex flex-col">
      <Section title="Career Objective">
        {values.careerObjective ? (
          values.careerObjective
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Section>

      <Section title="Education">
        <div>
          <div className="font-semibold">
            {values.collegeName || "College Name"}
          </div>
          <div className="text-slate-500 text-[12.5px]">
            {values.degree || "Degree"} • {values.branch || "Branch"} •{" "}
            {values.currentYear || "Current Year"}
          </div>
          {values.education ? (
            <div className="mt-2">{values.education}</div>
          ) : null}
        </div>
      </Section>

      <Section title="Skills">
        <TextList raw={values.skills} />
      </Section>

      <Section title="Academic Projects">
        <TextList raw={values.academicProjects} />
      </Section>

      <Section title="Internship">
        {values.internship ? (
          values.internship
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Section>

      <Section title="Certifications">
        <TextList raw={values.certifications} />
      </Section>

      <Section title="Achievements">
        <TextList raw={values.achievements} />
      </Section>

      <Section title="Hobbies & Interests">
        <TextList
          raw={[values.hobbies, values.interests].filter(Boolean).join(", ")}
        />
      </Section>

      <Section title="Languages">
        <TextList raw={values.languages} />
      </Section>
    </div>
  );
}
