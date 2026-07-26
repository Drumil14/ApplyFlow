"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, Check, Columns3, FileText, PlayCircle, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { ApplyFlowMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

const features = [
  { icon: Columns3, title: "Pipeline that stays honest", copy: "Drag roles across Applied, OA, Interview, Final Round, Offer, and Rejected with realtime updates." },
  { icon: Brain, title: "AI job description analysis", copy: "Extract skills, technologies, seniority, keywords, resume suggestions, and a match score from every posting." },
  { icon: FileText, title: "Resume version intelligence", copy: "Tie each application to a resume version and learn which variants turn into interviews and offers." },
  { icon: Zap, title: "Keyboard-first workflow", copy: "A command menu, shortcuts, subtle loading states, and fast transitions keep the search moving." }
];

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-ink text-white light:bg-slate-50 light:text-slate-950">
      <section className="relative min-h-[92vh] border-b border-white/10 light:border-slate-200">
        <div className="absolute inset-0 soft-grid opacity-70" />
        <motion.div
          className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand/20 blur-3xl"
          animate={{ x: [0, 80, 20, 0], y: [0, 50, 80, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-12 h-96 w-96 rounded-full bg-violet/20 blur-3xl"
          animate={{ x: [0, -70, 20, 0], y: [0, 90, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink shadow-glow light:bg-slate-950 light:text-white">
              <ApplyFlowMark className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">ApplyFlow</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white light:hover:text-slate-950">Features</a>
            <a href="#pricing" className="transition hover:text-white light:hover:text-slate-950">Pricing</a>
            <a href="#testimonials" className="transition hover:text-white light:hover:text-slate-950">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-950 sm:block">
              Log in
            </Link>
            <Link href="/login?demo=true" className="hidden rounded-md px-3 py-2 text-sm text-brand transition hover:bg-brand/10 md:block">
              Try demo
            </Link>
            <Link href="/signup">
              <Button className="h-9">Get started</Button>
            </Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Built for internship, new grad, and SWE searches
            </div>
            <h1 className="max-w-4xl text-6xl font-semibold tracking-[-0.04em] text-white light:text-slate-950 sm:text-7xl lg:text-8xl">
              ApplyFlow
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 light:text-slate-600">
              A modern AI-powered job application tracker that turns scattered applications, resume variants, and interview prep into a calm operating system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button className="w-full sm:w-auto" icon={<ArrowRight className="h-4 w-4" />}>Start tracking</Button>
              </Link>
              <Link href="/login?demo=true">
                <Button className="w-full sm:w-auto" variant="secondary" icon={<PlayCircle className="h-4 w-4" />}>Try Live Demo</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative min-h-[420px]"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-brand">Everything in one fast loop</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">A polished workspace for serious applicants.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.065] light:border-slate-200 light:bg-white light:hover:bg-slate-50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className="mb-8 h-5 w-5 text-brand" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">{feature.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="testimonials" className="border-y border-white/10 bg-white/[0.025] py-20 light:border-slate-200 light:bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            ["I stopped losing track of recruiter notes. ApplyFlow made my search feel like a product pipeline.", "Priya S.", "New Grad SWE"],
            ["The resume performance view changed how I applied. I knew which projects were actually converting.", "Evan M.", "CS Student"],
            ["It has the restraint of Linear but the workflow is clearly built for job hunting.", "Leah K.", "Frontend Engineer"]
          ].map(([quote, name, role]) => (
            <div key={name} className="rounded-lg border border-white/10 bg-ink/50 p-6 light:border-slate-200 light:bg-slate-50">
              <p className="text-sm leading-6 text-slate-300 light:text-slate-700">&ldquo;{quote}&rdquo;</p>
              <div className="mt-6 text-sm font-medium">{name}</div>
              <div className="text-xs text-slate-500">{role}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-medium text-brand">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">Start free. Upgrade when your search gets serious.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Starter", "$0", ["25 applications", "Manual tracking", "Resume versions"]],
              ["Pro", "$12", ["Unlimited applications", "AI analyzer", "Analytics and command menu"]]
            ].map(([name, price, items]) => (
              <div key={name as string} className="rounded-lg border border-white/10 bg-white/[0.045] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.065] light:border-slate-200 light:bg-white light:hover:bg-slate-50">
                <div className="text-sm text-slate-400 light:text-slate-600">{name}</div>
                <div className="mt-2 text-4xl font-semibold">{price}<span className="text-sm text-slate-500">/mo</span></div>
                <div className="mt-6 space-y-3">
                  {(items as string[]).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300 light:text-slate-700">
                      <Check className="h-4 w-4 text-brand" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


function DashboardPreview() {
  const columns = [
    ["Applied", "Notion", "Figma"],
    ["Interview", "Vercel", "Stripe"],
    ["Offer", "Datadog"]
  ];

  return (
    <div className="absolute inset-0 rounded-lg border border-white/10 bg-[#090d15]/90 p-4 shadow-panel light:border-slate-200 light:bg-white">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4 light:border-slate-200">
        <div>
          <div className="text-sm font-medium">Application pipeline</div>
          <div className="text-xs text-slate-500">18 active roles - 4 interviews this week</div>
        </div>
        <div className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs text-brand">82% momentum</div>
      </div>
      <div className="grid h-[330px] gap-3 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column[0]} className="rounded-md border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-slate-50">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">{column[0]}</div>
            <div className="space-y-3">
              {column.slice(1).map((company, index) => (
                <motion.div
                  key={company}
                  className="rounded-md border border-white/10 bg-ink/70 p-3 light:border-slate-200 light:bg-white"
                  animate={{ y: [0, index === 0 ? -4 : 4, 0] }}
                  transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="text-sm font-medium">{company}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${64 + index * 14}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
