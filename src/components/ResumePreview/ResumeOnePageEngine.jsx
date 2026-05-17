import { useEffect, useMemo, useRef, useState } from "react";

export default function ResumeOnePageEngine({ children, onFitChange }) {
  const wrapRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, density: 0 });

  const densities = useMemo(
    () => [
      { scale: 1.0, pad: 24, gap: 10, font: 14 },
      { scale: 0.98, pad: 22, gap: 9, font: 13.6 },
      { scale: 0.96, pad: 20, gap: 8, font: 13.2 },
      { scale: 0.94, pad: 18, gap: 7, font: 12.8 },
      { scale: 0.92, pad: 16, gap: 6, font: 12.4 },
    ],
    []
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const root = el.querySelector("#resume-root");
    if (!root) return;

    const original = root.style.transform;

    let raf = 0;
    const doFit = () => {
      const avail = el.clientHeight;

      for (let i = 0; i < densities.length; i++) {
        const d = densities[i];
        root.style.transformOrigin = "top left";
        root.style.transform = `scale(${d.scale})`;
        root.style.padding = `${d.pad}px`;
        root.style.gap = `${d.gap}px`;
        root.style.setProperty("--resume-font", `${d.font}px`);

        const needed = root.scrollHeight * d.scale;
        const fits = needed <= avail;
        if (fits) {
          setFit({ scale: d.scale, density: i });
          onFitChange?.({ scale: d.scale, density: i });
          return;
        }
      }

      const last = densities[densities.length - 1];
      root.style.transform = `scale(${last.scale})`;
      root.style.padding = `${last.pad}px`;
      root.style.gap = `${last.gap}px`;
      root.style.setProperty("--resume-font", `${last.font}px`);
      setFit({ scale: last.scale, density: densities.length - 1 });
      onFitChange?.({ scale: last.scale, density: densities.length - 1 });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(doFit);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    schedule();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      root.style.transform = original;
    };
  }, [children, densities, onFitChange]);

  useEffect(() => {
    const handlerPdf = async (e) => {
      const detail = e.detail;
      const root = wrapRef.current?.querySelector("#resume-root");
      if (!root) return;

      try {
        await new Promise((r) => setTimeout(r, 80));

        const html2pdf =
          (await import("html2pdf.js")).default ||
          (await import("html2pdf.js"));

        const safeName = ((detail.fullName || "Resume").trim() || "Resume")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");

        const opt = {
          margin: [0.15, 0.15, 0.15, 0.15],
          filename: `${safeName}_Resume.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(root).save();
      } catch {
        window.dispatchEvent(
          new CustomEvent("resume:export-error", {
            detail: {
              type: "pdf",
              message: "PDF export failed. Please try again.",
            },
          })
        );
      }
    };

    const handlerDocx = async (e) => {
      const detail = e.detail;

      try {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } =
          await import("docx");
        const { saveAs } = await import("file-saver");

        const safeName = ((detail.fullName || "Resume").trim() || "Resume")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");

        const fullName = (detail.fullName || "").trim() || "";

        const header = [
          new Paragraph({ text: fullName, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: detail.email ? `Email: ${detail.email}` : "" }),
          new Paragraph({
            text: detail.mobile ? `Mobile: ${detail.mobile}` : "",
          }),
          ...(detail.linkedin
            ? [new Paragraph({ text: `LinkedIn: ${detail.linkedin}` })]
            : []),
          ...(detail.github
            ? [new Paragraph({ text: `GitHub: ${detail.github}` })]
            : []),
          ...(detail.leetcode
            ? [new Paragraph({ text: `LeetCode: ${detail.leetcode}` })]
            : []),
          ...(detail.twitter
            ? [new Paragraph({ text: `Twitter/X: ${detail.twitter}` })]
            : []),
          ...(detail.portfolio
            ? [new Paragraph({ text: `Portfolio: ${detail.portfolio}` })]
            : []),
        ];

        const skills = (detail.skills || "")
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 30);

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                ...header,
                new Paragraph({ text: " " }),
                ...(detail.professionalSummary ||
                detail.careerObjective ||
                detail.summary
                  ? [
                      new Paragraph({
                        text: "Professional Summary",
                        heading: HeadingLevel.HEADING_2,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text:
                              detail.professionalSummary ||
                              detail.careerObjective ||
                              detail.summary,
                          }),
                        ],
                      }),
                    ]
                  : []),
                ...(skills.length
                  ? [
                      new Paragraph({
                        text: "Skills",
                        heading: HeadingLevel.HEADING_2,
                      }),
                      new Paragraph({ text: skills.join(" • ") }),
                    ]
                  : []),
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${safeName}_Resume.docx`);
      } catch {
        window.dispatchEvent(
          new CustomEvent("resume:export-error", {
            detail: {
              type: "docx",
              message: "Word export failed. Please try again.",
            },
          })
        );
      }
    };

    window.addEventListener("resume:download-pdf", handlerPdf);
    window.addEventListener("resume:download-docx", handlerDocx);

    return () => {
      window.removeEventListener("resume:download-pdf", handlerPdf);
      window.removeEventListener("resume:download-docx", handlerDocx);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: 520 }}>
      <div
        id="resume-root"
        className="absolute inset-0 left-0 top-0 bg-white p-6 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
        style={{
          gap: 10,
          fontSize: "var(--resume-font, 14px)",
          transform: `scale(${fit.scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
