import Link from "next/link";
import type { MockWorkout } from "@/lib/mock-data";

function formatShortDate(iso: string, hideWeekday = false): string {
  const d = new Date(iso);
  const tz = "America/New_York";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
  if (hideWeekday) return time;
  const day = d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz });
  return `${day} at ${time}`;
}

export function WorkoutListRow({
  workout,
  reason,
  stripColor,
  hideWeekday = false,
}: {
  workout: MockWorkout;
  reason?: string;
  stripColor?: string;
  hideWeekday?: boolean;
}) {
  const goingCount = workout.participants.length;

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="flex items-stretch rounded-card border border-radr-border overflow-hidden no-underline text-inherit hover:border-radr-cobalt/40 transition-colors group"
    >
      {/* Colored left-edge strip */}
      <div
        className="w-2 shrink-0"
        style={{ background: stripColor || workout.cover_gradient }}
      />

      {/* Content */}
      <div className="flex-1 p-4 flex items-center gap-4 bg-radr-surface-1">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-radr-text truncate">
            {workout.title}
          </p>
          <p className="text-sm text-radr-text-muted mt-0.5">
            {formatShortDate(workout.start_time, hideWeekday)} &middot; {workout.location.split(",")[0]}
          </p>
          {reason && (
            <p className="text-xs text-radr-text-dim mt-1.5">
              {reason}
            </p>
          )}
          {!reason && goingCount > 0 && (
            <p className="text-xs text-radr-text-dim mt-1.5">
              {goingCount} going
            </p>
          )}
        </div>

        {/* Join pill */}
        <span className="shrink-0 inline-flex items-center h-8 px-4 rounded-pill bg-radr-surface-2 border border-radr-border text-sm font-semibold text-radr-text radr-pill-interactive hover:bg-radr-cobalt hover:text-white hover:border-radr-cobalt transition-colors">
          + Join
        </span>
      </div>
    </Link>
  );
}
