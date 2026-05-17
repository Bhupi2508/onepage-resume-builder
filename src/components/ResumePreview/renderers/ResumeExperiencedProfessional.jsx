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

function ParagraphOrDash({ text }) {
  return text ? <div>{text}</div> : <div className="text-slate-400">—</div>;
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

export default function ResumeExperiencedProfessional({ values }) {
  const list = Array.isArray(values.experiences) ? values.experiences : [];

  return (
    <div className="flex-1 mt-3 flex flex-col">
      <Section title="Professional Summary">
        <ParagraphOrDash text={values.professionalSummary} />
      </Section>

      <Section title="Work Experience">
        <div className="flex flex-col gap-3">
          {list.map((exp, idx) => (
            <div key={idx} className="">
              <div className="font-semibold">
                {exp.designation || "Designation"} •{" "}
                {exp.companyName || "Company"}
              </div>
              <div className="text-[12.5px] text-slate-500 mt-0.5">
                {(exp.startDate || "Start") + " — " + (exp.endDate || "End")}
              </div>
              <div className="mt-2">
                <div className="font-semibold text-[12.5px]">
                  Responsibilities
                </div>
                <TextList raw={exp.responsibilities} />
              </div>
              <div className="mt-2">
                <div className="font-semibold text-[12.5px]">
                  Technologies Used
                </div>
                <TextList raw={exp.technologiesUsed} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Projects">
        <ParagraphOrDash text={values.projects} />
      </Section>

      <Section title="Skills">
        <TextList raw={values.skills} />
      </Section>

      <Section title="Certifications">
        <TextList raw={values.certificationsExperienced} />
      </Section>

      <Section title="Education">
        <ParagraphOrDash text={values.educationExperienced} />
      </Section>
    </div>
  );
}
