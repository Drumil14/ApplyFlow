"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import { ApplyFlowMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
          <p className="mb-4 text-sm font-medium text-brand">Application tracking</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.02em] text-white light:text-slate-950 sm:text-6xl">
            Keep every opportunity moving with less chaos.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400 light:text-slate-600">
            Track jobs, interviews, resume versions, and job description insights in one polished workspace built for serious applicants.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {["Kanban", "Match score", "Resume ROI"].map((item) => (
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
              {mode === "login" ? "Log in to your workspace." : "Start with a focused workspace for your search."}
            </p>
          </div>
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
            <Button className="w-full" disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}>
              {mode === "login" ? "Log in" : "Create workspace"}
            </Button>
          </form>
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
