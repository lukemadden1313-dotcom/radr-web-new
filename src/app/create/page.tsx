"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import BrandDot from "@/components/brand-dot";
import {
  ACTIVITIES,
  getSuggestedActivities,
  type Activity,
} from "@/lib/mock-data";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function todayStr(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function nextHour(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function groupByLetter(items: Activity[]): Map<string, Activity[]> {
  const map = new Map<string, Activity[]>();
  for (const a of items) {
    const letter = a.displayName[0].toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(a);
  }
  return map;
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function ProgressDots({ step }: { step: 1 | 2 | 3 | "success" }) {
  const steps = [1, 2, 3] as const;
  const current = step === "success" ? 4 : step;
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s) => (
        <span
          key={s}
          className="rounded-full"
          style={{
            width: s === current ? 12 : 8,
            height: s === current ? 12 : 8,
            background:
              s <= current ? "var(--radr-cobalt)" : "transparent",
            border:
              s > current ? "1.5px solid var(--radr-surface-2)" : "none",
            transition: "all 200ms",
          }}
        />
      ))}
    </div>
  );
}

function InlineSelect({
  label,
  icon,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 rounded-2xl py-3 px-4 cursor-pointer"
        style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
      >
        <span className="text-radr-text-muted shrink-0">{icon}</span>
        <span className="flex-1 text-left">
          <span className="text-sm text-radr-text-muted">{label}</span>{" "}
          <span className="font-medium text-radr-text">{value}</span>
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-radr-text-dim"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="mt-1 rounded-2xl overflow-hidden"
          style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); onToggle(); }}
              className="w-full text-left py-2.5 px-4 text-sm font-medium hover:bg-radr-surface-2 transition-colors cursor-pointer flex items-center justify-between"
              style={{
                background: "transparent",
                border: "none",
                color: opt === value ? "var(--radr-cobalt)" : "var(--radr-text)",
              }}
            >
              {opt}
              {opt === value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--radr-cobalt)" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function CreatePage() {
  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [duration, setDuration] = useState(60);
  const [audience, setAudience] = useState("All Friends");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [repeat, setRepeat] = useState("Never");
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [reminder, setReminder] = useState("None");
  const [reminderOpen, setReminderOpen] = useState(false);

  const suggested = useMemo(() => getSuggestedActivities(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return ACTIVITIES;
    const q = search.toLowerCase();
    return ACTIVITIES.filter((a) => a.displayName.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);

  function selectActivity(a: Activity) {
    setActivity(a);
    setStep(2);
    setSearch("");
  }

  function handleSomethingElse() {
    // TODO: replace prompt() with proper inline input modal
    const name = window.prompt("What activity?");
    if (name && name.trim()) {
      setActivity({ key: "other", displayName: name.trim(), icon: "\u2728" });
      setStep(2);
    }
  }

  function handleNext() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setStep(3);
  }

  function handleCreate() {
    // TODO: wire to RPC submission
    setStep("success");
  }

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto px-6">
        {/* ============================================================
            TOP ROW — nav + progress dots
            ============================================================ */}
        {step !== "success" && (
          <div className="flex items-center justify-between py-3" style={{ minHeight: 48 }}>
            {step === 1 ? (
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-full flex items-center justify-center no-underline text-radr-text-muted hover:text-radr-text transition-colors"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={() => setStep((s) => (s === 3 ? 2 : 1) as 1 | 2 | 3)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-radr-text-muted hover:text-radr-text transition-colors"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <ProgressDots step={step} />
          </div>
        )}

        {/* ============================================================
            STEP 1 — "What's the move."
            ============================================================ */}
        {step === 1 && (
          <div className="pb-20">
            <h1
              className="mt-3 font-bold italic text-radr-text leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
            >
              What&apos;s the move<span className="not-italic">.</span>
              <BrandDot />
            </h1>

            {/* Search input */}
            <div className="relative mt-5">
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="absolute text-radr-text-dim"
                style={{ left: 14, top: "50%", transform: "translateY(-50%)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities"
                className="w-full rounded-full py-3 pr-4 text-sm text-radr-text placeholder-radr-text-dim outline-none"
                style={{
                  paddingLeft: 40,
                  background: "var(--radr-surface-1)",
                  border: "1px solid var(--radr-border)",
                }}
              />
            </div>

            {/* Suggested */}
            {!search && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase mb-2" style={{ color: "var(--radr-text-muted)", letterSpacing: "0.08em" }}>
                  Suggested
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggested.map((a) => (
                    <button
                      key={a.key}
                      onClick={() => selectActivity(a)}
                      className="flex items-center gap-1.5 rounded-full py-2 px-3.5 text-sm font-semibold cursor-pointer"
                      style={{
                        background: "rgba(12, 93, 233, 0.15)",
                        border: "1px solid rgba(12, 93, 233, 0.4)",
                        color: "var(--radr-cobalt)",
                      }}
                    >
                      <span>{a.icon}</span>
                      <span>{a.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Something else */}
            {!search && (
              <button
                onClick={handleSomethingElse}
                className="w-full flex items-center gap-3 mt-4 rounded-2xl py-3 px-4 cursor-pointer"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--radr-cobalt)" }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span className="flex-1 text-left text-base italic" style={{ color: "var(--radr-cobalt)" }}>
                  Something else...
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Activity list */}
            <div className="mt-5">
              {search && filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-radr-text-dim italic">
                    No matches. Try &ldquo;Something else...&rdquo; above.
                  </p>
                </div>
              )}

              {search ? (
                // Flat filtered list
                filtered.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => selectActivity(a)}
                    className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-radr-surface-1 transition-colors cursor-pointer text-left"
                    style={{ background: "transparent", border: "none" }}
                  >
                    <span className="text-xl w-7 inline-block text-center">{a.icon}</span>
                    <span className="font-medium text-base text-radr-text">{a.displayName}</span>
                  </button>
                ))
              ) : (
                // Grouped by letter
                Array.from(grouped.entries()).map(([letter, items]) => (
                  <div key={letter}>
                    <p
                      className="text-2xl font-bold italic mt-4 mb-2"
                      style={{ color: "var(--radr-cobalt)" }}
                    >
                      {letter}
                    </p>
                    {items.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => selectActivity(a)}
                        className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-radr-surface-1 transition-colors cursor-pointer text-left"
                        style={{ background: "transparent", border: "none" }}
                      >
                        <span className="text-xl w-7 inline-block text-center">{a.icon}</span>
                        <span className="font-medium text-base text-radr-text">{a.displayName}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 2 — "When are you going."
            ============================================================ */}
        {step === 2 && (
          <div className="pb-20">
            <h1
              className="mt-3 font-bold italic text-radr-text leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
            >
              When are you going<span className="not-italic">.</span>
              <BrandDot />
            </h1>
            <p className="mt-2 text-base text-radr-text-muted">
              Lock in the time &mdash; your crew needs to know.
            </p>

            {/* Activity display row */}
            {activity && (
              <div
                className="flex items-center gap-3 mt-5 rounded-2xl py-3 px-4"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              >
                <span className="text-xl">{activity.icon}</span>
                <span className="flex-1 font-medium text-radr-text">{activity.displayName}</span>
                <button
                  onClick={() => { setStep(1); setSearch(""); }}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: "var(--radr-cobalt)", background: "transparent", border: "none" }}
                >
                  Change
                </button>
              </div>
            )}

            {/* Title input */}
            <div className="mt-3">
              <textarea
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(false); }}
                placeholder="What's the plan? Tag friends with @..."
                className="w-full rounded-2xl py-3 px-4 text-sm text-radr-text placeholder-radr-text-dim outline-none resize-none"
                style={{
                  minHeight: 80,
                  background: "var(--radr-surface-1)",
                  border: titleError ? "1px solid #EF4444" : "1px solid var(--radr-border)",
                }}
              />
              {titleError && (
                <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                  Add a quick plan or title
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="mt-6">
              <p className="font-medium text-base text-radr-text mb-2">Date &amp; Time</p>
              <div className="flex gap-2">
                {/* TODO: wire date picker */}
                <div
                  className="flex-1 flex items-center gap-2 rounded-2xl py-3 px-4"
                  style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="font-medium text-sm text-radr-text">{todayStr()}</span>
                </div>
                {/* TODO: wire time picker */}
                <div
                  className="flex-1 flex items-center gap-2 rounded-2xl py-3 px-4"
                  style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="font-medium text-sm text-radr-text">{nextHour()}</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mt-5">
              <p className="font-medium text-base text-radr-text mb-2">Duration</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[30, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    onClick={() => setDuration(m)}
                    className="shrink-0 rounded-full py-2 px-4 text-sm font-semibold cursor-pointer"
                    style={{
                      background: duration === m ? "var(--radr-cobalt)" : "var(--radr-surface-1)",
                      color: duration === m ? "#fff" : "var(--radr-text-muted)",
                      border: duration === m ? "none" : "1px solid var(--radr-border)",
                    }}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="mt-5">
              <InlineSelect
                label="Who can see this?"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                }
                value={audience}
                options={["All Friends", "Specific Friends", "Public"]}
                open={audienceOpen}
                onToggle={() => setAudienceOpen((v) => !v)}
                onSelect={(v) => setAudience(v)}
              />
            </div>

            <p className="mt-3 text-center text-sm text-radr-text-muted italic">
              You&apos;ll add a location on the next step
            </p>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="w-full mt-6 py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
              style={{ background: "var(--radr-cobalt)", border: "none" }}
            >
              Next
            </button>
          </div>
        )}

        {/* ============================================================
            STEP 3 — "Last touch."
            ============================================================ */}
        {step === 3 && (
          <div className="pb-20">
            <h1
              className="mt-3 font-bold italic text-radr-text leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
            >
              Last touch<span className="not-italic">.</span>
              <BrandDot />
            </h1>
            <p className="mt-2 text-base text-radr-text-muted">
              Add details to help your crew show up ready.
            </p>

            {/* Location */}
            <div className="mt-5">
              <p className="font-medium text-base text-radr-text mb-2">
                Location
                {audience === "Public" && (
                  <span className="ml-2 text-sm font-normal italic" style={{ color: "#f59e0b" }}>
                    Required for public workouts
                  </span>
                )}
              </p>
              {/* TODO: wire Google Places autocomplete */}
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search for a location..."
                className="w-full rounded-2xl py-3 px-4 text-sm text-radr-text placeholder-radr-text-dim outline-none"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              />
            </div>

            {/* Booking URL */}
            <div className="mt-5">
              <p className="font-medium text-base text-radr-text mb-2">Booking URL</p>
              <input
                type="url"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl py-3 px-4 text-sm text-radr-text placeholder-radr-text-dim outline-none"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              />
            </div>

            {/* Repeat */}
            <div className="mt-5">
              <InlineSelect
                label="Repeat:"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 014-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                }
                value={repeat}
                options={["Never", "Daily", "Weekly", "Monthly"]}
                open={repeatOpen}
                onToggle={() => setRepeatOpen((v) => !v)}
                onSelect={(v) => setRepeat(v)}
              />
            </div>

            {/* Reminder */}
            <div className="mt-3">
              <InlineSelect
                label="Reminder:"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                }
                value={reminder}
                options={["None", "5 min", "15 min", "30 min", "1 hour", "1 day"]}
                open={reminderOpen}
                onToggle={() => setReminderOpen((v) => !v)}
                onSelect={(v) => setReminder(v)}
              />
            </div>

            {/* Invite button */}
            {/* TODO: wire invite picker */}
            <button
              className="w-full flex items-center justify-center gap-2 mt-5 py-3 rounded-2xl text-base font-medium cursor-pointer"
              style={{
                background: "var(--radr-surface-1)",
                border: "1px solid rgba(12, 93, 233, 0.4)",
                color: "var(--radr-cobalt)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              + Invite
            </button>

            {/* Create button */}
            <button
              onClick={handleCreate}
              className="w-full mt-6 py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
              style={{ background: "var(--radr-cobalt)", border: "none" }}
            >
              Create workout
            </button>
          </div>
        )}

        {/* ============================================================
            SUCCESS STATE
            ============================================================ */}
        {step === "success" && (
          <div className="py-20 max-w-md mx-auto text-center">
            {/* Check circle */}
            <div
              className="mx-auto rounded-full flex items-center justify-center"
              style={{ width: 80, height: 80, background: "rgba(12, 93, 233, 0.15)" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--radr-cobalt)" }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2
              className="mt-6 font-bold italic text-radr-text"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
            >
              You&apos;re calling it<span className="not-italic">.</span>
              <BrandDot />
            </h2>
            <p className="mt-2 text-base text-radr-text-muted">
              Your crew can find this on their Radr.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {/* TODO: wire share */}
              <button
                className="w-full py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
                style={{ background: "var(--radr-cobalt)", border: "none" }}
              >
                Share with friends
              </button>
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center py-3.5 rounded-2xl text-base font-semibold no-underline"
                style={{ background: "var(--radr-text)", color: "var(--radr-bg)" }}
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
