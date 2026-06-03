import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow, type WorkoutRowData } from "@/components/workout-list-row";
import { createClient } from "@/lib/supabase/server";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

type ScheduleWorkout = {
  id: string;
  title: string;
  start_time: string;
  location: string | null;
  category: string | null;
  creator_id: string;
};

type ScheduleUser = {
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
};

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

// ── Category → stock image (one distinct image per activity type) ──
// Curated for cohesive dark-tone fitness aesthetic at small calendar sizes.
// Easy to swap later — just update URLs in this single map.
const CATEGORY_IMAGE: Record<string, string> = {
  run:        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&q=75&auto=format&fit=crop",  // runner on trail
  outdoor_run:"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&q=75&auto=format&fit=crop",
  indoor_run: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=200&q=75&auto=format&fit=crop",  // treadmill
  cycle:      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=75&auto=format&fit=crop",  // road cyclist
  outdoor_cycle:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=75&auto=format&fit=crop",
  indoor_cycle:"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=200&q=75&auto=format&fit=crop",  // spin class
  yoga:       "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=75&auto=format&fit=crop",  // yoga pose outdoors
  pilates:    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&q=75&auto=format&fit=crop",  // reformer/studio
  strength:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=75&auto=format&fit=crop",  // gym weights rack
  traditional_strength:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=75&auto=format&fit=crop",
  functional_strength:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=75&auto=format&fit=crop",
  hiit:       "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=200&q=75&auto=format&fit=crop",  // battle ropes
  boxing:     "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&q=75&auto=format&fit=crop",  // boxing gym
  swim:       "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&q=75&auto=format&fit=crop",  // pool lanes
  climbing:   "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200&q=75&auto=format&fit=crop",  // climbing wall
  walk:       "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=200&q=75&auto=format&fit=crop",  // path/trail
  outdoor_walk:"https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=200&q=75&auto=format&fit=crop",
  soccer:     "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&q=75&auto=format&fit=crop",  // soccer pitch
  other:      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=75&auto=format&fit=crop",  // generic fitness
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=75&auto=format&fit=crop";

function categoryImage(type: string | null): string {
  return (type && CATEGORY_IMAGE[type]) ?? DEFAULT_IMAGE;
}

// Category → brand color (for strip colors in workout rows + count badges)
const CATEGORY_COLOR: Record<string, string> = {
  run: "#3B82F6", outdoor_run: "#3B82F6", indoor_run: "#3B82F6",
  cycle: "#22C55E", outdoor_cycle: "#22C55E", indoor_cycle: "#22C55E",
  yoga: "#9A5AF0", pilates: "#9A5AF0",
  strength: "#EF4444", traditional_strength: "#EF4444", functional_strength: "#EF4444",
  hiit: "#EC4899", boxing: "#EC4899",
  swim: "#06B6D4", climbing: "#F59E0B",
  walk: "#22C55E", outdoor_walk: "#22C55E", soccer: "#22C55E",
  other: "#6B7280",
};

function categoryColor(type: string | null): string {
  return (type && CATEGORY_COLOR[type]) ?? "#3B82F6";
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/** Build the 7xN grid of day cells for a given month. */
function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatSelectedDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Build a map: dateKey (YYYY-MM-DD local) → workouts on that day
function buildDayMap(workouts: ScheduleWorkout[]): Map<string, ScheduleWorkout[]> {
  const map = new Map<string, ScheduleWorkout[]>();
  for (const w of workouts) {
    const d = new Date(w.start_time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(w);
    map.set(key, arr);
  }
  return map;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  size = 40,
  className = "",
}: {
  user: ScheduleUser;
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

function MonthCell({
  day,
  dayMap,
}: {
  day: Date | null;
  dayMap: Map<string, ScheduleWorkout[]>;
}) {
  if (!day) {
    return <div className="aspect-square" />;
  }

  const today = isToday(day);
  const workouts = dayMap.get(dayKey(day)) ?? [];
  const count = workouts.length;
  const hasWorkouts = count > 0;

  // Use earliest workout's category for the cell image
  const primaryCategory = hasWorkouts ? workouts[0].category : null;
  const image = hasWorkouts ? categoryImage(primaryCategory) : null;
  const color = hasWorkouts ? categoryColor(primaryCategory) : "#3B82F6";

  // Today + no workouts → solid cobalt cell
  if (today && !hasWorkouts) {
    return (
      <div
        className="aspect-square relative rounded-lg"
        style={{ background: "var(--radr-cobalt)" }}
      >
        <span
          className="absolute font-bold"
          style={{ top: 4, left: 6, fontSize: 13, lineHeight: 1, color: "#fff" }}
        >
          {day.getDate()}
        </span>
      </div>
    );
  }

  // No workouts → clean empty cell
  if (!hasWorkouts) {
    return (
      <div className="aspect-square relative rounded-lg">
        <span
          className="absolute font-bold"
          style={{ top: 4, left: 6, fontSize: 13, lineHeight: 1, color: "var(--radr-text-dim)" }}
        >
          {day.getDate()}
        </span>
      </div>
    );
  }

  const cell = (
    <div className="aspect-square relative rounded-lg overflow-hidden">
      {/* Category photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image!}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Day number */}
      <span
        className="absolute font-bold z-10"
        style={{ top: 4, left: 6, fontSize: 13, lineHeight: 1, color: "#fff" }}
      >
        {day.getDate()}
      </span>

      {/* Count badge (2+ workouts) */}
      {count > 1 && (
        <span
          className="absolute font-bold rounded-full flex items-center justify-center z-10"
          style={{
            bottom: 3,
            right: 3,
            width: 16,
            height: 16,
            fontSize: 9,
            background: color,
            color: "#fff",
          }}
        >
          {count}
        </span>
      )}

      {/* Single-workout color dot */}
      {count === 1 && (
        <span
          className="absolute rounded-full z-10"
          style={{
            bottom: 4,
            right: 4,
            width: 6,
            height: 6,
            background: color,
          }}
        />
      )}
    </div>
  );

  // Today ring
  if (today) {
    return (
      <div style={{ outline: "2px solid var(--radr-cobalt)", outlineOffset: 2, borderRadius: 8 }}>
        {cell}
      </div>
    );
  }

  return cell;
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const userId = user.id;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Month boundaries for queries
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  // ── Round 1: parallel queries ──
  const [
    profileResult,
    createdResult,
    participationsResult,
    unreadResult,
    friendshipsResult,
    groupMembershipsResult,
  ] = await Promise.all([
    // User profile for header
    supabase
      .from("profiles")
      .select("full_name, username, avatar_url")
      .eq("id", userId)
      .single(),

    // Workouts I created this month
    supabase
      .from("workouts")
      .select("id, title, start_time, location, category, creator_id")
      .eq("creator_id", userId)
      .gte("start_time", monthStart)
      .lte("start_time", monthEnd)
      .is("deleted_at", null)
      .order("start_time"),

    // Workouts I'm participating in this month
    supabase
      .from("workout_participants")
      .select("workout_id, status")
      .eq("user_id", userId)
      .in("status", ["accepted", "going"]),

    // Unread notification count
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),

    // My friendships (accepted)
    supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "accepted"),

    // My group memberships
    supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId),
  ]);

  const profile = profileResult.data;
  const createdWorkouts = (createdResult.data ?? []) as ScheduleWorkout[];
  const myParticipations = participationsResult.data ?? [];
  const unreadCount = unreadResult.count ?? 0;
  const friendships = friendshipsResult.data ?? [];
  const groupMemberships = groupMembershipsResult.data ?? [];

  const currentUser: ScheduleUser = {
    full_name: profile?.full_name ?? "You",
    username: profile?.username ?? "you",
    avatar_url: profile?.avatar_url ?? null,
    gradient_seed: (profile?.full_name || "Y").charAt(0).toUpperCase(),
  };

  // Friend IDs
  const friendIds = friendships.map((f: any) =>
    f.requester_id === userId ? f.receiver_id : f.requester_id,
  );

  // Group IDs
  const groupIds = groupMemberships.map((g: any) => g.group_id);

  // ── Round 2: fetch joined + friends' + group workouts for the month ──
  const participatedIds = myParticipations
    .map((p) => p.workout_id)
    .filter((id) => !createdWorkouts.some((w) => w.id === id));

  const workoutSelect = "id, title, start_time, location, category, creator_id";

  const [joinedResult, friendsResult, groupsResult] = await Promise.all([
    // Workouts I joined (participated but didn't create)
    participatedIds.length > 0
      ? supabase
          .from("workouts")
          .select(workoutSelect)
          .in("id", participatedIds)
          .gte("start_time", monthStart)
          .lte("start_time", monthEnd)
          .is("deleted_at", null)
          .order("start_time")
      : Promise.resolve({ data: [] as ScheduleWorkout[] }),

    // Friends' workouts this month (created by friends)
    friendIds.length > 0
      ? supabase
          .from("workouts")
          .select(workoutSelect)
          .in("creator_id", friendIds)
          .gte("start_time", monthStart)
          .lte("start_time", monthEnd)
          .is("deleted_at", null)
          .order("start_time")
      : Promise.resolve({ data: [] as ScheduleWorkout[] }),

    // Group workouts this month
    groupIds.length > 0
      ? supabase
          .from("workouts")
          .select(workoutSelect)
          .in("group_id", groupIds)
          .gte("start_time", monthStart)
          .lte("start_time", monthEnd)
          .is("deleted_at", null)
          .order("start_time")
      : Promise.resolve({ data: [] as ScheduleWorkout[] }),
  ]);

  const joinedWorkouts = (joinedResult.data ?? []) as ScheduleWorkout[];
  const friendsWorkouts = (friendsResult.data ?? []) as ScheduleWorkout[];
  const groupsWorkouts = (groupsResult.data ?? []) as ScheduleWorkout[];

  // Merge and dedupe all workouts for this month
  const allWorkoutsMap = new Map<string, ScheduleWorkout>();
  for (const w of [...createdWorkouts, ...joinedWorkouts, ...friendsWorkouts, ...groupsWorkouts]) {
    allWorkoutsMap.set(w.id, w);
  }
  const allWorkouts = [...allWorkoutsMap.values()].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );

  // Build day map for calendar
  const dayMap = buildDayMap(allWorkouts);
  const grid = getMonthGrid(year, month);

  // Today's workouts
  const todayKey = dayKey(now);
  const todayWorkouts = dayMap.get(todayKey) ?? [];

  // Convert to WorkoutRowData for the list
  const todayRows: (WorkoutRowData & { category: string | null })[] = todayWorkouts.map((w) => ({
    id: w.id,
    title: w.title,
    start_time: w.start_time,
    location: w.location,
    category: w.category,
  }));

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. PAGE HEADER ROW
            ============================================================ */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${currentUser.username}`} className="no-underline shrink-0">
              <UserAvatar user={currentUser} size={40} />
            </Link>
            <div>
              <h1
                className="font-bold italic text-radr-text leading-tight"
                style={{ fontSize: "var(--radr-text-h1)" }}
              >
                Schedule<span className="not-italic">.</span><BrandDot />
              </h1>
              <p className="text-sm text-radr-text-muted">Your month</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <Link
              href="/notifications"
              className="relative w-9 h-9 rounded-full flex items-center justify-center no-underline"
              style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
              aria-label="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute rounded-full"
                  style={{ top: 1, right: 1, width: 7, height: 7, background: "var(--radr-cobalt)", border: "2px solid var(--radr-bg)" }}
                />
              )}
            </Link>
          </div>
        </div>

        {/* ============================================================
            2. MONTH NAV ROW
            ============================================================ */}
        <div className="px-6 mt-6 flex items-center justify-between">
          <h2
            className="font-bold italic text-radr-text"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
          >
            {formatMonthYear(year, month)}
          </h2>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer"
              style={{ background: "var(--radr-cobalt)", border: "none" }}
            >
              Today
            </button>
          </div>
        </div>

        {/* ============================================================
            3. WEEKDAY LABELS
            ============================================================ */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] font-semibold uppercase"
                style={{ color: "var(--radr-text-dim)", letterSpacing: "0.06em" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* ============================================================
              4. MONTH GRID
              ============================================================ */}
          <div className="grid grid-cols-7 gap-1">
            {grid.flat().map((day, i) => (
              <MonthCell key={i} day={day} dayMap={dayMap} />
            ))}
          </div>
        </div>

        {/* ============================================================
            5. SELECTED-DAY DRAWER (today by default)
            ============================================================ */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-bold italic text-radr-text"
              style={{ fontSize: "var(--radr-text-h2)" }}
            >
              {formatSelectedDate(now)}<BrandDot />
            </h3>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "var(--radr-surface-1)", color: "var(--radr-text-muted)", border: "1px solid var(--radr-border)" }}
            >
              {todayRows.length} {todayRows.length === 1 ? "workout" : "workouts"}
            </span>
          </div>

          {todayRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {todayRows.map((w) => (
                <WorkoutListRow
                  key={w.id}
                  workout={w}
                  stripColor={categoryColor(w.category)}
                  hideWeekday
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base text-radr-text-dim italic">
                Wide open. Call something in.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center mt-4 px-5 py-2.5 rounded-full text-sm font-semibold no-underline transition-colors"
                style={{
                  background: "var(--radr-surface-1)",
                  color: "var(--radr-text-muted)",
                  border: "1px solid var(--radr-border)",
                }}
              >
                Browse workouts
              </Link>
            </div>
          )}
        </div>

        {/* ============================================================
            6. FOOTER SPACING
            ============================================================ */}
        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
