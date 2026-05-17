// Frontend-only security helpers: sanitization, URL validation, clamping.

const MAX = {
  firstName: 40,
  lastName: 40,
  email: 80,
  mobile: 10,
  roleTitle: 60,
  skills: 240,
  summary: 260,
  professionalSummary: 260,
  projects: 1200,
  experience: 1200,
  educationDetails: 800,
  schoolCollegeName: 120,
  careerObjective: 350,
  objective: 350,
  governmentEducation: 800,
  achievements: 800,
  hobbies: 600,
  strengths: 600,
  languages: 500,
  portfolio: 800,
  tools: 800,
  creativeProjects: 800,
  creativeExperience: 800,
  creativeSummary: 260,
  businessSummary: 350,
  businessExperience: 1200,
  businessAchievements: 800,
  leadership: 800,
  businessCertifications: 800,
  businessEducation: 800,

  // Social urls
  linkedin: 500,
  github: 500,
  leetcode: 500,
  twitter: 500,
  discord: 500,
  youtube: 500,
  portfolioUrl: 500,
};

function clampStr(val, maxLen) {
  const s = (val ?? "").toString();
  if (!maxLen || s.length <= maxLen) return s;
  return s.slice(0, maxLen);
}

// Since we render user inputs as plain text nodes in React,
// we still strip angle brackets and common script markers to reduce risk.
export function sanitizeText(val, maxLen) {
  const s = clampStr(val, maxLen);
  return s
    .replace(/[<>]/g, "")
    .replace(/script/gi, "")
    .replace(/onerror/gi, "")
    .replace(/onload/gi, "")
    .replace(/\u0000/g, "")
    .trim();
}

export function sanitizePhone(val) {
  const s = (val ?? "").toString().replace(/\D/g, "");
  return s.slice(0, 10);
}

export function sanitizeSkills(val) {
  const s = sanitizeText(val, MAX.skills);
  return s;
}

export function sanitizeGeneric(val, maxLen) {
  return sanitizeText(val, maxLen);
}

function isHttpsUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

// Allow only HTTPS URLs. Also allow plain hostnames/handles by normalizing with https://
// Caller should decide if empty is allowed.
export function sanitizeHttpsUrl(input, { allowEmpty = true } = {}) {
  const raw = (input ?? "").toString().trim();
  if (!raw) return allowEmpty ? "" : "";

  // If user pasted without protocol, add https://
  const candidate =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  if (!isHttpsUrl(candidate)) return "";

  // Basic allowlist of protocols is done. Return sanitized URL.
  return candidate;
}

export function sanitizeResumeForPreview(values) {
  // Normalize + clamp everything used in UI + exports.
  // Never return HTML.
  return {
    ...values,
    firstName: sanitizeText(values.firstName, MAX.firstName),
    lastName: sanitizeText(values.lastName, MAX.lastName),
    email: sanitizeText(values.email, MAX.email),
    mobile: sanitizePhone(values.mobile).slice(0, MAX.mobile),

    roleTitle: sanitizeText(values.roleTitle, MAX.roleTitle),

    linkedin: sanitizeHttpsUrl(values.linkedin, { allowEmpty: true }),
    github: sanitizeHttpsUrl(values.github, { allowEmpty: true }),
    leetcode: sanitizeHttpsUrl(values.leetcode, { allowEmpty: true }),
    twitter: sanitizeHttpsUrl(values.twitter, { allowEmpty: true }),
    discord: sanitizeHttpsUrl(values.discord, { allowEmpty: true }),
    youtube: sanitizeHttpsUrl(values.youtube, { allowEmpty: true }),
    portfolio: sanitizeHttpsUrl(values.portfolio, { allowEmpty: true }),

    skills: sanitizeSkills(values.skills),

    summary: sanitizeGeneric(values.summary, MAX.summary),
    professionalSummary: sanitizeGeneric(
      values.professionalSummary,
      MAX.professionalSummary
    ),

    projects: sanitizeGeneric(values.projects, MAX.projects),
    experience: sanitizeGeneric(values.experience, MAX.experience),

    schoolCollegeName: sanitizeGeneric(
      values.schoolCollegeName,
      MAX.schoolCollegeName
    ),
    educationDetails: sanitizeGeneric(
      values.educationDetails,
      MAX.educationDetails
    ),
    careerObjective: sanitizeGeneric(
      values.careerObjective,
      MAX.careerObjective
    ),

    // Government
    objective: sanitizeGeneric(values.objective, MAX.objective),
    governmentEducation: sanitizeGeneric(
      values.governmentEducation,
      MAX.governmentEducation
    ),
    achievements: sanitizeGeneric(values.achievements, MAX.achievements),
    hobbies: sanitizeGeneric(values.hobbies, MAX.hobbies),
    strengths: sanitizeGeneric(values.strengths, MAX.strengths),
    languages: sanitizeGeneric(values.languages, MAX.languages),

    // Designer
    tools: sanitizeGeneric(values.tools, MAX.tools),
    portfolio: sanitizeGeneric(values.portfolio, MAX.portfolio),
    creativeProjects: sanitizeGeneric(
      values.creativeProjects,
      MAX.creativeProjects
    ),
    creativeExperience: sanitizeGeneric(
      values.creativeExperience,
      MAX.creativeExperience
    ),
    creativeSummary: sanitizeGeneric(
      values.creativeSummary,
      MAX.creativeSummary
    ),

    // Business
    businessSummary: sanitizeGeneric(
      values.businessSummary,
      MAX.businessSummary
    ),
    businessExperience: sanitizeGeneric(
      values.businessExperience,
      MAX.businessExperience
    ),
    businessAchievements: sanitizeGeneric(
      values.businessAchievements,
      MAX.businessAchievements
    ),
    leadership: sanitizeGeneric(values.leadership, MAX.leadership),
    businessCertifications: sanitizeGeneric(
      values.businessCertifications,
      MAX.businessCertifications
    ),
    businessEducation: sanitizeGeneric(
      values.businessEducation,
      MAX.businessEducation
    ),

    // Helpers/auto
    roleTitle: sanitizeText(values.roleTitle, MAX.roleTitle),

    resumeType: values.resumeType,
    templateId: values.templateId,

    // Validation helper fields (keep short)
    experienceMin: sanitizeGeneric(values.experienceMin, 120),
    projectsMin: sanitizeGeneric(values.projectsMin, 120),
  };
}
