import { formatPhone } from "../../utils/format.js";

import ResumeSchoolStudent from "./renderers/ResumeSchoolStudent.jsx";
import ResumeCollegeStudent from "./renderers/ResumeCollegeStudent.jsx";
import ResumeFresher from "./renderers/ResumeFresher.jsx";
import ResumeExperiencedProfessional from "./renderers/ResumeExperiencedProfessional.jsx";

function SocialIcon({ href, label, children }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:opacity-80"
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
}

function PremiumHeader({ values }) {
  const name = (values.fullName || "").trim();
  const email = (values.email || "").trim();
  const mobile = (values.mobile || "").trim();

  const headerLine = [
    // Keep exactly as required: "Class 12 Student | email | mobile" for school, otherwise different role.
    // Templates pass the correct line via values._headerSubtitle
    values._headerSubtitle || "",
  ].filter(Boolean);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-[22px] md:text-[24px] font-extrabold tracking-wide text-slate-900 dark:text-slate-50">
        {name || "Your Name"}
      </div>

      <div className="mt-1 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 flex-wrap">
        {headerLine.join(" ") || (
          <span>
            {" "}
            | {email || "email@example.com"}
            {mobile ? ` | ${formatPhone(mobile)}` : ""}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <SocialIcon href={values.linkedin} label="LinkedIn">
          in
        </SocialIcon>
        <SocialIcon href={values.github} label="GitHub">
          GH
        </SocialIcon>
        <SocialIcon href={values.leetcode} label="LeetCode">
          LC
        </SocialIcon>
        <SocialIcon href={values.twitter} label="Twitter/X">
          X
        </SocialIcon>
        <SocialIcon href={values.discord} label="Discord">
          DC
        </SocialIcon>
        <SocialIcon href={values.youtube} label="YouTube">
          YT
        </SocialIcon>
        <SocialIcon href={values.portfolio} label="Portfolio">
          Web
        </SocialIcon>
      </div>
    </div>
  );
}

export default function ResumePreview({ values }) {
  const type = values.resumeType;

  if (type === "School Student")
    return (
      <div className="h-full flex flex-col">
        <PremiumHeader
          values={{
            ...values,
            _headerSubtitle: `${values.schoolClass || "Class"} Student`,
          }}
        />
        <ResumeSchoolStudent values={values} />
      </div>
    );

  if (type === "College Student")
    return (
      <div className="h-full flex flex-col">
        <PremiumHeader
          values={{
            ...values,
            _headerSubtitle: `${values.degree || "Degree"} ${
              values.branch || "Branch"
            } Student`,
          }}
        />
        <ResumeCollegeStudent values={values} />
      </div>
    );

  if (type === "Fresher")
    return (
      <div className="h-full flex flex-col">
        <PremiumHeader
          values={{
            ...values,
            _headerSubtitle: `Fresher Software Developer`,
          }}
        />
        <ResumeFresher values={values} />
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <PremiumHeader
        values={{
          ...values,
          _headerSubtitle: `Experienced Professional`,
        }}
      />
      <ResumeExperiencedProfessional values={values} />
    </div>
  );
}
