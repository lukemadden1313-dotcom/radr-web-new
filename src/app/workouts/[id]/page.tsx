import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { createClient } from "@/lib/supabase/server";
import {
  coverPhotoForActivity,
  categoryDisplayName,
  type RSVPStatus,
} from "@/lib/mock-data";
import { WorkoutDetailInteractive } from "./workout-detail-interactive";

// ----------------------------------------------------------------
// Types (from Supabase RPC response)
// ----------------------------------------------------------------

type DeepLinkWorkout = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  created_at: string;
  booking_url: string | null;
  open_to_join: boolean;
  duration: number | null;
  category: string | null;
  group_id: string | null;
  activity_name: string | null;
  creator_username: string | null;
  creator_full_name: string | null;
  creator_avatar_url: string | null;
  participants: Array<{
    user_id: string;
    status: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }>;
};

type DbComment = {
  id: string;
  user_id: string;
  workout_id: string;
  content: string;
  created_at: string;
};

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

/** Map DB participant status to our RSVPStatus union. */
function mapStatus(dbStatus: string): RSVPStatus {
  if (dbStatus === "going") return "going";
  if (dbStatus === "maybe") return "maybe";
  if (dbStatus === "cant" || dbStatus === "declined" || dbStatus === "not_going") return "cant";
  // "accepted" is the legacy iOS value — treat as "going"
  if (dbStatus === "accepted") return "going";
  return "going";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Fetch workout via RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_workout_for_deep_link",
    { p_workout_id: id },
  );

  const rows = (rpcData ?? []) as DeepLinkWorkout[];
  const workout = rows[0];
  if (!workout || rpcError) notFound();

  // Fetch comments for this workout
  const { data: commentsData } = await supabase
    .from("comments")
    .select("id, user_id, workout_id, content, created_at")
    .eq("workout_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const comments = (commentsData ?? []) as DbComment[];

  // Fetch commenter profiles
  const commenterIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: commenterProfiles } = commenterIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", commenterIds)
    : { data: [] };

  const profileMap = new Map(
    (commenterProfiles ?? []).map((p: any) => [p.id, p]),
  );

  // Fetch authenticated user's profile for the comment composer
  let meUser = {
    id: authUser?.id ?? "anon",
    full_name: "You",
    username: "you",
    avatar_url: null as string | null,
    gradient_seed: "Y",
  };

  if (authUser) {
    const { data: meProfile } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", authUser.id)
      .single();

    if (meProfile) {
      const initial = (meProfile.full_name || "?").charAt(0).toUpperCase();
      meUser = {
        id: meProfile.id,
        full_name: meProfile.full_name ?? "You",
        username: meProfile.username ?? "you",
        avatar_url: meProfile.avatar_url,
        gradient_seed: initial,
      };
    }
  }

  // Build host user
  const hostInitial = (workout.creator_full_name || "?").charAt(0).toUpperCase();
  const hostUser = {
    id: workout.creator_id,
    full_name: workout.creator_full_name ?? "Host",
    username: workout.creator_username ?? "unknown",
    avatar_url: workout.creator_avatar_url,
    gradient_seed: hostInitial,
  };

  // Build participants
  const serializedParticipants = workout.participants.map((p) => {
    const initial = (p.full_name || p.username || "?").charAt(0).toUpperCase();
    return {
      user_id: p.user_id,
      status: mapStatus(p.status),
      user: {
        id: p.user_id,
        full_name: p.full_name ?? p.username ?? "User",
        username: p.username ?? "user",
        avatar_url: p.avatar_url,
        gradient_seed: initial,
      },
    };
  });

  // Current user's RSVP
  const myParticipant = workout.participants.find(
    (p) => p.user_id === authUser?.id,
  );
  const initialRsvp: RSVPStatus | null = myParticipant
    ? mapStatus(myParticipant.status)
    : null;

  // Group chip (fetch from Supabase if group_id exists)
  let groupChip: { id: string; name: string } | null = null;
  if (workout.group_id) {
    const { data: groupData } = await supabase.rpc("get_group_for_deep_link", {
      p_group_id: workout.group_id,
    });
    const groupRows = (groupData ?? []) as Array<{ id: string; name: string }>;
    if (groupRows[0]) {
      groupChip = { id: groupRows[0].id, name: groupRows[0].name };
    }
  }

  // Build activity feed: comments + RSVP events + "created" event
  const commentFeedItems = comments.map((c) => {
    const profile = profileMap.get(c.user_id);
    const initial = (profile?.full_name || "?").charAt(0).toUpperCase();
    return {
      id: `comment-${c.id}`,
      type: "comment" as const,
      actor: {
        id: c.user_id,
        full_name: profile?.full_name ?? "User",
        username: profile?.username ?? "user",
        avatar_url: profile?.avatar_url ?? null,
        gradient_seed: initial,
      },
      comment_body: c.content,
      time_label: timeAgo(c.created_at),
    };
  });

  const rsvpFeedItems = workout.participants
    .filter((p) => p.user_id !== workout.creator_id)
    .map((p) => {
      const initial = (p.full_name || p.username || "?").charAt(0).toUpperCase();
      return {
        id: `a-rsvp-${p.user_id}`,
        type: "rsvp" as const,
        actor: {
          id: p.user_id,
          full_name: p.full_name ?? p.username ?? "User",
          username: p.username ?? "user",
          avatar_url: p.avatar_url,
          gradient_seed: initial,
        },
        rsvp_status: mapStatus(p.status),
        time_label: "",
      };
    });

  const createdItem = {
    id: "a-created",
    type: "created" as const,
    actor: hostUser,
    time_label: timeAgo(workout.created_at),
  };

  const initialFeed = [...commentFeedItems, ...rsvpFeedItems, createdItem];

  // Cover image
  const coverUrl = coverPhotoForActivity(workout.category ?? "other");
  const coverGradient = "var(--radr-cobalt)";

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
            {groupChip && (
              <Link
                href={`/groups/${groupChip.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold no-underline"
                style={{
                  background: "rgba(42, 212, 114, 0.12)",
                  color: "#2AD472",
                  border: "1px solid rgba(42, 212, 114, 0.2)",
                }}
              >
                From {groupChip.name}
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
          coverGradient={coverGradient}
          categoryLabel={categoryDisplayName(workout.category ?? "other")}
          title={workout.title}
          dateStr={formatFullDate(workout.start_time)}
          host={hostUser}
          locationParts={workout.location ? workout.location.split(",").map((s) => s.trim()) : []}
          bookingUrl={workout.booking_url}
          description={workout.description}
          groupChip={groupChip}
          initialRsvp={initialRsvp}
          initialParticipants={serializedParticipants}
          initialFeed={initialFeed}
          currentUser={meUser}
        />
      </div>
    </SiteShell>
  );
}
