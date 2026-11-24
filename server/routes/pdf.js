import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { HttpError, asyncHandler, parseBody } from "../http.js";
import { exportProblems, resumeSchema } from "../../shared/schema.js";

const bodySchema = z.object({ resume: resumeSchema });

const fileName = (name) => `${(name || "resume").normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_").slice(0, 50) || "resume"}_Resume.pdf`;

// Public on purpose: the no-login demo can download PDFs. The input is the
// same strict schema as saved resumes, rendering has no network access, and
// the route is rate limited.
export default function pdfRoutes({ pdf, config }) {
  const r = Router();
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: config.rateLimits.pdfMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many PDF requests. Please wait a minute." } },
  });

  r.get("/status", (_req, res) => res.json({ available: pdf.isAvailable() }));

  r.post("/", limiter, asyncHandler(async (req, res) => {
    const { resume } = parseBody(bodySchema, req.body);
    const problems = exportProblems(resume);
    if (problems.length) throw new HttpError(422, "INCOMPLETE", problems[0], problems);
    const { pdf: buf, fit } = await pdf.render(resume);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName(resume.basics.name)}"`,
      "Content-Length": buf.length,
      "X-Resume-Density": String(fit.density),
      "Cache-Control": "no-store",
    });
    res.send(buf);
  }));

  return r;
}
