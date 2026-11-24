// Fictional DEMO profiles. No real people: reserved example.com domains and
// 555-01xx style phone numbers only.
import { createResume, newId } from "./profiles.js";
import { sectionHasContent } from "./sections.js";

const it = (heading, subheading, date, meta, text) => ({ id: newId("i"), heading, subheading, date, meta, text });
const fill = (resume, title, items) => {
  const s = resume.sections.find((x) => x.title === title);
  if (s) s.items = items;
  return resume;
};

function build(profile, basics, fills, templateId) {
  const r = createResume(profile, templateId);
  r.basics = { ...r.basics, ...basics };
  fills.forEach(([title, items]) => fill(r, title, items));
  // Drop sections the demo leaves empty so the preview has no placeholder gaps.
  r.sections = r.sections.filter(sectionHasContent);
  return r;
}

export const DEMO_PROFILES = [
  {
    id: "school",
    label: "School Student",
    blurb: "Class 12 student applying for a summer programme",
    build: () =>
      build(
        { stage: "school", category: "general" },
        { name: "Aarav Sample", title: "Class 12 Student, Science Stream", email: "aarav.sample@example.com", phone: "+1 555 0101", location: "Springfield, USA", summary: "Curious and disciplined student with a strong interest in physics and programming. Seeking a summer research programme to learn from practising scientists." },
        [
          ["Education", [it("Greenfield Public School", "Class 12, Science (PCM + Computer Science)", "2025 – 2026", "CBSE", "Class 11 result: 93%. Maths and Physics 96%.")]],
          ["Academic Achievements", [it("Gold medal, State Science Olympiad", "State Science Council", "2025", "", ""), it("School topper in Mathematics", "", "2024", "", "")]],
          ["Extracurricular Activities", [it("Founder, Robotics Club", "Greenfield Public School", "2024 – Present", "", "Built a line-following robot with 12 members\nOrganised two inter-school workshops")]],
          ["Sports & Competitions", [it("District-level 800m runner", "", "2024", "", "")]],
          ["Skills", [it("", "", "", "", "Python, Arduino, Public speaking, Teamwork, MS Office")]],
          ["Languages", [it("", "", "", "", "English (fluent), Hindi (native)")]],
        ],
        "academic"
      ),
  },
  {
    id: "college",
    label: "College Student",
    blurb: "Third-year computer science student seeking internships",
    build: () =>
      build(
        { stage: "college", category: "technical" },
        { name: "Maya Example", title: "B.Tech Computer Science Student", email: "maya.example@example.com", phone: "+1 555 0102", location: "Austin, USA", linkedin: "linkedin.com/in/maya-example", github: "github.com/maya-example", summary: "Third-year CS student with hands-on experience building web apps and a record of winning hackathons. Looking for a summer software internship." },
        [
          ["Education", [it("State Institute of Technology", "B.Tech, Computer Science", "2023 – 2027", "CGPA 8.7 / 10", "Dean's list, four semesters")]],
          ["Academic Projects", [it("Campus Event Planner", "React, Node.js, PostgreSQL", "2025", "", "Web app used by 600+ students to discover events\nCut registration time by 70% using QR check-ins"), it("Study Buddy Matcher", "Python, Flask", "2024", "", "Matches students by course and availability\nDeployed on a free-tier cloud instance")]],
          ["Internships", [it("Web Development Intern", "Brightside Labs", "May – Jul 2025", "Remote", "Built three reusable dashboard components\nFixed 25 UI bugs and wrote unit tests")]],
          ["Skills", [it("Languages", "", "", "", "Python, JavaScript, Java, SQL"), it("Frameworks & Libraries", "", "", "", "React, Node.js, Flask"), it("Tools & Platforms", "", "", "", "Git, Docker, Linux")]],
          ["Relevant Coursework", [it("", "", "", "", "Data Structures, Algorithms, Operating Systems, Databases, Computer Networks")]],
          ["Hackathons & Workshops", [it("Winner, CodeSprint 2025", "State Institute of Technology", "2025", "", "Built an accessibility checker in 24 hours")]],
        ],
        "technical"
      ),
  },
  {
    id: "fresher",
    label: "Fresher / Graduate",
    blurb: "Recent business graduate starting a marketing career",
    build: () =>
      build(
        { stage: "entry", category: "business" },
        { name: "Jordan Sample", title: "Marketing Graduate", email: "jordan.sample@example.com", phone: "+1 555 0103", location: "Denver, USA", linkedin: "linkedin.com/in/jordan-sample", summary: "BBA graduate with internship experience in social media and email campaigns. Eager to grow into a digital marketing role." },
        [
          ["Education", [it("Metro University", "BBA, Marketing", "2021 – 2025", "GPA 3.7 / 4.0", "Minor in Communication")]],
          ["Internships & Experience", [it("Marketing Intern", "Northwind Retail", "Jun – Dec 2024", "Denver", "Grew Instagram engagement by 38% in four months\nDrafted weekly newsletters for 12,000 subscribers\nTracked campaign results in Google Analytics")]],
          ["Projects", [it("Local Cafe Rebrand", "Canva, Mailchimp", "2024", "", "Created a launch campaign that doubled weekday foot traffic during a class project")]],
          ["Skills", [it("Domain skills", "", "", "", "Social media marketing, Email campaigns, Copywriting, SEO basics"), it("Tools & Platforms", "", "", "", "Google Analytics, Canva, Mailchimp, Excel")]],
          ["Certifications", [it("Google Digital Marketing Certificate", "Google", "2024", "", "")]],
          ["Languages", [it("", "", "", "", "English (native), Spanish (conversational)")]],
        ],
        "modern"
      ),
  },
  {
    id: "experienced",
    label: "Experienced Professional",
    blurb: "Operations manager with ten years of experience",
    build: () =>
      build(
        { stage: "manager", category: "operations" },
        { name: "Priya Demo", title: "Operations Manager | Supply Chain & Process Improvement", email: "priya.demo@example.com", phone: "+1 555 0104", location: "Chicago, USA", linkedin: "linkedin.com/in/priya-demo", summary: "Operations leader with 10+ years improving delivery speed and cost across logistics teams. Known for building reliable processes and mentoring first-time managers." },
        [
          ["Work Experience", [
            it("Operations Manager", "Harbor Logistics", "2020 – Present", "Chicago", "Lead 28 people across three regional warehouses\nCut order-to-delivery time by 22% by redesigning picking routes\nSaved $1.4M annually through vendor renegotiation\nIntroduced weekly KPI reviews that lifted on-time delivery to 97%"),
            it("Senior Operations Analyst", "Harbor Logistics", "2016 – 2020", "Chicago", "Built dashboards that reduced stock-outs by 31%\nTrained 40+ coordinators on new inventory software"),
            it("Operations Coordinator", "Lakeside Freight", "2013 – 2016", "Milwaukee", "Scheduled 120+ weekly shipments with a 99% accuracy rate"),
          ]],
          ["Key Achievements", [it("Company Excellence Award, 2023", "Harbor Logistics", "", "", ""), it("Led ERP rollout across 3 sites on time and 8% under budget", "", "2022", "", "")]],
          ["Skills", [it("Operations", "", "", "", "Supply chain planning, Lean Six Sigma, Vendor management, Budgeting"), it("Tools & Platforms", "", "", "", "SAP, Power BI, Excel, Jira")]],
          ["Education", [it("Midwest University", "B.S., Business Administration", "2009 – 2013", "", "")]],
          ["Certifications", [it("Six Sigma Green Belt", "ASQ", "2018", "", ""), it("PMP", "PMI", "2021", "", "")]],
        ],
        "traditional"
      ),
  },
  {
    id: "technical",
    label: "Technical Professional",
    blurb: "Senior backend engineer",
    build: () =>
      build(
        { stage: "experienced", category: "technical" },
        { name: "Sam Developer", title: "Senior Backend Engineer", email: "sam.developer@example.com", phone: "+1 555 0105", location: "Seattle, USA", linkedin: "linkedin.com/in/sam-developer", github: "github.com/sam-developer", website: "samdeveloper.example.com", summary: "Backend engineer with 8 years building high-throughput APIs and data pipelines. Strong on system design, reliability and mentoring." },
        [
          ["Work Experience", [
            it("Senior Software Engineer", "Cloudwave", "2021 – Present", "Seattle", "Redesigned the billing service to handle 5x traffic at p99 under 120 ms\nCut infrastructure cost 35% by moving batch jobs to spot instances\nMentored 4 engineers; two were promoted within 18 months"),
            it("Software Engineer", "DataForge", "2017 – 2021", "Remote", "Built an event pipeline processing 40M events/day on Kafka\nIntroduced contract tests that halved integration incidents"),
          ]],
          ["Key Projects", [it("Feature-flag service", "Go, PostgreSQL, Redis", "2023", "github.com/sam-developer/flags", "Sub-millisecond evaluation with local caching and audit trail")]],
          ["Open-Source Contributions", [it("Maintainer, tinyqueue-js", "Open source", "2020 – Present", "", "Maintain a small job-queue library with 1.8k GitHub stars")]],
          ["Skills", [it("Languages", "", "", "", "Go, Python, TypeScript, SQL"), it("Frameworks & Libraries", "", "", "", "gRPC, FastAPI, Express"), it("Databases", "", "", "", "PostgreSQL, Redis, DynamoDB, Kafka"), it("Cloud & DevOps", "", "", "", "AWS, Kubernetes, Terraform, GitHub Actions")]],
          ["Education", [it("City Technical University", "B.S., Computer Science", "2013 – 2017", "", "")]],
          ["Certifications", [it("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "2022", "", "")]],
        ],
        "technical"
      ),
  },
];

export const getDemo = (id) => DEMO_PROFILES.find((d) => d.id === id);
