import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { HttpError } from "./http.js";

export const COOKIE = "sid";
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

export function createAuth(db, config) {
  const ttlMs = config.sessionTtlDays * 864e5;
  // Pre-hashed so unknown-email logins cost the same as wrong-password ones.
  const dummyHash = bcrypt.hashSync("not-a-real-password", config.bcryptRounds);

  const cookieOpts = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: config.production,
    path: "/",
    maxAge: ttlMs,
  });

  return {
    hash: (pw) => bcrypt.hash(pw, config.bcryptRounds),
    async verify(pw, hash) {
      return bcrypt.compare(pw, hash || dummyHash).then((ok) => ok && !!hash);
    },
    startSession(res, userId) {
      const token = crypto.randomBytes(32).toString("base64url");
      db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha(token), userId, Date.now() + ttlMs);
      res.cookie(COOKIE, token, cookieOpts());
    },
    endSession(req, res) {
      const t = req.cookies?.[COOKIE];
      if (t) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha(t));
      res.clearCookie(COOKIE, { ...cookieOpts(), maxAge: undefined });
    },
    endOtherSessions(userId, req) {
      const t = req.cookies?.[COOKIE];
      db.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, t ? sha(t) : "");
    },
    // Attaches req.user when a valid session cookie is present.
    loadUser(req, _res, next) {
      const t = req.cookies?.[COOKIE];
      if (t) {
        const row = db
          .prepare("SELECT u.id, u.email, u.name, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?")
          .get(sha(t));
        if (row && row.expires_at > Date.now()) req.user = { id: row.id, email: row.email, name: row.name };
        else if (row) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha(t));
      }
      next();
    },
    purgeExpired: () => db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now()),
  };
}

export function requireUser(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "UNAUTHENTICATED", "Please sign in to continue"));
  next();
}
