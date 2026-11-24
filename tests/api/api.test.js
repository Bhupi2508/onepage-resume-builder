import { describe, expect, it, beforeEach } from "vitest";
import { makeApp, signUp } from "./helpers.js";
import { DEMO_PROFILES } from "../../shared/demoData.js";
import { CATEGORIES, STAGES, createResume } from "../../shared/profiles.js";

const sample = (i = 0) => DEMO_PROFILES[i].build();
let ctx;
beforeEach(() => { ctx = makeApp(); });

describe("auth", () => {
  it("registers, sets an HttpOnly cookie, and never leaks the password hash", async () => {
    const a = ctx.agent();
    const r = await a.post("/api/auth/register").send({ email: "A@Example.com", name: "Ann", password: "Passw0rdlong1" });
    expect(r.status).toBe(201);
    expect(r.body.user.email).toBe("a@example.com");
    expect(JSON.stringify(r.body)).not.toMatch(/hash|password/i);
    const cookie = r.headers["set-cookie"][0];
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect((await a.get("/api/auth/me")).body.user.email).toBe("a@example.com");
    const stored = ctx.db.prepare("SELECT password_hash FROM users").get().password_hash;
    expect(stored).toMatch(/^\$2[aby]\$/);
    expect(stored).not.toContain("Passw0rdlong1");
  });
  it("stores only a hash of the session token", async () => {
    const a = ctx.agent(); await signUp(a);
    const token = /sid=([^;]+)/.exec((await a.get("/api/auth/me")).request.header.Cookie || "")?.[1];
    const row = ctx.db.prepare("SELECT token_hash FROM sessions").get();
    expect(row.token_hash).toMatch(/^[0-9a-f]{64}$/);
    if (token) expect(row.token_hash).not.toContain(token);
  });
  it("rejects duplicate email, weak passwords, bad emails", async () => {
    await signUp(ctx.agent());
    expect((await ctx.request().post("/api/auth/register").send({ email: "u1@example.com", name: "X", password: "Passw0rdlong1" })).status).toBe(409);
    for (const password of ["short1", "alllettersonly", "1234567890123", "x".repeat(80) + "1"]) {
      const r = await ctx.request().post("/api/auth/register").send({ email: "n@example.com", name: "N", password });
      expect(r.status, password).toBe(400);
      expect(r.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect((await ctx.request().post("/api/auth/register").send({ email: "bad", name: "N", password: "Passw0rdlong1" })).status).toBe(400);
  });
  it("logs in, rejects wrong credentials with one generic message, logs out", async () => {
    await signUp(ctx.agent());
    const a = ctx.agent();
    const bad = await a.post("/api/auth/login").send({ email: "u1@example.com", password: "wrongpassword1" });
    const unknown = await a.post("/api/auth/login").send({ email: "nobody@example.com", password: "wrongpassword1" });
    expect(bad.status).toBe(401);
    expect(bad.body.error.message).toBe(unknown.body.error.message);
    expect((await a.post("/api/auth/login").send({ email: "u1@example.com", password: "Passw0rdlong1" })).status).toBe(200);
    expect((await a.get("/api/resumes")).status).toBe(200);
    await a.post("/api/auth/logout");
    expect((await a.get("/api/resumes")).status).toBe(401);
    expect((await a.get("/api/auth/me")).body.user).toBeNull();
  });
  it("rate limits repeated login attempts", async () => {
    const c = makeApp({ rateLimits: { authMax: 3, pdfMax: 100, apiMax: 1000 } });
    let last;
    for (let i = 0; i < 5; i++) last = await c.request().post("/api/auth/login").send({ email: "x@example.com", password: "nope" });
    expect(last.status).toBe(429);
  });
  it("changing password signs out other sessions; deleting account removes resumes", async () => {
    const a = ctx.agent(); await signUp(a);
    const other = ctx.agent();
    await other.post("/api/auth/login").send({ email: "u1@example.com", password: "Passw0rdlong1" });
    await a.post("/api/resumes").send({ title: "R", data: sample() });
    expect((await a.post("/api/auth/password").send({ currentPassword: "bad", newPassword: "Newpassw0rd123" })).status).toBe(401);
    expect((await a.post("/api/auth/password").send({ currentPassword: "Passw0rdlong1", newPassword: "Newpassw0rd123" })).status).toBe(200);
    expect((await other.get("/api/resumes")).status).toBe(401);
    expect((await a.get("/api/resumes")).status).toBe(200);
    expect((await a.del("/api/auth/me").send({ password: "wrong" })).status).toBe(401);
    expect((await a.del("/api/auth/me").send({ password: "Newpassw0rd123" })).status).toBe(200);
    expect(ctx.db.prepare("SELECT COUNT(*) c FROM resumes").get().c).toBe(0);
    expect(ctx.db.prepare("SELECT COUNT(*) c FROM users").get().c).toBe(0);
  });
});

describe("resumes", () => {
  it("requires authentication on every endpoint", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    for (const [m, p] of [["get", "/api/resumes"], ["post", "/api/resumes"], ["get", `/api/resumes/${id}`], ["put", `/api/resumes/${id}`], ["delete", `/api/resumes/${id}`]]) {
      expect((await ctx.request()[m](p).send({})).status, `${m} ${p}`).toBe(401);
    }
  });
  it("saves and retrieves a resume for every profile stage and category", async () => {
    const a = ctx.agent(); await signUp(a);
    for (const s of STAGES) {
      const data = createResume({ stage: s.id, category: CATEGORIES[s.id.length % CATEGORIES.length].id });
      const c = await a.post("/api/resumes").send({ title: `R ${s.id}`, data });
      expect(c.status, s.id).toBe(201);
      const g = await a.get(`/api/resumes/${c.body.resume.id}`);
      expect(g.body.resume.data.profile.stage).toBe(s.id);
    }
  });
  it("round-trips content, custom sections, section order and template", async () => {
    const a = ctx.agent(); await signUp(a);
    const data = sample(1);
    data.sections.push({ id: "custom1", type: "custom", title: "Publications", visible: true, items: [{ id: "ci1", heading: "A paper", subheading: "", date: "2025", meta: "", text: "Details" }] });
    data.sections.reverse();
    data.templateId = "creative";
    const c = await a.post("/api/resumes").send({ title: "Mine", data });
    const g = (await a.get(`/api/resumes/${c.body.resume.id}`)).body.resume;
    expect(g.data.sections.map((s) => s.id)).toEqual(data.sections.map((s) => s.id));
    expect(g.data.templateId).toBe("creative");
    expect(g.templateId).toBe("creative");
    expect(g.data.sections.find((s) => s.id === "custom1").title).toBe("Publications");
  });
  it("updates (including template switch), lists newest first, and deletes", async () => {
    const a = ctx.agent(); await signUp(a);
    const r1 = (await a.post("/api/resumes").send({ title: "One", data: sample(0) })).body.resume;
    const r2 = (await a.post("/api/resumes").send({ title: "Two", data: sample(1) })).body.resume;
    const upd = sample(0); upd.templateId = "minimal"; upd.basics.name = "Changed Name";
    const u = await a.put(`/api/resumes/${r1.id}`).send({ data: upd });
    expect(u.status).toBe(200);
    expect(u.body.resume.templateId).toBe("minimal");
    expect(u.body.resume.title).toBe("One");
    const list = (await a.get("/api/resumes")).body.resumes;
    expect(list.map((x) => x.id)).toEqual([r1.id, r2.id]);
    expect(list[0].name).toBe("Changed Name");
    expect((await a.del(`/api/resumes/${r1.id}`)).status).toBe(200);
    expect((await a.get(`/api/resumes/${r1.id}`)).status).toBe(404);
  });
  it("isolates users: no read, update or delete of another user's resume (IDOR)", async () => {
    const a = ctx.agent(); const b = ctx.agent();
    await signUp(a, "a@example.com"); await signUp(b, "b@example.com");
    const id = (await a.post("/api/resumes").send({ title: "Secret", data: sample() })).body.resume.id;
    expect((await b.get(`/api/resumes/${id}`)).status).toBe(404);
    expect((await b.put(`/api/resumes/${id}`).send({ title: "pwned" })).status).toBe(404);
    expect((await b.del(`/api/resumes/${id}`)).status).toBe(404);
    expect((await b.get("/api/resumes")).body.resumes).toEqual([]);
    expect((await a.get(`/api/resumes/${id}`)).body.resume.title).toBe("Secret");
    expect((await b.get("/api/resumes/not-a-uuid")).status).toBe(404);
    expect((await b.get("/api/resumes/1%27%20OR%20%271%27=%271")).status).toBe(404);
  });
  it("rejects invalid API input", async () => {
    const a = ctx.agent(); await signUp(a);
    const bad = [
      { title: "", data: sample() },
      { title: "x".repeat(81), data: sample() },
      { title: "ok" },
      { title: "ok", data: { ...sample(), templateId: "nope" } },
      { title: "ok", data: { ...sample(), basics: { ...sample().basics, name: "n".repeat(200) } } },
      { title: "ok", data: { ...sample(), basics: { ...sample().basics, website: "javascript:alert(1)" } } },
      { title: "ok", data: { ...sample(), sections: [{ id: "s", type: "evil", title: "t", visible: true, items: [] }] } },
      { title: "ok", data: "string" },
    ];
    for (const body of bad) {
      const r = await a.post("/api/resumes").send(body);
      expect(r.status, JSON.stringify(body).slice(0, 80)).toBe(400);
      expect(r.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect((await a.put("/api/resumes/11111111-1111-4111-8111-111111111111").send({})).status).toBe(404);
  });
  it("enforces per-user resume cap and body size limit", async () => {
    const c = makeApp({ maxResumesPerUser: 2 });
    const a = c.agent(); await signUp(a);
    await a.post("/api/resumes").send({ title: "1", data: sample() });
    await a.post("/api/resumes").send({ title: "2", data: sample() });
    expect((await a.post("/api/resumes").send({ title: "3", data: sample() })).status).toBe(409);
    const big = await a.post("/api/resumes").send({ title: "x", data: sample(), pad: "x".repeat(300_000) });
    expect(big.status).toBe(413);
  });
});

describe("request hardening", () => {
  it("blocks cross-origin state-changing requests and non-JSON bodies", async () => {
    const a = ctx.agent(); await signUp(a);
    const x = await a.post("/api/resumes").set("Origin", "https://evil.example").send({ title: "t", data: sample() });
    expect(x.status).toBe(403);
    const ok = await a.post("/api/resumes").set("Origin", "http://localhost:5173").send({ title: "t", data: sample() });
    expect(ok.status).toBe(201);
    const t = await a.post("/api/auth/logout").set("Content-Type", "text/plain").send("hello");
    expect(t.status).toBe(415);
  });
  it("returns JSON errors for malformed JSON and unknown routes, and sets security headers", async () => {
    const r = await ctx.request().post("/api/auth/login").set("Content-Type", "application/json").send("{bad");
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe("BAD_JSON");
    expect((await ctx.request().get("/api/nope")).status).toBe(404);
    const h = await ctx.request().get("/api/health");
    expect(h.headers["x-content-type-options"]).toBe("nosniff");
    expect(h.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(h.headers["x-powered-by"]).toBeUndefined();
  });
  it("does not log request bodies or passwords on errors", async () => {
    const logs = []; const orig = console.error; console.error = (...a) => logs.push(a.join(" "));
    try { await ctx.request().post("/api/auth/login").set("Content-Type", "application/json").send('{"password":"SuperSecret123"'); } finally { console.error = orig; }
    expect(logs.join("\n")).not.toContain("SuperSecret123");
  });
});
