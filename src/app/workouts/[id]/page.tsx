import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import {
  CURRENT_USER,
  MOCK_WORKOUTS,
  MOCK_GROUPS,
  coverPhotoForActivity,
  type MockUser,
  type MockWorkout,
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

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const tz = "America/New_York";
  const weekday = d.toLocaleString("en-US", { weekday: "long", timeZone: tz });
  const month = d.toLocaleString("en-US", { month: "long", timeZone: tz });
  const day = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
  return `${weekday}, ${month} ${day} \u00b7 ${time}`;
}

function isUserGoing(workout: MockWorkout): boolean {
  return workout.participants.some((p) => p.id === CURRENT_USER.id);
}

function resolveGroup(groupId: string | null) {
  if (!groupId) return null;
  return MOCK_GROUPS.find((g) => g.id === groupId) ?? null;
}

// ----------------------------------------------------------------
// Mock activity feed (inline for now)
// TODO: pull from real activity feed RPC
// ----------------------------------------------------------------

type ActivityItem = {
  id: string;
  actor: MockUser;
  action: string;
  emoji: string;
  timeAgo: string;
};

function buildMockActivity(workout: MockWorkout): ActivityItem[] {
  const host = workout.host;

  // RSVPs: newest first. Filter out host, take up to 4.
  const rsvps = workout.participants
    .filter((p) => p.id !== host.id)
    .slice(0, 4)
    .map((p, i, arr): ActivityItem => ({
      id: `a-rsvp-${p.id}`,
      actor: p,
      action: "rsvp'd Going",
      emoji: "\ud83d\udc4d",
      // Newest RSVP = smallest timeAgo. Spread from 1h to ~(2*len)h.
      timeAgo: `${1 + i * 2}h`,
    }));

  // "Created" is always the oldest event (anchor at bottom)
  const created: ActivityItem = {
    id: "a-created",
    actor: host,
    action: "created this workout",
    emoji: "",
    timeAgo: "2d",
  };

  // Newest first → oldest last
  return [...rsvps, created];
}

// ----------------------------------------------------------------
// Sub-components
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

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      className="font-bold italic text-radr-text mb-4"
      style={{ fontSize: "var(--radr-text-h1)" }}
    >
      {title}<BrandDot />
    </h2>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  const workout = MOCK_WORKOUTS.find((w) => w.id === id);
  if (!workout) notFound();

  const going = isUserGoing(workout);
  const group = resolveGroup(workout.group_id);
  const coverUrl = workout.cover_image_url || coverPhotoForActivity(workout.activity_type);
  const dateStr = formatFullDate(workout.start_time);
  const goingCount = workout.participants.length;
  const locationParts = workout.location.split(",").map((s) => s.trim());
  const activityItems = buildMockActivity(workout);

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK + CONTEXT ROW
            ============================================================ */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ minHeight: 48 }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            {group && (
              <Link
                href={`/groups/${group.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold no-underline"
                style={{
                  background: "rgba(42, 212, 114, 0.12)",
                  color: "#2AD472",
                  border: "1px solid rgba(42, 212, 114, 0.2)",
                }}
              >
                From {group.name}
              </Link>
            )}
            {/* TODO: wire "more" menu */}
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-radr-surface-2 transition-colors cursor-pointer"
              style={{ background: "transparent", border: "none" }}
              aria-label="More options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-radr-text-muted">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            2. COVER HERO
            ============================================================ */}
        <div className="px-6">
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              aspectRatio: "16 / 11",
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

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Activity label — top right */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: "5px 12px",
                borderRadius: 9999,
                background: "rgba(12, 93, 233, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {workout.activity_type}
              </span>
            </div>

            {/* RSVP pill — bottom right */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                padding: "10px 22px",
                borderRadius: 9999,
                background: going ? "#0C5DE9" : "rgba(255,255,255,0.95)",
                border: going ? "1px solid rgba(255,255,255,0.2)" : "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                cursor: "pointer",
              }}
            >
              {/* TODO: wire RSVP action */}
              <span style={{
                color: going ? "#fff" : "#000",
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1,
              }}>
                {going ? "\ud83d\udc4d Going" : "+ Join"}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. TITLE + DATE BLOCK
            ============================================================ */}
        <div className="px-6 pt-5">
          <h1
            className="font-bold text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            {workout.title}
          </h1>

          <p
            className="mt-2 text-radr-text-muted font-medium"
            style={{ fontSize: "1.125rem" }}
          >
            {dateStr}
          </p>

          {/* Action row */}
          <div className="flex items-center gap-4 mt-4">
            {/* TODO: wire calendar add */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Add to calendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </button>
            {/* TODO: wire share */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            {/* TODO: wire notifications toggle */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            4. HOSTED BY ROW
            ============================================================ */}
        <div className="px-6 mt-6">
          <p className="text-sm text-radr-text-muted mb-2">Hosted by</p>
          <div className="flex items-center gap-3">
            <Link href={`/profile/${workout.host.username}`} className="no-underline text-inherit flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <UserAvatar user={workout.host} size={40} />
              <div className="min-w-0">
                <p className="font-medium text-radr-text" style={{ fontSize: "1.125rem" }}>
                  {workout.host.full_name}
                </p>
                <p className="text-sm text-radr-text-muted">
                  @{workout.host.username}
                </p>
              </div>
            </Link>
            {/* TODO: wire message host */}
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer shrink-0"
              style={{ background: "transparent" }}
              aria-label="Message host"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            5. LOCATION ROW
            ============================================================ */}
        <div className="px-6 mt-5">
          <div className="flex gap-3" style={{ alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--radr-cobalt)" }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="min-w-0">
              <p className="font-medium text-radr-text">
                {locationParts[0]}
              </p>
              {locationParts.length > 1 && (
                <p className="text-sm text-radr-text-muted mt-0.5">
                  {locationParts.slice(1).join(", ")}
                </p>
              )}
              {workout.booking_url && (
                <a
                  href={workout.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold mt-2 no-underline"
                  style={{ color: "var(--radr-cobalt)" }}
                >
                  Book a spot &rarr;
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            6. DESCRIPTION
            ============================================================ */}
        {workout.description && (
          <div className="px-6 mt-6">
            <p className="text-base text-radr-text-muted leading-relaxed whitespace-pre-line">
              {workout.description}
            </p>
          </div>
        )}

        {/* ============================================================
            7. WHO'S GOING
            ============================================================ */}
        <div className="px-6 mt-10">
          <SectionHeader title="Who's Going" />
          <p className="text-sm text-radr-text-muted -mt-2 mb-5">
            {goingCount} going
          </p>

          {goingCount > 0 ? (
            <div className="flex flex-wrap gap-4">
              {workout.participants.map((p) => (
                <Link
                  key={p.id}
                  href={`/profile/${p.username}`}
                  className="flex flex-col items-center gap-1.5 no-underline text-inherit"
                  style={{ width: 72 }}
                >
                  <UserAvatar user={p} size={44} />
                  <span className="text-xs text-radr-text-muted text-center leading-tight truncate w-full">
                    {p.full_name.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-radr-text-dim italic">
              Nobody yet &mdash; be the first to lock in.
            </p>
          )}
        </div>

        {/* ============================================================
            8. ACTIVITY FEED
            ============================================================ */}
        <div className="px-6 mt-10">
          <SectionHeader title="Activity" />

          <div className="flex flex-col">
            {activityItems.map((item, i) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3"
                style={i > 0 ? { borderTop: "1px solid rgba(255,255,247,0.08)" } : undefined}
              >
                <UserAvatar user={item.actor} size={32} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-radr-text">{item.actor.full_name.split(" ")[0]}</span>
                    {" "}
                    <span className="text-radr-text-muted">{item.action}</span>
                    {item.emoji && ` ${item.emoji}`}
                  </p>
                  <p className="text-xs text-radr-text-dim mt-0.5">
                    {item.timeAgo}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,247,0.08)" }}>
            <UserAvatar user={CURRENT_USER} size={32} />
            <div
              className="flex-1 flex items-center rounded-full border border-radr-border px-4"
              style={{ height: 40, background: "rgba(255,255,247,0.04)" }}
            >
              {/* TODO: wire comment submit when backend ready */}
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm text-radr-text placeholder-radr-text-dim outline-none border-none"
                readOnly
              />
              <button
                className="text-sm font-semibold ml-2 cursor-pointer"
                style={{ color: "var(--radr-cobalt)", background: "transparent", border: "none" }}
                disabled
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            9. FOOTER SPACING
            ============================================================ */}
        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
