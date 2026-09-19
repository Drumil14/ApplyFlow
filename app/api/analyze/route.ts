import { NextResponse } from "next/server";
import { analyzeJob, type AiGateDecision } from "@/lib/ai/analyze-job";
import { prisma } from "@/lib/prisma";
import { checkAIAnalysisLimit } from "@/lib/rate-limit";
import { getRateLimitIdentifier, requireUser } from "@/lib/session";

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

    // Rate-limit only the paid AI stage. The gate is consulted inside analyzeJob
    // *after* validation and *only* when an AI provider is configured, so an
    // invalid request or a provider-less deployment never consumes quota. The
    // deterministic match below is always returned regardless of the outcome.
    const identifier = await getRateLimitIdentifier(request);
    const aiGate = async (): Promise<AiGateDecision> => {
      const result = await checkAIAnalysisLimit(identifier);
      if (result.status === "ok") return { allow: true };
      if (result.status === "unavailable") {
        // Fail closed: never make an unrestricted Anthropic call.
        return { allow: false, status: "rate_limit_unavailable" };
      }
      return {
        allow: false,
        status: "rate_limited",
        rateLimit: { limit: result.limit, remaining: result.remaining, reset: result.reset }
      };
    };

    const analysis = await analyzeJob({
      jobDescription,
      resumeSkills,
      resumeText: resume.contentText,
      aiGate
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
