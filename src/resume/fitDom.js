// Measures how the rendered resume fits an A4 page. Self-contained (no outer
// references) so the very same function runs in the browser preview and is
// injected into headless Chrome by the PDF service: same maths, same answer.
export function measureFit(startDensity, maxDensity, root) {
  const page = (root || document).querySelector("[data-resume-page]");
  const body = page.querySelector("[data-resume-body]");
  const cs = getComputedStyle(page);
  const available = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  let d = startDensity;
  for (; d <= maxDensity; d++) {
    page.setAttribute("data-density", String(d));
    if (body.offsetHeight <= available + 0.5) break;
  }
  if (d > maxDensity) {
    d = maxDensity;
    page.setAttribute("data-density", String(d));
  }
  const sections = Array.from(body.querySelectorAll("[data-section-id]")).map((el) => ({
    id: el.getAttribute("data-section-id"),
    height: el.offsetHeight + parseFloat(getComputedStyle(el).marginTop || "0"),
  }));
  return { density: d, used: body.offsetHeight, available, sections };
}
