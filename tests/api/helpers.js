import supertest from "supertest";
import { createApp } from "../../server/app.js";
import { openDb } from "../../server/db.js";
import { loadConfig } from "../../server/config.js";
import { createPdfService } from "../../server/pdf/service.js";

export function makeApp(overrides = {}) {
  const config = loadConfig({ databasePath: ":memory:", bcryptRounds: 4, production: false, serveStatic: false, rateLimits: { authMax: 1000, pdfMax: 1000, apiMax: 100000 }, ...overrides });
  const db = openDb(":memory:");
  const pdf = createPdfService(config);
  const app = createApp({ db, config, pdf });
  return { app, db, pdf, config, agent: () => supertest.agent(app), request: () => supertest(app) };
}

export async function signUp(agent, email = "u1@example.com", password = "Passw0rdlong1") {
  const r = await agent.post("/api/auth/register").send({ email, name: "User One", password });
  if (r.status !== 201) throw new Error(`register failed: ${r.status} ${JSON.stringify(r.body)}`);
  return r.body.user;
}
