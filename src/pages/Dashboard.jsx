import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Download, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, ConfirmDialog, ErrorNote, Spinner } from "../components/ui.jsx";
import { downloadPdf } from "../lib/pdf.js";
import { getTemplate } from "../../shared/templates.js";
import { STAGES } from "../../shared/profiles.js";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => api.get("/resumes").then((d) => setItems(d.resumes)).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const download = async (id) => {
    setBusyId(id);
    try {
      const { resume } = await api.get(`/resumes/${id}`);
      await downloadPdf(resume.data);
      toast.success("PDF downloaded.");
    } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await api.del(`/resumes/${toDelete.id}`);
      setItems((l) => l.filter((r) => r.id !== toDelete.id));
      toast.success("Resume deleted.");
      setToDelete(null);
    } catch (e) { toast.error(e.message); } finally { setDeleting(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">My resumes</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Hi {user.name}. Everything here is saved to your account.</p>
        </div>
        <Link to="/builder/new?fresh=1"><Button variant="primary"><FilePlus2 className="h-4 w-4" />New resume</Button></Link>
      </div>
      <div className="mt-6">
        <ErrorNote>{error}</ErrorNote>
        {!items && !error ? <Spinner /> : null}
        {items && !items.length ? (
          <Card className="p-10 text-center">
            <p className="font-semibold">No saved resumes yet</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create one now, or open the demo to see how it works.</p>
            <div className="mt-4 flex justify-center gap-2"><Link to="/builder/new?fresh=1"><Button variant="primary">Create resume</Button></Link><Link to="/demo"><Button>Try demo</Button></Link></div>
          </Card>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {items?.map((r) => (
            <li key={r.id}>
              <Card className="flex h-full flex-col p-4">
                <p className="truncate font-bold" title={r.title}>{r.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{r.name || "No name yet"} · {STAGES.find((s) => s.id === r.stage)?.label || "Resume"}</p>
                <p className="text-xs text-slate-500">{getTemplate(r.templateId).label} · updated {new Date(r.updatedAt).toLocaleDateString()}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/builder/${r.id}`}><Button size="sm"><Pencil className="h-4 w-4" />Edit</Button></Link>
                  <Button size="sm" loading={busyId === r.id} onClick={() => download(r.id)}><Download className="h-4 w-4" />PDF</Button>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(r)} aria-label={`Delete ${r.title}`}><Trash2 className="h-4 w-4" />Delete</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
      <ConfirmDialog open={!!toDelete} danger loading={deleting} title="Delete this resume?" message={toDelete ? `“${toDelete.title}” will be permanently deleted. This can’t be undone.` : ""} confirmLabel="Delete resume" onCancel={() => setToDelete(null)} onConfirm={remove} />
    </div>
  );
}
