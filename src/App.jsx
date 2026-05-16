import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Builder from "./pages/Builder.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
