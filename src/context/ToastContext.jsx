import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const dismiss = useCallback((t) => setToasts((all) => all.filter((x) => x.id !== t)), []);
  const push = useCallback(
    (message, kind = "success") => {
      const t = ++id.current;
      setToasts((all) => [...all.slice(-3), { id: t, message, kind }]);
      setTimeout(() => dismiss(t), kind === "error" ? 7000 : 3500);
    },
    [dismiss]
  );
  const value = useMemo(() => ({ success: (m) => push(m, "success"), error: (m) => push(m, "error") }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={"flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-lg animate-in " + (t.kind === "error" ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100" : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100")}>
            {t.kind === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
