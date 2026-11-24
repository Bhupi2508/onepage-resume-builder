import crypto from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireUser } from "../auth.js";
import { HttpError, asyncHandler, parseBody } from "../http.js";

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(72, "Use at most 72 characters")
  .refine((p) => /[A-Za-z]/.test(p) && /[0-9]/.test(p), "Include at least one letter and one number");

const emailSchema = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address");
const nameSchema = z.string().trim().min(1, "Enter your name").max(80);

const registerSchema = z.object({ email: emailSchema, name: nameSchema, password: passwordSchema });
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });
const profileSchema = z.object({ name: nameSchema });
const passwordChangeSchema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: passwordSchema });
const deleteSchema = z.object({ password: z.string().min(1).max(200) });

export default function authRoutes({ db, auth, config }) {
  const r = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.rateLimits.authMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." } },
  });
  const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name });

  r.post("/register", limiter, asyncHandler(async (req, res) => {
    const { email, name, password } = parseBody(registerSchema, req.body);
    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
      throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists");
    }
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)").run(id, email, name, await auth.hash(password));
    auth.startSession(res, id);
    res.status(201).json({ user: { id, email, name } });
  }));

  r.post("/login", limiter, asyncHandler(async (req, res) => {
    const { email, password } = parseBody(loginSchema, req.body);
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    const ok = await auth.verify(password, row?.password_hash);
    if (!ok) throw new HttpError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
    auth.startSession(res, row.id);
    res.json({ user: publicUser(row) });
  }));

  r.post("/logout", (req, res) => {
    auth.endSession(req, res);
    res.json({ ok: true });
  });

  r.get("/me", (req, res) => res.json({ user: req.user || null }));

  r.patch("/me", requireUser, (req, res) => {
    const { name } = parseBody(profileSchema, req.body);
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
    res.json({ user: { ...req.user, name } });
  });

  r.post("/password", requireUser, limiter, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = parseBody(passwordChangeSchema, req.body);
    const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(req.user.id);
    if (!(await auth.verify(currentPassword, row.password_hash))) throw new HttpError(401, "INVALID_CREDENTIALS", "Current password is incorrect");
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(await auth.hash(newPassword), req.user.id);
    auth.endOtherSessions(req.user.id, req);
    res.json({ ok: true });
  }));

  r.delete("/me", requireUser, limiter, asyncHandler(async (req, res) => {
    const { password } = parseBody(deleteSchema, req.body);
    const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(req.user.id);
    if (!(await auth.verify(password, row.password_hash))) throw new HttpError(401, "INVALID_CREDENTIALS", "Password is incorrect");
    db.prepare("DELETE FROM users WHERE id = ?").run(req.user.id); // cascades sessions + resumes
    auth.endSession(req, res);
    res.json({ ok: true });
  }));

  return r;
}
