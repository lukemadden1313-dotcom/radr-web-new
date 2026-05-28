import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import {
  MOCK_NOTIFICATIONS,
  getNotificationActor,
  getNotificationLink,
  type MockUser,
  type MockNotification,
} from "@/lib/mock-data";

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

// Notification icon per type (matches iOS NotificationCategory)
function notificationIcon(type: MockNotification["type"]): { icon: string; color: string } {
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

// iOS notifications use pre-rendered `message`. Display it directly.
function NotificationText({ n }: { n: MockNotification }) {
  return (
    <span className="text-radr-text-muted">
      {n.message}
    </span>
  );
}

function NotificationRow({ n, showBorder }: { n: MockNotification; showBorder: boolean }) {
  const href = getNotificationLink(n);
  const isFriendRequest = n.type === "friend_request";
  const actor = getNotificationActor(n);
  const { icon } = notificationIcon(n.type);

  return (
    <Link
      href={href}
      className="flex items-start gap-3 py-4 no-underline text-inherit transition-colors"
      style={{
        borderTop: showBorder ? "1px solid rgba(255,255,247,0.08)" : undefined,
      }}
    >
      {/* Avatar with unread dot */}
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
              top: -1,
              right: -1,
              width: 8,
              height: 8,
              background: "var(--radr-cobalt)",
              border: "2px solid var(--radr-bg)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <NotificationText n={n} />
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--radr-text-dim)" }}>
          {timeAgo(n.created_at)}
        </p>
      </div>

      {/* Right action */}
      <div className="shrink-0 flex items-center pt-1">
        {isFriendRequest ? (
          <div className="flex items-center gap-2">
            {/* TODO: wire accept action */}
            <button
              className="py-1 px-3 rounded-full text-xs font-semibold text-white cursor-pointer"
              style={{ background: "var(--radr-cobalt)", border: "none" }}
            >
              Accept
            </button>
            {/* TODO: wire decline action */}
            <button
              className="py-1 px-3 rounded-full text-xs font-semibold cursor-pointer"
              style={{ background: "var(--radr-surface-1)", color: "var(--radr-text-muted)", border: "1px solid var(--radr-border)" }}
            >
              Decline
            </button>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function NotificationsPage() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const sorted = [...MOCK_NOTIFICATIONS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const recent = sorted.filter((n) => new Date(n.created_at) >= oneDayAgo);
  const earlier = sorted.filter((n) => new Date(n.created_at) < oneDayAgo);
  const unreadCount = sorted.filter((n) => !n.is_read).length;

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK + MARK ALL AS READ ROW
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

          {unreadCount > 0 && (
            // TODO: wire mark-all-as-read action
            <button
              className="py-1.5 px-3 rounded-full text-xs font-medium text-radr-text-muted hover:text-radr-text transition-colors cursor-pointer"
              style={{ background: "transparent", border: "1px solid var(--radr-border)" }}
            >
              Mark all as read
            </button>
          )}
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
              ? `${unreadCount} new this week`
              : "All caught up."}
          </p>
        </div>

        {/* ============================================================
            3. NOTIFICATION LIST
            ============================================================ */}
        {sorted.length > 0 ? (
          <div className="px-6 mt-6">
            {/* Recent group */}
            {recent.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Recent" />
                {recent.map((n, i) => (
                  <NotificationRow key={n.id} n={n} showBorder={i > 0} />
                ))}
              </div>
            )}

            {/* Earlier group */}
            {earlier.length > 0 && (
              <div>
                <SectionHeader title="Earlier" />
                {earlier.map((n, i) => (
                  <NotificationRow key={n.id} n={n} showBorder={i > 0} />
                ))}
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
