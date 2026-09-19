/**
 * Central query-key registry for TanStack Query.
 *
 * Keys are simple, flat arrays — enough structure to target invalidations
 * without an over-engineered hierarchy. Import these everywhere instead of
 * writing string arrays inline, so a rename is a single edit.
 */
export const queryKeys = {
  applications: ["applications"] as const,
  resumes: ["resumes"] as const,
  activity: ["activity"] as const,
  analyses: ["analyses"] as const
};
