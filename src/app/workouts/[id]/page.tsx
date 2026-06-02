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
// Types
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

type ActivityEvent = {
  event_type: "workout_created" | "rsvp" | "comment" | "reaction";
  actor_id: string;
  actor_username: string | null;
  actor_full_name: string | null;
  actor_avatar_url: string | null;
  occurred_at: string;
  rsvp_status: string | null;
  comment_id: string | null;
  comment_body: string | null;
  reaction_emoji: string | null;
};

type DbComment = {
  id: string;
  workout_id: string;
  user_id: string;
  text: string;
  parent_id: string | null;
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

function mapStatus(dbStatus: string): RSVPStatus {
  if (dbStatus === "going") return "going";
  if (dbStatus === "maybe") return "maybe";
  if (dbStatus === "cant" || dbStatus === "declined" || dbStatus === "not_going") return "cant";
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

function actorToUser(evt: ActivityEvent) {
  const initial = (evt.actor_full_name || evt.actor_username || "?").charAt(0).toUpperCase();
  return {
    id: evt.actor_id,
    full_name: evt.actor_full_name ?? evt.actor_username ?? "User",
    username: evt.actor_username ?? "user",
    avatar_url: evt.actor_avatar_url,
    gradient_seed: initial,
  };
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

  // Fetch activity feed via RPC
  const { data: activityData } = await supabase.rpc("get_workout_activity", {
    p_workout_id: id,
  });
  const activityEvents = (activityData ?? []) as ActivityEvent[];

  // Fetch threaded comments from workout_comments
  const { data: commentsData } = await supabase
    .from("workout_comments")
    .select("id, workout_id, user_id, text, parent_id, created_at")
    .eq("workout_id", id)
    .order("created_at", { ascending: true });

  const allComments = (commentsData ?? []) as DbComment[];

  // Fetch commenter profiles
  const commenterIds = [...new Set(allComments.map((c) => c.user_id))];
  const { data: commenterProfiles } = commenterIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", commenterIds)
    : { data: [] };

  const profileMap = new Map(
    (commenterProfiles ?? []).map((p: any) => [p.id, p]),
  );

  // Build serializable comments with profiles (for threaded display)
  const serializedComments = allComments.map((c) => {
    const profile = profileMap.get(c.user_id);
    const initial = (profile?.full_name || "?").charAt(0).toUpperCase();
    return {
      id: c.id,
      parent_id: c.parent_id,
      text: c.text,
      created_at: c.created_at,
      time_label: timeAgo(c.created_at),
      actor: {
        id: c.user_id,
        full_name: profile?.full_name ?? "User",
        username: profile?.username ?? "user",
        avatar_url: profile?.avatar_url ?? null,
        gradient_seed: initial,
      },
    };
  });

  // Fetch authenticated user's profile
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

  // Group chip
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

  // Build activity feed from get_workout_activity RPC
  const initialFeed = activityEvents.map((evt, i) => {
    const feedItem: any = {
      id: `activity-${evt.event_type}-${i}`,
      type: evt.event_type === "workout_created" ? "created" : evt.event_type,
      actor: actorToUser(evt),
      time_label: timeAgo(evt.occurred_at),
    };
    if (evt.event_type === "rsvp" && evt.rsvp_status) {
      feedItem.rsvp_status = mapStatus(evt.rsvp_status);
    }
    if (evt.event_type === "comment" && evt.comment_body) {
      feedItem.comment_body = evt.comment_body;
      if (evt.comment_id) feedItem.id = `comment-${evt.comment_id}`;
    }
    if (evt.event_type === "reaction" && evt.reaction_emoji) {
      feedItem.reaction_emoji = evt.reaction_emoji;
    }
    return feedItem;
  });

  // Cover image
  const coverUrl = coverPhotoForActivity(workout.category ?? "other");
  const coverGradient = "var(--radr-cobalt)";

  const isOwner = authUser?.id === workout.creator_id;

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* BACK + CONTEXT ROW */}
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
          </div>
        </div>

        {/* INTERACTIVE REGION */}
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
          initialComments={serializedComments}
          currentUser={meUser}
          isOwner={isOwner}
        />
      </div>
    </SiteShell>
  );
}
