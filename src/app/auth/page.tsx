"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setSubmitting(false);
          return;
        }
        await register(email, password, name);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-card shadow hover:bg-card-hover transition"
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? <Moon className="w-5 h-5 text-ink-muted" /> : <Sun className="w-5 h-5 text-yellow-400" />}
      </button>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-ink mb-2">
          Job Bridge
        </h1>
        <p className="text-center text-ink-muted mb-8 text-sm">Tunisia â†’ Germany Recruitment Platform</p>

        <div className="flex mb-6 rounded-lg bg-dim p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === "login" ? "bg-card shadow text-ink" : "text-ink-muted"
            }`}
          >
            <LogIn className="inline w-4 h-4 mr-1" /> Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === "register" ? "bg-card shadow text-ink" : "text-ink-muted"
            }`}
          >
            <UserPlus className="inline w-4 h-4 mr-1" /> Register
          </button>
        </div>

        {error && (
          <div className="bg-err-bg text-err text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                placeholder="Ahmed Ben Ali"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              placeholder="Min 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-bold text-white py-2.5 rounded-lg font-medium text-sm hover:bg-accent-bolder transition disabled:opacity-50"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
