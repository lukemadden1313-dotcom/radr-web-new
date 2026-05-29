"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandDot from "@/components/brand-dot";

type Mode = "magic" | "password";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error") === "callback-failed";

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? "That magic link didn\u2019t work. Try again." : null,
  );
  const [sent, setSent] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Success state — magic link sent
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--radr-bg)" }}>
        <div className="w-full max-w-sm text-center">
          <p className="text-4xl mb-4">✓</p>
          <h1
            className="font-bold italic text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 1.75rem)" }}
          >
            Check your email<BrandDot size={8} color="cobalt" />
          </h1>
          <p className="mt-3 text-base text-radr-text-muted">
            We sent a magic link to{" "}
            <span className="text-radr-text font-medium">{email}</span>.
            <br />
            Click it to sign in.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="mt-6 text-sm font-medium transition-colors"
            style={{ color: "var(--radr-cobalt)" }}
          >
            Didn&apos;t get it? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--radr-bg)" }}>
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <p
          className="text-center font-bold italic text-radr-text mb-8"
          style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          Radr<BrandDot size={9} color="cobalt" />
        </p>

        {/* Heading */}
        <h1
          className="text-center font-bold italic text-radr-text leading-tight"
          style={{ fontSize: "clamp(1.5rem, 4vw, 1.75rem)" }}
        >
          Welcome back<BrandDot size={8} color="cobalt" />
        </h1>
        <p className="text-center text-sm text-radr-text-muted mt-1.5 mb-6">
          Sign in to your Radr.
        </p>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-2.5 rounded-xl text-sm text-center"
            style={{ background: "rgba(239, 68, 68, 0.12)", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl text-base text-radr-text placeholder:text-radr-text-dim outline-none transition-shadow"
            style={{
              background: "var(--radr-surface-2)",
              border: "1px solid var(--radr-border)",
            }}
          />

          {mode === "password" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl text-base text-radr-text placeholder:text-radr-text-dim outline-none transition-shadow"
              style={{
                background: "var(--radr-surface-2)",
                border: "1px solid var(--radr-border)",
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-base text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--radr-cobalt)" }}
          >
            {loading
              ? "..."
              : mode === "magic"
                ? "Email me a magic link"
                : "Sign in"}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              setMode(mode === "magic" ? "password" : "magic");
              setError(null);
            }}
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--radr-cobalt)" }}
          >
            {mode === "magic" ? "Use password instead" : "Use magic link instead"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--radr-border)" }} />
          <span className="text-xs text-radr-text-dim">or</span>
          <div className="flex-1 h-px" style={{ background: "var(--radr-border)" }} />
        </div>

        {/* Bottom notes */}
        <p className="text-center text-xs text-radr-text-muted leading-relaxed">
          No account? Sign in anyway &mdash; we&apos;ll create one.
        </p>
        <p className="text-center text-xs text-radr-text-dim mt-2">
          Have an iOS account? Use that email here.
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
