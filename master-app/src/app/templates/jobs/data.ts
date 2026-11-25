/**
 * Fixtures for Northbound. Every company and job here is fictional, and the
 * whole catalogue lives in this file so a buyer can swap in a real API by
 * replacing these arrays. Nothing in the app makes a network call.
 */

export type JobType = "Full-time" | "Contract" | "Part-time";
export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type Category =
  | "Engineering"
  | "Design"
  | "Product"
  | "Data"
  | "Marketing"
  | "Operations";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  mode: WorkMode;
  category: Category;
  /** Annual salary band in USD. */
  salaryMin: number;
  salaryMax: number;
  /** Days since the job was posted; 0 is today. Drives "newest" sorting. */
  postedDaysAgo: number;
  /** Skills the job asks for; the match score is profile overlap with this. */
  skills: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
  applicants: number;
}

export const CATEGORIES: Category[] = [
  "Engineering",
  "Design",
  "Product",
  "Data",
  "Marketing",
  "Operations",
];

export const JOB_TYPES: JobType[] = ["Full-time", "Contract", "Part-time"];
export const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

/** Salary filter bands, matched against the job's salary midpoint. */
export const SALARY_BANDS = [
  { value: "any", label: "Any salary", min: 0, max: Infinity },
  { value: "u80", label: "Under $80k", min: 0, max: 80000 },
  { value: "80-120", label: "$80k – $120k", min: 80000, max: 120000 },
  { value: "120-160", label: "$120k – $160k", min: 120000, max: 160000 },
  { value: "o160", label: "$160k+", min: 160000, max: Infinity },
] as const;

export const RESUMES = [
  "JordanEllis_CV.pdf",
  "JordanEllis_CV_Product.pdf",
  "JordanEllis_Portfolio_2026.pdf",
];

export const ALL_SKILLS = [
  "React",
  "TypeScript",
  "React Native",
  "Node.js",
  "GraphQL",
  "Figma",
  "Product Strategy",
  "SQL",
  "Python",
  "Design Systems",
  "User Research",
  "SEO",
  "Content",
  "Excel",
  "Stakeholder Management",
];

export const JOBS: Job[] = [
  {
    id: "j1",
    title: "Senior Product Engineer",
    company: "Loom & Lark",
    location: "Remote · EU/US",
    type: "Full-time",
    mode: "Remote",
    category: "Engineering",
    salaryMin: 145000,
    salaryMax: 175000,
    postedDaysAgo: 1,
    skills: ["React", "TypeScript", "React Native", "Node.js", "GraphQL"],
    about:
      "Loom & Lark builds scheduling tools for distributed teams. You'd join the four-person product engineering pod that owns the mobile app end to end, from discovery calls to the release train.",
    responsibilities: [
      "Own features in the React Native app from spec to shipped",
      "Pair with design on prototypes and usability sessions",
      "Keep the GraphQL schema tidy and the app fast on mid-range Android",
      "Mentor two mid-level engineers on the pod",
    ],
    requirements: [
      "5+ years building production React / React Native apps",
      "Strong TypeScript and a feel for API design",
      "Comfortable talking to customers, not just tickets",
    ],
    applicants: 34,
  },
  {
    id: "j2",
    title: "Frontend Engineer, Design Systems",
    company: "Petalworks",
    location: "Berlin · Hybrid",
    type: "Full-time",
    mode: "Hybrid",
    category: "Engineering",
    salaryMin: 95000,
    salaryMax: 125000,
    postedDaysAgo: 2,
    skills: ["React", "TypeScript", "Design Systems", "Figma"],
    about:
      "Petalworks is a florist marketplace with a 40-person product team. The design systems group maintains the component library used by six product squads.",
    responsibilities: [
      "Build and document accessible components in React",
      "Run the library's release and migration process",
      "Audit product surfaces for visual consistency",
    ],
    requirements: [
      "3+ years with React and component libraries",
      "A portfolio of polished, accessible UI work",
      "Working knowledge of Figma's API is a plus",
    ],
    applicants: 58,
  },
  {
    id: "j3",
    title: "Product Designer",
    company: "Fernline",
    location: "Remote · Worldwide",
    type: "Full-time",
    mode: "Remote",
    category: "Design",
    salaryMin: 110000,
    salaryMax: 140000,
    postedDaysAgo: 0,
    skills: ["Figma", "Design Systems", "User Research"],
    about:
      "Fernline makes invoicing painless for freelancers. We're hiring our second product designer to own the mobile experience and grow the research practice.",
    responsibilities: [
      "Lead design for the mobile app, discovery to delivery",
      "Run monthly usability studies and share findings company-wide",
      "Evolve the Fernline design system with engineering",
    ],
    requirements: [
      "4+ years designing consumer or prosumer mobile products",
      "Deep Figma fluency, including variables and prototyping",
      "A research habit: you test before you polish",
    ],
    applicants: 112,
  },
  {
    id: "j4",
    title: "Mobile Engineer (React Native)",
    company: "Cartway",
    location: "Austin, TX · On-site",
    type: "Full-time",
    mode: "On-site",
    category: "Engineering",
    salaryMin: 130000,
    salaryMax: 160000,
    postedDaysAgo: 3,
    skills: ["React Native", "TypeScript", "GraphQL", "Node.js"],
    about:
      "Cartway powers same-day delivery for independent grocers. The shopper app you'll build is used by 9,000 couriers every day.",
    responsibilities: [
      "Ship courier-facing features in React Native",
      "Own offline sync and background location reliability",
      "Profile and fix performance on low-end devices",
    ],
    requirements: [
      "4+ years of mobile development, 2+ in React Native",
      "Experience with offline-first data layers",
      "Based in Austin or willing to relocate",
    ],
    applicants: 47,
  },
  {
    id: "j5",
    title: "Product Manager, Growth",
    company: "Loom & Lark",
    location: "Remote · US",
    type: "Full-time",
    mode: "Remote",
    category: "Product",
    salaryMin: 135000,
    salaryMax: 165000,
    postedDaysAgo: 4,
    skills: ["Product Strategy", "SQL", "Stakeholder Management"],
    about:
      "Loom & Lark's growth pod owns activation and expansion revenue. You'll run the experiment backlog and work directly with the founders on pricing tests.",
    responsibilities: [
      "Own the activation funnel and its experiment roadmap",
      "Write specs and success metrics with engineering and design",
      "Report learnings to the whole company every Friday",
    ],
    requirements: [
      "3+ years in product, ideally on a growth team",
      "SQL fluency — you pull your own numbers",
      "A bias for small tests over big launches",
    ],
    applicants: 89,
  },
  {
    id: "j6",
    title: "Data Analyst",
    company: "Northbeam Studio",
    location: "Toronto · Hybrid",
    type: "Full-time",
    mode: "Hybrid",
    category: "Data",
    salaryMin: 85000,
    salaryMax: 110000,
    postedDaysAgo: 1,
    skills: ["SQL", "Python", "Excel"],
    about:
      "Northbeam Studio is a games analytics consultancy. Analysts here sit with client studios and turn raw telemetry into roadmap decisions.",
    responsibilities: [
      "Build dashboards for three client studios",
      "Run cohort and retention analyses in SQL and Python",
      "Present findings to client leadership monthly",
    ],
    requirements: [
      "2+ years in an analytics role",
      "Strong SQL; Python for analysis, not production code",
      "Clear written communication — reports are the product",
    ],
    applicants: 73,
  },
  {
    id: "j7",
    title: "Backend Engineer (Node.js)",
    company: "Tidepool Health",
    location: "Remote · US/CA",
    type: "Contract",
    mode: "Remote",
    category: "Engineering",
    salaryMin: 120000,
    salaryMax: 150000,
    postedDaysAgo: 5,
    skills: ["Node.js", "TypeScript", "SQL", "GraphQL"],
    about:
      "Tidepool Health builds clinic scheduling software. This is a 9-month contract on the integrations team, connecting our API to hospital systems.",
    responsibilities: [
      "Build Node.js services for HL7/FHIR integrations",
      "Harden the GraphQL gateway and its rate limits",
      "Write migration tooling for legacy clinic data",
    ],
    requirements: [
      "5+ years of backend work, deep Node.js/TypeScript",
      "PostgreSQL schema design and query tuning",
      "Healthcare or regulated-industry experience is a plus",
    ],
    applicants: 41,
  },
  {
    id: "j8",
    title: "Content Strategist",
    company: "Fernline",
    location: "Remote · Worldwide",
    type: "Part-time",
    mode: "Remote",
    category: "Marketing",
    salaryMin: 55000,
    salaryMax: 75000,
    postedDaysAgo: 2,
    skills: ["Content", "SEO", "User Research"],
    about:
      "Fernline's content team writes the guides freelancers actually read. This part-time role (24 hrs/week) owns the SEO roadmap and the help centre voice.",
    responsibilities: [
      "Plan and brief the monthly guide calendar",
      "Own SEO audits and internal-linking structure",
      "Keep help-centre articles accurate with product changes",
    ],
    requirements: [
      "3+ years in content strategy or editorial",
      "Working SEO knowledge — you read Search Console for fun",
      "A portfolio of long-form writing",
    ],
    applicants: 64,
  },
  {
    id: "j9",
    title: "Engineering Manager",
    company: "Cartway",
    location: "Austin, TX · Hybrid",
    type: "Full-time",
    mode: "Hybrid",
    category: "Engineering",
    salaryMin: 165000,
    salaryMax: 195000,
    postedDaysAgo: 6,
    skills: ["React", "Stakeholder Management", "Product Strategy", "Node.js"],
    about:
      "Cartway's platform group needs a manager for six engineers across web and API. You'll spend your time on people, planning, and the occasional architecture review.",
    responsibilities: [
      "Run the platform team's planning, 1:1s and growth plans",
      "Own the technical roadmap with the staff engineer",
      "Hire two engineers this year",
    ],
    requirements: [
      "2+ years managing engineers, 6+ in software overall",
      "A web platform background — React and Node.js shops preferred",
      "Calm, written-first communication",
    ],
    applicants: 29,
  },
  {
    id: "j10",
    title: "UX Researcher",
    company: "Petalworks",
    location: "Remote · EU",
    type: "Contract",
    mode: "Remote",
    category: "Design",
    salaryMin: 90000,
    salaryMax: 115000,
    postedDaysAgo: 3,
    skills: ["User Research", "Figma", "Stakeholder Management"],
    about:
      "Petalworks is standing up its first research practice. This 6-month contract sets up the participant panel, the repository, and the first three studies.",
    responsibilities: [
      "Design and run mixed-method studies for two squads",
      "Build a searchable research repository",
      "Coach designers on running their own sessions",
    ],
    requirements: [
      "4+ years of UX research in product teams",
      "Experience setting up panels and repositories from scratch",
      "Strong synthesis and storytelling",
    ],
    applicants: 38,
  },
  {
    id: "j11",
    title: "Growth Marketing Lead",
    company: "Northbeam Studio",
    location: "New York · Hybrid",
    type: "Full-time",
    mode: "Hybrid",
    category: "Marketing",
    salaryMin: 105000,
    salaryMax: 135000,
    postedDaysAgo: 7,
    skills: ["SEO", "Content", "Product Strategy"],
    about:
      "Northbeam Studio sells analytics to game studios, and word of mouth has carried us this far. You'll build the first real marketing engine: content, SEO and partnerships.",
    responsibilities: [
      "Own the content and SEO strategy end to end",
      "Launch a partnerships programme with engine vendors",
      "Report pipeline impact monthly to the founders",
    ],
    requirements: [
      "5+ years in B2B marketing, ideally dev-tools or gaming",
      "You write well and ship your own first drafts",
      "Comfortable being the whole marketing team for a while",
    ],
    applicants: 52,
  },
  {
    id: "j12",
    title: "Operations Coordinator",
    company: "Tidepool Health",
    location: "Chicago · On-site",
    type: "Full-time",
    mode: "On-site",
    category: "Operations",
    salaryMin: 60000,
    salaryMax: 78000,
    postedDaysAgo: 2,
    skills: ["Excel", "Stakeholder Management", "SQL"],
    about:
      "Tidepool Health's clinic onboarding team needs a coordinator to keep 40+ clinic launches a quarter on track — schedules, data checks, and a lot of friendly chasing.",
    responsibilities: [
      "Track onboarding milestones for new clinic customers",
      "Run data-quality checks in Excel and SQL before go-live",
      "Be the first point of contact for clinic office managers",
    ],
    requirements: [
      "2+ years in operations, support or project coordination",
      "Advanced Excel; basic SQL a strong plus",
      "Unflappable organisation skills",
    ],
    applicants: 96,
  },
];

/** "Posted today", "Posted 3d ago" — small helper for job cards. */
export function postedLabel(job: Job): string {
  if (job.postedDaysAgo === 0) return "Posted today";
  if (job.postedDaysAgo === 1) return "Posted yesterday";
  return `Posted ${job.postedDaysAgo}d ago`;
}

export function salaryLabel(job: Job): string {
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${k(job.salaryMin)} – ${k(job.salaryMax)}`;
}

/**
 * Match score: the share of the job's required skills the candidate's
 * profile covers, expressed as a percentage. A job asking for 5 skills
 * where the profile has 4 scores 80.
 */
export function matchScore(job: Job, profileSkills: string[]): number {
  if (job.skills.length === 0) return 0;
  const mine = new Set(profileSkills.map((s) => s.toLowerCase()));
  const hits = job.skills.filter((s) => mine.has(s.toLowerCase())).length;
  return Math.round((hits / job.skills.length) * 100);
}

export function companyInitials(company: string): string {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
