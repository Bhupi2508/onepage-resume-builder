const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const githubRe = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/;
const linkedInRe =
  /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_.-]+\/?$/;

export function validateResume(values) {
  const name = (values.fullName || "").trim();
  if (!name) return null;
  if (name.length > 40)
    return { message: "Full Name must be max 40 characters." };

  const email = (values.email || "").trim();
  if (email && !emailRe.test(email))
    return { message: "Enter a valid email address." };

  const mobile = (values.mobile || "").trim();
  if (mobile && !/^\d{10}$/.test(mobile))
    return { message: "Mobile must be exactly 10 digits." };

  const skills = (values.skills || "").trim();
  if (skills && skills.length > 240)
    return { message: "Skills field is too long." };

  const summary = (values.summary || "").trim();
  if (summary && summary.length > 250)
    return { message: "Professional Summary must be max 250 characters." };

  const linkedin = (values.linkedin || "").trim();
  if (linkedin && !linkedInRe.test(linkedin))
    return { message: "LinkedIn URL looks invalid." };

  const github = (values.github || "").trim();
  if (github && !githubRe.test(github))
    return { message: "GitHub URL looks invalid." };

  return null;
}
