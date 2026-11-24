import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { MAX_DENSITY, summarizeFit } from "../../shared/fit.js";
import { measureFit } from "../resume/fitDom.js";

// Re-measures the rendered A4 page whenever the content changes and picks the
// least-compact density that fits (see shared/fit.js).
export function usePageFit(resume) {
  const containerRef = useRef(null);
  const [fit, setFit] = useState(null);
  const [fontTick, setFontTick] = useState(0);

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root || !root.querySelector("[data-resume-page]")) return;
    const m = measureFit(0, MAX_DENSITY, root);
    setFit((prev) => {
      const next = summarizeFit(m);
      return prev && prev.density === next.density && prev.used === next.used && prev.available === next.available && prev.sections.length === next.sections.length ? prev : next;
    });
  }, []);

  useLayoutEffect(measure, [resume, measure, fontTick]);

  useLayoutEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setFontTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, []);

  return { containerRef, fit };
}
