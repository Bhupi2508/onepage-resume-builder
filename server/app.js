import fs from "node:fs";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createAuth } from "./auth.js";
import { HttpError, errorMiddleware } from "./http.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import pdfRoutes from "./routes/pdf.js";
import { createPdfService } from "./pdf/service.js";

export function createApp({ db, config, pdf = createPdfService(config) }) {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    })
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());

  const auth = createAuth(db, config);
  const api = express.Router();

  api.use(rateLimit({ windowMs: 60_000, limit: config.rateLimits.apiMax, standardHeaders: "draft-7", legacyHeaders: false, message: { error: { code: "RATE_LIMITED", message: "Too many requests" } } }));

  // CSRF defence-in-depth (cookies are also SameSite=Lax): state-changing
  // requests must be JSON and, when a browser sends Origin, same-origin or the
  // configured client origin.
  api.use((req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (origin) {
      const allowed = new Set([config.clientOrigin, `${req.protocol}://${req.get("host")}`]);
      if (!allowed.has(origin)) return next(new HttpError(403, "BAD_ORIGIN", "Cross-origin request blocked"));
    }
    const hasBody = req.get("content-length") && req.get("content-length") !== "0";
    if (hasBody && !req.is("application/json")) return next(new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json"));
    next();
  });
  api.use(auth.loadUser);
  api.use((req, res, next) => {
    if (req.path !== "/pdf" && req.path !== "/pdf/status") res.set("Cache-Control", "no-store");
    next();
  });

  api.get("/health", (_req, res) => res.json({ ok: true }));
  api.use("/auth", authRoutes({ db, auth, config }));
  api.use("/resumes", resumeRoutes({ db, config }));
  api.use("/pdf", pdfRoutes({ pdf, config }));
  api.use((_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "Not found")));
  app.use("/api", api);

  const dist = path.resolve("dist");
  if (config.serveStatic && fs.existsSync(dist)) {
    app.use(express.static(dist, { index: false, maxAge: "1h" }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  app.use(errorMiddleware(config));
  app.locals.pdf = pdf;
  app.locals.auth = auth;
  return app;
}
