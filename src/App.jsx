import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import DemoPicker from "./pages/DemoPicker.jsx";
import Builder from "./pages/Builder.jsx";
import Dashboard, { RequireAuth } from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import { Login, Register } from "./pages/AuthPages.jsx";
import { About, Contact, Privacy, Terms } from "./pages/StaticPages.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/demo" element={<DemoPicker />} />
              <Route path="/demo/:demoId" element={<Builder key="demo" mode="demo" />} />
              <Route path="/builder/new" element={<Builder key="draft" mode="draft" />} />
              <Route path="/builder/:id" element={<RequireAuth><Builder mode="saved" /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
