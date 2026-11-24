import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, ConfirmDialog, ErrorNote, Field } from "../components/ui.jsx";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwError, setPwError] = useState("");
  const [del, setDel] = useState({ open: false, password: "", error: "", busy: false });

  const saveName = async (e) => {
    e.preventDefault();
    try { const d = await api.patch("/auth/me", { name }); setUser(d.user); toast.success("Profile updated."); } catch (err) { toast.error(err.message); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setPwError("");
    try { await api.post("/auth/password", pw); setPw({ currentPassword: "", newPassword: "" }); toast.success("Password changed. Other devices were signed out."); } catch (err) { setPwError(err.details?.[0]?.message || err.message); }
  };
  const deleteAccount = async () => {
    setDel((d) => ({ ...d, busy: true, error: "" }));
    try { await api.del("/auth/me", { password: del.password }); await logout(); toast.success("Account deleted."); navigate("/"); } catch (err) { setDel((d) => ({ ...d, busy: false, error: err.message })); }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <h1 className="text-2xl font-extrabold">Account settings</h1>
      <Card className="p-5">
        <form onSubmit={saveName} className="space-y-3">
          <h2 className="font-bold">Profile</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Signed in as {user.email}</p>
          <Field label="Name" value={name} max={80} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="primary" disabled={!name.trim() || name === user.name}>Save</Button>
        </form>
      </Card>
      <Card className="p-5">
        <form onSubmit={changePw} className="space-y-3">
          <h2 className="font-bold">Change password</h2>
          <Field label="Current password" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <Field label="New password" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} hint="At least 10 characters, with a letter and a number." />
          <ErrorNote>{pwError}</ErrorNote>
          <Button type="submit" variant="primary" disabled={!pw.currentPassword || !pw.newPassword}>Update password</Button>
        </form>
      </Card>
      <Card className="border-red-200 p-5 dark:border-red-900">
        <h2 className="font-bold text-red-700 dark:text-red-300">Delete account</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Permanently deletes your account and all saved resumes.</p>
        <Button className="mt-3" variant="danger" onClick={() => setDel({ open: true, password: "", error: "", busy: false })}>Delete my account</Button>
      </Card>
      <ConfirmDialog open={del.open} danger loading={del.busy} title="Delete your account?" confirmLabel="Delete everything" onCancel={() => setDel((d) => ({ ...d, open: false }))} onConfirm={deleteAccount}
        message={<span className="block space-y-3"><span className="block">Enter your password to confirm. This cannot be undone.</span><Field label="Password" type="password" value={del.password} onChange={(e) => setDel((d) => ({ ...d, password: e.target.value }))} error={del.error} /></span>} />
    </div>
  );
}
