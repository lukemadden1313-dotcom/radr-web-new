import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow, type WorkoutRowData } from "@/components/workout-list-row";
import { CreateCrewButton } from "@/components/create-crew-prompt";
import { createClient } from "@/lib/supabase/server";
import { coverPhotoForActivity, categoryDisplayName } from "@/lib/mock-data";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

type DashUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
};

type DashWorkout = {
  id: string;
  title: string;
  category: string | null;
  start_time: string;
  location: string | null;
  creator_id: string;
  group_id: string | null;
  open_to_join: boolean;
  booking_url: string | null;
  duration: number | null;
  description: string | null;
  activity_name: string | null;
};

type DashGroup = {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  upcoming_count: number;
};

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

function initial(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
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
      {initial(name)}
    </span>
  );
}

function UserAvatar({
  user,
  size = 48,
  className = "",
}: {
  user: DashUser;
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

function WorkoutCard({
  workout,
  host,
  going,
  participantCount,
}: {
  workout: DashWorkout;
  host: DashUser;
  going: boolean;
  participantCount: number;
}) {
  const dateLabel = formatDateChip(workout.start_time);
  const hostFirstName = host.full_name.split(" ")[0];
  const coverUrl = coverPhotoForActivity(workout.category ?? "other");

  return (
    <a
      href={`/workouts/${workout.id}`}
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
      {/* COVER AREA */}
      <div
        style={{
          position: "relative",
          height: 195,
          width: "100%",
          overflow: "hidden",
          background: "var(--radr-cobalt)",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* DATE PILL */}
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

        {/* ACTIVITY LABEL */}
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
            {categoryDisplayName(workout.category ?? "other")}
          </span>
        </div>

        {/* RSVP PILL */}
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

        {/* PARTICIPANT COUNT — bottom left */}
        {participantCount > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              padding: "4px 10px",
              borderRadius: 9999,
              background: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(8px)",
              zIndex: 10,
            }}
          >
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
              {participantCount} going
            </span>
          </div>
        )}
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
          <UserAvatar user={host} size={20} className="shrink-0" />
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
// Group Card
// ----------------------------------------------------------------

function GroupCard({ group }: { group: DashGroup }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="shrink-0 w-[180px] rounded-card border border-radr-border overflow-hidden no-underline text-inherit hover:border-radr-green/40 transition-colors group"
    >
      {/* Cover */}
      <div
        className="relative h-[110px]"
        style={{ background: avatarGradient(group.name.charAt(0)) }}
      >
        {group.avatar_url && (
          <img
            src={group.avatar_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
        />
        <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/80">
          {group.member_count} member{group.member_count !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Info */}
      <div className="p-3 bg-radr-surface-1">
        <p className="text-sm font-bold text-radr-text truncate">
          {group.name}
        </p>
        {group.upcoming_count > 0 && (
          <p className="text-xs text-radr-green mt-0.5">
            {group.upcoming_count} upcoming
          </p>
        )}
      </div>
    </Link>
  );
}

function CreateGroupCard() {
  return (
    <CreateCrewButton
      className="shrink-0 w-[180px] min-h-[170px] rounded-card border border-dashed border-radr-border bg-radr-surface-1 flex flex-col items-center justify-center gap-2 hover:bg-radr-surface-2 transition-colors cursor-pointer"
      style={{ background: "var(--radr-surface-1)" }}
    >
      <span className="w-10 h-10 rounded-full bg-radr-surface-2 flex items-center justify-center text-radr-text-muted text-lg font-light">
        +
      </span>
      <span className="text-xs font-semibold text-radr-text-muted">
        Create group
      </span>
    </CreateCrewButton>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const userId = user.id;
  const now = new Date().toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // ── Round 1: parallel independent queries ──────────────────────
  const [
    profileResult,
    participantsResult,
    friendshipsResult,
    pendingRequestsResult,
    groupMembershipsResult,
    friendRecsResult,
    inviteNotifsResult,
    createdUpcomingResult,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, username, avatar_url, total_workouts, current_streak").eq("id", userId).single(),
    supabase.from("workout_participants").select("workout_id, status").eq("user_id", userId),
    supabase.from("friendships").select("requester_id, receiver_id").or(`requester_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "accepted"),
    supabase.from("friendships").select("requester_id").eq("receiver_id", userId).eq("status", "pending"),
    supabase.from("group_members").select("group_id").eq("user_id", userId),
    supabase.rpc("get_friend_recommendations"),
    supabase.from("notifications").select("id").eq("user_id", userId).eq("type", "workout_invite").eq("is_read", false),
    supabase.from("workouts").select("id").eq("creator_id", userId).gt("start_time", now).is("deleted_at", null),
  ]);

  const profile = profileResult.data;
  const myParticipations = participantsResult.data ?? [];
  const friendships = friendshipsResult.data ?? [];
  const pendingRequests = pendingRequestsResult.data ?? [];
  const groupMemberships = groupMembershipsResult.data ?? [];
  const friendRecsRaw = (friendRecsResult.data ?? []) as Array<{ id: string; username: string; full_name: string; avatar_url: string | null; mutual_count?: number }>;
  const friendRecs = friendRecsRaw.filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
  const inviteNotifs = inviteNotifsResult.data ?? [];
  const createdUpcoming = createdUpcomingResult.data ?? [];

  const firstName = (profile?.full_name || "You").split(" ")[0];
  const friendCount = friendships.length;
  const groupCount = groupMemberships.length;
  const friendRequestCount = pendingRequests.length;
  const invitesCount = inviteNotifs.length;
  const yoursCount = createdUpcoming.length;

  // Friend IDs
  const friendIds = friendships.map((f: any) =>
    f.requester_id === userId ? f.receiver_id : f.requester_id,
  );

  // My workout IDs
  const myWorkoutIds = myParticipations.map((p: any) => p.workout_id);
  const myGoingIds = new Set(
    myParticipations.filter((p: any) => p.status === "accepted" || p.status === "going").map((p: any) => p.workout_id),
  );

  // ── Round 2: fetch workouts, groups, crew workouts ─────────────
  const [upcomingResult, crewResult, groupsResult, monthResult] = await Promise.all([
    // Upcoming workouts I'm participating in
    myWorkoutIds.length > 0
      ? supabase
          .from("workouts")
          .select("id, title, category, start_time, location, creator_id, group_id, open_to_join, booking_url, duration, description, activity_name")
          .in("id", myWorkoutIds)
          .gt("start_time", now)
          .is("deleted_at", null)
          .order("start_time")
      : Promise.resolve({ data: [] as DashWorkout[] }),
    // Crew workouts (from friends)
    friendIds.length > 0
      ? supabase
          .from("workouts")
          .select("id, title, category, start_time, location, creator_id, group_id, open_to_join, booking_url, duration, description, activity_name")
          .in("creator_id", friendIds)
          .gt("start_time", now)
          .is("deleted_at", null)
          .order("start_time")
          .limit(8)
      : Promise.resolve({ data: [] as DashWorkout[] }),
    // Groups I belong to
    groupMemberships.length > 0
      ? supabase
          .from("groups")
          .select("id, name, avatar_url")
          .in("id", groupMemberships.map((g: any) => g.group_id))
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; avatar_url: string | null }> }),
    // Workouts this month (for stats)
    myWorkoutIds.length > 0
      ? supabase
          .from("workouts")
          .select("id")
          .in("id", myWorkoutIds)
          .gte("start_time", monthStart.toISOString())
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as Array<{ id: string }> }),
  ]);

  const upcomingWorkouts = (upcomingResult.data ?? []) as DashWorkout[];
  const crewWorkouts = (crewResult.data ?? []) as DashWorkout[];
  const groups = (groupsResult.data ?? []) as Array<{ id: string; name: string; avatar_url: string | null }>;
  const workoutsThisMonth = (monthResult.data ?? []).length;

  // ── Round 3: fetch creator profiles + participant counts ───────
  const allWorkoutIds = [
    ...upcomingWorkouts.map((w) => w.id),
    ...crewWorkouts.map((w) => w.id),
  ];
  const allCreatorIds = [
    ...new Set([
      ...upcomingWorkouts.map((w) => w.creator_id),
      ...crewWorkouts.map((w) => w.creator_id),
    ]),
  ];

  const [creatorsResult, allParticipantsResult, groupMemberCountsResult] = await Promise.all([
    allCreatorIds.length > 0
      ? supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", allCreatorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string; username: string; avatar_url: string | null }> }),
    allWorkoutIds.length > 0
      ? supabase.from("workout_participants").select("workout_id, user_id").in("workout_id", allWorkoutIds)
      : Promise.resolve({ data: [] as Array<{ workout_id: string; user_id: string }> }),
    groupMemberships.length > 0
      ? supabase.from("group_members").select("group_id").in("group_id", groupMemberships.map((g: any) => g.group_id))
      : Promise.resolve({ data: [] as Array<{ group_id: string }> }),
  ]);

  // Build lookup maps
  const creatorMap = new Map(
    (creatorsResult.data ?? []).map((p: any) => [p.id, {
      id: p.id,
      full_name: p.full_name ?? "User",
      username: p.username ?? "user",
      avatar_url: p.avatar_url,
      gradient_seed: initial(p.full_name),
    } as DashUser]),
  );

  const participantCounts = new Map<string, number>();
  (allParticipantsResult.data ?? []).forEach((p: any) => {
    participantCounts.set(p.workout_id, (participantCounts.get(p.workout_id) ?? 0) + 1);
  });

  const groupMemberCounts = new Map<string, number>();
  (groupMemberCountsResult.data ?? []).forEach((g: any) => {
    groupMemberCounts.set(g.group_id, (groupMemberCounts.get(g.group_id) ?? 0) + 1);
  });

  const fallbackHost: DashUser = { id: "", full_name: "Host", username: "host", avatar_url: null, gradient_seed: "H" };

  // Build crew workout row data (exclude workouts user is already in)
  const crewWorkoutRows: (WorkoutRowData & { reason: string })[] = crewWorkouts
    .filter((w) => !myWorkoutIds.includes(w.id))
    .slice(0, 4)
    .map((w) => {
      const host = creatorMap.get(w.creator_id);
      return {
        id: w.id,
        title: w.title,
        start_time: w.start_time,
        location: w.location,
        participant_count: participantCounts.get(w.id) ?? 0,
        reason: host ? `${host.full_name.split(" ")[0]} is hosting` : "",
      };
    });

  // Build group cards
  const dashGroups: DashGroup[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    avatar_url: g.avatar_url,
    member_count: groupMemberCounts.get(g.id) ?? 0,
    upcoming_count: 0,
  }));

  // Build discover friends data from get_friend_recommendations
  const discoverCount = friendRecs.length;
  const discoverPreview = friendRecs.slice(0, 2).map((r) => ({
    id: r.id,
    full_name: r.full_name ?? "User",
    username: r.username ?? "user",
    avatar_url: r.avatar_url,
    gradient_seed: initial(r.full_name),
  }));

  const upcomingCount = upcomingWorkouts.length;

  return (
    <SiteShell glow="warm">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        {/* ============================================================
            1. HERO
            ============================================================ */}
        <section className="pt-8 pb-6 radr-section-enter">
          <h1
            className="font-extrabold tracking-tight text-radr-text"
            style={{ fontSize: "var(--radr-text-display)", lineHeight: 1.1 }}
          >
            <span className="italic">{firstName}</span>
            <BrandDot size={10} />
          </h1>
          <p
            className="mt-3 text-radr-text-muted leading-relaxed"
            style={{ fontSize: "var(--radr-text-body)" }}
          >
            <span className="text-radr-text font-semibold">{workoutsThisMonth} workout{workoutsThisMonth !== 1 ? "s" : ""}</span> this month
            {" "}&middot;{" "}
            <span className="text-radr-text font-semibold">{friendCount} friend{friendCount !== 1 ? "s" : ""}</span>
            {" "}&middot;{" "}
            <span className="text-radr-text font-semibold">{groupCount} group{groupCount !== 1 ? "s" : ""}</span>
          </p>
        </section>

        {/* ============================================================
            1b. FRIEND REQUESTS BANNER
            ============================================================ */}
        {friendRequestCount > 0 && (
          <section className="pb-6 radr-section-enter" style={{ animationDelay: "0.05s" }}>
            <Link
              href="/notifications"
              className="flex items-center gap-3 p-4 rounded-card border border-radr-cobalt/30 bg-radr-cobalt/5 no-underline text-inherit hover:bg-radr-cobalt/10 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-radr-cobalt/20 flex items-center justify-center text-radr-cobalt text-lg font-bold shrink-0">
                {friendRequestCount}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-radr-text">
                  Friend request{friendRequestCount !== 1 ? "s" : ""} waiting
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
            2. TABS
            ============================================================ */}
        <section className="pb-6 radr-section-enter" style={{ animationDelay: "0.08s" }}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
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

            <button className="shrink-0 px-4 h-10 rounded-full font-semibold flex items-center gap-2 cursor-default" style={{ background: "var(--radr-text)", color: "var(--radr-bg)" }}>
              <span>Upcoming</span>
              <span className="text-xs opacity-70">{upcomingCount}</span>
            </button>

            <button
              className="shrink-0 px-4 h-10 rounded-full text-radr-text-muted border border-radr-border flex items-center gap-2 hover:bg-radr-surface-2 transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,247,0.04)" }}
            >
              <span>Invites</span>
              <span className="text-xs">{invitesCount}</span>
            </button>

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
              <WorkoutCard
                key={w.id}
                workout={w}
                host={creatorMap.get(w.creator_id) ?? fallbackHost}
                going={myGoingIds.has(w.id)}
                participantCount={participantCounts.get(w.id) ?? 0}
              />
            ))}
            <CreateWorkoutCard />
          </div>
          {upcomingWorkouts.length === 0 && (
            <p className="text-sm text-radr-text-dim italic mt-2">
              Nothing upcoming &mdash; create a workout or join one from your crew.
            </p>
          )}
        </section>

        {/* ============================================================
            4. "Workouts on your Radr." — from your crew
            ============================================================ */}
        <section className="pb-10 radr-section-enter" style={{ animationDelay: "0.15s" }}>
          <SectionHeader title="Workouts on your Radr" />
          <p className="text-sm text-radr-text-muted -mt-2 mb-4 italic">
            From your crew.
          </p>
          {crewWorkoutRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {crewWorkoutRows.map((row) => (
                <WorkoutListRow key={row.id} workout={row} reason={row.reason} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-radr-text-dim italic">
              {friendCount === 0
                ? "Add friends to see workouts from your crew."
                : "No upcoming workouts from your crew right now."}
            </p>
          )}
        </section>

        {/* ============================================================
            5. "Your Crew." — groups
            ============================================================ */}
        <section className="pb-10 radr-section-enter" style={{ animationDelay: "0.2s" }}>
          <SectionHeader title="Your Crew" action={dashGroups.length > 0 ? "See all" : undefined} actionHref="/groups" />
          {dashGroups.length > 0 ? (
            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 md:-mx-8 md:px-8 pb-2"
              aria-label="Your groups"
            >
              {dashGroups.map((g) => (
                <div key={g.id} className="shrink-0 snap-start">
                  <GroupCard group={g} />
                </div>
              ))}
              <div className="shrink-0 snap-start">
                <CreateGroupCard />
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <CreateGroupCard />
            </div>
          )}
        </section>

        {/* ============================================================
            6. "On your Radr." — discover friends
            ============================================================ */}
        <section className="pb-12 radr-section-enter" style={{ animationDelay: "0.25s" }}>
          <SectionHeader title="On your Radr" />
          <Link
            href="/friends"
            className="flex items-center gap-4 p-5 rounded-card border border-radr-border bg-radr-surface-1 no-underline text-inherit hover:border-radr-purple/40 transition-colors"
          >
            {/* Stacked preview avatars */}
            <div className="flex -space-x-3 shrink-0">
              {discoverPreview.map((u) => (
                <UserAvatar
                  key={u.id}
                  user={u}
                  size={40}
                  className="border-2 border-radr-bg"
                />
              ))}
              {discoverCount > discoverPreview.length && (
                <span
                  className="w-10 h-10 rounded-full bg-radr-surface-2 border-2 border-radr-bg flex items-center justify-center text-xs font-bold text-radr-text-muted"
                >
                  +{discoverCount - discoverPreview.length}
                </span>
              )}
              {discoverCount === 0 && (
                <span
                  className="w-10 h-10 rounded-full bg-radr-surface-2 border-2 border-radr-bg flex items-center justify-center text-radr-text-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-radr-text">
                Discover friends
              </p>
              <p className="text-xs text-radr-text-muted mt-0.5">
                {discoverCount > 0
                  ? `${discoverCount} people on your Radr`
                  : "Find friends and start working out together"}
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
