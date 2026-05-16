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
import {
  getInitialResumeState,
  resumeStorageKey,
  resumeTypes,
} from "../utils/resumeDefaults.js";

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
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: initial,
  });

  // Keep form values in sync when resume type changes
  // (we keep it simple for v1: reset defaults)
  // Production-ready: you can preserve values per type if desired.
  const values = watch();

  const combined = useMemo(() => {
    return {
      ...values,
      resumeType,
      templateId,
    };
  }, [values, resumeType, templateId]);

  const onClear = () => {
    const empty = getInitialResumeState(resumeType);
    Object.keys(empty).forEach((k) => setValue(k, empty[k]));
    localStorage.removeItem(resumeStorageKey);
    localStorage.removeItem("op-resume-type");
    localStorage.removeItem("op-template");
  };

  // Save to localStorage (throttling could be added)
  const onAutoSave = () => {
    try {
      const payload = {
        resumeType,
        templateId,
        data: watch(),
      };
      localStorage.setItem(resumeStorageKey, JSON.stringify(payload));
      localStorage.setItem("op-resume-type", resumeType);
      localStorage.setItem("op-template", templateId);
    } catch {
      // ignore
    }
  };

  // Auto-save on every change via useEffect-like pattern using handleSubmit hack is overkill.
  // We'll instead attach onAutoSave to form submitless updates using a lightweight interval.
  // For now: quick interval ensures persistence.
  useMemo(() => {
    const t = setInterval(onAutoSave, 800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeType, templateId]);

  const [fitState, setFitState] = useState({ scale: 1, density: 0 });

  const resumeValidation = useMemo(() => validateResume(combined), [combined]);

  const resumeRootRefProps = {
    onFitChange: setFitState,
  };

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
                  Resume type
                </label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeTypes.map((t) => {
                    const icon =
                      t === "School Student" ? (
                        <GraduationCap className="h-4 w-4" />
                      ) : t === "Government Job Aspirant" ? (
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
                          // Reset is handled by defaultValues initial memo only on first mount.
                          // For production: persist per type and remount form.
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
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  maxLen={40}
                  error={errors.fullName?.message}
                  register={register("fullName")}
                />
                <Input
                  label="Email"
                  placeholder="name@example.com"
                  maxLen={80}
                  error={errors.email?.message}
                  register={register("email")}
                />
                <Input
                  label="Mobile"
                  placeholder="10 digit number"
                  maxLen={10}
                  error={errors.mobile?.message}
                  register={register("mobile")}
                  inputMode="numeric"
                />

                {/* Minimal common fields for v1 */}
                <TextArea
                  label="Skills"
                  placeholder="React, JavaScript, SQL"
                  maxLen={240}
                  error={errors.skills?.message}
                  register={register("skills")}
                />
                <TextArea
                  label="Professional Summary"
                  placeholder="Short ATS-friendly summary"
                  maxLen={250}
                  error={errors.summary?.message}
                  register={register("summary")}
                />
              </div>

              {resumeValidation?.message ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  {resumeValidation.message}
                </div>
              ) : null}
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
                      const payload = combined;
                      window.dispatchEvent(
                        new CustomEvent("resume:download-pdf", {
                          detail: payload,
                        })
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-sm font-semibold shadow-soft hover:opacity-95 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>

                  <button
                    onClick={() => {
                      const payload = combined;
                      window.dispatchEvent(
                        new CustomEvent("resume:download-docx", {
                          detail: payload,
                        })
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-900/30 transition"
                  >
                    Download Word
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <ResumeOnePageEngine
                  resumeType={resumeType}
                  templateId={templateId}
                  onFitChange={resumeRootRefProps.onFitChange}
                >
                  <ResumePreview values={combined} />
                </ResumeOnePageEngine>
              </div>

              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Tip: keep bullets concise—this builder compresses spacing to
                always fit A4.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, maxLen, error, register, inputMode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {label}
        </label>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          0 / {maxLen}
        </div>
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
        <div className="text-xs text-slate-500 dark:text-slate-400">
          0 / {maxLen}
        </div>
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
