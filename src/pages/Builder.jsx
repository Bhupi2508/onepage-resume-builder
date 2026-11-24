import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Download, Eye, Loader2, Pencil } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { usePageFit } from "../hooks/usePageFit.js";
import { DEFAULT_PROFILE, createResume } from "../../shared/profiles.js";
import { applyProfile, patchSection, setBasics, setTemplate } from "../../shared/resumeOps.js";
import { exportProblems, validateResume } from "../../shared/schema.js";
import { getDemo } from "../../shared/demoData.js";
import { Button, ErrorNote, Spinner } from "../components/ui.jsx";
import { FitProbe, PrintCopy, Preview } from "../components/builder/Preview.jsx";
import { FitMeter, OverflowHelp } from "../components/builder/FitPanel.jsx";
import ProfileStep from "../components/builder/ProfileStep.jsx";
import BasicsStep from "../components/builder/BasicsStep.jsx";
import SectionsStep from "../components/builder/SectionsStep.jsx";
import DesignStep from "../components/builder/DesignStep.jsx";
import DownloadStep from "../components/builder/DownloadStep.jsx";
import { downloadPdf, isPdfUnavailable, printResume } from "../lib/pdf.js";

const DRAFT_KEY = "op-draft";
const DEMO_KEY = "op-demo";
const ALL_STEPS = [
  { id: "profile", label: "Profile" },
  { id: "details", label: "Details" },
  { id: "sections", label: "Sections" },
  { id: "design", label: "Template" },
  { id: "download", label: "Download" },
];

const readJson = (store, key) => {
  try { return JSON.parse(store.getItem(key)); } catch { return null; }
};
const defaultTitle = (r) => `${r.basics.name.trim() || "Untitled"} – ${r.profile.stage} resume`.slice(0, 80);

export default function Builder({ mode }) {
  const params = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const demo = mode === "demo" ? getDemo(params.demoId) : null;
  const [resume, setResume] = useState(() => {
    if (mode === "demo") {
      if (!demo) return null;
      const saved = readJson(sessionStorage, DEMO_KEY);
      return saved?.demoId === demo.id ? saved.resume : demo.build();
    }
    if (mode === "draft") {
      if (search.get("fresh")) localStorage.removeItem(DRAFT_KEY);
      return readJson(localStorage, DRAFT_KEY)?.resume || null;
    }
    return null;
  });
  const [title, setTitle] = useState(() => (mode === "draft" ? readJson(localStorage, DRAFT_KEY)?.title : null) || "");
  const [loadState, setLoadState] = useState(mode === "saved" ? "loading" : "ready");
  const [loadError, setLoadError] = useState("");
  const [pendingProfile, setPendingProfile] = useState(DEFAULT_PROFILE);
  const [step, setStep] = useState(() => (mode === "demo" || resume ? "details" : "profile"));
  const [tab, setTab] = useState("edit");
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const loadedId = useRef(null);

  const steps = mode === "demo" ? ALL_STEPS.slice(1) : ALL_STEPS;
  const edit = useCallback((fn) => { setResume((r) => (r ? fn(r) : r)); setDirty(true); }, []);

  // "?fresh=1" is a one-shot instruction: drop it so a reload keeps the draft.
  useEffect(() => {
    if (mode === "draft" && search.get("fresh")) navigate("/builder/new", { replace: true });
  }, [mode, search, navigate]);

  // Load a saved resume.
  useEffect(() => {
    if (mode !== "saved") return;
    let alive = true;
    setLoadState("loading");
    api.get(`/resumes/${params.id}`)
      .then((d) => { if (!alive) return; loadedId.current = d.resume.id; setResume(d.resume.data); setTitle(d.resume.title); setStep("details"); setLoadState("ready"); })
      .catch((e) => { if (alive) { setLoadError(e.message); setLoadState("error"); } });
    return () => { alive = false; };
  }, [mode, params.id]);

  // Persistence: demo -> sessionStorage, draft -> localStorage, saved -> API (debounced).
  useEffect(() => {
    if (!resume || !dirty) return undefined;
    if (mode === "demo") {
      const t = setTimeout(() => sessionStorage.setItem(DEMO_KEY, JSON.stringify({ demoId: demo.id, resume })), 400);
      return () => clearTimeout(t);
    }
    if (mode === "draft") {
      const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ resume, title })); } catch { /* storage full/blocked */ } }, 500);
      return () => clearTimeout(t);
    }
    if (mode === "saved" && loadedId.current) {
      if (!validateResume(resume).ok || !title.trim()) { setSaveState("error"); return undefined; }
      setSaveState("saving");
      const t = setTimeout(async () => {
        try {
          await api.put(`/resumes/${loadedId.current}`, { title: title.trim(), data: resume });
          setSaveState("saved"); setDirty(false);
        } catch (e) { setSaveState("error"); toast.error(e.message); }
      }, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [resume, title, dirty, mode, demo, toast]);

  const deferred = useDeferredValue(resume);
  const { containerRef, fit } = usePageFit(deferred);
  const validation = useMemo(() => (deferred ? validateResume(deferred) : { ok: true, errors: [] }), [deferred]);
  const errors = useMemo(() => Object.fromEntries(validation.errors.map((e) => [e.path, e.message])), [validation]);
  const problems = useMemo(() => (resume ? exportProblems(resume) : []), [resume]);

  if (mode === "demo" && !demo) return <Navigate to="/demo" replace />;
  if (loadState === "loading") return <Spinner label="Loading your resume…" />;
  if (loadState === "error") {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <ErrorNote>{loadError}</ErrorNote>
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-indigo-600 underline">Back to my resumes</Link>
      </div>
    );
  }

  // Draft with no resume yet: just the profile chooser.
  if (!resume) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-extrabold">Let’s build your one-page resume</h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">Free, no account needed. Tell us about you and we’ll set up the right sections.</p>
        <ProfileStep profile={pendingProfile} onChange={setPendingProfile} />
        <Button variant="primary" className="mt-6 w-full sm:w-auto" onClick={() => { setResume(createResume(pendingProfile)); setDirty(true); setStep("details"); }} data-testid="start-building">Start building <ArrowRight className="h-4 w-4" /></Button>
      </div>
    );
  }

  const idx = steps.findIndex((s) => s.id === step);
  const go = (id) => { setStep(id); setTab("edit"); window.scrollTo({ top: 0 }); };

  const hideSection = (id) => edit((r) => patchSection(r, id, { visible: false }));
  const shorten = (id) => { setFocusId(id); go("sections"); setTimeout(() => setFocusId(null), 500); };

  const onDownload = async () => {
    if (!validation.ok) { toast.error("Fix the highlighted fields before downloading."); return; }
    setBusy(true);
    try {
      await downloadPdf(resume);
      toast.success("PDF downloaded.");
    } catch (e) {
      if (isPdfUnavailable(e)) setShowPrint(true);
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const onSaveDraft = async () => {
    setSaving(true);
    try {
      const d = await api.post("/resumes", { title: title.trim() || defaultTitle(resume), data: resume });
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Saved to your account.");
      navigate(`/builder/${d.resume.id}`, { replace: true });
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const density = fit?.density ?? 0;
  const statusText = { saving: "Saving…", saved: "All changes saved", error: "Not saved — fix errors" }[saveState];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 lg:pb-6">
      {mode === "demo" ? (
        <div role="note" className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <p className="flex-1"><span className="mr-2 rounded bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">DEMO</span>Sample data about a fictional person — edit freely. Nothing is saved to an account; it lives only in this browser tab.</p>
          <Link to="/builder/new?fresh=1" className="shrink-0"><Button size="sm" variant="primary" className="w-full sm:w-auto">Start my own resume</Button></Link>
        </div>
      ) : null}
      {mode === "draft" && !user ? <p className="mb-3 text-xs text-slate-500">Working as a guest — your draft is kept in this browser only.</p> : null}

      <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-8">
        <section className={(tab === "edit" ? "block" : "hidden") + " lg:block"} aria-label="Resume editor">
          {mode === "saved" ? (
            <div className="mb-3 flex items-center gap-2">
              <input aria-label="Resume name" value={title} maxLength={80} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold hover:border-slate-300 focus:border-slate-400 dark:hover:border-slate-700" />
              <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500" aria-live="polite">{saveState === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : saveState === "saved" ? <Check className="h-3 w-3 text-emerald-600" /> : null}{statusText}</span>
            </div>
          ) : null}

          <nav aria-label="Steps" className="mb-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((s, i) => (
              <button key={s.id} type="button" onClick={() => go(s.id)} aria-current={s.id === step ? "step" : undefined} className={"flex min-h-11 flex-col items-center justify-center rounded-lg px-1 py-1.5 text-[11px] font-semibold leading-tight sm:text-xs " + (s.id === step ? "bg-indigo-600 text-white" : i < idx ? "bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                <span className="tabular-nums opacity-80">{i + 1}</span>{s.label}
              </button>
            ))}
          </nav>

          <div className="animate-in" key={step}>
            {step === "profile" ? (
              <div className="space-y-4">
                <ProfileStep profile={resume.profile} onChange={(p) => edit((r) => applyProfile(r, p, createResume))} />
                <p className="text-xs text-slate-500">Changing your profile adds any new suggested sections. Nothing you’ve entered is removed.</p>
              </div>
            ) : null}
            {step === "details" ? <BasicsStep basics={resume.basics} errors={errors} onChange={(p) => edit((r) => setBasics(r, p))} /> : null}
            {step === "sections" ? <SectionsStep resume={resume} edit={edit} errors={errors} focusId={focusId} /> : null}
            {step === "design" ? <DesignStep templateId={resume.templateId} onChange={(t) => edit((r) => setTemplate(r, t))} /> : null}
            {step === "download" ? (
              <DownloadStep fit={fit} resume={resume} problems={problems} busy={busy} onDownload={onDownload} onPrint={printResume} showPrint={showPrint} onHide={hideSection} onShorten={shorten} mode={mode} user={user} onSave={onSaveDraft} saving={saving} />
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <Button onClick={() => go(steps[idx - 1].id)} disabled={idx <= 0}><ArrowLeft className="h-4 w-4" />Back</Button>
            {idx < steps.length - 1 ? <Button variant="primary" onClick={() => go(steps[idx + 1].id)}>Next<ArrowRight className="h-4 w-4" /></Button> : null}
          </div>
        </section>

        <aside className={(tab === "preview" ? "block" : "hidden") + " lg:block lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:self-start lg:overflow-y-auto"} aria-label="Live preview">
          <div className="space-y-3 pb-2">
            {step !== "download" ? <FitMeter fit={fit} /> : null}
            {step !== "download" ? <OverflowHelp fit={fit} resume={resume} onHide={hideSection} onShorten={shorten} /> : null}
            <Preview resume={resume} density={density} />
          </div>
        </aside>
      </div>

      <FitProbe containerRef={containerRef} resume={deferred || resume} density={density} />
      <PrintCopy resume={resume} density={density} />

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <Button className="flex-1" variant={tab === "edit" ? "primary" : "secondary"} onClick={() => setTab("edit")} aria-pressed={tab === "edit"}><Pencil className="h-4 w-4" />Edit</Button>
        <Button className="flex-1" variant={tab === "preview" ? "primary" : "secondary"} onClick={() => setTab("preview")} aria-pressed={tab === "preview"}><Eye className="h-4 w-4" />Preview{fit?.status === "overflow" ? " ⚠" : ""}</Button>
        <Button className="flex-1" variant="secondary" onClick={() => go("download")}><Download className="h-4 w-4" />PDF</Button>
      </div>
    </div>
  );
}
