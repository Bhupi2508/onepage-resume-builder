import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

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
      // Try from most natural to compressed
      for (let i = 0; i < densities.length; i++) {
        const d = densities[i];
        root.style.transformOrigin = "top left";
        root.style.transform = `scale(${d.scale})`;
        root.style.padding = `${d.pad}px`;
        root.style.gap = `${d.gap}px`;
        root.style.setProperty("--resume-font", `${d.font}px`);

        // Height after transform is tricky; use scrollHeight of unscaled content
        const needed = root.scrollHeight * d.scale;
        const fits = needed <= avail;
        if (fits) {
          setFit({ scale: d.scale, density: i });
          onFitChange?.({ scale: d.scale, density: i });
          return;
        }
      }

      // If nothing fits, pick last density
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

    // Resize observer for responsiveness
    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    // Also fit once
    schedule();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      root.style.transform = original;
    };
  }, [children, densities, onFitChange]);

  // Hook export triggers
  useEffect(() => {
    const handlerPdf = async (e) => {
      const detail = e.detail;
      const root = wrapRef.current?.querySelector("#resume-root");
      if (!root) return;

      // Ensure transform is applied before exporting
      // html2pdf uses DOM snapshot; give it a tick.
      await new Promise((r) => setTimeout(r, 80));

      const html2pdf =
        (await import("html2pdf.js")).default || (await import("html2pdf.js"));
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

      // Use A4 via CSS sizing is more consistent than jsPDF format here.
      await html2pdf().set(opt).from(root).save();
    };

    const handlerDocx = async (e) => {
      const detail = e.detail;
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } =
        await import("docx");
      const { saveAs } = await import("file-saver");

      const safeName = ((detail.fullName || "Resume").trim() || "Resume")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");

      const fullName = detail.fullName || "";
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
      ];

      const skills = (detail.skills || "")
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const skillParagraphs = skills.length
        ? [
            new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({}),
          ]
        : [];

      const skillRuns = skills.map((s) => `${s}`);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              ...header.filter((p) => p.rootKey !== undefined),
              new Paragraph({ text: " ", spacing: { after: 200 } }),
              ...(detail.summary
                ? [
                    new Paragraph({
                      text: "Professional Summary",
                      heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: detail.summary })],
                    }),
                  ]
                : []),
              ...(skills.length
                ? [
                    new Paragraph({
                      text: "Skills",
                      heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                      text: skillRuns.join(" • "),
                    }),
                  ]
                : []),
              new Paragraph({ text: " " }),
              new Paragraph({ text: "Generated by ONEPAGE AI Resume Builder" }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${safeName}_Resume.docx`);
    };

    window.addEventListener("resume:download-pdf", handlerPdf);
    window.addEventListener("resume:download-docx", handlerDocx);
    return () => {
      window.removeEventListener("resume:download-pdf", handlerPdf);
      window.removeEventListener("resume:download-docx", handlerDocx);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{
        // A4-ish height for preview area
        height: 520,
      }}
    >
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
