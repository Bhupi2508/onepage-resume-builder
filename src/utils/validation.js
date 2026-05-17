const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRe = /^\d{10}$/;

function clean(s) {
  return (s ?? "").toString().trim();
}

function required(value) {
  return clean(value).length > 0;
}

function splitNonEmpty(str) {
  return clean(str)
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function hasMinSkills(skills, min = 1) {
  return splitNonEmpty(skills).length >= min;
}

function isHttpsValidUrl(url) {
  const s = clean(url);
  if (!s) return true; // optional
  try {
    const u = new URL(s);
    return u.protocol === "https:" && Boolean(u.hostname);
  } catch {
    return false;
  }
}

function validateCommon(values) {
  const fullName = clean(values.fullName);
  const email = clean(values.email);
  const mobile = clean(values.mobile);

  if (!fullName) return { message: "Please enter your full name." };
  if (!email) return { message: "Please enter your email address." };
  if (!emailRe.test(email)) return { message: "Enter a valid email address." };
  if (!mobile) return { message: "Please enter your mobile number." };
  if (!mobileRe.test(mobile))
    return { message: "Mobile must be exactly 10 digits." };

  // Social URL validation (optional)
  if (!isHttpsValidUrl(values.linkedin))
    return { message: "LinkedIn URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.github))
    return { message: "GitHub URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.leetcode))
    return { message: "LeetCode URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.twitter))
    return { message: "Twitter/X URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.discord))
    return { message: "Discord URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.youtube))
    return { message: "YouTube URL must be a valid HTTPS link." };
  if (!isHttpsValidUrl(values.portfolio))
    return { message: "Portfolio URL must be a valid HTTPS link." };

  return null;
}

export function validateResume(values) {
  const commonErr = validateCommon(values);
  if (commonErr) return commonErr;

  const type = values.resumeType;

  // 1. School Student
  if (type === "School Student") {
    if (!required(values.schoolName))
      return { message: "School Name is required." };
    if (!required(values.schoolClass)) return { message: "Class is required." };
    if (!required(values.careerObjective))
      return { message: "Career Objective is required." };
    if (!hasMinSkills(values.skills, 2))
      return { message: "At least 2 skills are required." };
    return null;
  }

  // 2. College Student
  if (type === "College Student") {
    if (!required(values.collegeName))
      return { message: "College Name is required." };
    if (!required(values.degree)) return { message: "Degree is required." };
    if (!required(values.branch)) return { message: "Branch is required." };
    if (!required(values.currentYear))
      return { message: "Current Year is required." };
    if (!required(values.careerObjective))
      return { message: "Career Objective is required." };
    if (!hasMinSkills(values.skills, 2))
      return { message: "At least 2 skills are required." };
    return null;
  }

  // 3. Fresher
  if (type === "Fresher") {
    if (!required(values.degreeFresher))
      return { message: "Degree is required." };
    if (!required(values.collegeNameFresher))
      return { message: "College Name is required." };
    if (!hasMinSkills(values.skills, 1))
      return { message: "At least 1 skill is required." };

    const projectTitle = clean(values.projectTitle);
    const projectDescription = clean(values.projectDescription);
    if (!projectTitle || !projectDescription)
      return {
        message:
          "At least 1 project is required (Project Title + Description).",
      };

    return null;
  }

  // 4. Experienced Professional
  if (type === "Experienced Professional") {
    if (!required(values.professionalSummary))
      return { message: "Professional Summary is required." };
    if (!hasMinSkills(values.skills, 1))
      return { message: "At least 1 skill is required." };

    const list = Array.isArray(values.experiences) ? values.experiences : [];
    const hasAny = list.some(
      (x) => required(x?.companyName) && required(x?.designation)
    );
    if (!hasAny) return { message: "At least 1 experience is required." };
    return null;
  }

  return null;
}
