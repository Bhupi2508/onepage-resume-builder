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

export default function ResumeSchoolStudent({ values }) {
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
            {values.schoolName || "School Name"}
          </div>
          <div className="text-slate-500 text-[12.5px]">
            {values.schoolClass || "Class"}
          </div>
        </div>
        {values.favoriteSubjects ? null : null}
      </Section>

      <Section title="Skills">
        <TextList raw={values.skills} />
      </Section>

      <Section title="Favorite Subjects">
        <TextList raw={values.favoriteSubjects} />
      </Section>

      <Section title="Certifications">
        <TextList raw={values.certifications} />
      </Section>

      <Section title="Achievements">
        <div className="grid grid-cols-1 gap-1">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              Academic
            </div>
            <TextList raw={values.academicAchievements} />
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              Sports
            </div>
            <TextList raw={values.sportsAchievements} />
          </div>
        </div>
      </Section>

      <Section title="Hobbies & Interests">
        <TextList
          raw={[values.hobbies, values.interests].filter(Boolean).join(", ")}
        />
      </Section>

      <Section title="Languages">
        <TextList raw={values.languages} />
      </Section>

      {/* Optional sections (kept light to stay one-page) */}
      {values.extracurricularActivities ? (
        <Section title="Extracurricular Activities">
          <TextList raw={values.extracurricularActivities} />
        </Section>
      ) : null}

      {!values.favoriteSubjects &&
      !values.academicAchievements &&
      !values.sportsAchievements
        ? null
        : null}
    </div>
  );
}
