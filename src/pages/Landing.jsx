import { motion } from "framer-motion";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const examples = [
  {
    title: "Student ATS Resume",
    lines: ["Header + Skills", "Projects/Activities", "Clean one-page layout"],
  },
  {
    title: "Fresher / College",
    lines: [
      "Education + Projects",
      "Internship/Certifications",
      "Balanced spacing",
    ],
  },
  {
    title: "Professional / Experienced",
    lines: ["Experience bullets", "Company history", "Premium typography"],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-soft flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                ONEPAGE AI RESUME BUILDER
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                ATS-friendly • One-page • Instant PDF/Word
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/builder")}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-50"
          >
            Build Resume
            <ArrowRight className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
            >
              Build a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                perfect one-page
              </span>{" "}
              resume.
            </motion.h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Smart forms for every profile type—students, freshers,
              professionals and government aspirants. Live preview always fits
              A4 with no clipping. Download as PDF or Word.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={() => navigate("/builder")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-semibold shadow-soft hover:opacity-95 transition"
              >
                Build Resume
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <FileText className="h-4 w-4" />
                <span>PDF & Word exports • No backend</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "One-page engine", value: "Always fits" },
                { label: "ATS-friendly", value: "Clean layout" },
                { label: "Instant preview", value: "Live updates" },
              ].map((x) => (
                <motion.div
                  key={x.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 backdrop-blur px-4 py-3"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {x.label}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-50">
                    {x.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/30 backdrop-blur shadow-soft p-5"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                Resume examples
              </div>
              <div className="space-y-3">
                {examples.map((ex, idx) => (
                  <motion.div
                    key={ex.title}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="rounded-2xl bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 dark:text-slate-50">
                        {ex.title}
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-soft" />
                    </div>
                    <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      {ex.lines.map((l) => (
                        <li key={l}>• {l}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="hidden md:block absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-20 blur-2xl" />
            <div className="hidden md:block absolute -top-6 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 opacity-20 blur-2xl" />
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
          Built for speed • Works offline after load • Ready for Netlify
        </footer>
      </div>
    </div>
  );
}
