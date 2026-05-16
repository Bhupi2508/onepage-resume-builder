export const resumeTypes = [
  "School Student",
  "College Student",
  "Fresher",
  "Experienced Professional",
  "Government Job Aspirant",
];

export const resumeStorageKey = "op-resume-builder";

export function getInitialResumeState(resumeType) {
  // Minimal common fields for initial v1 scaffold.
  // Full spec will be implemented in subsequent iterations.
  const base = {
    fullName: "",
    email: "",
    mobile: "",
    linkedin: "",
    github: "",
    skills: "",
    summary: "",
    projects: "",
    experience: "",
    education: "",
  };

  // Resume-type toggles will be refined later.
  if (resumeType === "School Student") {
    return {
      ...base,
      schoolName: "",
      className: "",
      percentage: "",
      achievements: "",
      hobbies: "",
      languages: "",
      careerGoal: "",
      extracurricular: "",
      interests: "",
    };
  }

  if (resumeType === "Government Job Aspirant") {
    return {
      ...base,
      address: "",
      objective: "",
      examPreparation: "",
      achievements: "",
      hobbies: "",
      skills: "",
      languages: "",
      interests: "",
    };
  }

  // Generic for other types
  return base;
}
