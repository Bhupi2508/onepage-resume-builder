// Section type registry: single source of truth for field labels, limits and
// render layout. Used by the form editor, the zod schema and the renderer.

const f = (label, max, extra = {}) => ({ label, max, ...extra });

export const BASICS_LIMITS = {
  name: 60,
  title: 70,
  email: 100,
  phone: 25,
  location: 60,
  linkedin: 120,
  github: 120,
  website: 120,
  summary: 350,
};

export const MAX_SECTIONS = 20;
export const MAX_SKILL_LENGTH = 40;

export const SECTION_TYPES = {
  school: {
    label: "School",
    layout: "entries",
    priority: 90,
    maxItems: 3,
    fields: {
      heading: f("School name", 80, { placeholder: "Greenfield Public School" }),
      subheading: f("Class / grade & stream", 80, { placeholder: "Class 12, Science (PCM)" }),
      date: f("Academic year", 30, { placeholder: "2025 – 2026" }),
      meta: f("Board", 40, { placeholder: "CBSE" }),
      text: f("Subjects, marks or highlights", 200, { multiline: true }),
    },
  },
  education: {
    label: "Education",
    layout: "entries",
    priority: 80,
    maxItems: 5,
    fields: {
      heading: f("College / university", 80, { placeholder: "State University" }),
      subheading: f("Degree and specialization", 80, { placeholder: "B.Tech, Computer Science" }),
      date: f("Years", 30, { placeholder: "2022 – 2026" }),
      meta: f("CGPA / percentage", 40, { placeholder: "8.4 / 10" }),
      text: f("Details (coursework, honours)", 200, { multiline: true }),
    },
  },
  experience: {
    label: "Experience",
    layout: "entries",
    priority: 95,
    maxItems: 8,
    bullets: true,
    fields: {
      heading: f("Job title / role", 80, { placeholder: "Software Engineer" }),
      subheading: f("Company / organization", 80, { placeholder: "Acme Corp" }),
      date: f("Dates", 30, { placeholder: "Jan 2023 – Present" }),
      meta: f("Location", 60, { placeholder: "Remote" }),
      text: f("Responsibilities and achievements", 450, {
        multiline: true,
        hint: "One point per line. Lead with measurable results.",
      }),
    },
  },
  projects: {
    label: "Projects",
    layout: "entries",
    priority: 70,
    maxItems: 6,
    bullets: true,
    fields: {
      heading: f("Project name", 80, { placeholder: "Campus Event Planner" }),
      subheading: f("Technologies / tools", 80, { placeholder: "React, Node.js, PostgreSQL" }),
      date: f("Date", 30),
      meta: f("Link", 100, { placeholder: "github.com/you/project", url: true }),
      text: f("Description", 300, { multiline: true, hint: "One point per line." }),
    },
  },
  skills: {
    label: "Skills",
    layout: "inline",
    priority: 85,
    maxItems: 10,
    fields: {
      heading: f("Group (optional)", 40, { placeholder: "Languages" }),
      text: f("Skills, comma separated", 300, { placeholder: "Python, SQL, Excel" }),
    },
  },
  achievements: {
    label: "Achievements",
    layout: "entries",
    priority: 55,
    maxItems: 8,
    fields: {
      heading: f("Title", 100, { placeholder: "First place, Inter-school Science Fair" }),
      subheading: f("Organization / event", 80),
      date: f("Date", 30),
      text: f("Details", 180, { multiline: true }),
    },
  },
  certifications: {
    label: "Certifications",
    layout: "entries",
    priority: 50,
    maxItems: 8,
    fields: {
      heading: f("Certification", 100, { placeholder: "AWS Certified Cloud Practitioner" }),
      subheading: f("Issuer", 80),
      date: f("Date", 30),
    },
  },
  activities: {
    label: "Activities",
    layout: "entries",
    priority: 35,
    maxItems: 8,
    bullets: true,
    fields: {
      heading: f("Activity / role", 100, { placeholder: "Captain, School Debate Club" }),
      subheading: f("Organization", 80),
      date: f("Dates", 30),
      text: f("Details", 180, { multiline: true }),
    },
  },
  volunteer: {
    label: "Volunteer experience",
    layout: "entries",
    priority: 30,
    maxItems: 6,
    bullets: true,
    fields: {
      heading: f("Role", 100),
      subheading: f("Organization", 80),
      date: f("Dates", 30),
      text: f("Details", 180, { multiline: true }),
    },
  },
  coursework: {
    label: "Relevant coursework",
    layout: "inline",
    priority: 25,
    maxItems: 1,
    fields: { text: f("Courses, comma separated", 300) },
  },
  languages: {
    label: "Languages",
    layout: "inline",
    priority: 20,
    maxItems: 1,
    fields: { text: f("Languages, comma separated", 200, { placeholder: "English (fluent), Hindi (native)" }) },
  },
  interests: {
    label: "Interests",
    layout: "inline",
    priority: 10,
    maxItems: 1,
    fields: { text: f("Interests, comma separated", 200) },
  },
  custom: {
    label: "Custom section",
    layout: "entries",
    priority: 40,
    maxItems: 8,
    fields: {
      heading: f("Title", 100),
      subheading: f("Organization / supporting detail", 80),
      date: f("Date (optional)", 30),
      text: f("Description", 300, { multiline: true }),
    },
  },
};

export const SECTION_TYPE_IDS = Object.keys(SECTION_TYPES);
export const ITEM_FIELDS = ["heading", "subheading", "date", "meta", "text"];

// Catalog shown in the "Add section" menu.
export const SECTION_CATALOG = [
  { type: "school", title: "School" },
  { type: "education", title: "Education" },
  { type: "experience", title: "Work Experience" },
  { type: "experience", title: "Internships" },
  { type: "projects", title: "Projects" },
  { type: "projects", title: "Open-Source Contributions" },
  { type: "skills", title: "Skills" },
  { type: "coursework", title: "Relevant Coursework" },
  { type: "achievements", title: "Achievements" },
  { type: "achievements", title: "Awards & Recognition" },
  { type: "certifications", title: "Certifications" },
  { type: "activities", title: "Extracurricular Activities" },
  { type: "activities", title: "Clubs & Leadership" },
  { type: "activities", title: "Hackathons & Workshops" },
  { type: "activities", title: "Sports & Competitions" },
  { type: "volunteer", title: "Volunteer Experience" },
  { type: "languages", title: "Languages" },
  { type: "interests", title: "Interests" },
  { type: "custom", title: "Custom Section" },
];

// Inline sections (skills, languages...) only have content when the list text
// is filled in; a pre-seeded group label alone must not produce a heading.
export const itemIsEmpty = (item, type) =>
  SECTION_TYPES[type]?.layout === "inline"
    ? !String(item?.text ?? "").trim()
    : !ITEM_FIELDS.some((k) => String(item?.[k] ?? "").trim());

export const sectionHasContent = (section) => section.items.some((i) => !itemIsEmpty(i, section.type));

export const splitList = (text) =>
  String(text ?? "")
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const splitLines = (text) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((s) => s.replace(/^[\s•\-*–]+/, "").trim())
    .filter(Boolean);
