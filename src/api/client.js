// Thin fetch wrapper: JSON in/out, cookies included, errors normalised.
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Cannot reach the server. Check your connection and try again.");
  }
  if (res.ok && res.headers.get("content-type")?.includes("application/pdf")) return res;
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error page (e.g. dev proxy down) */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code || "ERROR", data?.error?.message || `Request failed (${res.status})`, data?.error?.details);
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b ?? {}),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p, b) => request("DELETE", p, b),
};
