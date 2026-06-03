import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow, type WorkoutRowData } from "@/components/workout-list-row";
import { createClient } from "@/lib/supabase/server";

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

function initial(name: string | null): string {
  return (name || "?").charAt(0).toUpperCase();
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

type ProfileUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
};

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
  user: ProfileUser;
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
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) notFound();

  const now = new Date().toISOString();

  // ── Round 1: fetch the viewed profile ──
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, total_workouts, current_streak, created_at")
    .ilike("username", username)
    .single();

  if (!profileData) notFound();

  const profileId = profileData.id;
  const isSelf = profileId === authUser.id;
  const firstName = (profileData.full_name || "User").split(" ")[0];

  const user: ProfileUser = {
    id: profileId,
    full_name: profileData.full_name ?? "User",
    username: profileData.username ?? username,
    avatar_url: profileData.avatar_url,
    gradient_seed: initial(profileData.full_name),
  };

  // ── Round 2: parallel queries ──
  const [
    myFriendshipsResult,
    profileFriendCountResult,
    hostedWorkoutsResult,
    profileParticipationsResult,
    myParticipationsResult,
    friendshipBetweenResult,
  ] = await Promise.all([
    // My friendships (for mutual friends computation)
    supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
      .eq("status", "accepted"),

    // Profile's friend count
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`)
      .eq("status", "accepted"),

    // Hosted workouts (future, created by this profile)
    supabase
      .from("workouts")
      .select("id, title, start_time, location, category, creator_id")
      .eq("creator_id", profileId)
      .gt("start_time", now)
      .is("deleted_at", null)
      .order("start_time", { ascending: true })
      .limit(10),

    // Profile's workout participations (future workouts they're going to)
    supabase
      .from("workout_participants")
      .select("workout_id, status")
      .eq("user_id", profileId)
      .in("status", ["accepted", "going"]),

    // My participations (for shared/could-join computation)
    isSelf
      ? { data: [] as Array<{ workout_id: string; status: string }>, error: null }
      : supabase
          .from("workout_participants")
          .select("workout_id, status")
          .eq("user_id", authUser.id)
          .in("status", ["accepted", "going"]),

    // Friendship status between me and this profile
    isSelf
      ? { data: [] as any[], error: null }
      : supabase
          .from("friendships")
          .select("id, requester_id, receiver_id, status")
          .or(
            `and(requester_id.eq.${authUser.id},receiver_id.eq.${profileId}),and(requester_id.eq.${profileId},receiver_id.eq.${authUser.id})`,
          )
          .limit(1),
  ]);

  const myFriendships = myFriendshipsResult.data ?? [];
  const profileFriendCount = profileFriendCountResult.count ?? 0;
  const hostedWorkouts = hostedWorkoutsResult.data ?? [];
  const profileParticipations = profileParticipationsResult.data ?? [];
  const myParticipations = (myParticipationsResult.data ?? []) as Array<{ workout_id: string; status: string }>;
  const friendshipRow = (friendshipBetweenResult.data ?? [])[0] ?? null;

  // ── Compute derived data ──

  // My friend IDs
  const myFriendIds = new Set(
    myFriendships.map((f) =>
      f.requester_id === authUser.id ? f.receiver_id : f.requester_id,
    ),
  );

  // Friendship status with this profile
  let friendshipStatus: "none" | "friends" | "request_sent" | "request_received" = "none";
  if (friendshipRow) {
    if (friendshipRow.status === "accepted") {
      friendshipStatus = "friends";
    } else if (friendshipRow.status === "pending") {
      friendshipStatus =
        friendshipRow.requester_id === authUser.id ? "request_sent" : "request_received";
    }
  }

  // Mutual friends: intersection of my friends and profile's friends
  // We can only compute this if we're friends with people who are also friends with the target.
  // Since RLS limits us to our own friendships, we check which of our friends are also friends
  // with the target user. We know myFriendIds; we need to find which of them are in the target's friend list.
  // We can do this by querying friendships involving the target AND any of our friends.
  let mutualFriendProfiles: ProfileUser[] = [];
  let mutualCount = 0;

  if (!isSelf && myFriendIds.size > 0) {
    const myFriendIdArr = [...myFriendIds];
    // Query friendships where one side is profileId and the other is one of my friends
    const { data: mutualRows } = await supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .eq("status", "accepted")
      .or(
        `and(requester_id.eq.${profileId},receiver_id.in.(${myFriendIdArr.join(",")})),and(receiver_id.eq.${profileId},requester_id.in.(${myFriendIdArr.join(",")}))`,
      );

    const mutualIds = (mutualRows ?? []).map((r) =>
      r.requester_id === profileId ? r.receiver_id : r.requester_id,
    );
    mutualCount = mutualIds.length;

    // Fetch profiles for first 3 mutual friends
    if (mutualIds.length > 0) {
      const { data: mutualProfiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", mutualIds.slice(0, 3));

      mutualFriendProfiles = (mutualProfiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name ?? "User",
        username: p.username ?? "user",
        avatar_url: p.avatar_url,
        gradient_seed: initial(p.full_name),
      }));
    }
  }

  // Self: upcoming workouts I'm attending
  const myWorkoutIds = new Set(myParticipations.map((p) => p.workout_id));
  let attendingWorkouts: WorkoutRowData[] = [];
  if (isSelf) {
    const myPartIds = profileParticipations.map((p) => p.workout_id);
    if (myPartIds.length > 0) {
      const { data: upcomingData } = await supabase
        .from("workouts")
        .select("id, title, start_time, location, category, creator_id")
        .in("id", myPartIds)
        .gt("start_time", now)
        .is("deleted_at", null)
        .order("start_time", { ascending: true })
        .limit(10);

      attendingWorkouts = (upcomingData ?? []).map((w) => ({
        id: w.id,
        title: w.title,
        start_time: w.start_time,
        location: w.location,
      }));
    }
  }

  // Other view: shared workouts (both of us participated) and could-join (they're in, I'm not)
  let sharedWorkouts: WorkoutRowData[] = [];
  let couldJoinWorkouts: WorkoutRowData[] = [];

  if (!isSelf) {
    const profileWorkoutIds = new Set(profileParticipations.map((p) => p.workout_id));

    // Shared = intersection of my participations and their participations
    const sharedIds = [...myWorkoutIds].filter((id) => profileWorkoutIds.has(id));

    // Could join = their future participations minus mine
    const couldJoinIds = [...profileWorkoutIds].filter((id) => !myWorkoutIds.has(id));

    // Fetch shared workouts
    const [sharedResult, couldJoinResult] = await Promise.all([
      sharedIds.length > 0
        ? supabase
            .from("workouts")
            .select("id, title, start_time, location, category, creator_id")
            .in("id", sharedIds)
            .is("deleted_at", null)
            .order("start_time", { ascending: false })
            .limit(5)
        : { data: [] },
      couldJoinIds.length > 0
        ? supabase
            .from("workouts")
            .select("id, title, start_time, location, category, creator_id")
            .in("id", couldJoinIds)
            .gt("start_time", now)
            .is("deleted_at", null)
            .order("start_time", { ascending: true })
            .limit(5)
        : { data: [] },
    ]);

    sharedWorkouts = (sharedResult.data ?? []).map((w: any) => ({
      id: w.id,
      title: w.title,
      start_time: w.start_time,
      location: w.location,
    }));

    couldJoinWorkouts = (couldJoinResult.data ?? []).map((w: any) => ({
      id: w.id,
      title: w.title,
      start_time: w.start_time,
      location: w.location,
    }));
  }

  // Convert hosted workouts to WorkoutRowData
  const hostedWorkoutRows: WorkoutRowData[] = hostedWorkouts.map((w) => ({
    id: w.id,
    title: w.title,
    start_time: w.start_time,
    location: w.location,
  }));

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

          {/* Name */}
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

          {/* Self: joined date */}
          {isSelf && profileData.created_at && (
            <p className="mt-2 text-sm text-radr-text-muted">
              <span>{"\u2728"} {formatJoinedDate(profileData.created_at)}</span>
            </p>
          )}

          {/* Bio */}
          {profileData.bio && (
            <p className="mt-3 text-base text-radr-text-muted leading-relaxed whitespace-pre-line max-w-md">
              {profileData.bio}
            </p>
          )}

          {/* Other: friendship status badge */}
          {!isSelf && friendshipStatus === "friends" && (
            <p className="mt-2 text-sm text-radr-text-muted font-medium">
              Friends
            </p>
          )}

          {/* Other: mutual friends */}
          {!isSelf && mutualCount > 0 && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-sm text-radr-text-muted">
                <span className="font-semibold text-radr-text">{mutualCount}</span> friend{mutualCount !== 1 ? "s" : ""} in common
              </p>
              {mutualFriendProfiles.length > 0 && (
                <div className="flex -space-x-2">
                  {mutualFriendProfiles.map((m) => (
                    <Link key={m.id} href={`/profile/${m.username}`} className="no-underline">
                      <UserAvatar user={m} size={20} className="border-2 border-radr-bg" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other: friend count (when no mutuals to show) */}
          {!isSelf && mutualCount === 0 && profileFriendCount > 0 && (
            <p className="mt-2 text-sm text-radr-text-muted">
              <span className="font-semibold text-radr-text">{profileFriendCount}</span> friend{profileFriendCount !== 1 ? "s" : ""} on Radr
            </p>
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
            <>
              {friendshipStatus === "none" && (
                <span
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-base"
                  style={{
                    background: "var(--radr-purple)",
                    color: "#fff",
                  }}
                >
                  + Add Friend
                </span>
              )}
              {friendshipStatus === "request_sent" && (
                <span
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-base"
                  style={{
                    background: "var(--radr-surface-1)",
                    color: "var(--radr-text-muted)",
                    border: "1px solid var(--radr-border)",
                  }}
                >
                  Request Sent
                </span>
              )}
              {friendshipStatus === "request_received" && (
                <span
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-base"
                  style={{
                    background: "var(--radr-purple)",
                    color: "#fff",
                  }}
                >
                  Accept Request
                </span>
              )}
              {friendshipStatus === "friends" && (
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
                  + Workout with {firstName}
                </Link>
              )}
            </>
          )}
        </div>

        {/* ============================================================
            4. STATS / BADGES (self view only)
            ============================================================ */}
        {isSelf && (
          <div className="px-6 mt-8 grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl py-5 px-4 text-center border border-radr-border"
              style={{ background: "radial-gradient(ellipse at center, rgba(154, 90, 240, 0.05), transparent 70%), var(--radr-surface-1)" }}
            >
              <p className="text-3xl font-bold text-radr-text">
                {profileData.total_workouts ?? 0}
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
                {profileData.current_streak ?? 0}
                {(profileData.current_streak ?? 0) > 0 && <span style={{ fontSize: "1.25rem" }}>{"\uD83D\uDD25"}</span>}
              </p>
              <p className="text-xs font-semibold text-radr-text-muted mt-1 uppercase" style={{ letterSpacing: "0.08em" }}>
                Day Streak
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            5. WORKOUTS TOGETHER (other view only)
            ============================================================ */}
        {!isSelf && sharedWorkouts.length > 0 && (
          <div className="px-6 mt-10">
            <SectionHeader title={`${sharedWorkouts.length} Workout${sharedWorkouts.length !== 1 ? "s" : ""} Together`} />
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
        {!isSelf && couldJoinWorkouts.length > 0 && (
          <div className="px-6 mt-10">
            <SectionHeader title="You Could Join" />
            <p className="text-sm text-radr-text-muted -mt-2 mb-4">
              Workouts {firstName}&apos;s going to
            </p>
            <div className="flex flex-col gap-3">
              {couldJoinWorkouts.map((w) => (
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
            {hostedWorkoutRows.length > 0 ? (
              <div className="flex flex-col gap-3">
                {hostedWorkoutRows.map((w) => (
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
