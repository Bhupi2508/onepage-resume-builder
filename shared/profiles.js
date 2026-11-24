// Profile presets: career stage x professional category decide which sections
// (and which skill groups) a new resume starts with.
import { SECTION_TYPES } from "./sections.js";

export const STAGES = [
  { id: "school", label: "School Student", hint: "Classes 8–12" },
  { id: "college", label: "College Student", hint: "Pursuing a degree" },
  { id: "graduate", label: "Recent Graduate", hint: "Just finished studying" },
  { id: "entry", label: "Fresher / Entry-Level", hint: "First job or internship" },
  { id: "experienced", label: "Experienced Professional", hint: "Several years of work" },
  { id: "manager", label: "Manager / Team Lead", hint: "Leading people or projects" },
  { id: "freelancer", label: "Freelancer / Consultant", hint: "Independent work" },
  { id: "other", label: "Other / Career Changer", hint: "Returning or switching careers" },
];

export const CATEGORIES = [
  {
    id: "technical",
    label: "Technical / Software",
    skillGroups: ["Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Tools & Platforms"],
  },
  { id: "business", label: "Sales & Marketing", skillGroups: ["Domain skills", "Tools & Platforms", "Communication"] },
  { id: "finance", label: "Finance & Accounting", skillGroups: ["Domain skills", "Software & Tools", "Compliance"] },
  { id: "people", label: "Human Resources", skillGroups: ["HR skills", "Tools & Platforms", "Communication"] },
  { id: "operations", label: "Operations / Admin / Project Coordination", skillGroups: ["Operations", "Tools & Platforms", "Communication"] },
  { id: "support", label: "Customer Support", skillGroups: ["Support skills", "Tools & Platforms", "Communication"] },
  { id: "general", label: "General / Not listed", skillGroups: ["Skills"] },
];

export const DEFAULT_PROFILE = { stage: "college", category: "technical" };

// Which sections each stage starts with: [type, title]
const STAGE_SECTIONS = {
  school: [
    ["school", "Education"],
    ["achievements", "Academic Achievements"],
    ["activities", "Extracurricular Activities"],
    ["activities", "Sports & Competitions"],
    ["volunteer", "Volunteer Work"],
    ["skills", "Skills"],
    ["languages", "Languages"],
    ["interests", "Interests"],
  ],
  college: [
    ["education", "Education"],
    ["projects", "Academic Projects"],
    ["experience", "Internships"],
    ["skills", "Skills"],
    ["coursework", "Relevant Coursework"],
    ["certifications", "Certifications"],
    ["activities", "Hackathons & Workshops"],
    ["activities", "Clubs & Leadership"],
    ["achievements", "Achievements"],
  ],
  graduate: [
    ["education", "Education"],
    ["experience", "Internships"],
    ["projects", "Projects"],
    ["skills", "Skills"],
    ["certifications", "Certifications"],
    ["achievements", "Achievements"],
    ["activities", "Leadership & Activities"],
  ],
  entry: [
    ["education", "Education"],
    ["experience", "Internships & Experience"],
    ["projects", "Projects"],
    ["skills", "Skills"],
    ["certifications", "Certifications"],
    ["achievements", "Achievements"],
    ["languages", "Languages"],
  ],
  experienced: [
    ["experience", "Work Experience"],
    ["projects", "Key Projects"],
    ["skills", "Skills"],
    ["education", "Education"],
    ["certifications", "Certifications"],
    ["achievements", "Awards & Recognition"],
  ],
  manager: [
    ["experience", "Work Experience"],
    ["achievements", "Key Achievements"],
    ["skills", "Skills"],
    ["education", "Education"],
    ["certifications", "Certifications"],
    ["activities", "Mentoring & Leadership"],
  ],
  freelancer: [
    ["experience", "Selected Engagements"],
    ["projects", "Client Projects"],
    ["skills", "Skills"],
    ["certifications", "Certifications"],
    ["education", "Education"],
  ],
  other: [
    ["experience", "Experience"],
    ["education", "Education"],
    ["skills", "Skills"],
    ["certifications", "Certifications"],
    ["achievements", "Achievements"],
  ],
};

let counter = 0;
export const newId = (prefix = "x") =>
  `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const blankItem = () => ({ id: newId("i"), heading: "", subheading: "", date: "", meta: "", text: "" });

export function createSection(type, title, extra = {}) {
  if (!SECTION_TYPES[type]) throw new Error(`Unknown section type: ${type}`);
  return {
    id: newId("s"),
    type,
    title: title || SECTION_TYPES[type].label,
    visible: true,
    items: [blankItem()],
    ...extra,
  };
}

export function createBasics() {
  return { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "" };
}

export function createResume(profile = DEFAULT_PROFILE, templateId) {
  const { stage, category } = { ...DEFAULT_PROFILE, ...profile };
  const cat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
  const rows = STAGE_SECTIONS[stage] || STAGE_SECTIONS.other;
  const sections = rows.map(([type, title]) => {
    const s = createSection(type, title);
    if (type === "skills") {
      s.items = cat.skillGroups.map((g) => ({ ...blankItem(), heading: cat.id === "general" ? "" : g }));
    }
    return s;
  });
  if (category === "technical" && ["experienced", "manager", "freelancer", "graduate", "entry"].includes(stage)) {
    // Open-source work matters for technical profiles; offered up-front but empty.
    sections.splice(
      Math.max(sections.findIndex((s) => s.type === "skills"), 0),
      0,
      createSection("projects", "Open-Source Contributions")
    );
  }
  return {
    version: 1,
    templateId: templateId || (stage === "school" || stage === "college" ? "academic" : category === "technical" ? "technical" : "modern"),
    profile: { stage, category },
    basics: createBasics(),
    sections,
  };
}
