export type Status = "APPLIED" | "OA" | "INTERVIEW" | "FINAL_ROUND" | "OFFER" | "REJECTED";

export const statuses: Status[] = ["APPLIED", "OA", "INTERVIEW", "FINAL_ROUND", "OFFER", "REJECTED"];

export const statusLabels: Record<Status, string> = {
  APPLIED: "Applied",
  OA: "OA",
  INTERVIEW: "Interview",
  FINAL_ROUND: "Final round",
  OFFER: "Offer",
  REJECTED: "Rejected"
};

export type Resume = {
  id: string;
  title: string;
  versionTag: string;
  fileName: string;
  targetRole: string | null;
  contentText?: string | null;
  skills?: string[];
  score: number;
  interviews: number;
  offers: number;
  rejections: number;
  createdAt: string;
  applications?: Array<{
    id: string;
    company: string;
    role: string;
    status: Status;
  }>;
};

export type Application = {
  id: string;
  company: string;
  role: string;
  status: Status;
  location: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  deadline: string | null;
  appliedAt: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  notes: string | null;
  links: string[];
  priority: number;
  resumeId: string | null;
  resume?: Resume | null;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  application?: {
    company: string;
    role: string;
    status: Status;
  } | null;
};

export type AiStatus = "ok" | "unconfigured" | "failed";

export type JobAIAnalysis = {
  roleTitle: string;
  seniority: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  strengths: string[];
  gaps: string[];
  resumeSuggestions: string[];
  interviewTopics: string[];
};

export type AnalysisResult = {
  requiredSkills: string[];
  technologies: string[];
  seniorityLevel: string;
  keywords: string[];
  resumeSuggestions: string[];
  matchScore: number;
  matched: string[];
  missing: string[];
  ai: JobAIAnalysis | null;
  aiStatus: AiStatus;
};
