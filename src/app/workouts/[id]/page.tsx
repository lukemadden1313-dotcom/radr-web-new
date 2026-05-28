import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import {
  CURRENT_USER,
  MOCK_GROUPS,
  coverPhotoForActivity,
  categoryDisplayName,
  getWorkoutHost,
  getWorkoutById,
  getAllKnownUsers,
  type MockWorkout,
  type WorkoutParticipant,
  type RSVPStatus,
} from "@/lib/mock-data";
import { WorkoutDetailInteractive } from "./workout-detail-interactive";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

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

function currentUserRsvp(workout: MockWorkout): RSVPStatus | null {
  const p = workout.participants.find((p) => p.user_id === CURRENT_USER.id);
  return p ? p.status : null;
}

function resolveParticipantUser(p: WorkoutParticipant) {
  const found = getAllKnownUsers().find((u) => u.id === p.user_id);
  const fallbackInitial = p.profile.username.charAt(0).toUpperCase();
  return {
    id: found?.id ?? p.user_id,
    full_name: found?.full_name ?? p.profile.username,
    username: found?.username ?? p.profile.username,
    avatar_url: found?.avatar_url ?? p.profile.avatar_url,
    gradient_seed: found?.gradient_seed ?? fallbackInitial,
  };
}

function resolveGroup(groupId: string | null) {
  if (!groupId) return null;
  const g = MOCK_GROUPS.find((g) => g.id === groupId);
  return g ? { id: g.id, name: g.name } : null;
}

// Build initial feed items (serializable)
function buildInitialFeed(workout: MockWorkout) {
  const host = getWorkoutHost(workout);
  const hostUser = {
    id: host.id,
    full_name: host.full_name,
    username: host.username,
    avatar_url: host.avatar_url,
    gradient_seed: host.gradient_seed,
  };

  const rsvps = workout.participants
    .filter((p) => p.user_id !== workout.creator_id)
    .slice(0, 4)
    .map((p, i) => ({
      id: `a-rsvp-${p.user_id}`,
      type: "rsvp" as const,
      actor: resolveParticipantUser(p),
      rsvp_status: p.status,
      time_label: `${1 + i * 2}h`,
    }));

  const created = {
    id: "a-created",
    type: "created" as const,
    actor: hostUser,
    time_label: "2d",
  };

  return [...rsvps, created];
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  const workout = getWorkoutById(id); // TODO: replace with get_workout RPC when backend ready
  if (!workout) notFound();

  const host = getWorkoutHost(workout);
  const group = resolveGroup(workout.group_id);
  const coverUrl = workout.cover_image_url || coverPhotoForActivity(workout.category);

  const hostUser = {
    id: host.id,
    full_name: host.full_name,
    username: host.username,
    avatar_url: host.avatar_url,
    gradient_seed: host.gradient_seed,
  };

  const meUser = {
    id: CURRENT_USER.id,
    full_name: CURRENT_USER.full_name,
    username: CURRENT_USER.username,
    avatar_url: CURRENT_USER.avatar_url,
    gradient_seed: CURRENT_USER.gradient_seed,
  };

  const serializedParticipants = workout.participants.map((p) => ({
    user_id: p.user_id,
    status: p.status,
    user: resolveParticipantUser(p),
  }));

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            BACK + CONTEXT ROW  (server-rendered, no interactivity)
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
            INTERACTIVE REGION (cover → activity → comments)
            ============================================================ */}
        <WorkoutDetailInteractive
          workoutId={workout.id}
          coverUrl={coverUrl}
          coverGradient={workout.cover_gradient || "var(--radr-cobalt)"}
          categoryLabel={categoryDisplayName(workout.category)}
          title={workout.title}
          dateStr={formatFullDate(workout.start_time)}
          host={hostUser}
          locationParts={workout.location ? workout.location.split(",").map((s) => s.trim()) : []}
          bookingUrl={workout.booking_url}
          description={workout.description}
          groupChip={group}
          initialRsvp={currentUserRsvp(workout)}
          initialParticipants={serializedParticipants}
          initialFeed={buildInitialFeed(workout)}
          currentUser={meUser}
        />
      </div>
    </SiteShell>
  );
}
