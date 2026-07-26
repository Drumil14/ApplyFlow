"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApplyFlowMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const demoEmail = "demo@applyflow.dev";
const demoPassword = "applyflow123";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStarted = useRef(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "" : "");
  const [password, setPassword] = useState("");

  const loginWithCredentials = useCallback(async (credentials: { email: string; password: string; successMessage?: string }) => {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false
    });

    if (result?.error) throw new Error("Check your email and password.");

    toast.success(credentials.successMessage ?? "Welcome back");
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message ?? "Unable to create account.");
        }
      }

      await loginWithCredentials({
        email,
        password,
        successMessage: mode === "signup" ? "Workspace created" : "Welcome back"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithDemo = useCallback(async () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setDemoLoading(true);

    try {
      await loginWithCredentials({
        email: demoEmail,
        password: demoPassword,
        successMessage: "Demo workspace ready"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the demo workspace.");
    } finally {
      setDemoLoading(false);
    }
  }, [loginWithCredentials]);

  useEffect(() => {
    if (mode !== "login" || autoStarted.current || searchParams.get("demo") !== "true") return;
    autoStarted.current = true;
    continueWithDemo();
  }, [continueWithDemo, mode, searchParams]);

  return (
    <div className="min-h-screen bg-ink px-4 py-8 text-white light:bg-slate-50 light:text-slate-950">
      <Link href="/" className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink light:bg-slate-950 light:text-white">
          <ApplyFlowMark className="h-5 w-5" />
        </div>
        <span className="text-sm font-semibold">ApplyFlow</span>
      </Link>
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="mb-4 text-sm font-medium text-brand">AI-powered application tracking</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.02em] text-white light:text-slate-950 sm:text-6xl">
            Keep every opportunity moving with less chaos.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400 light:text-slate-600">
            Track jobs, interviews, resume versions, and AI job description insights in one polished workspace built for serious applicants.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {["Kanban", "AI match", "Resume ROI"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="glass rounded-lg p-6 shadow-panel"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{mode === "login" ? "Log in" : "Create account"}</h2>
            <p className="mt-2 text-sm text-slate-400 light:text-slate-600">
              {mode === "login" ? "Use your account or jump straight into the seeded demo workspace." : "Start with a focused workspace for your search."}
            </p>
          </div>
          {mode === "login" ? (
            <motion.button
              type="button"
              onClick={continueWithDemo}
              disabled={loading || demoLoading}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-md border border-brand/25 bg-brand/10 px-4 py-3 text-sm font-medium text-brand transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:opacity-60"
              whileTap={{ scale: 0.99 }}
            >
              {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Continue with Demo Account
            </motion.button>
          ) : null}
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <label className="block text-sm">
                <span className="mb-2 block text-slate-300 light:text-slate-700">Name</span>
                <Input name="name" autoComplete="name" required placeholder="Maya Chen" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
            ) : null}
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300 light:text-slate-700">Email</span>
              <Input name="email" type="email" autoComplete="email" required placeholder="you@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300 light:text-slate-700">Password</span>
              <Input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} placeholder="8+ characters" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <Button className="w-full" disabled={loading || demoLoading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}>
              {mode === "login" ? "Log in" : "Create workspace"}
            </Button>
          </form>
          {mode === "login" ? (
            <motion.div
              className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm transition hover:border-white/20 hover:bg-white/[0.06] light:border-slate-200 light:bg-slate-50 light:hover:bg-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <div className="font-medium text-slate-200 light:text-slate-800">Demo Account</div>
              <div className="mt-3 space-y-2 text-slate-400 light:text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>Email</span>
                  <code className="rounded border border-white/10 bg-black/20 px-2 py-1 font-mono text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                    {demoEmail}
                  </code>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Password</span>
                  <code className="rounded border border-white/10 bg-black/20 px-2 py-1 font-mono text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                    {demoPassword}
                  </code>
                </div>
              </div>
            </motion.div>
          ) : null}
          <p className="mt-5 text-center text-sm text-slate-400 light:text-slate-600">
            {mode === "login" ? "New to ApplyFlow? " : "Already have an account? "}
            <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-brand hover:underline">
              {mode === "login" ? "Create an account" : "Log in"}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
