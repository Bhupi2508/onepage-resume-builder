import { forwardRef, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 dark:disabled:text-indigo-300",
  secondary: "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50",
  ghost: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
};

export const Button = forwardRef(function Button({ variant = "secondary", size = "md", loading, className = "", children, disabled, type = "button", ...rest }, ref) {
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm min-h-9" : "px-4 py-2.5 text-sm min-h-11";
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed ${sizes} ${VARIANTS[variant]} ${className}`} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

export function IconButton({ label, className = "", children, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed ${className}`} {...rest}>
      {children}
    </button>
  );
}

const inputCls = "mt-1 w-full rounded-xl border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ";

export function Field({ label, value = "", max, error, hint, multiline, id, className = "", ...rest }) {
  const fid = id || `f-${label.replace(/\W+/g, "-").toLowerCase()}-${rest.name || ""}`;
  const Tag = multiline ? "textarea" : "input";
  const over = max && value.length >= max;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={fid} className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</label>
        {max ? <span className={"text-xs tabular-nums " + (over ? "text-amber-600" : "text-slate-400")}>{value.length}/{max}</span> : null}
      </div>
      <Tag id={fid} value={value} maxLength={max} rows={multiline ? 3 : undefined} aria-invalid={!!error} aria-describedby={error || hint ? `${fid}-d` : undefined}
        className={inputCls + (error ? "border-red-400" : "border-slate-300 dark:border-slate-700") + (multiline ? " resize-y min-h-[4.5rem]" : "")} {...rest} />
      {error || hint ? <p id={`${fid}-d`} className={"mt-1 text-xs " + (error ? "text-red-600" : "text-slate-500 dark:text-slate-400")}>{error || hint}</p> : null}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {label}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">{children}</div>;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger, loading, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }} className="w-[min(92vw,26rem)] rounded-2xl p-0 backdrop:bg-slate-900/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-2xl">
      <div className="p-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}

export const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}>{children}</div>
);
