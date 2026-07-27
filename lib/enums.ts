// SQLite has no native enum support, so the Prisma schema stores these as plain
// strings. These const objects preserve the previous `@prisma/client` enum
// ergonomics (`ApplicationStatus.APPLIED`, `Object.values(...)`) for the app.

export const ApplicationStatus = {
  APPLIED: "APPLIED",
  OA: "OA",
  INTERVIEW: "INTERVIEW",
  FINAL_ROUND: "FINAL_ROUND",
  OFFER: "OFFER",
  REJECTED: "REJECTED"
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ActivityType = {
  APPLICATION_CREATED: "APPLICATION_CREATED",
  APPLICATION_UPDATED: "APPLICATION_UPDATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  NOTE_ADDED: "NOTE_ADDED",
  INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
  RESUME_UPLOADED: "RESUME_UPLOADED",
  ANALYSIS_CREATED: "ANALYSIS_CREATED"
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
