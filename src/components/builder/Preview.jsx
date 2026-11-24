import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ResumeDocument from "../../resume/ResumeDocument.jsx";

const PAGE_W = (210 / 25.4) * 96; // A4 width in CSS px
const PAGE_H = (297 / 25.4) * 96;

// Visible, scaled-to-fit A4 preview. Layout measurement happens in the hidden
// <FitProbe/>, which is always laid out even when this pane is not shown.
export function Preview({ resume, density }) {
  const wrap = useRef(null);
  const [scale, setScale] = useState(0.6);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1.1, Math.max(0.3, e.contentRect.width / PAGE_W))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrap} className="w-full">
      <div className="mx-auto overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-slate-200 dark:ring-slate-700" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_W, height: PAGE_H }} aria-label="Resume preview" role="img">
          <ResumeDocument resume={resume} density={density} />
        </div>
      </div>
    </div>
  );
}

export function FitProbe({ containerRef, resume, density }) {
  return (
    <div ref={containerRef} aria-hidden="true" style={{ position: "fixed", left: -99999, top: 0, visibility: "hidden", pointerEvents: "none" }}>
      <ResumeDocument resume={resume} density={density} />
    </div>
  );
}

// Copy used only by window.print() (see resume.css @media print).
export function PrintCopy({ resume, density }) {
  return createPortal(
    <div className="print-root"><ResumeDocument resume={resume} density={density} /></div>,
    document.body
  );
}
