import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { WorkoutListRow } from "@/components/workout-list-row";
import {
  CURRENT_USER,
  MOCK_FRIENDS,
  getGroupById,
  getWorkoutHost,
  resolveGroupMember,
  getAllKnownUsers,
  type MockUser,
  type MockGroup,
  type GroupMember,
} from "@/lib/mock-data";
import {
  GroupActivityInteractive,
  type SerializableUser,
  type FeedItem,
} from "./group-activity-interactive";

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

function resolveUser(userId: string): MockUser | null {
  return getAllKnownUsers().find((u) => u.id === userId) ?? null;
}

function isCurrentUserMember(group: MockGroup): boolean {
  return group.members.some((m) => m.user_id === CURRENT_USER.id);
}

// ----------------------------------------------------------------
// Mock group activity feed (inline for now)
// TODO: pull from real group activity feed RPC
// ----------------------------------------------------------------

function toSerializable(u: MockUser): SerializableUser {
  return {
    id: u.id,
    full_name: u.full_name,
    username: u.username,
    avatar_url: u.avatar_url,
    initials: u.initials,
    gradient_seed: u.gradient_seed,
  };
}

function buildMockGroupActivity(group: MockGroup): FeedItem[] {
  const items: FeedItem[] = [];

  // Most recent: a member joined
  if (group.members.length > 2) {
    const recentMember = resolveGroupMember(group.members[group.members.length - 1]);
    items.push({
      id: "ga-joined",
      actor: toSerializable(recentMember),
      action: "joined the crew",
      timeAgo: "2d",
    });
  }

  // A workout was created
  if (group.upcoming_workouts.length > 0) {
    const w = group.upcoming_workouts[0];
    items.push({
      id: "ga-created-workout",
      actor: toSerializable(getWorkoutHost(w)),
      action: `created ${w.title}`,
      timeAgo: "4d",
    });
  }

  // Creator started the group (anchor)
  const creator = resolveUser(group.creator_id);
  if (creator) {
    items.push({
      id: "ga-created-group",
      actor: toSerializable(creator),
      action: "started the crew",
      timeAgo: "1w",
    });
  }

  // If a second member exists, show an "added" event
  if (group.members.length > 1) {
    const adder = resolveUser(group.creator_id);
    const addedMember = resolveGroupMember(group.members[1]);
    if (adder && addedMember.id !== adder.id) {
      items.push({
        id: "ga-added",
        actor: toSerializable(adder),
        action: `added ${addedMember.full_name.split(" ")[0]} to the crew`,
        timeAgo: "1w",
      });
    }
  }

  return items;
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
  size = 48,
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
      className="font-bold italic text-radr-text mb-4"
      style={{ fontSize: "var(--radr-text-h1)" }}
    >
      {title}<BrandDot />
    </h2>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ id: string }> };

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const group = getGroupById(id); // TODO: replace with get_group RPC when backend ready
  if (!group) notFound();

  const isMember = isCurrentUserMember(group);
  const creator = resolveUser(group.creator_id);
  const upcomingCount = group.upcoming_workouts.length;
  const activityItems = buildMockGroupActivity(group);

  return (
    <SiteShell glow="green">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK + CONTEXT ROW
            ============================================================ */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ minHeight: 48 }}
        >
          <Link
            href="/groups"
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* TODO: wire "more" menu */}
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

        {/* ============================================================
            2. COVER HERO
            ============================================================ */}
        <div className="px-6">
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              aspectRatio: "16 / 11",
              background: group.cover_gradient,
            }}
          >
            {group.cover_photo_url && (
              <img
                src={group.cover_photo_url}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Entity label — top right */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: "5px 12px",
                borderRadius: 9999,
                background: "rgba(42, 212, 114, 0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                CREW
              </span>
            </div>

            {/* Join/Joined pill — bottom right */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                padding: "10px 22px",
                borderRadius: 9999,
                background: isMember ? "rgba(42, 212, 114, 0.95)" : "rgba(255,255,255,0.95)",
                border: isMember ? "1px solid rgba(255,255,255,0.2)" : "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                cursor: "pointer",
              }}
            >
              {/* TODO: wire join/leave action */}
              <span style={{
                color: isMember ? "#fff" : "#000",
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1,
              }}>
                {isMember ? "\ud83d\udc4b Joined" : "+ Join Crew"}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. TITLE + MEMBER COUNT BLOCK
            ============================================================ */}
        <div className="px-6 pt-5">
          <h1
            className="font-bold text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            {group.name}
          </h1>

          <p
            className="mt-2 font-medium"
            style={{ fontSize: "1.125rem", color: "var(--radr-text-muted)" }}
          >
            <span className="font-semibold" style={{ color: "var(--radr-text)" }}>{group.member_count}</span> members
            {" "}&middot;{" "}
            <span className="font-semibold" style={{ color: "var(--radr-text)" }}>{upcomingCount}</span> upcoming
          </p>

          {/* Action row */}
          <div className="flex items-center gap-4 mt-4">
            {/* TODO: wire calendar sync */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Sync calendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </button>
            {/* TODO: wire share */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            {/* TODO: wire notifications */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
            {/* TODO: wire more menu */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-radr-border hover:bg-radr-surface-2 transition-colors cursor-pointer" style={{ background: "transparent" }} aria-label="More">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-radr-text-muted">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================
            4. CREATED BY ROW
            ============================================================ */}
        <div className="px-6 mt-6">
          <p className="text-sm text-radr-text-muted mb-2">Created by</p>
          <div className="flex items-center gap-3">
            {creator ? (
              <Link href={`/profile/${creator.username}`} className="no-underline text-inherit flex items-center gap-3 flex-1 min-w-0">
                <UserAvatar user={creator} size={40} />
                <div className="min-w-0">
                  <p className="font-medium text-radr-text" style={{ fontSize: "1.125rem" }}>
                    {creator.full_name}
                  </p>
                  <p className="text-sm text-radr-text-muted">
                    @{creator.username}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AvatarFallback name="Admin" seed="A" size={40} />
                <p className="font-medium text-radr-text-muted" style={{ fontSize: "1.125rem" }}>
                  Created by an admin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            5. DESCRIPTION
            ============================================================ */}
        {group.description && (
          <div className="px-6 mt-6">
            <p className="text-base text-radr-text-muted leading-relaxed whitespace-pre-line">
              {group.description}
            </p>
          </div>
        )}

        {/* ============================================================
            6. UPCOMING WORKOUTS
            ============================================================ */}
        <div className="px-6 mt-10">
          <SectionHeader title="Upcoming" />

          {upcomingCount > 0 ? (
            <>
              <p className="text-sm text-radr-text-muted -mt-2 mb-4">
                {upcomingCount} this week
              </p>
              <div className="flex flex-col gap-3">
                {group.upcoming_workouts.map((w) => (
                  <WorkoutListRow
                    key={w.id}
                    workout={w}
                    stripColor="linear-gradient(to bottom, #2AD472, #1a9e54)"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-radr-text-dim italic">
                No workouts on the books yet. Lock one in.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold no-underline transition-colors"
                style={{
                  background: "rgba(42, 212, 114, 0.15)",
                  color: "#2AD472",
                  border: "1px solid rgba(42, 212, 114, 0.25)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create workout
              </a>
            </div>
          )}
        </div>

        {/* ============================================================
            7. MEMBERS — "The Crew."
            ============================================================ */}
        <div className="px-6 mt-10">
          <SectionHeader title="The Crew" />
          <p className="text-sm text-radr-text-muted -mt-2 mb-5">
            {group.member_count} members
          </p>

          <div className="flex flex-wrap gap-4">
            {group.members.map((m) => {
              const user = resolveGroupMember(m);
              return (
                <Link
                  key={m.user_id}
                  href={`/profile/${user.username}`}
                  className="flex flex-col items-center gap-1.5 no-underline text-inherit"
                  style={{ width: 72 }}
                >
                  <UserAvatar user={user} size={44} />
                  <span className="text-xs text-radr-text-muted text-center leading-tight truncate w-full">
                    {user.full_name.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>

          <Link
            href={`/groups/${group.id}/members`}
            className="block text-sm font-medium mt-4 no-underline transition-colors"
            style={{ color: "var(--radr-green)" }}
          >
            View all {group.member_count} members &rarr;
          </Link>
        </div>

        {/* ============================================================
            8. ACTIVITY (interactive — optimistic comments)
            ============================================================ */}
        <div className="px-6 mt-10">
          <SectionHeader title="Activity" />
          <GroupActivityInteractive
            initialFeed={activityItems}
            currentUser={toSerializable(CURRENT_USER)}
            groupId={group.id}
          />
        </div>

        {/* ============================================================
            9. FOOTER SPACING
            ============================================================ */}
        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
