import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow } from "@/components/workout-list-row";
import {
  CURRENT_USER,
  MOCK_WORKOUTS,
  getUserByUsername,
  getMutualFriends,
  getSharedWorkouts,
  getWorkoutsHostedByUser,
  getWorkoutsUserCouldJoin,
  type MockUser,
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

function formatJoinedDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear().toString().slice(2);
  return `Joined ${month} \u2018${year}`;
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

type Props = { params: Promise<{ username: string }> };

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = getUserByUsername(username);
  if (!user) notFound();

  const isSelf = user.id === CURRENT_USER.id;
  const firstName = user.full_name.split(" ")[0];

  // Other-view data
  const mutualFriends = !isSelf ? getMutualFriends(user) : [];
  const sharedWorkouts = !isSelf ? getSharedWorkouts(user) : [];
  const couldJoin = !isSelf ? getWorkoutsUserCouldJoin(user) : [];

  // Self-view data
  const hostedWorkouts = isSelf ? getWorkoutsHostedByUser(user) : [];
  const attendingWorkouts = isSelf
    ? MOCK_WORKOUTS.filter(
        (w) =>
          new Date(w.start_time) >= new Date() &&
          w.participants.some((p) => p.user_id === CURRENT_USER.id),
      ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    : [];

  return (
    <SiteShell glow="purple">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK + MENU ROW
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

        {/* ============================================================
            2. HERO BLOCK
            ============================================================ */}
        <div className="px-6 pt-4 flex flex-col items-center text-center">
          {/* Avatar with purple ring */}
          <div
            className="rounded-full"
            style={{
              padding: 3,
              background: "linear-gradient(135deg, rgba(154, 90, 240, 0.4), rgba(154, 90, 240, 0.15))",
            }}
          >
            <UserAvatar user={user} size={120} />
          </div>

          {/* Name — italic + period + purple BrandDot */}
          <h1
            className="mt-5 font-bold italic text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            {firstName}.<BrandDot size={10} color="purple" />
          </h1>

          {/* @username */}
          <p className="mt-1 text-base text-radr-text-muted">
            @{user.username}
          </p>

          {/* Self: birthday + joined */}
          {isSelf && (user.birthday_month || user.created_at) && (
            <p className="mt-2 text-sm text-radr-text-muted">
              {user.birthday_month && (
                <span>{"\ud83c\udf82"} {user.birthday_month} birthday</span>
              )}
              {user.birthday_month && user.created_at && (
                <span> &middot; </span>
              )}
              {user.created_at && (
                <span>{"\u2728"} {formatJoinedDate(user.created_at)}</span>
              )}
            </p>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-base text-radr-text-muted leading-relaxed whitespace-pre-line max-w-md">
              {user.bio}
            </p>
          )}

          {/* Other: mutual friends */}
          {!isSelf && mutualFriends.length > 0 && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-sm text-radr-text-muted">
                <span className="font-semibold text-radr-text">{mutualFriends.length}</span> friends in common
              </p>
              <div className="flex -space-x-2">
                {mutualFriends.slice(0, 3).map((m) => (
                  <Link key={m.id} href={`/profile/${m.username}`} className="no-underline">
                    <UserAvatar user={m} size={20} className="border-2 border-radr-bg" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            3. ACTION BUTTON ROW
            ============================================================ */}
        <div className="px-6 mt-6 flex items-center justify-center gap-3">
          {isSelf ? (
            <>
              <Link
                href="/profile/edit"
                className="px-8 py-3 rounded-full font-semibold text-base no-underline"
                style={{ background: "var(--radr-text)", color: "var(--radr-bg)" }}
              >
                Edit profile
              </Link>
              <Link
                href="/settings"
                className="w-12 h-12 rounded-full flex items-center justify-center no-underline"
                style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
                aria-label="Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </Link>
            </>
          ) : (
            /* TODO: wire "+ Workout" — preselect friend invite if possible */
            <Link
              href="/create"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-base no-underline"
              style={{
                background: "transparent",
                color: "var(--radr-purple)",
                border: "1px solid rgba(154, 90, 240, 0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Workout with {user.full_name.split(" ")[0]}
            </Link>
          )}
        </div>

        {/* ============================================================
            4. STATS / BADGES (self view only)
            ============================================================ */}
        {isSelf && (user.total_workouts != null || user.current_streak != null || user.hosted_count != null) && (
          <div className="px-6 mt-8 grid grid-cols-2 gap-3">
            {/* iOS-canonical stats */}
            <div
              className="rounded-2xl py-5 px-4 text-center border border-radr-border"
              style={{ background: "radial-gradient(ellipse at center, rgba(154, 90, 240, 0.05), transparent 70%), var(--radr-surface-1)" }}
            >
              <p className="text-3xl font-bold text-radr-text">
                {user.total_workouts ?? 0}
              </p>
              <p className="text-xs font-semibold text-radr-text-muted mt-1 uppercase" style={{ letterSpacing: "0.08em" }}>
                Workouts
              </p>
            </div>
            <div
              className="rounded-2xl py-5 px-4 text-center border border-radr-border"
              style={{ background: "radial-gradient(ellipse at center, rgba(154, 90, 240, 0.05), transparent 70%), var(--radr-surface-1)" }}
            >
              <p className="text-3xl font-bold text-radr-text flex items-center justify-center gap-1.5">
                {user.current_streak ?? 0}
                {(user.current_streak ?? 0) > 0 && <span style={{ fontSize: "1.25rem" }}>{"\uD83D\uDD25"}</span>}
              </p>
              <p className="text-xs font-semibold text-radr-text-muted mt-1 uppercase" style={{ letterSpacing: "0.08em" }}>
                Day Streak
              </p>
            </div>
            {/* Web-leads stats */}
            {user.hosted_count != null && (
              <div
                className="rounded-2xl py-5 px-4 text-center border border-radr-border col-span-2"
                style={{ background: "var(--radr-surface-1)" }}
              >
                <p className="text-3xl font-bold text-radr-text">
                  {user.hosted_count}
                </p>
                <p className="text-xs font-semibold text-radr-text-muted mt-1 uppercase" style={{ letterSpacing: "0.08em" }}>
                  Hosted
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            5. WORKOUTS TOGETHER (other view only)
            ============================================================ */}
        {!isSelf && sharedWorkouts.length > 0 && (
          <div className="px-6 mt-10">
            <SectionHeader title={`${sharedWorkouts.length} Workouts Together`} />
            <div className="flex flex-col gap-3">
              {sharedWorkouts.slice(0, 3).map((w) => (
                <WorkoutListRow
                  key={w.id}
                  workout={w}
                  stripColor="linear-gradient(to bottom, #9A5AF0, #6b3dbd)"
                />
              ))}
            </div>
            {sharedWorkouts.length > 3 && (
              <Link
                href={`/profile/${user.username}/workouts`}
                className="block text-sm font-medium mt-4 no-underline transition-colors"
                style={{ color: "var(--radr-purple)" }}
              >
                View all {sharedWorkouts.length} &rarr;
              </Link>
            )}
          </div>
        )}

        {/* ============================================================
            6. YOU COULD JOIN (other view only)
            ============================================================ */}
        {!isSelf && couldJoin.length > 0 && (
          <div className="px-6 mt-10">
            <SectionHeader title="You Could Join" />
            <p className="text-sm text-radr-text-muted -mt-2 mb-4">
              Workouts {firstName}&apos;s going to
            </p>
            <div className="flex flex-col gap-3">
              {couldJoin.map((w) => (
                <WorkoutListRow
                  key={w.id}
                  workout={w}
                  stripColor="linear-gradient(to bottom, #9A5AF0, #6b3dbd)"
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            7. WORKOUTS YOU'RE CALLING (self view only)
            ============================================================ */}
        {isSelf && (
          <div className="px-6 mt-10">
            <SectionHeader title="Workouts You're Calling" />
            {hostedWorkouts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {hostedWorkouts.map((w) => (
                  <WorkoutListRow key={w.id} workout={w} stripColor="var(--radr-cobalt)" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-radr-text-dim italic">
                Nothing on your slate. Call one in.
              </p>
            )}
          </div>
        )}

        {/* ============================================================
            8. YOU'RE IN FOR (self view only)
            ============================================================ */}
        {isSelf && (
          <div className="px-6 mt-10">
            <SectionHeader title="You're In For" />
            <p className="text-sm text-radr-text-muted -mt-2 mb-4">
              Your upcoming workouts
            </p>
            {attendingWorkouts.length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {attendingWorkouts.slice(0, 5).map((w) => (
                    <WorkoutListRow key={w.id} workout={w} stripColor="var(--radr-cobalt)" />
                  ))}
                </div>
                {attendingWorkouts.length > 5 && (
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium mt-4 no-underline transition-colors"
                    style={{ color: "var(--radr-cobalt)" }}
                  >
                    View all &rarr;
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-radr-text-dim italic">
                Nothing on the books. Lock one in.
              </p>
            )}
          </div>
        )}

        {/* ============================================================
            9. FOOTER SPACING
            ============================================================ */}
        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
