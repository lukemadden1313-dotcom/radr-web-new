import Link from "next/link";

export type WorkoutRowData = {
  id: string;
  title: string;
  start_time: string;
  location: string | null;
  participant_count?: number;
  participants?: Array<{ user_id: string }>;
  cover_gradient?: string;
};

function formatShortDate(iso: string, hideWeekday = false): string {
  const d = new Date(iso);
  const tz = "America/New_York";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
  if (hideWeekday) return time;
  const day = d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz });
  const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz });
  return `${day}, ${monthDay} at ${time}`;
}

export function WorkoutListRow({
  workout,
  reason,
  stripColor,
  hideWeekday = false,
}: {
  workout: WorkoutRowData;
  reason?: string;
  stripColor?: string;
  hideWeekday?: boolean;
}) {
  const goingCount = workout.participant_count ?? workout.participants?.length ?? 0;

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="flex items-stretch rounded-card border border-radr-border overflow-hidden no-underline text-inherit hover:border-radr-cobalt/40 transition-colors group"
    >
      {/* Colored left-edge strip */}
      <div
        className="w-2 shrink-0"
        style={{ background: stripColor || workout.cover_gradient || "var(--radr-cobalt)" }}
      />

      {/* Content */}
      <div className="flex-1 p-4 flex items-center gap-4 bg-radr-surface-1">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-radr-text truncate">
            {workout.title}
          </p>
          <p className="text-sm text-radr-text-muted mt-0.5">
            {formatShortDate(workout.start_time, hideWeekday)}{workout.location ? <> &middot; {workout.location.split(",")[0]}</> : null}
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
