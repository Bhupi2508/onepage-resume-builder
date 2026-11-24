import { Link } from "react-router-dom";
import { DEMO_PROFILES } from "../../shared/demoData.js";

export default function DemoPicker() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <span className="rounded bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">DEMO</span>
      <h1 className="mt-3 text-3xl font-extrabold">Pick a sample profile</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">All people and details are fictional. No account is needed, and nothing is saved anywhere except this browser tab.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {DEMO_PROFILES.map((d) => (
          <li key={d.id}>
            <Link to={`/demo/${d.id}`} data-testid={`demo-${d.id}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md focus-visible:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <span className="block font-bold">{d.label}</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{d.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">Ready for your own? <Link to="/builder/new?fresh=1" className="font-semibold text-indigo-600 underline">Start a fresh resume</Link></p>
    </div>
  );
}
