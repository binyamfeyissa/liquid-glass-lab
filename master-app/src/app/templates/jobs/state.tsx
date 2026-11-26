import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";

import { JOBS, type Job } from "./data";

/**
 * Northbound's whole data layer: one in-memory store. There is no backend
 * and no persistence — saved jobs, applications and the candidate profile
 * live for the session, so applying to a job on the detail screen shows up
 * in the Applications tab immediately, and editing skills on the Profile
 * tab re-scores every match badge in the app. Restarting resets fixtures.
 */

/** The three backgrounds. Every Glacia `isDark` prop derives from it. */
export type BackdropMode = "dark" | "light" | "image";

export interface Profile {
  name: string;
  email: string;
  title: string;
  location: string;
  yearsExperience: number;
  skills: string[];
}

/** Pipeline stages, in order. "Closed" is a terminal outcome, not a stage. */
export const STAGES = ["Applied", "Reviewing", "Interview", "Offer"] as const;
export type ApplicationStatus = (typeof STAGES)[number] | "Closed";

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  /** Index into STAGES the application reached before closing, if closed. */
  closedAtStage?: number;
  appliedLabel: string;
  updatedLabel: string;
  coverNote: string;
  resume: string;
  /** One line per reached stage, shown on the application timeline. */
  stageNotes: Partial<Record<ApplicationStatus, string>>;
}

interface JobsState {
  jobs: Job[];
  jobById: (id: string) => Job | undefined;

  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;

  savedIds: string[];
  isSaved: (jobId: string) => boolean;
  toggleSaved: (jobId: string) => void;

  applications: Application[];
  applicationFor: (jobId: string) => Application | undefined;
  apply: (jobId: string, coverNote: string, resume: string) => Application;

  /** Home's search box writes here; the Search tab reads it. */
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  alertsNewJobs: boolean;
  setAlertsNewJobs: (value: boolean) => void;
  alertsStatusChanges: boolean;
  setAlertsStatusChanges: (value: boolean) => void;
  alertsDigest: boolean;
  setAlertsDigest: (value: boolean) => void;
}

const JobsContext = createContext<JobsState | null>(null);

const SEED_PROFILE: Profile = {
  name: "Jordan Ellis",
  email: "jordan.ellis@example.com",
  title: "Senior Product Engineer",
  location: "Portland, OR · Remote",
  yearsExperience: 6,
  skills: ["React", "TypeScript", "React Native", "Node.js", "GraphQL", "Figma"],
};

const SEED_APPLICATIONS: Application[] = [
  {
    id: "a1",
    jobId: "j7",
    status: "Interview",
    appliedLabel: "Applied Nov 12",
    updatedLabel: "Updated today",
    coverNote:
      "I've spent the last three years building Node.js integration services, including a FHIR connector for a telehealth client. The integrations focus of this contract is exactly the work I want more of.",
    resume: "JordanEllis_CV.pdf",
    stageNotes: {
      Applied: "Application sent with JordanEllis_CV.pdf",
      Reviewing: "Tidepool's hiring team viewed your profile",
      Interview: "Technical interview booked — Thu, Nov 26, 10:00 PT",
    },
  },
  {
    id: "a2",
    jobId: "j2",
    status: "Reviewing",
    appliedLabel: "Applied Nov 18",
    updatedLabel: "Updated yesterday",
    coverNote:
      "Design systems are where I do my best work — I maintain an open-source component library and led Petalworks-style token migrations at my last role.",
    resume: "JordanEllis_CV.pdf",
    stageNotes: {
      Applied: "Application sent with JordanEllis_CV.pdf",
      Reviewing: "Your application is with the design systems team",
    },
  },
  {
    id: "a3",
    jobId: "j5",
    status: "Closed",
    closedAtStage: 1,
    appliedLabel: "Applied Oct 30",
    updatedLabel: "Closed Nov 14",
    coverNote:
      "I run growth experiments as an engineer today and would love to own the roadmap side of the funnel at Loom & Lark.",
    resume: "JordanEllis_CV_Product.pdf",
    stageNotes: {
      Applied: "Application sent with JordanEllis_CV_Product.pdf",
      Reviewing: "Reviewed by the growth team",
      Closed: "Role filled by an internal candidate — profile kept on file",
    },
  },
];

let counter = 100;
const nextId = () => `app-${++counter}`;

export function JobsProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(SEED_PROFILE);
  const [savedIds, setSavedIds] = useState<string[]>(["j3", "j9"]);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  // The host (template list) passes its current backdrop mode as a route
  // param (`backdrop`) when opening a template, so the template opens on
  // the same background the owner just picked. Standalone there is no
  // param and the template keeps its dark default. Read once on mount
  // (lazy initialiser) so navigating inside the template never resets it.
  const params = useLocalSearchParams();
  const [backdrop, setBackdrop] = useState<BackdropMode>(() => {
    const p = params.backdrop;
    const v = Array.isArray(p) ? p[0] : p;
    return v === "dark" || v === "light" || v === "image" ? v : "dark";
  });
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [alertsNewJobs, setAlertsNewJobs] = useState(true);
  const [alertsStatusChanges, setAlertsStatusChanges] = useState(true);
  const [alertsDigest, setAlertsDigest] = useState(false);

  const jobById = useCallback((id: string) => JOBS.find((j) => j.id === id), []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addSkill = useCallback((skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    setProfile((prev) =>
      prev.skills.some((s) => s.toLowerCase() === clean.toLowerCase())
        ? prev
        : { ...prev, skills: [...prev.skills, clean] },
    );
  }, []);

  const removeSkill = useCallback((skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  }, []);

  const isSaved = useCallback(
    (jobId: string) => savedIds.includes(jobId),
    [savedIds],
  );

  const toggleSaved = useCallback((jobId: string) => {
    setSavedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [jobId, ...prev],
    );
  }, []);

  const applicationFor = useCallback(
    (jobId: string) => applications.find((a) => a.jobId === jobId),
    [applications],
  );

  const apply = useCallback(
    (jobId: string, coverNote: string, resume: string) => {
      const app: Application = {
        id: nextId(),
        jobId,
        status: "Applied",
        appliedLabel: "Applied today",
        updatedLabel: "Updated just now",
        coverNote: coverNote.trim(),
        resume,
        stageNotes: { Applied: `Application sent with ${resume}` },
      };
      setApplications((prev) => [app, ...prev]);
      return app;
    },
    [],
  );

  const value = useMemo<JobsState>(
    () => ({
      jobs: JOBS,
      jobById,
      profile,
      updateProfile,
      addSkill,
      removeSkill,
      savedIds,
      isSaved,
      toggleSaved,
      applications,
      applicationFor,
      apply,
      searchQuery,
      setSearchQuery,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      alertsNewJobs,
      setAlertsNewJobs,
      alertsStatusChanges,
      setAlertsStatusChanges,
      alertsDigest,
      setAlertsDigest,
    }),
    [
      jobById,
      profile,
      updateProfile,
      addSkill,
      removeSkill,
      savedIds,
      isSaved,
      toggleSaved,
      applications,
      applicationFor,
      apply,
      searchQuery,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
    ],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsState {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used inside JobsProvider");
  return ctx;
}
