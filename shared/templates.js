// Template registry. Rendering differences live in resume.css (keyed by id);
// header layout is chosen here so the renderer can vary markup, not just colour.
export const TEMPLATES = [
  { id: "modern", label: "Modern Professional", header: "left", description: "Accent colour headings, balanced spacing. A safe default." },
  { id: "minimal", label: "Minimal / Clean", header: "center", description: "Light, centred header with plenty of white space." },
  { id: "academic", label: "Student / Academic", header: "left", description: "Serif type, education-first look for students." },
  { id: "technical", label: "Technical / Developer", header: "left", description: "Dense and scannable, ideal for skills-heavy profiles." },
  { id: "traditional", label: "Corporate / Traditional", header: "center", description: "Classic black-and-white serif for formal industries." },
  { id: "creative", label: "Creative / Modern", header: "band", description: "Bold colour header band with a clean single column body." },
];
export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
