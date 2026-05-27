import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import { ActivityIcon } from "@/components/activity-icon";
import {
  CURRENT_USER,
  MOCK_WORKOUTS,
  MOCK_INVITES,
  MOCK_RECOMMENDATIONS,
  MOCK_GROUPS,
  USER_STATS,
  FRIEND_REQUESTS_COUNT,
  DISCOVERABLE_FRIENDS,
  coverPhotoForActivity,
  type MockUser,
  type MockWorkout,
  type MockGroup,
  type MockRecommendation,
} from "@/lib/mock-data";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

const AVATAR_GRADIENTS: [string, string][] = [
  ["#4a5d8f", "#2c3a5e"],
  ["#8f4a4a", "#5e2c2c"],
  ["#4a8f6f", "#2c5e4a"],
  ["#8f7a4a", "#5e4f2c"],
  ["#5b3d8f", "#3d2c5e"],
];

function avatarGradient(seed: string): string {
  const idx = (seed.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  const [from, to] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function formatDateChip(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
  return `${day} at ${time}`;
}

function formatShortDate(iso: string): string {
  return formatDateChip(iso);
}

function isUpcoming(w: MockWorkout): boolean {
  return new Date(w.start_time) > new Date();
}

function userIsParticipant(w: MockWorkout): boolean {
  return w.participants.some((p) => p.id === CURRENT_USER.id);
}

function isUserGoing(workout: MockWorkout, user: MockUser): boolean {
  return workout.participants.some((p) => p.id === user.id);
}

// ----------------------------------------------------------------
// Brand Dot — cobalt filled circle after italic section headers
// ----------------------------------------------------------------

function BrandDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full ml-1 align-middle"
      style={{ background: "var(--radr-cobalt)", transform: "translateY(-2px)" }}
    />
  );
}

// ----------------------------------------------------------------
// Small Components
// ----------------------------------------------------------------

function AvatarFallback({
  name,
  seed,
  size,
  className = "",
}: {
  name: string;
  seed: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full shrink-0 flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: avatarGradient(seed),
        fontSize: size * 0.4,
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function UserAvatar({
  user,
  size = 48,
  className = "",
}: {
  user: MockUser;
  size?: number;
  className?: string;
}) {
  if (user.avatar_url) {
    return (
      <AvatarImg
        src={user.avatar_url}
        alt={user.full_name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        fallback={
          <AvatarFallback
            name={user.full_name}
            seed={user.gradient_seed}
            size={size}
            className={className}
          />
        }
      />
    );
  }
  return (
    <AvatarFallback
      name={user.full_name}
      seed={user.gradient_seed}
      size={size}
      className={className}
    />
  );
}

function SectionHeader({
  title,
  action,
  actionHref,
}: {
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2
        className="font-bold italic text-radr-text"
        style={{ fontSize: "var(--radr-text-h1)" }}
      >
        {title}<BrandDot />
      </h2>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="text-radr-text-dim text-sm font-medium hover:text-radr-text transition-colors no-underline"
        >
          {action} &rarr;
        </Link>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Workout Card (horizontal scroll)
// ----------------------------------------------------------------

function WorkoutCard({ workout }: { workout: MockWorkout }) {
  const going = isUserGoing(workout, CURRENT_USER);
  const dateLabel = formatDateChip(workout.start_time);
  const hostFirstName = workout.host.full_name.split(" ")[0];
  const coverUrl = workout.cover_image_url || coverPhotoForActivity(workout.activity_type);

  return (
    <a
      href={`/w-v2/${workout.id}`}
      style={{
        flexShrink: 0,
        width: 280,
        height: 300,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,247,0.10)",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      {/* COVER AREA — photo */}
      <div
        style={{
          position: "relative",
          height: 195,
          width: "100%",
          overflow: "hidden",
          background: workout.cover_gradient,
        }}
      >
        <img
          src={coverUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Bottom vignette for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* DATE PILL — top left */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "4px 10px",
            borderRadius: 9999,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 10,
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap" }}>
            {dateLabel}
          </span>
        </div>

        {/* ACTIVITY LABEL — top right */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "4px 10px",
            borderRadius: 9999,
            background: "rgba(12, 93, 233, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            zIndex: 10,
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 11, fontWeight: 600, lineHeight: 1, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
            {workout.activity_type}
          </span>
        </div>

        {/* RSVP PILL — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "6px 14px",
            borderRadius: 9999,
            background: going ? "#0C5DE9" : "rgba(255,255,255,0.95)",
            border: going ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
            zIndex: 10,
          }}
        >
          <span style={{
            color: going ? "#ffffff" : "#000000",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}>
            {going ? "GOING" : "JOIN"}
          </span>
        </div>
      </div>

      {/* INFO AREA */}
      <div
        style={{
          padding: 12,
          height: 105,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          background: "rgba(255, 255, 247, 0.04)",
        }}
      >
        <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 16, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
          {workout.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <UserAvatar user={workout.host} size={20} className="shrink-0" />
          <span style={{ color: "rgba(255,255,247,0.60)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Hosted by {hostFirstName}
          </span>
        </div>
      </div>
    </a>
  );
}

function CreateWorkoutCard() {
  return (
    <a
      href="/create"
      style={{
        flexShrink: 0,
        width: 280,
        height: 300,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px dashed rgba(255,255,247,0.10)",
        background: "rgba(255, 255, 247, 0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(12, 93, 233, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0C5DE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,247,0.60)" }}>
        Create workout
      </span>
    </a>
  );
}

// ----------------------------------------------------------------
// Recommendation Card (vertical stack)
// ----------------------------------------------------------------

function RecommendationCard({ rec }: { rec: MockRecommendation }) {
  const w = rec.workout;

  return (
    <Link
      href={`/w-v2/${w.id}`}
      className="flex items-stretch rounded-card border border-radr-border overflow-hidden no-underline text-inherit hover:border-radr-cobalt/40 transition-colors group"
    >
      {/* Gradient accent strip */}
      <div
        className="w-2 shrink-0"
        style={{ background: w.cover_gradient }}
      />

      {/* Content */}
      <div className="flex-1 p-4 flex items-center gap-4 bg-radr-surface-1">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-radr-text truncate">
            {w.title}
          </p>
          <p className="text-sm text-radr-text-muted mt-0.5">
            {formatShortDate(w.start_time)} &middot; {w.location.split(",")[0]}
          </p>
          <p className="text-xs text-radr-text-dim mt-1.5">
            {rec.reason}
          </p>
        </div>

        {/* Join pill */}
        <span className="shrink-0 inline-flex items-center h-8 px-4 rounded-pill bg-radr-surface-2 border border-radr-border text-sm font-semibold text-radr-text radr-pill-interactive hover:bg-radr-cobalt hover:text-white hover:border-radr-cobalt transition-colors">
          + Join
        </span>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------
// Group Card (photo cover)
// ----------------------------------------------------------------

function GroupCard({ group }: { group: MockGroup }) {
  return (
    <Link
      href={`/g-v2/${group.id}`}
      className="shrink-0 w-[180px] rounded-card border border-radr-border overflow-hidden no-underline text-inherit hover:border-radr-green/40 transition-colors group"
    >
      {/* Cover */}
      <div
        className="relative h-[110px]"
        style={{ background: group.cover_gradient }}
      >
        {group.cover_photo_url && (
          <img
            src={group.cover_photo_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Vignette for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
        />
        <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/80">
          {group.member_count} members
        </span>
      </div>
      {/* Info */}
      <div className="p-3 bg-radr-surface-1">
        <p className="text-sm font-bold text-radr-text truncate">
          {group.name}
        </p>
        {group.upcoming_workouts.length > 0 && (
          <p className="text-xs text-radr-green mt-0.5">
            {group.upcoming_workouts.length} upcoming
          </p>
        )}
      </div>
    </Link>
  );
}

function CreateGroupCard() {
  return (
    <button className="shrink-0 w-[180px] min-h-[170px] rounded-card border border-dashed border-radr-border bg-radr-surface-1 flex flex-col items-center justify-center gap-2 hover:bg-radr-surface-2 transition-colors cursor-pointer">
      <span className="w-10 h-10 rounded-full bg-radr-surface-2 flex items-center justify-center text-radr-text-muted text-lg font-light">
        +
      </span>
      <span className="text-xs font-semibold text-radr-text-muted">
        Create group
      </span>
    </button>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function DashboardPage() {
  const upcomingWorkouts = MOCK_WORKOUTS.filter(
    (w) => isUpcoming(w) && userIsParticipant(w),
  ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const upcomingCount = upcomingWorkouts.length;
  const invitesCount = MOCK_INVITES.length;
  const yoursCount = MOCK_WORKOUTS.filter(
    (w) => isUpcoming(w) && w.host.id === CURRENT_USER.id,
  ).length;

  const firstName = CURRENT_USER.full_name.split(" ")[0];

  return (
    <SiteShell glow="warm">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        {/* ============================================================
            1. HERO — "Eli." + cobalt dot + stats
            ============================================================ */}
        <section className="pt-8 pb-6 radr-section-enter">
          <h1
            className="font-extrabold tracking-tight text-radr-text"
            style={{ fontSize: "var(--radr-text-display)", lineHeight: 1.1 }}
          >
            <span className="italic">{firstName}</span>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full ml-1.5 align-middle"
              style={{ background: "var(--radr-cobalt)", transform: "translateY(-4px)" }}
            />
          </h1>
          <p
            className="mt-3 text-radr-text-muted leading-relaxed"
            style={{ fontSize: "var(--radr-text-body)" }}
          >
            <span className="text-radr-text font-semibold">{USER_STATS.workouts_this_month} workouts</span> this month
            {" "}&middot;{" "}
            <span className="text-radr-text font-semibold">{USER_STATS.friends} friends</span>
            {" "}&middot;{" "}
            <span className="text-radr-text font-semibold">{USER_STATS.groups} groups</span>
          </p>
        </section>

        {/* ============================================================
            1b. FRIEND REQUESTS BANNER
            ============================================================ */}
        {FRIEND_REQUESTS_COUNT > 0 && (
          <section className="pb-6 radr-section-enter" style={{ animationDelay: "0.05s" }}>
            <Link
              href="/notifications"
              className="flex items-center gap-3 p-4 rounded-card border border-radr-cobalt/30 bg-radr-cobalt/5 no-underline text-inherit hover:bg-radr-cobalt/10 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-radr-cobalt/20 flex items-center justify-center text-radr-cobalt text-lg font-bold shrink-0">
                {FRIEND_REQUESTS_COUNT}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-radr-text">
                  Friend request{FRIEND_REQUESTS_COUNT !== 1 ? "s" : ""} waiting
                </p>
                <p className="text-xs text-radr-cobalt mt-0.5">
                  Tap to review
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </section>
        )}

        {/* ============================================================
            2. TABS — Upcoming / Invites / Yours (visual only)
            ============================================================ */}
        {/* TODO: wire tab switching when we add state */}
        <section className="pb-6 radr-section-enter" style={{ animationDelay: "0.08s" }}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Search icon pill */}
            <button
              className="shrink-0 w-10 h-10 rounded-full border border-radr-border flex items-center justify-center hover:bg-radr-surface-2 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,247,0.04)" }}
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Upcoming pill — active */}
            <button className="shrink-0 px-4 h-10 rounded-full font-semibold flex items-center gap-2 cursor-default" style={{ background: "var(--radr-text)", color: "var(--radr-bg)" }}>
              <span>Upcoming</span>
              <span className="text-xs opacity-70">{upcomingCount}</span>
            </button>

            {/* Invites pill — inactive */}
            <button
              className="shrink-0 px-4 h-10 rounded-full text-radr-text-muted border border-radr-border flex items-center gap-2 hover:bg-radr-surface-2 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,247,0.04)" }}
            >
              <span>Invites</span>
              <span className="text-xs">{invitesCount}</span>
            </button>

            {/* Yours pill — inactive */}
            <button
              className="shrink-0 px-4 h-10 rounded-full text-radr-text-muted border border-radr-border flex items-center gap-2 hover:bg-radr-surface-2 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,247,0.04)" }}
            >
              <span>Yours</span>
              <span className="text-xs">{yoursCount}</span>
            </button>
          </div>
        </section>

        {/* ============================================================
            3. "What's on your Radr." — upcoming workouts
            ============================================================ */}
        <section className="pb-10 radr-section-enter" style={{ animationDelay: "0.1s" }}>
          <SectionHeader title="What's on your Radr" />
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 md:-mx-8 md:px-8 pb-2"
            aria-label="Upcoming workouts"
          >
            {upcomingWorkouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
            <CreateWorkoutCard />
          </div>
        </section>

        {/* ============================================================
            4. "Workouts on your Radr." — recommendations
            ============================================================ */}
        <section className="pb-10 radr-section-enter" style={{ animationDelay: "0.15s" }}>
          <SectionHeader title="Workouts on your Radr" />
          <p className="text-sm text-radr-text-muted -mt-2 mb-4 italic">
            From your crew.
          </p>
          <div className="flex flex-col gap-3">
            {MOCK_RECOMMENDATIONS.slice(0, 4).map((rec) => (
              <RecommendationCard key={rec.workout.id} rec={rec} />
            ))}
          </div>
          {MOCK_RECOMMENDATIONS.length > 4 && (
            <Link
              href="/explore"
              className="block text-center text-sm font-medium text-radr-text-dim hover:text-radr-text mt-4 transition-colors no-underline"
            >
              See more
            </Link>
          )}
        </section>

        {/* ============================================================
            5. "Your Crew." — groups
            ============================================================ */}
        <section className="pb-10 radr-section-enter" style={{ animationDelay: "0.2s" }}>
          <SectionHeader title="Your Crew" action="See all" actionHref="/groups" />
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 md:-mx-8 md:px-8 pb-2"
            aria-label="Your groups"
          >
            {MOCK_GROUPS.map((g) => (
              <div key={g.id} className="shrink-0 snap-start">
                <GroupCard group={g} />
              </div>
            ))}
            <div className="shrink-0 snap-start">
              <CreateGroupCard />
            </div>
          </div>
        </section>

        {/* ============================================================
            6. "On your Radr." — discover friends
            ============================================================ */}
        <section className="pb-12 radr-section-enter" style={{ animationDelay: "0.25s" }}>
          <SectionHeader title="On your Radr" />
          <Link
            href="/explore"
            className="flex items-center gap-4 p-5 rounded-card border border-radr-border bg-radr-surface-1 no-underline text-inherit hover:border-radr-cobalt/40 transition-colors"
          >
            {/* Stacked preview avatars */}
            <div className="flex -space-x-3 shrink-0">
              {DISCOVERABLE_FRIENDS.preview_avatars.map((u) => (
                <UserAvatar
                  key={u.id}
                  user={u}
                  size={40}
                  className="border-2 border-radr-bg"
                />
              ))}
              <span
                className="w-10 h-10 rounded-full bg-radr-surface-2 border-2 border-radr-bg flex items-center justify-center text-xs font-bold text-radr-text-muted"
              >
                +{DISCOVERABLE_FRIENDS.count - DISCOVERABLE_FRIENDS.preview_avatars.length}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-radr-text">
                Discover friends
              </p>
              <p className="text-xs text-radr-text-muted mt-0.5">
                {DISCOVERABLE_FRIENDS.count} people on your Radr
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
