import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Trash2,
  Sun,
  Moon,
  Sparkles,
  GraduationCap,
  Briefcase,
  LandPlot,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

import ResumePreview from "../components/ResumePreview/ResumePreview.jsx";
import ResumeOnePageEngine from "../components/ResumePreview/ResumeOnePageEngine.jsx";
import { validateResume } from "../utils/validation.js";
import { sanitizeResumeForPreview } from "../utils/security.js";

import {
  getInitialResumeState,
  resumeStorageKey,
  resumeTypes,
} from "../utils/resumeDefaults.js";

function Input({ label, placeholder, maxLen, error, register, inputMode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {label}
        </label>
        {typeof maxLen === "number" ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            0 / {maxLen}
          </div>
        ) : null}
      </div>
      <input
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLen}
        className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/30"
        {...register}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

function TextArea({ label, placeholder, maxLen, error, register }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {label}
        </label>
        {typeof maxLen === "number" ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            0 / {maxLen}
          </div>
        ) : null}
      </div>
      <textarea
        placeholder={placeholder}
        maxLength={maxLen}
        className="mt-2 w-full min-h-[92px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
        {...register}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

export default function Builder() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [resumeType, setResumeType] = useState(() => {
    const saved = localStorage.getItem("op-resume-type");
    return saved && resumeTypes.includes(saved) ? saved : "College Student";
  });

  const [templateId, setTemplateId] = useState(() => {
    const saved = localStorage.getItem("op-template");
    return saved || "minimal";
  });

  const initial = useMemo(
    () => getInitialResumeState(resumeType),
    [resumeType]
  );

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: initial,
  });

  const values = watch();

  const combined = useMemo(
    () => ({
      ...values,
      resumeType,
      templateId,
      // builder compatibility (templates expect fullName/email/mobile)
      fullName: values.fullName,
    }),
    [values, resumeType, templateId]
  );

  const onClear = () => {
    const empty = getInitialResumeState(resumeType);
    Object.keys(empty).forEach((k) => setValue(k, empty[k]));
    localStorage.removeItem(resumeStorageKey);
    localStorage.removeItem("op-resume-type");
    localStorage.removeItem("op-template");
  };

  // Auto-save (lightweight)
  useMemo(() => {
    const t = setInterval(() => {
      try {
        const payload = { resumeType, templateId, data: watch() };
        localStorage.setItem(resumeStorageKey, JSON.stringify(payload));
        localStorage.setItem("op-resume-type", resumeType);
        localStorage.setItem("op-template", templateId);
      } catch {
        // ignore
      }
    }, 800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeType, templateId]);

  const [fitState, setFitState] = useState({ scale: 1, density: 0 });

  const sanitizedCombined = useMemo(() => {
    try {
      return sanitizeResumeForPreview(combined);
    } catch {
      return combined;
    }
  }, [combined]);

  const resumeValidation = useMemo(
    () => validateResume(sanitizedCombined),
    [sanitizedCombined]
  );
  const isResumeValid = !resumeValidation;

  const [exportLocked, setExportLocked] = useState(false);

  const resumeValidationMessage = resumeValidation?.message;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/30 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50"
          >
            ← Landing
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/30 h-10 w-10"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/30 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:col-span-5"
          >
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/20 backdrop-blur shadow-soft p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                      Resume Builder
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    One-page ATS layout with intelligent fit.
                  </div>
                </div>

                <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                  Fit:{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {fitState.scale.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Resume category
                </label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeTypes.map((t) => {
                    const icon =
                      t === "School Student" ? (
                        <GraduationCap className="h-4 w-4" />
                      ) : t === "Experienced Professional" ? (
                        <Briefcase className="h-4 w-4" />
                      ) : t === "College Student" ? (
                        <LandPlot className="h-4 w-4" />
                      ) : (
                        <Briefcase className="h-4 w-4" />
                      );
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setResumeType(t);
                          localStorage.setItem("op-resume-type", t);
                          window.location.reload();
                        }}
                        className={
                          "text-left rounded-2xl border px-3 py-3 transition " +
                          (resumeType === t
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20 hover:bg-white/45")
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={
                              resumeType === t
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-slate-600 dark:text-slate-300"
                            }
                          >
                            {icon}
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-50">
                            {t}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Template
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "minimal", label: "Minimal" },
                    { id: "modern", label: "Modern" },
                    { id: "gradient", label: "Gradient" },
                    { id: "student", label: "Student" },
                  ].map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => {
                        setTemplateId(x.id);
                        localStorage.setItem("op-template", x.id);
                      }}
                      className={
                        "rounded-2xl border px-3 py-3 text-sm font-semibold transition " +
                        (templateId === x.id
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200"
                          : "border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20 hover:bg-white/45")
                      }
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {/* ONLY: Full Name, Email Address, Mobile Number */}
                <Input
                  label="Full Name *"
                  placeholder="e.g. John Doe"
                  maxLen={40}
                  error={errors.fullName?.message || undefined}
                  register={register("fullName")}
                />
                <Input
                  label="Email Address *"
                  placeholder="name@example.com"
                  maxLen={80}
                  error={errors.email?.message || undefined}
                  register={register("email")}
                />
                <Input
                  label="Mobile Number *"
                  placeholder="10 digit number"
                  maxLen={10}
                  error={errors.mobile?.message || undefined}
                  register={register("mobile")}
                  inputMode="numeric"
                />

                {/* Category-specific forms */}
                {resumeType === "School Student" ? (
                  <>
                    <Input
                      label="School Name *"
                      placeholder="e.g. Central School"
                      maxLen={80}
                      register={register("schoolName")}
                      error={errors.schoolName?.message}
                    />
                    <Input
                      label="Class *"
                      placeholder="e.g. Class 12"
                      maxLen={40}
                      register={register("schoolClass")}
                      error={errors.schoolClass?.message}
                    />
                    <TextArea
                      label="Career Objective *"
                      placeholder="Short objective"
                      maxLen={350}
                      register={register("careerObjective")}
                      error={errors.careerObjective?.message}
                    />
                    <TextArea
                      label="Skills * (at least 2)"
                      placeholder="e.g. Communication, Problem Solving"
                      maxLen={240}
                      register={register("skills")}
                      error={errors.skills?.message}
                    />

                    {/* Optional sections */}
                    <TextArea
                      label="Favorite Subjects"
                      placeholder="e.g. Math, Physics, English"
                      maxLen={240}
                      register={register("favoriteSubjects")}
                      error={errors.favoriteSubjects?.message}
                    />
                    <TextArea
                      label="Academic Achievements"
                      placeholder="e.g. Top 10 in class"
                      maxLen={240}
                      register={register("academicAchievements")}
                      error={errors.academicAchievements?.message}
                    />
                    <TextArea
                      label="Sports Achievements"
                      placeholder="e.g. District-level runner"
                      maxLen={240}
                      register={register("sportsAchievements")}
                      error={errors.sportsAchievements?.message}
                    />
                    <TextArea
                      label="Certifications"
                      placeholder="e.g. Python Basics"
                      maxLen={240}
                      register={register("certifications")}
                      error={errors.certifications?.message}
                    />
                    <TextArea
                      label="Hobbies"
                      placeholder="e.g. Reading"
                      maxLen={240}
                      register={register("hobbies")}
                      error={errors.hobbies?.message}
                    />
                    <TextArea
                      label="Interests"
                      placeholder="e.g. AI, Astronomy"
                      maxLen={240}
                      register={register("interests")}
                      error={errors.interests?.message}
                    />
                    <TextArea
                      label="Languages"
                      placeholder="e.g. English, Hindi"
                      maxLen={200}
                      register={register("languages")}
                      error={errors.languages?.message}
                    />
                    <TextArea
                      label="Extracurricular Activities"
                      placeholder="e.g. Debate club"
                      maxLen={240}
                      register={register("extracurricularActivities")}
                      error={errors.extracurricularActivities?.message}
                    />

                    {/* Social (optional, shown to support premium header requirement) */}
                    <Input
                      label="LinkedIn"
                      placeholder="https://linkedin.com/in/..."
                      maxLen={500}
                      register={register("linkedin")}
                      error={errors.linkedin?.message}
                    />
                    <Input
                      label="GitHub"
                      placeholder="https://github.com/..."
                      maxLen={500}
                      register={register("github")}
                      error={errors.github?.message}
                    />
                    <Input
                      label="LeetCode"
                      placeholder="https://leetcode.com/..."
                      maxLen={500}
                      register={register("leetcode")}
                      error={errors.leetcode?.message}
                    />
                    <Input
                      label="Twitter/X"
                      placeholder="https://twitter.com/..."
                      maxLen={500}
                      register={register("twitter")}
                      error={errors.twitter?.message}
                    />
                    <Input
                      label="Discord"
                      placeholder="https://discord.com/invite/..."
                      maxLen={500}
                      register={register("discord")}
                      error={errors.discord?.message}
                    />
                    <Input
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      maxLen={500}
                      register={register("youtube")}
                      error={errors.youtube?.message}
                    />
                    <Input
                      label="Portfolio Website"
                      placeholder="https://..."
                      maxLen={500}
                      register={register("portfolio")}
                      error={errors.portfolio?.message}
                    />
                  </>
                ) : null}

                {resumeType === "College Student" ? (
                  <>
                    <Input
                      label="College Name *"
                      placeholder="e.g. ABC College"
                      maxLen={80}
                      register={register("collegeName")}
                      error={errors.collegeName?.message}
                    />
                    <Input
                      label="Degree *"
                      placeholder="e.g. B.Tech"
                      maxLen={80}
                      register={register("degree")}
                      error={errors.degree?.message}
                    />
                    <Input
                      label="Branch *"
                      placeholder="e.g. Computer Science"
                      maxLen={80}
                      register={register("branch")}
                      error={errors.branch?.message}
                    />
                    <Input
                      label="Current Year *"
                      placeholder="e.g. 3"
                      maxLen={10}
                      register={register("currentYear")}
                      error={errors.currentYear?.message}
                    />
                    <TextArea
                      label="Career Objective *"
                      placeholder="Short objective"
                      maxLen={350}
                      register={register("careerObjective")}
                      error={errors.careerObjective?.message}
                    />
                    <TextArea
                      label="Skills * (at least 2)"
                      placeholder="e.g. React, SQL"
                      maxLen={240}
                      register={register("skills")}
                      error={errors.skills?.message}
                    />

                    <TextArea
                      label="Academic Projects"
                      placeholder="Project list"
                      maxLen={1200}
                      register={register("academicProjects")}
                      error={errors.academicProjects?.message}
                    />
                    <TextArea
                      label="Internship"
                      placeholder="Internship details"
                      maxLen={800}
                      register={register("internship")}
                      error={errors.internship?.message}
                    />
                    <TextArea
                      label="Certifications"
                      placeholder="Certifications list"
                      maxLen={800}
                      register={register("certifications")}
                      error={errors.certifications?.message}
                    />
                    <TextArea
                      label="Achievements"
                      placeholder="Achievements list"
                      maxLen={800}
                      register={register("achievements")}
                      error={errors.achievements?.message}
                    />
                    <TextArea
                      label="Hobbies"
                      placeholder="Hobbies"
                      maxLen={600}
                      register={register("hobbies")}
                      error={errors.hobbies?.message}
                    />
                    <TextArea
                      label="Interests"
                      placeholder="Interests"
                      maxLen={600}
                      register={register("interests")}
                      error={errors.interests?.message}
                    />
                    <TextArea
                      label="Languages"
                      placeholder="Languages"
                      maxLen={500}
                      register={register("languages")}
                      error={errors.languages?.message}
                    />

                    <Input
                      label="LinkedIn"
                      placeholder="https://linkedin.com/in/..."
                      maxLen={500}
                      register={register("linkedin")}
                      error={errors.linkedin?.message}
                    />
                    <Input
                      label="GitHub"
                      placeholder="https://github.com/..."
                      maxLen={500}
                      register={register("github")}
                      error={errors.github?.message}
                    />
                    <Input
                      label="LeetCode"
                      placeholder="https://leetcode.com/..."
                      maxLen={500}
                      register={register("leetcode")}
                      error={errors.leetcode?.message}
                    />
                    <Input
                      label="Twitter/X"
                      placeholder="https://twitter.com/..."
                      maxLen={500}
                      register={register("twitter")}
                      error={errors.twitter?.message}
                    />
                    <Input
                      label="Discord"
                      placeholder="https://discord.com/invite/..."
                      maxLen={500}
                      register={register("discord")}
                      error={errors.discord?.message}
                    />
                    <Input
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      maxLen={500}
                      register={register("youtube")}
                      error={errors.youtube?.message}
                    />
                    <Input
                      label="Portfolio Website"
                      placeholder="https://..."
                      maxLen={500}
                      register={register("portfolio")}
                      error={errors.portfolio?.message}
                    />
                  </>
                ) : null}

                {resumeType === "Fresher" ? (
                  <>
                    <Input
                      label="Degree *"
                      placeholder="e.g. B.Tech"
                      maxLen={80}
                      register={register("degreeFresher")}
                      error={errors.degreeFresher?.message}
                    />
                    <Input
                      label="College Name *"
                      placeholder="e.g. ABC College"
                      maxLen={80}
                      register={register("collegeNameFresher")}
                      error={errors.collegeNameFresher?.message}
                    />
                    <TextArea
                      label="Skills *"
                      placeholder="e.g. JavaScript, React"
                      maxLen={240}
                      register={register("skills")}
                      error={errors.skills?.message}
                    />
                    <TextArea
                      label="Project Title + Description * (at least 1 project)"
                      placeholder="Title\nDescription"
                      maxLen={1200}
                      register={register("projectTitle")}
                      error={errors.projectTitle?.message}
                    />
                    <TextArea
                      label="Project Description"
                      placeholder="(put details here)"
                      maxLen={1200}
                      register={register("projectDescription")}
                      error={errors.projectDescription?.message}
                    />

                    <TextArea
                      label="Internship"
                      placeholder="Internship details"
                      maxLen={800}
                      register={register("internshipFresher")}
                      error={errors.internshipFresher?.message}
                    />
                    <TextArea
                      label="Certifications"
                      placeholder="Certifications"
                      maxLen={800}
                      register={register("certificationsFresher")}
                      error={errors.certificationsFresher?.message}
                    />
                    <TextArea
                      label="Achievements"
                      placeholder="Achievements"
                      maxLen={800}
                      register={register("achievementsFresher")}
                      error={errors.achievementsFresher?.message}
                    />
                    <TextArea
                      label="Languages"
                      placeholder="Languages"
                      maxLen={500}
                      register={register("languagesFresher")}
                      error={errors.languagesFresher?.message}
                    />
                    <TextArea
                      label="Interests"
                      placeholder="Interests"
                      maxLen={600}
                      register={register("interestsFresher")}
                      error={errors.interestsFresher?.message}
                    />

                    <Input
                      label="LinkedIn"
                      placeholder="https://linkedin.com/in/..."
                      maxLen={500}
                      register={register("linkedin")}
                      error={errors.linkedin?.message}
                    />
                    <Input
                      label="GitHub"
                      placeholder="https://github.com/..."
                      maxLen={500}
                      register={register("github")}
                      error={errors.github?.message}
                    />
                    <Input
                      label="LeetCode"
                      placeholder="https://leetcode.com/..."
                      maxLen={500}
                      register={register("leetcode")}
                      error={errors.leetcode?.message}
                    />
                    <Input
                      label="Twitter/X"
                      placeholder="https://twitter.com/..."
                      maxLen={500}
                      register={register("twitter")}
                      error={errors.twitter?.message}
                    />
                    <Input
                      label="Discord"
                      placeholder="https://discord.com/invite/..."
                      maxLen={500}
                      register={register("discord")}
                      error={errors.discord?.message}
                    />
                    <Input
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      maxLen={500}
                      register={register("youtube")}
                      error={errors.youtube?.message}
                    />
                    <Input
                      label="Portfolio Website"
                      placeholder="https://..."
                      maxLen={500}
                      register={register("portfolio")}
                      error={errors.portfolio?.message}
                    />
                  </>
                ) : null}

                {resumeType === "Experienced Professional" ? (
                  <>
                    <TextArea
                      label="Professional Summary *"
                      placeholder="Your summary"
                      maxLen={800}
                      register={register("professionalSummary")}
                      error={errors.professionalSummary?.message}
                    />
                    <TextArea
                      label="Skills *"
                      placeholder="e.g. Node.js, System Design"
                      maxLen={240}
                      register={register("skills")}
                      error={errors.skills?.message}
                    />

                    {/* Experience */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/20 p-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Experience * (at least 1)
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-3">
                        <Input
                          label="Company Name"
                          placeholder="e.g. Acme Inc"
                          maxLen={80}
                          register={register("experiences.0.companyName")}
                        />
                        <Input
                          label="Designation"
                          placeholder="e.g. Senior Backend Developer"
                          maxLen={100}
                          register={register("experiences.0.designation")}
                        />
                        <Input
                          label="Start Date"
                          placeholder="e.g. Jan 2022"
                          maxLen={40}
                          register={register("experiences.0.startDate")}
                        />
                        <Input
                          label="End Date"
                          placeholder="e.g. Present"
                          maxLen={40}
                          register={register("experiences.0.endDate")}
                        />
                        <TextArea
                          label="Responsibilities"
                          placeholder="Responsibilities (bullets or lines)"
                          maxLen={1200}
                          register={register("experiences.0.responsibilities")}
                        />
                        <TextArea
                          label="Technologies Used"
                          placeholder="e.g. Node.js, PostgreSQL"
                          maxLen={800}
                          register={register("experiences.0.technologiesUsed")}
                        />
                      </div>
                    </div>

                    <TextArea
                      label="Projects"
                      placeholder="Projects"
                      maxLen={1200}
                      register={register("projects")}
                      error={errors.projects?.message}
                    />
                    <TextArea
                      label="Certifications"
                      placeholder="Certifications"
                      maxLen={800}
                      register={register("certificationsExperienced")}
                      error={errors.certificationsExperienced?.message}
                    />
                    <TextArea
                      label="Education"
                      placeholder="Education"
                      maxLen={800}
                      register={register("educationExperienced")}
                      error={errors.educationExperienced?.message}
                    />

                    <Input
                      label="LinkedIn"
                      placeholder="https://linkedin.com/in/..."
                      maxLen={500}
                      register={register("linkedin")}
                      error={errors.linkedin?.message}
                    />
                    <Input
                      label="GitHub"
                      placeholder="https://github.com/..."
                      maxLen={500}
                      register={register("github")}
                      error={errors.github?.message}
                    />
                    <Input
                      label="LeetCode"
                      placeholder="https://leetcode.com/..."
                      maxLen={500}
                      register={register("leetcode")}
                      error={errors.leetcode?.message}
                    />
                    <Input
                      label="Twitter/X"
                      placeholder="https://twitter.com/..."
                      maxLen={500}
                      register={register("twitter")}
                      error={errors.twitter?.message}
                    />
                    <Input
                      label="Discord"
                      placeholder="https://discord.com/invite/..."
                      maxLen={500}
                      register={register("discord")}
                      error={errors.discord?.message}
                    />
                    <Input
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      maxLen={500}
                      register={register("youtube")}
                      error={errors.youtube?.message}
                    />
                    <Input
                      label="Portfolio Website"
                      placeholder="https://..."
                      maxLen={500}
                      register={register("portfolio")}
                      error={errors.portfolio?.message}
                    />
                  </>
                ) : null}
              </div>

              {resumeValidationMessage ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  {resumeValidationMessage}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
                  Ready to export.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:col-span-7"
          >
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/20 backdrop-blur shadow-soft p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Live A4 Preview
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Updates instantly as you type.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isResumeValid) return;
                      if (exportLocked) return;
                      setExportLocked(true);
                      window.dispatchEvent(
                        new CustomEvent("resume:download-pdf", {
                          detail: sanitizedCombined,
                        })
                      );
                      setTimeout(() => setExportLocked(false), 2000);
                    }}
                    disabled={!isResumeValid || exportLocked}
                    className={
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-soft transition " +
                      (isResumeValid
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-95"
                        : "bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed")
                    }
                    aria-disabled={!isResumeValid}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>

                  <button
                    onClick={() => {
                      if (!isResumeValid) return;
                      if (exportLocked) return;
                      setExportLocked(true);
                      window.dispatchEvent(
                        new CustomEvent("resume:download-docx", {
                          detail: sanitizedCombined,
                        })
                      );
                      setTimeout(() => setExportLocked(false), 2000);
                    }}
                    disabled={!isResumeValid || exportLocked}
                    className={
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition " +
                      (isResumeValid
                        ? "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 text-slate-900 dark:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-900/30"
                        : "border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed")
                    }
                    aria-disabled={!isResumeValid}
                  >
                    Download Word
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <ResumeOnePageEngine
                  resumeType={resumeType}
                  templateId={templateId}
                  onFitChange={({ scale }) => setFitState({ scale })}
                >
                  <ResumePreview values={sanitizedCombined} />
                </ResumeOnePageEngine>
              </div>

              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Tip: keep bullets concise—this builder compresses spacing to
                always fit.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
