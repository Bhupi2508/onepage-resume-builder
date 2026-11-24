import "dotenv/config";
import path from "node:path";

const num = (v, d) => (v !== undefined && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : d);

export function loadConfig(overrides = {}) {
  const env = process.env;
  const production = env.NODE_ENV === "production";
  const cfg = {
    production,
    port: num(env.PORT, 3001),
    databasePath: env.DATABASE_PATH || path.resolve("data/app.db"),
    clientOrigin: env.CLIENT_ORIGIN || "http://localhost:5173",
    sessionTtlDays: num(env.SESSION_TTL_DAYS, 14),
    bcryptRounds: num(env.BCRYPT_ROUNDS, 12),
    trustProxy: env.TRUST_PROXY === "1",
    chromePath: env.CHROME_PATH || "",
    pdfNoSandbox: env.PDF_NO_SANDBOX === "1",
    maxResumesPerUser: num(env.MAX_RESUMES_PER_USER, 25),
    rateLimits: {
      authMax: num(env.RATE_LIMIT_AUTH_MAX, 10), // per 15 min per IP
      pdfMax: num(env.RATE_LIMIT_PDF_MAX, 20), // per minute per IP
      apiMax: num(env.RATE_LIMIT_API_MAX, 300), // per minute per IP
    },
    serveStatic: production,
    ...overrides,
  };
  return cfg;
}
