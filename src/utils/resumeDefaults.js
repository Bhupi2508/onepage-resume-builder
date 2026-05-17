export const resumeTypes = [
  "School Student",
  "College Student",
  "Fresher",
  "Experienced Professional",
];

export const resumeStorageKey = "op-resume-builder";

export function getInitialResumeState(resumeType) {
  // Premium header/contact fields (ONLY these 3 in requirements)
  const base = {
    fullName: "",
    email: "",
    mobile: "",

    // Social links (optional)
    linkedin: "",
    github: "",
    leetcode: "",
    twitter: "",
    discord: "",
    youtube: "",
    portfolio: "",

    // Category marker (for renderer)
    resumeType,

    // Common
    skills: "",

    // Social/contact helper (not required)
    careerObjective: "",

    // School Student fields
    schoolName: "",
    schoolClass: "",
    favoriteSubjects: "",
    academicAchievements: "",
    sportsAchievements: "",
    certifications: "",
    hobbies: "",
    interests: "",
    languages: "",
    extracurricularActivities: "",

    // College Student fields
    collegeName: "",
    degree: "",
    branch: "",
    currentYear: "",
    education: "",
    academicProjects: "",
    internship: "",

    achievements: "",

    // Fresher fields
    degreeFresher: "",
    collegeNameFresher: "",
    projectTitle: "",
    projectDescription: "",
    internshipFresher: "",
    certificationsFresher: "",
    achievementsFresher: "",
    languagesFresher: "",
    interestsFresher: "",

    // Experienced Professional fields
    professionalSummary: "",
    experiences: [
      {
        companyName: "",
        designation: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
        technologiesUsed: "",
      },
    ],
    projects: "",
    certificationsExperienced: "",
    educationExperienced: "",
  };

  // Keep category-specific defaults distinct (don’t share structure across categories)
  // Ensure resumeType field always matches selected value
  return { ...base, resumeType };
}
