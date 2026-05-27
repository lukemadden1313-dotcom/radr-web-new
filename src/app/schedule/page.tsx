import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow } from "@/components/workout-list-row";
import {
  CURRENT_USER,
  MOCK_WORKOUTS,
  MOCK_NOTIFICATIONS,
  coverPhotoForActivity,
  type MockUser,
  type MockWorkout,
} from "@/lib/mock-data";

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

const ACTIVITY_STRIP_COLOR: Record<string, string> = {
  Running: "var(--radr-cobalt)",
  Cycling: "var(--radr-green)",
  Yoga: "var(--radr-purple)",
  Climbing: "#f59e0b",
  Strength: "#ef4444",
  HIIT: "#ec4899",
  Track: "var(--radr-cobalt)",
  Walking: "var(--radr-green)",
};

function stripColorForActivity(type: string): string {
  return ACTIVITY_STRIP_COLOR[type] ?? "var(--radr-cobalt)";
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

function workoutsOnDay(day: Date): MockWorkout[] {
  return MOCK_WORKOUTS.filter((w) => {
    const wd = new Date(w.start_time);
    return isSameDay(wd, day);
  }).sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

/** Build the 7×N grid of day cells for a given month. */
function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  // Leading blanks
  for (let i = 0; i < startDow; i++) cells.push(null);

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  // Trailing blanks to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  // Split into rows of 7
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
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

function MonthCell({ day }: { day: Date | null }) {
  if (!day) {
    return <div className="aspect-square" />;
  }

  const today = isToday(day);
  const workouts = workoutsOnDay(day);
  const hasWorkouts = workouts.length > 0;
  const coverPhoto = hasWorkouts
    ? workouts[0].cover_image_url || coverPhotoForActivity(workouts[0].activity_type)
    : null;

  // Today + no workouts → filled cobalt cell
  if (today && !hasWorkouts) {
    return (
      <div
        className="aspect-square relative rounded-lg flex items-start"
        style={{ background: "var(--radr-cobalt)" }}
      >
        <span
          className="absolute font-bold z-10"
          style={{ top: 4, left: 6, fontSize: 13, lineHeight: 1, color: "#fff" }}
        >
          {day.getDate()}
        </span>
      </div>
    );
  }

  // Today + has workouts → cover photo + cobalt outline ring around cell
  // Other days → normal treatment
  const cell = (
    <div
      className="aspect-square relative rounded-lg overflow-hidden"
      style={{
        background: hasWorkouts ? "var(--radr-surface-2)" : "transparent",
      }}
    >
      {/* Cover photo background */}
      {coverPhoto && (
        <img
          src={coverPhoto}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.7 }}
        />
      )}

      {/* Darkening overlay for photo cells */}
      {coverPhoto && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      )}

      {/* Day number */}
      <span
        className="absolute font-bold z-10"
        style={{
          top: 4,
          left: 6,
          fontSize: 13,
          lineHeight: 1,
          color: hasWorkouts ? "#fff" : "var(--radr-text-dim)",
        }}
      >
        {day.getDate()}
      </span>

      {/* Workout count badge (when >1) */}
      {workouts.length > 1 && (
        <span
          className="absolute font-bold rounded-full flex items-center justify-center z-10"
          style={{
            bottom: 3,
            right: 3,
            width: 16,
            height: 16,
            fontSize: 9,
            background: "var(--radr-cobalt)",
            color: "#fff",
          }}
        >
          {workouts.length}
        </span>
      )}

      {/* Activity color dot for single-workout days */}
      {workouts.length === 1 && (
        <span
          className="absolute rounded-full z-10"
          style={{
            bottom: 4,
            right: 4,
            width: 6,
            height: 6,
            background: stripColorForActivity(workouts[0].activity_type),
          }}
        />
      )}
    </div>
  );

  // Wrap today cells with an outline ring that sits outside the cell
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

export default function SchedulePage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const grid = getMonthGrid(year, month);
  const todayWorkouts = workoutsOnDay(now);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. PAGE HEADER ROW
            ============================================================ */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${CURRENT_USER.username}`} className="no-underline shrink-0">
              <UserAvatar user={CURRENT_USER} size={40} />
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
            <button
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)", color: "var(--radr-text-muted)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-px mr-1">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
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
              <MonthCell key={i} day={day} />
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
              {todayWorkouts.length} {todayWorkouts.length === 1 ? "workout" : "workouts"}
            </span>
          </div>

          {todayWorkouts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {todayWorkouts.map((w) => (
                <WorkoutListRow
                  key={w.id}
                  workout={w}
                  stripColor={stripColorForActivity(w.activity_type)}
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
