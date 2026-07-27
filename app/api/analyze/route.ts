import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreMatch } from "@/lib/scoring";
import { requireUser } from "@/lib/session";
import { extractSkills } from "@/lib/skills";

const seniorityFor = (description: string) => {
  const text = description.toLowerCase();
  if (text.includes("staff")) return "Staff";
  if (text.includes("senior")) return "Senior";
  if (text.includes("intern")) return "Intern";
  if (text.includes("junior") || text.includes("new grad")) return "Junior";
  return "Mid-level";
};

export async function POST(request: Request) {
  const { userId, response } = await requireUser();
  if (response) return response;

  try {
    const body = await request.json();
    const resumeId = String(body.resumeId ?? "").trim();
    const jobDescription = String(body.jobDescription ?? body.description ?? "").trim();

    if (!resumeId) {
      return NextResponse.json({ message: "Pick a resume version to compare against." }, { status: 400 });
    }
    if (jobDescription.length < 80) {
      return NextResponse.json({ message: "Paste at least a few paragraphs of a job description." }, { status: 400 });
    }

    const resume = await prisma.resumeVersion.findFirst({
      where: { id: resumeId, userId: userId as string },
      select: { id: true, title: true, skills: true }
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found." }, { status: 404 });
    }

    const jdSkills = extractSkills(jobDescription);
    const resumeSkills = (resume.skills as string[]) ?? [];
    const { score, matched, missing } = scoreMatch(jdSkills, resumeSkills);
    const seniorityLevel = seniorityFor(jobDescription);

    const resumeSuggestions = missing.map(
      (skill) => `Job asks for ${skill} — not found in this resume version.`
    );

    const analysis = {
      matchScore: score,
      matched,
      missing,
      requiredSkills: jdSkills,
      technologies: matched,
      seniorityLevel,
      keywords: resumeSkills,
      resumeSuggestions
    };

    await prisma.jobAnalysis.create({
      data: {
        userId: userId as string,
        title: resume.title,
        sourceText: jobDescription,
        requiredSkills: analysis.requiredSkills,
        technologies: analysis.technologies,
        seniorityLevel: analysis.seniorityLevel,
        keywords: analysis.keywords,
        resumeSuggestions: analysis.resumeSuggestions,
        matchScore: analysis.matchScore
      }
    });

    await prisma.activity.create({
      data: {
        userId: userId as string,
        type: "ANALYSIS_CREATED",
        message: `Analyzed a ${seniorityLevel.toLowerCase()} role with a ${score}% match score.`
      }
    });

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ message: "We could not analyze this role right now. Try again in a moment." }, { status: 500 });
  }
}
