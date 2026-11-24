import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Card, ErrorNote, Field } from "../components/ui.jsx";

const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

function AuthForm({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = safeNext(search.get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isReg = mode === "register";
  if (user) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setFieldErrors({}); setBusy(true);
    try {
      if (isReg) await register(form.email, form.name, form.password);
      else await login(form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.details) setFieldErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
    } finally { setBusy(false); }
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-extrabold">{isReg ? "Create your free account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{isReg ? "Save resumes and edit them from any device. You never need an account to build or download." : "Log in to see your saved resumes."}</p>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {isReg ? <Field label="Name" value={form.name} onChange={set("name")} autoComplete="name" required max={80} error={fieldErrors.name} /> : null}
          <Field label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required error={fieldErrors.email} />
          <Field label="Password" type="password" value={form.password} onChange={set("password")} autoComplete={isReg ? "new-password" : "current-password"} required error={fieldErrors.password} hint={isReg ? "At least 10 characters, with a letter and a number." : undefined} />
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" variant="primary" className="w-full" loading={busy}>{isReg ? "Create account" : "Log in"}</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          {isReg ? <>Already have an account? <Link to={`/login${search.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-indigo-600 underline">Log in</Link></> : <>New here? <Link to={`/register${search.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-indigo-600 underline">Create a free account</Link></>}
        </p>
        {!isReg ? <p className="mt-2 text-center text-xs text-slate-500">Forgot your password? Password reset by email isn’t available yet — see the Contact page.</p> : null}
      </Card>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
