import { Download, Printer, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, ErrorNote } from "../ui.jsx";
import { FitMeter, OverflowHelp } from "./FitPanel.jsx";

export default function DownloadStep({ fit, resume, problems, busy, onDownload, onPrint, showPrint, onHide, onShorten, mode, user, onSave, saving }) {
  const blocked = problems.length > 0 || fit?.status === "overflow";
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Download your resume</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">You get a real, text-based PDF — exactly one A4 page, identical to the preview.</p>
      </div>
      <FitMeter fit={fit} />
      <OverflowHelp fit={fit} resume={resume} onHide={onHide} onShorten={onShorten} />
      {problems.length ? <ErrorNote>{problems.join(" ")}</ErrorNote> : null}
      <Button variant="primary" className="w-full" loading={busy} disabled={blocked} onClick={onDownload} data-testid="download-pdf"><Download className="h-4 w-4" />Download PDF</Button>
      {showPrint ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p>The PDF service isn’t reachable right now. You can still save a one-page PDF with your browser: choose “Save as PDF” and set margins to “None”.</p>
          <Button className="mt-2" size="sm" disabled={blocked} onClick={onPrint}><Printer className="h-4 w-4" />Print / Save as PDF</Button>
        </div>
      ) : null}
      {mode === "draft" ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
          {user ? (
            <>
              <p className="mb-2">Save this resume to your account to edit it later from any device.</p>
              <Button loading={saving} onClick={onSave}><Save className="h-4 w-4" />Save to my account</Button>
            </>
          ) : (
            <p>Want to come back later? <Link to="/register?next=/builder/new" className="font-semibold text-indigo-600 underline">Create a free account</Link> or <Link to="/login?next=/builder/new" className="font-semibold text-indigo-600 underline">log in</Link> to save it. Until then your draft stays in this browser.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
