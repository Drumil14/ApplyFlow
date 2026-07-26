/**
 * Pure, deterministic match scoring. No DB, no I/O, no globals — trivially
 * testable. Given the skills a job description asks for and the skills present
 * in a resume, report which are matched, which are missing, and a 0–100 score.
 */

export type ScoreResult = {
  score: number;
  matched: string[];
  missing: string[];
};

export function scoreMatch(jdSkills: string[], resumeSkills: string[]): ScoreResult {
  const resumeSet = new Set(resumeSkills);
  const matched = jdSkills.filter((skill) => resumeSet.has(skill));
  const missing = jdSkills.filter((skill) => !resumeSet.has(skill));
  const score = jdSkills.length === 0 ? 0 : Math.round((100 * matched.length) / jdSkills.length);

  return { score, matched, missing };
}
