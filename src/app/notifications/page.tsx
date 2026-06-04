import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { createClient } from "@/lib/supabase/server";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

type DbNotification = {
  id: string;
  type: string;
  message: string | null;
  actor_id: string | null;
  entity_id: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

type NotifUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
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

function initial(name: string | null): string {
  return (name || "?").charAt(0).toUpperCase();
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  if (diff < 604800) return Math.floor(diff / 86400) + "d";
  return Math.floor(diff / 604800) + "w";
}

function notificationIcon(type: string): { icon: string; color: string } {
  switch (type) {
    case "friend_request": return { icon: "\ud83d\udc64", color: "var(--radr-cobalt)" };
    case "friend_request_accepted": return { icon: "\u2705", color: "var(--radr-green)" };
    case "workout_join": return { icon: "\ud83d\udc65", color: "#818cf8" };
    case "workout_invite": return { icon: "\u2709\ufe0f", color: "#06b6d4" };
    case "workout_update": return { icon: "\u26a0\ufe0f", color: "#ef4444" };
    case "workout_reaction": return { icon: "\u2764\ufe0f", color: "#ec4899" };
    case "workout_comment": return { icon: "\ud83d\udcac", color: "#a855f7" };
    case "friend_workout": return { icon: "\ud83c\udfc3", color: "var(--radr-green)" };
    case "upcoming_activity": return { icon: "\u23f0", color: "#f97316" };
    case "profile_view": return { icon: "\ud83d\udc41\ufe0f", color: "#a855f7" };
    default: return { icon: "\ud83d\udd14", color: "var(--radr-text-muted)" };
  }
}

function notificationLink(n: DbNotification, actorMap: Map<string, NotifUser>): string {
  switch (n.type) {
    case "friend_request":
    case "friend_request_accepted":
    case "profile_view": {
      const actor = n.actor_id ? actorMap.get(n.actor_id) : undefined;
      return actor ? `/profile/${actor.username}` : "#";
    }
    case "workout_join":
    case "workout_update":
    case "workout_invite":
    case "friend_workout":
    case "workout_reaction":
    case "workout_comment":
    case "upcoming_activity":
      return n.entity_id ? `/workouts/${n.entity_id}` : "#";
    default:
      return "#";
  }
}

// Build a readable fallback message if the DB `message` column is empty
function fallbackMessage(n: DbNotification, actorMap: Map<string, NotifUser>): string {
  const actorName = n.actor_id
    ? (actorMap.get(n.actor_id)?.full_name ?? "Someone")
    : "Someone";

  switch (n.type) {
    case "friend_request": return `${actorName} sent you a friend request`;
    case "friend_request_accepted": return `${actorName} accepted your friend request`;
    case "workout_join": return `${actorName} joined a workout`;
    case "workout_invite": return `${actorName} invited you to a workout`;
    case "workout_update": return `${actorName} updated a workout`;
    case "workout_reaction": return `${actorName} reacted to your workout`;
    case "workout_comment": return `${actorName} commented on a workout`;
    case "friend_workout": return `${actorName} is working out`;
    case "upcoming_activity": return "You have an upcoming workout";
    case "profile_view": return `${actorName} viewed your profile`;
    default: return "New notification";
  }
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
  user: NotifUser;
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
      className="font-bold italic text-radr-text mb-3"
      style={{ fontSize: "var(--radr-text-h2)" }}
    >
      {title}<BrandDot />
    </h2>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Fetch notifications (newest first, limit 50)
  const { data: notifData } = await supabase
    .from("notifications")
    .select("id, type, message, actor_id, entity_id, related_id, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (notifData ?? []) as DbNotification[];

  // Collect actor IDs and fetch their profiles
  const actorIds = [...new Set(
    notifications.map((n) => n.actor_id).filter(Boolean) as string[],
  )];

  const actorMap = new Map<string, NotifUser>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", actorIds);

    for (const p of profiles ?? []) {
      actorMap.set(p.id, {
        id: p.id,
        full_name: p.full_name ?? "User",
        username: p.username ?? "user",
        avatar_url: p.avatar_url,
        gradient_seed: initial(p.full_name),
      });
    }
  }

  // Mark unread notifications as read (fire-and-forget)
  const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
  if (unreadIds.length > 0) {
    supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds)
      .then(({ error }) => {
        if (error) {
          console.warn("Failed to mark notifications as read (likely RLS):", error.message);
        }
      });
  }

  // Split into recent (last 24h) and earlier
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent = notifications.filter((n) => new Date(n.created_at) >= oneDayAgo);
  const earlier = notifications.filter((n) => new Date(n.created_at) < oneDayAgo);
  const unreadCount = unreadIds.length;

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK ROW
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
        </div>

        {/* ============================================================
            2. PAGE HEADER
            ============================================================ */}
        <div className="px-6 pt-4">
          <h1
            className="font-bold text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            Notifications
          </h1>
          <p className="mt-2 text-base text-radr-text-muted">
            {unreadCount > 0
              ? `${unreadCount} new`
              : notifications.length > 0
                ? "All caught up."
                : "Nothing yet."}
          </p>
        </div>

        {/* ============================================================
            3. NOTIFICATION LIST
            ============================================================ */}
        {notifications.length > 0 ? (
          <div className="px-6 mt-6">
            {/* Recent group */}
            {recent.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Recent" />
                {recent.map((n, i) => {
                  const actor = n.actor_id ? actorMap.get(n.actor_id) : undefined;
                  const href = notificationLink(n, actorMap);
                  const { icon } = notificationIcon(n.type);
                  const message = n.message || fallbackMessage(n, actorMap);

                  return (
                    <Link
                      key={n.id}
                      href={href}
                      className="flex items-start gap-3 py-4 no-underline text-inherit transition-colors"
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(255,255,247,0.08)" : undefined,
                      }}
                    >
                      <div className="relative shrink-0">
                        {actor ? (
                          <UserAvatar user={actor} size={40} />
                        ) : (
                          <span
                            className="rounded-full shrink-0 flex items-center justify-center text-lg"
                            style={{ width: 40, height: 40, background: "var(--radr-surface-2)" }}
                          >
                            {icon}
                          </span>
                        )}
                        {!n.is_read && (
                          <span
                            className="absolute rounded-full"
                            style={{
                              top: -1, right: -1,
                              width: 8, height: 8,
                              background: "var(--radr-cobalt)",
                              border: "2px solid var(--radr-bg)",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug text-radr-text-muted">
                          {message}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--radr-text-dim)" }}>
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center pt-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Earlier group */}
            {earlier.length > 0 && (
              <div>
                <SectionHeader title="Earlier" />
                {earlier.map((n, i) => {
                  const actor = n.actor_id ? actorMap.get(n.actor_id) : undefined;
                  const href = notificationLink(n, actorMap);
                  const { icon } = notificationIcon(n.type);
                  const message = n.message || fallbackMessage(n, actorMap);

                  return (
                    <Link
                      key={n.id}
                      href={href}
                      className="flex items-start gap-3 py-4 no-underline text-inherit transition-colors"
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(255,255,247,0.08)" : undefined,
                      }}
                    >
                      <div className="relative shrink-0">
                        {actor ? (
                          <UserAvatar user={actor} size={40} />
                        ) : (
                          <span
                            className="rounded-full shrink-0 flex items-center justify-center text-lg"
                            style={{ width: 40, height: 40, background: "var(--radr-surface-2)" }}
                          >
                            {icon}
                          </span>
                        )}
                        {!n.is_read && (
                          <span
                            className="absolute rounded-full"
                            style={{
                              top: -1, right: -1,
                              width: 8, height: 8,
                              background: "var(--radr-cobalt)",
                              border: "2px solid var(--radr-bg)",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug text-radr-text-muted">
                          {message}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--radr-text-dim)" }}>
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center pt-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================
              4. EMPTY STATE
              ============================================================ */
          <div className="px-6 py-20 text-center">
            <p className="text-lg text-radr-text-dim italic">
              All quiet. Go invite someone to a workout.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center mt-6 px-5 py-2.5 rounded-full text-sm font-semibold no-underline transition-colors"
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

        {/* ============================================================
            5. FOOTER SPACING
            ============================================================ */}
        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
