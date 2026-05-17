const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tokenizeSkills(skills) {
  return (skills || "")
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function detectRoleTitle(values) {
  const skills = tokenizeSkills(values.skills);
  const text = skills.join(" ").toLowerCase();

  // Software/IT
  const isJavaBackend = /(java|spring boot)/i.test(text);
  const isNodeReact =
    /(node\.js|node|react|mongodb|express|sql|typescript|javascript|postgres|mysql)/i.test(
      text
    );
  const isDevOps =
    /(docker|kubernetes|aws|gcp|azure|terraform|ci\/cd|jenkins|ansible)/i.test(
      text
    );
  const isFrontend =
    /(react|angular|vue|next\.js|frontend|css|tailwind|javascript)/i.test(text);

  if (isJavaBackend || /spring/i.test(text)) return "Backend Developer";
  if (isDevOps) return "DevOps Engineer";
  if (isFrontend && isNodeReact) return "Full Stack Developer";
  if (isFrontend) return "Frontend Developer";
  if (isNodeReact) return "Full Stack Developer";

  // Designer
  const isDesign =
    /(figma|photoshop|illustrator|adobe|sketch|canva|ui\/ux|ux|ui|premiere|after effects|vegas|video editor)/i.test(
      text
    );
  if (isDesign) return "UI/UX Designer";

  // Business
  const isBiz =
    /(mba|marketing|sales|hr|human resources|finance|accounting|analytics|crm|leadership)/i.test(
      text
    );
  if (isBiz) return "Business Professional";

  return values.roleTitle || "";
}

export function isEmailValid(email) {
  return email ? emailRe.test(email) : false;
}
