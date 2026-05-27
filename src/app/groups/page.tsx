import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import BrandDot from "@/components/brand-dot";
import { MOCK_GROUPS, type MockGroup } from "@/lib/mock-data";

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function GroupCard({ group }: { group: MockGroup }) {
  const upcomingCount = group.upcoming_workouts.length;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="rounded-2xl overflow-hidden border border-radr-border no-underline text-inherit hover:border-radr-green/40 transition-colors block"
    >
      {/* Cover photo — square */}
      <div
        className="relative aspect-square"
        style={{ background: group.cover_gradient }}
      >
        {group.cover_photo_url && (
          <img
            src={group.cover_photo_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        {/* CREW pill */}
        <span
          className="absolute rounded-full font-semibold uppercase"
          style={{
            top: 8,
            right: 8,
            padding: "3px 8px",
            fontSize: 10,
            letterSpacing: "0.06em",
            background: "rgba(42, 212, 114, 0.85)",
            color: "#fff",
          }}
        >
          Crew
        </span>
      </div>

      {/* Info */}
      <div className="p-3 bg-radr-surface-1">
        <p className="text-base font-semibold text-radr-text leading-tight truncate">
          {group.name}
        </p>
        <p className="text-sm mt-0.5" style={{ color: "var(--radr-text-muted)" }}>
          {group.member_count} members
        </p>
        {upcomingCount > 0 && (
          <p className="text-xs mt-0.5" style={{ color: "var(--radr-green)" }}>
            {upcomingCount} upcoming
          </p>
        )}
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function GroupsPage() {
  const totalUpcoming = MOCK_GROUPS.reduce(
    (sum, g) => sum + g.upcoming_workouts.length,
    0
  );

  return (
    <SiteShell glow="green">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK + ACTION ROW
            ============================================================ */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ minHeight: 48 }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* TODO: wire to create group flow (currently routes to general /create) */}
          <Link
            href="/create"
            className="py-1.5 px-3.5 rounded-full text-sm font-semibold text-white no-underline"
            style={{ background: "var(--radr-green)" }}
          >
            + Create
          </Link>
        </div>

        {/* ============================================================
            2. PAGE HEADER
            ============================================================ */}
        <div className="px-6 pt-4">
          <h1
            className="font-bold italic text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            Your Crews<span className="not-italic">.</span>
            <BrandDot color="green" />
          </h1>
          <p className="mt-2 text-base text-radr-text-muted">
            <span className="font-semibold text-radr-text">
              {MOCK_GROUPS.length}
            </span>{" "}
            {MOCK_GROUPS.length === 1 ? "crew" : "crews"} &middot;{" "}
            <span className="font-semibold text-radr-text">
              {totalUpcoming}
            </span>{" "}
            upcoming {totalUpcoming === 1 ? "workout" : "workouts"}
          </p>
        </div>

        {/* ============================================================
            3. SEARCH ROW
            ============================================================ */}
        {/* TODO: wire client-side filter when interactivity needed */}
        <div className="px-6 mt-5">
          <div
            className="flex items-center gap-2.5 rounded-full py-2.5 px-4"
            style={{
              background: "var(--radr-surface-1)",
              border: "1px solid var(--radr-border)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-radr-text-dim shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-sm" style={{ color: "var(--radr-text-dim)" }}>
              Search your crews...
            </span>
          </div>
        </div>

        {/* ============================================================
            4. GROUPS GRID
            ============================================================ */}
        {MOCK_GROUPS.length > 0 ? (
          <div className="px-6 mt-6 pb-20">
            <div className="grid grid-cols-2 gap-3">
              {MOCK_GROUPS.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          </div>
        ) : (
          /* ============================================================
              5. EMPTY STATE
              ============================================================ */
          <div className="px-6 py-20 text-center">
            <p className="text-base text-radr-text-dim italic">
              No crews yet. Start one with your people.
            </p>
            {/* TODO: wire to create group flow (currently routes to general /create) */}
            <Link
              href="/create"
              className="inline-block mt-5 py-2.5 px-5 rounded-full text-sm font-semibold text-white no-underline"
              style={{ background: "var(--radr-green)" }}
            >
              + Create your first crew
            </Link>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
