import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FileText, Moon, Sun, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "./ui.jsx";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const link = ({ isActive }) => "rounded-lg px-3 py-2 text-sm font-medium " + (isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white");
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"><FileText className="h-4 w-4" aria-hidden /></span>
          <span className="hidden sm:inline">OnePage Resume</span>
        </Link>
        <nav className="ml-2 hidden items-center sm:flex" aria-label="Main">
          <NavLink to="/demo" className={link}>Demo</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">My resumes</span></Link>
              <Link to="/settings" aria-label="Account settings" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><Settings className="h-4 w-4" /></Link>
              <button onClick={logout} aria-label="Log out" title="Log out" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Log in</Link>
              <Link to="/register"><Button variant="primary" size="sm">Sign up free</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-sm text-slate-500 dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
        <p>© {new Date().getFullYear()} OnePage Resume Builder. Free forever.</p>
        <nav className="flex flex-wrap justify-center gap-4" aria-label="Footer">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

// Builder pages manage their own full-height layout, so no footer there.
export default function Layout() {
  const { pathname } = useLocation();
  const inBuilder = pathname.startsWith("/builder") || /^\/demo\/.+/.test(pathname);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900">Skip to content</a>
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      {inBuilder ? null : <Footer />}
    </div>
  );
}
