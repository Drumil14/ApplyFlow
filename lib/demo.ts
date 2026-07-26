import { ApplicationStatus, type PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { extractSkills } from "@/lib/skills";

export const DEMO_EMAIL = "demo@applyflow.dev";
export const DEMO_PASSWORD = "applyflow123";

const resetWindowMs = 6 * 60 * 60 * 1000;

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date;
};

export async function ensureDemoWorkspace(prisma: PrismaClient, options: { force?: boolean } = {}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Maya Chen",
      passwordHash,
      targetRole: "New Grad Software Engineer"
    },
    create: {
      name: "Maya Chen",
      email: DEMO_EMAIL,
      passwordHash,
      targetRole: "New Grad Software Engineer"
    }
  });

  const [applicationCount, latestActivity] = await Promise.all([
    prisma.application.count({ where: { userId: user.id } }),
    prisma.activity.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    })
  ]);

  const shouldReset =
    options.force ||
    applicationCount === 0 ||
    !latestActivity ||
    Date.now() - latestActivity.createdAt.getTime() > resetWindowMs;

  if (!shouldReset) return user;

  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.jobAnalysis.deleteMany({ where: { userId: user.id } });
  await prisma.application.deleteMany({ where: { userId: user.id } });
  await prisma.resumeVersion.deleteMany({ where: { userId: user.id } });

  const systemsResumeText =
    "Backend engineer focused on distributed systems. Built payment and ledger services in Node.js and TypeScript backed by PostgreSQL and Redis. Shipped event pipelines on Kafka, containerized workloads with Docker and Kubernetes, and ran deployments on AWS with CI/CD. Strong SQL and API design.";
  const systemsResume = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      title: "Systems + Backend Resume",
      versionTag: "v4",
      fileName: "maya-chen-backend-v4.pdf",
      targetRole: "Backend Software Engineer",
      contentText: systemsResumeText,
      skills: extractSkills(systemsResumeText),
      score: 82,
      interviews: 5,
      offers: 1,
      rejections: 2
    }
  });

  const productResumeText =
    "Product engineer building full-stack surfaces with React, Next.js, and TypeScript. Owned Node.js API integrations and GraphQL endpoints over a PostgreSQL database, styled with Tailwind, and deployed to AWS. Comfortable across REST and modern CI/CD.";
  const productResume = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      title: "Product Engineering Resume",
      versionTag: "v7",
      fileName: "maya-chen-product-v7.pdf",
      targetRole: "Full Stack Engineer",
      contentText: productResumeText,
      skills: extractSkills(productResumeText),
      score: 91,
      interviews: 8,
      offers: 2,
      rejections: 1
    }
  });

  const internshipResumeText =
    "Software engineering intern projects using React and JavaScript on the frontend and Python with Flask on the backend. Worked with SQL databases and version control in Git. Built a study assistant and a payments simulator.";
  const internshipResume = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      title: "Internship Projects Resume",
      versionTag: "v3",
      fileName: "maya-chen-internship-v3.pdf",
      targetRole: "Software Engineer Intern",
      contentText: internshipResumeText,
      skills: extractSkills(internshipResumeText),
      score: 76,
      interviews: 3,
      offers: 0,
      rejections: 2
    }
  });

  const applications = [
    {
      company: "Vercel",
      role: "Software Engineer, Frontend Platform",
      status: ApplicationStatus.INTERVIEW,
      location: "Remote, US",
      workMode: "Remote",
      salaryMin: 145000,
      salaryMax: 190000,
      recruiterName: "Elena Park",
      recruiterEmail: "elena@vercel.example",
      deadline: new Date("2026-05-12"),
      notes: "Hiring manager screen focused on design systems, edge rendering, and developer experience.",
      links: ["https://vercel.com/careers"],
      priority: 1,
      resumeId: productResume.id,
      appliedAt: daysAgo(8)
    },
    {
      company: "Linear",
      role: "Product Engineer",
      status: ApplicationStatus.FINAL_ROUND,
      location: "San Francisco, CA",
      workMode: "Hybrid",
      salaryMin: 165000,
      salaryMax: 220000,
      recruiterName: "Nora Iversen",
      recruiterEmail: "nora@linear.example",
      deadline: new Date("2026-05-15"),
      notes: "Final round includes product critique and systems architecture. Prepare examples around taste and velocity.",
      links: ["https://linear.app/careers"],
      priority: 1,
      resumeId: productResume.id,
      appliedAt: daysAgo(14)
    },
    {
      company: "Stripe",
      role: "Backend Engineer, Money Movement",
      status: ApplicationStatus.OA,
      location: "Seattle, WA",
      workMode: "Hybrid",
      salaryMin: 155000,
      salaryMax: 205000,
      recruiterName: "Arjun Rao",
      recruiterEmail: "arjun@stripe.example",
      deadline: new Date("2026-05-10"),
      notes: "OA due this weekend. Review idempotency, ledgers, and API design tradeoffs.",
      links: ["https://stripe.com/jobs"],
      priority: 1,
      resumeId: systemsResume.id,
      appliedAt: daysAgo(5)
    },
    {
      company: "Notion",
      role: "New Grad Software Engineer",
      status: ApplicationStatus.APPLIED,
      location: "New York, NY",
      workMode: "Hybrid",
      salaryMin: 130000,
      salaryMax: 175000,
      notes: "Applied with referral from Priya. Follow up after one week.",
      links: ["https://notion.com/careers"],
      priority: 2,
      resumeId: productResume.id,
      appliedAt: daysAgo(2)
    },
    {
      company: "Datadog",
      role: "Software Engineer Intern, Infrastructure",
      status: ApplicationStatus.OFFER,
      location: "Boston, MA",
      workMode: "Onsite",
      salaryMin: 98000,
      salaryMax: 115000,
      notes: "Offer received. Deadline to respond after final compensation conversation.",
      links: ["https://careers.datadoghq.com"],
      deadline: new Date("2026-05-20"),
      priority: 1,
      resumeId: systemsResume.id,
      appliedAt: daysAgo(18)
    },
    {
      company: "Figma",
      role: "Frontend Engineer",
      status: ApplicationStatus.REJECTED,
      location: "San Francisco, CA",
      workMode: "Hybrid",
      notes: "Rejected after recruiter screen. Weakest signal was canvas rendering depth.",
      links: ["https://figma.com/careers"],
      priority: 3,
      resumeId: productResume.id,
      appliedAt: daysAgo(24)
    },
    {
      company: "Ramp",
      role: "New Grad Software Engineer, Growth",
      status: ApplicationStatus.APPLIED,
      location: "New York, NY",
      workMode: "Hybrid",
      salaryMin: 135000,
      salaryMax: 180000,
      notes: "Tailor resume toward experimentation, dashboards, and measurable product velocity.",
      links: ["https://ramp.com/careers"],
      priority: 2,
      resumeId: internshipResume.id,
      appliedAt: daysAgo(1)
    },
    {
      company: "Anthropic",
      role: "Product Engineer, Claude",
      status: ApplicationStatus.INTERVIEW,
      location: "San Francisco, CA",
      workMode: "Hybrid",
      salaryMin: 175000,
      salaryMax: 235000,
      recruiterName: "Sam Rivera",
      recruiterEmail: "sam@anthropic.example",
      deadline: new Date("2026-05-18"),
      notes: "Prepare examples around AI product safety, evaluation workflows, and thoughtful UX defaults.",
      links: ["https://anthropic.com/careers"],
      priority: 1,
      resumeId: productResume.id,
      appliedAt: daysAgo(10)
    }
  ];

  for (const item of applications) {
    const { appliedAt, ...applicationData } = item;
    const application = await prisma.application.create({
      data: {
        ...applicationData,
        appliedAt,
        createdAt: appliedAt,
        updatedAt: appliedAt,
        userId: user.id
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        applicationId: application.id,
        type: "APPLICATION_CREATED",
        message: `Added ${application.role} at ${application.company}.`,
        createdAt: appliedAt
      }
    });
  }

  await prisma.activity.createMany({
    data: [
      {
        userId: user.id,
        type: "INTERVIEW_SCHEDULED",
        message: "Linear final round scheduled for Monday at 11:00 AM.",
        createdAt: daysAgo(0, 9)
      },
      {
        userId: user.id,
        type: "STATUS_CHANGED",
        message: "Datadog moved to offer.",
        createdAt: daysAgo(1, 15)
      },
      {
        userId: user.id,
        type: "RESUME_UPLOADED",
        message: "Uploaded Product Engineering Resume v7.",
        createdAt: daysAgo(3, 11)
      },
      {
        userId: user.id,
        type: "ANALYSIS_CREATED",
        message: "Analyzed Anthropic Product Engineer role with an 88% match score.",
        createdAt: daysAgo(0, 13)
      },
      {
        userId: user.id,
        type: "NOTE_ADDED",
        message: "Added Stripe OA prep notes about idempotency keys, ledgers, and API pagination.",
        createdAt: daysAgo(2, 17)
      },
      {
        userId: user.id,
        type: "STATUS_CHANGED",
        message: "Vercel moved from OA to interview after frontend systems screen.",
        createdAt: daysAgo(4, 14)
      }
    ]
  });

  await prisma.jobAnalysis.createMany({
    data: [
      {
        userId: user.id,
        title: "Anthropic Product Engineer",
        sourceText:
          "Build AI product workflows with React, TypeScript, evaluation tooling, and thoughtful UX defaults for teams adopting Claude.",
        requiredSkills: ["Product judgment", "React architecture", "Evaluation workflows", "Clear written communication"],
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Analytics"],
        seniorityLevel: "Mid-level",
        keywords: ["AI product", "evaluations", "safety", "UX defaults", "experimentation"],
        resumeSuggestions: [
          "Lead with the AI study assistant project and quantify weekly active users.",
          "Add a bullet about evaluation criteria and failure analysis.",
          "Highlight accessibility decisions in the dashboard project."
        ],
        matchScore: 88,
        createdAt: daysAgo(0, 13)
      },
      {
        userId: user.id,
        title: "Stripe Backend Engineer",
        sourceText:
          "Own financial APIs, improve money movement reliability, and design idempotent systems with strong observability.",
        requiredSkills: ["Distributed systems", "API design", "Reliability", "Testing discipline"],
        technologies: ["Node.js", "PostgreSQL", "Kafka", "Observability"],
        seniorityLevel: "New grad",
        keywords: ["idempotency", "ledger", "reliability", "API contracts"],
        resumeSuggestions: [
          "Move the payments simulator project above general coursework.",
          "Quantify test coverage and latency improvements.",
          "Use stronger verbs around ownership and debugging."
        ],
        matchScore: 81,
        createdAt: daysAgo(2, 16)
      }
    ]
  });

  return user;
}
