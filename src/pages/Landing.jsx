import { Link } from "react-router-dom";
import { ArrowRight, FileCheck2, Gauge, LayoutTemplate, ShieldCheck, Users, Wand2 } from "lucide-react";
import { Button } from "../components/ui.jsx";
import { STAGES } from "../../shared/profiles.js";
import { TEMPLATES } from "../../shared/templates.js";

const FEATURES = [
  { icon: Gauge, title: "Always one page", text: "A live A4 preview and a page-fit meter tell you exactly how much room is left — and what to trim if you run over." },
  { icon: FileCheck2, title: "Real, ATS-friendly PDF", text: "Selectable text, standard fonts and a single column. The PDF matches the preview and never spills onto page two." },
  { icon: Users, title: "Built for everyone", text: "School students to senior engineers: you only see the sections that fit your situation." },
  { icon: LayoutTemplate, title: "Six honest templates", text: "Switch templates any time without losing a word you wrote." },
  { icon: Wand2, title: "Nothing silently removed", text: "When space is tight we suggest what to hide or shorten. You decide." },
  { icon: ShieldCheck, title: "Free, no strings", text: "No paywalls, credits or watermarks. No account is needed to build and download." },
];

export default function Landing() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 pb-14 pt-16 text-center sm:pt-24">
        <p className="mx-auto mb-4 w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">100% free · no sign-up needed</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">A professional <span className="text-indigo-600 dark:text-indigo-400">one-page resume</span>, without the design work</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Answer a few questions, fill in what applies to you, and download a clean A4 PDF that applicant tracking systems can read.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/builder/new"><Button variant="primary" className="w-full sm:w-auto px-6">Create my resume <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/demo"><Button className="w-full sm:w-auto px-6" data-testid="try-demo">Try the demo</Button></Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="who">
        <h2 id="who" className="text-center text-2xl font-bold">Made for every stage of your career</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {STAGES.map((s) => <span key={s.id} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">{s.label}</span>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="features">
        <h2 id="features" className="sr-only">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="tpl">
        <h2 id="tpl" className="text-center text-2xl font-bold">Templates</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="font-semibold">{t.label}</p><p className="text-sm text-slate-600 dark:text-slate-300">{t.description}</p></li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold">See it with sample data first</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Open a fictional student, fresher, manager or engineer resume, edit it, switch templates and download a PDF.</p>
        <Link to="/demo"><Button variant="primary" className="mt-5 px-6">Explore the demo</Button></Link>
      </section>
    </div>
  );
}
