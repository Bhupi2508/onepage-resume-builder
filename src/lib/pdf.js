import { api, ApiError } from "../api/client.js";

export async function downloadPdf(resume) {
  const res = await api.post("/pdf", { resume });
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "")?.[1] || "resume.pdf";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const isPdfUnavailable = (e) => e instanceof ApiError && (e.code === "PDF_UNAVAILABLE" || e.status === 0 || e.status >= 502);

// Fallback: the browser's own print-to-PDF of the same A4 markup (vector text).
export function printResume() {
  document.body.classList.add("printing-resume");
  const done = () => {
    document.body.classList.remove("printing-resume");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}
