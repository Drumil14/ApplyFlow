import { NextResponse } from "next/server";
import { analyzeJob } from "@/lib/ai/analyze-job";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

// Uses the Anthropic SDK, which needs the Node.js runtime (not edge).
export const runtime = "nodejs";

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
      select: { id: true, title: true, skills: true, contentText: true }
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found." }, { status: 404 });
    }

    const resumeSkills = (resume.skills as string[]) ?? [];
    const analysis = await analyzeJob({
      jobDescription,
      resumeSkills,
      resumeText: resume.contentText
    });

    // Persist the deterministic record (AI persistence lands with analysis
    // history in a later phase). Keep this best-effort so a DB hiccup never
    // fails an otherwise-successful analysis.
    try {
      await prisma.jobAnalysis.create({
        data: {
          userId: userId as string,
          title: analysis.ai?.roleTitle ?? resume.title,
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
          message: `Analyzed a ${analysis.seniorityLevel.toLowerCase()} role with a ${analysis.matchScore}% match score.`
        }
      });
    } catch (persistError) {
      console.error("[analyze] failed to persist analysis:", persistError);
    }

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { message: "We could not analyze this role right now. Try again in a moment." },
      { status: 500 }
    );
  }
}
