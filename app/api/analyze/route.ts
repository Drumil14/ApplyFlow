import OpenAI from "openai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const fallback = (description: string) => {
  const text = description.toLowerCase();
  const technologies = ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "AWS", "GraphQL", "Python"].filter(
    (tech) => text.includes(tech.toLowerCase().replace(".", ""))
  );
  const seniorityLevel = text.includes("senior")
    ? "Senior"
    : text.includes("staff")
      ? "Staff"
      : text.includes("intern")
        ? "Intern"
        : text.includes("junior")
          ? "Junior"
          : "Mid-level";

  return {
    requiredSkills: ["Product sense", "Systems thinking", "Clear communication", "Shipping reliable software"],
    technologies: technologies.length ? technologies : ["React", "TypeScript", "APIs", "SQL"],
    seniorityLevel,
    keywords: ["ownership", "collaboration", "performance", "user experience", "data-informed"],
    resumeSuggestions: [
      "Move the most relevant project into the first third of the resume.",
      "Quantify impact with latency, conversion, reliability, or adoption metrics.",
      "Mirror the role's core technologies in project bullets where truthful.",
      "Add one concise bullet showing cross-functional collaboration."
    ],
    matchScore: Math.min(94, Math.max(62, 70 + technologies.length * 4 + (text.includes("intern") ? 6 : 0)))
  };
};

export async function POST(request: Request) {
  const { userId, response } = await requireUser();
  if (response) return response;

  try {
    const body = await request.json();
    const description = String(body.description ?? "").trim();
    if (description.length < 80) {
      return NextResponse.json({ message: "Paste at least a few paragraphs of a job description." }, { status: 400 });
    }

    let analysis = fallback(description);

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You extract structured hiring signals for a job application tracker. Return compact JSON with requiredSkills, technologies, seniorityLevel, keywords, resumeSuggestions, matchScore."
            },
            {
              role: "user",
              content: description
            }
          ]
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          analysis = { ...analysis, ...JSON.parse(content) };
        }
      } catch {
        analysis = fallback(description);
      }
    }

    analysis = {
      requiredSkills: Array.isArray(analysis.requiredSkills) ? analysis.requiredSkills.slice(0, 8).map(String) : fallback(description).requiredSkills,
      technologies: Array.isArray(analysis.technologies) ? analysis.technologies.slice(0, 10).map(String) : fallback(description).technologies,
      seniorityLevel: String(analysis.seniorityLevel || "Mid-level"),
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords.slice(0, 10).map(String) : fallback(description).keywords,
      resumeSuggestions: Array.isArray(analysis.resumeSuggestions)
        ? analysis.resumeSuggestions.slice(0, 6).map(String)
        : fallback(description).resumeSuggestions,
      matchScore: Math.min(99, Math.max(1, Number(analysis.matchScore) || fallback(description).matchScore))
    };

    await prisma.jobAnalysis.create({
      data: {
        userId: userId as string,
        sourceText: description,
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

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ message: "We could not analyze this role right now. Try again in a moment." }, { status: 500 });
  }
}
