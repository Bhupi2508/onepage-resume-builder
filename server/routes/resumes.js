import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../auth.js";
import { HttpError, parseBody } from "../http.js";
import { resumeSchema, resumeTitleSchema } from "../../shared/schema.js";

const createSchema = z.object({ title: resumeTitleSchema, data: resumeSchema });
const updateSchema = z.object({ title: resumeTitleSchema.optional(), data: resumeSchema.optional() }).refine((v) => v.title || v.data, "Nothing to update");
const now = () => new Date().toISOString(); // ms precision keeps "newest first" stable
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const summary = (row) => ({ id: row.id, title: row.title, templateId: row.template_id, createdAt: row.created_at, updatedAt: row.updated_at });
const full = (row) => ({ ...summary(row), data: JSON.parse(row.data) });

export default function resumeRoutes({ db, config }) {
  const r = Router();
  r.use(requireUser);

  // Every query is scoped by user_id: a foreign or unknown id is simply a 404.
  const find = (req) => {
    if (!UUID.test(req.params.id)) throw new HttpError(404, "NOT_FOUND", "Resume not found");
    const row = db.prepare("SELECT * FROM resumes WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, "NOT_FOUND", "Resume not found");
    return row;
  };

  r.get("/", (req, res) => {
    const rows = db.prepare("SELECT id, title, template_id, created_at, updated_at, data FROM resumes WHERE user_id = ? ORDER BY updated_at DESC, rowid DESC").all(req.user.id);
    res.json({
      resumes: rows.map((row) => {
        const d = JSON.parse(row.data);
        return { ...summary(row), name: d.basics?.name || "", stage: d.profile?.stage };
      }),
    });
  });

  r.post("/", (req, res) => {
    const { title, data } = parseBody(createSchema, req.body);
    const count = db.prepare("SELECT COUNT(*) c FROM resumes WHERE user_id = ?").get(req.user.id).c;
    if (count >= config.maxResumesPerUser) throw new HttpError(409, "LIMIT_REACHED", `You can save up to ${config.maxResumesPerUser} resumes. Delete one to add another.`);
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO resumes (id, user_id, title, template_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, title, data.templateId, JSON.stringify(data), now(), now());
    res.status(201).json({ resume: full(db.prepare("SELECT * FROM resumes WHERE id = ?").get(id)) });
  });

  r.get("/:id", (req, res) => res.json({ resume: full(find(req)) }));

  r.put("/:id", (req, res) => {
    const row = find(req);
    const body = parseBody(updateSchema, req.body);
    const data = body.data ?? JSON.parse(row.data);
    db.prepare("UPDATE resumes SET title = ?, template_id = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(
      body.title ?? row.title, data.templateId, JSON.stringify(data), now(), row.id, req.user.id
    );
    res.json({ resume: full(db.prepare("SELECT * FROM resumes WHERE id = ?").get(row.id)) });
  });

  r.delete("/:id", (req, res) => {
    const row = find(req);
    db.prepare("DELETE FROM resumes WHERE id = ? AND user_id = ?").run(row.id, req.user.id);
    res.json({ ok: true });
  });

  return r;
}
