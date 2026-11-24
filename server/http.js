// Small HTTP helpers: consistent error shape and zod -> 400 mapping.
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function parseBody(schema, body) {
  const r = schema.safeParse(body);
  if (!r.success) {
    throw new HttpError(400, "VALIDATION_ERROR", "Some fields are invalid", r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
  }
  return r.data;
}

export function errorMiddleware(config) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err?.type === "entity.too.large") return res.status(413).json({ error: { code: "TOO_LARGE", message: "Request is too large" } });
    if (err?.type === "entity.parse.failed") return res.status(400).json({ error: { code: "BAD_JSON", message: "Malformed JSON body" } });
    // Log only the message: never request bodies, cookies or passwords.
    console.error(`[error] ${req.method} ${req.path}: ${err?.message || err}`);
    res.status(500).json({ error: { code: "INTERNAL", message: config.production ? "Something went wrong" : String(err?.message || err) } });
  };
}
