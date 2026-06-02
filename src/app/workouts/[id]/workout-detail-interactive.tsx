"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { postComment, updateRsvp, deleteWorkout } from "./actions";
import type { RSVPStatus } from "@/lib/mock-data";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

type SerializableUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
};

type SerializableParticipant = {
  user_id: string;
  status: RSVPStatus;
  user: SerializableUser;
};

type FeedItem = {
  id: string;
  type: "rsvp" | "comment" | "created" | "reaction";
  actor: SerializableUser;
  rsvp_status?: RSVPStatus;
  comment_body?: string;
  reaction_emoji?: string;
  time_label: string;
};

type SerializableComment = {
  id: string;
  parent_id: string | null;
  text: string;
  created_at: string;
  time_label: string;
  actor: SerializableUser;
};

type Props = {
  workoutId: string;
  coverUrl: string;
  coverGradient: string;
  categoryLabel: string;
  title: string;
  dateStr: string;
  host: SerializableUser;
  locationParts: string[];
  bookingUrl: string | null;
  description: string | null;
  groupChip: { id: string; name: string } | null;
  initialRsvp: RSVPStatus | null;
  initialParticipants: SerializableParticipant[];
  initialFeed: FeedItem[];
  initialComments: SerializableComment[];
  currentUser: SerializableUser;
  isOwner: boolean;
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

function rsvpActionText(status: RSVPStatus): string {
  switch (status) {
    case "going": return "rsvp\u2019d Going \uD83D\uDC4D";
    case "maybe": return "rsvp\u2019d Maybe \uD83E\uDD14";
    case "cant": return "rsvp\u2019d Can\u2019t go";
  }
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function AvatarFallback({ name, seed, size, className = "" }: { name: string; seed: string; size: number; className?: string }) {
  return (
    <span
      className={`rounded-full shrink-0 flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size, background: avatarGradient(seed), fontSize: size * 0.4 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function UserAvatar({ user, size = 48, className = "" }: { user: SerializableUser; size?: number; className?: string }) {
  if (user.avatar_url) {
    return (
      <AvatarImg
        src={user.avatar_url}
        alt={user.full_name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        fallback={<AvatarFallback name={user.full_name} seed={user.gradient_seed} size={size} className={className} />}
      />
    );
  }
  return <AvatarFallback name={user.full_name} seed={user.gradient_seed} size={size} className={className} />;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="font-bold italic text-radr-text mb-4" style={{ fontSize: "var(--radr-text-h1)" }}>
      {title}<BrandDot />
    </h2>
  );
}

// ----------------------------------------------------------------
// RSVP option config
// ----------------------------------------------------------------

const RSVP_OPTIONS: { value: RSVPStatus; emoji: string; label: string; activeColor: string; activeBg: string; activeBorder: string }[] = [
  {
    value: "going",
    emoji: "\uD83D\uDC4D",
    label: "Going",
    activeColor: "#fff",
    activeBg: "#0C5DE9",
    activeBorder: "rgba(12, 93, 233, 0.6)",
  },
  {
    value: "maybe",
    emoji: "\uD83E\uDD14",
    label: "Maybe",
    activeColor: "#F5A623",
    activeBg: "rgba(245, 166, 35, 0.15)",
    activeBorder: "rgba(245, 166, 35, 0.4)",
  },
  {
    value: "cant",
    emoji: "\uD83D\uDE22",
    label: "Can\u2019t go",
    activeColor: "rgba(255,255,247,0.5)",
    activeBg: "rgba(255,255,247,0.08)",
    activeBorder: "rgba(255,255,247,0.15)",
  },
];

// ----------------------------------------------------------------
// Main interactive component
// ----------------------------------------------------------------

export function WorkoutDetailInteractive({
  workoutId,
  coverUrl,
  coverGradient,
  categoryLabel,
  title,
  dateStr,
  host,
  locationParts,
  bookingUrl,
  description,
  initialRsvp,
  initialParticipants,
  initialFeed,
  initialComments,
  currentUser,
  isOwner,
}: Props) {
  const [myStatus, setMyStatus] = useState<RSVPStatus | null>(initialRsvp);
  const [participants, setParticipants] = useState(initialParticipants);
  const [feed, setFeed] = useState(initialFeed);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [calAdded, setCalAdded] = useState(false);
  const [bellOn, setBellOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // -- Action button handlers --
  function handleCalendar() {
    setCalAdded(true);
    setTimeout(() => setCalAdded(false), 2000);
  }
  async function handleShare() {
    setMenuOpen(false);
    const url = window.location.href;
    // Try native share sheet first, fall back to clipboard
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }
  function handleBell() {
    setBellOn((prev) => !prev);
  }

  // -- RSVP change handler (persists to Supabase) --
  async function handleRsvpChange(newStatus: RSVPStatus) {
    const clearing = newStatus === myStatus;
    const nextStatus = clearing ? null : newStatus;

    setMyStatus(nextStatus);

    // Update participants list
    setParticipants((prev) => {
      const without = prev.filter((p) => p.user_id !== currentUser.id);
      if (!nextStatus || nextStatus === "cant") return without;
      return [
        ...without,
        { user_id: currentUser.id, status: nextStatus, user: currentUser },
      ];
    });

    // Prepend feed item
    if (nextStatus && nextStatus !== "cant") {
      setFeed((prev) => {
        const withoutMyRsvp = prev.filter(
          (f) => !(f.type === "rsvp" && f.actor.id === currentUser.id && f.id.startsWith("opt-")),
        );
        return [
          {
            id: `opt-rsvp-${Date.now()}`,
            type: "rsvp" as const,
            actor: currentUser,
            rsvp_status: nextStatus,
            time_label: "just now",
          },
          ...withoutMyRsvp,
        ];
      });
    }

    // Persist to Supabase
    const result = await updateRsvp(workoutId, nextStatus);
    if (result.error) {
      setMyStatus(initialRsvp);
      setParticipants(initialParticipants);
    }
  }

  // -- Comment / Reply post handler --
  async function handlePostComment() {
    const body = commentText.trim();
    if (!body) return;

    const parentId = replyingTo?.id ?? null;
    const optimisticId = `opt-comment-${Date.now()}`;

    const optimisticComment: SerializableComment = {
      id: optimisticId,
      parent_id: parentId,
      text: body,
      created_at: new Date().toISOString(),
      time_label: "just now",
      actor: currentUser,
    };

    setComments((prev) => [...prev, optimisticComment]);

    // Also add to activity feed if top-level comment
    if (!parentId) {
      setFeed((prev) => [
        {
          id: optimisticId,
          type: "comment" as const,
          actor: currentUser,
          comment_body: body,
          time_label: "just now",
        },
        ...prev,
      ]);
    }

    setCommentText("");
    setReplyingTo(null);

    const result = await postComment(workoutId, body, parentId);
    if (result.error) {
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setFeed((prev) => prev.filter((f) => f.id !== optimisticId));
    } else if (result.comment) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === optimisticId
            ? { ...c, id: result.comment!.id }
            : c,
        ),
      );
      setFeed((prev) =>
        prev.map((f) =>
          f.id === optimisticId ? { ...f, id: `comment-${result.comment!.id}` } : f,
        ),
      );
    }
  }

  function handleReply(commentId: string, authorName: string) {
    setReplyingTo({ id: commentId, name: authorName });
    // Scroll input into view + focus
    setTimeout(() => {
      commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      commentInputRef.current?.focus();
    }, 50);
  }

  // -- Delete workout --
  async function handleDelete() {
    if (!confirm("Delete this workout? This can\u2019t be undone.")) return;
    setDeleting(true);
    await deleteWorkout(workoutId);
  }

  // Derived
  const goingParticipants = participants.filter((p) => p.status === "going");
  const maybeParticipants = participants.filter((p) => p.status === "maybe");

  // Thread comments: top-level + replies grouped
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, SerializableComment[]>();
  comments.filter((c) => c.parent_id).forEach((c) => {
    const arr = repliesByParent.get(c.parent_id!) ?? [];
    arr.push(c);
    repliesByParent.set(c.parent_id!, arr);
  });

  return (
    <>
      {/* ============================================================
          COVER HERO
          ============================================================ */}
      <div className="px-6">
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            aspectRatio: "16 / 11",
            background: coverGradient,
          }}
        >
          <img
            src={coverUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Activity label -- top right */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "rgba(12, 93, 233, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          TITLE + DATE + THREE-DOTS MENU
          ============================================================ */}
      <div className="px-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-radr-text leading-tight" style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}>
              {title}
            </h1>
            <p className="mt-2 text-radr-text-muted font-medium" style={{ fontSize: "1.125rem" }}>
              {dateStr}
            </p>
          </div>

          {/* Three-dots menu — no z-index on parent to avoid trapping the stacking context */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,247,0.06)", border: "1px solid rgba(255,255,247,0.1)" }}
              aria-label="More options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-radr-text-muted">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <>
                {/* Backdrop — catches clicks to close */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 70 }}
                  onClick={() => setMenuOpen(false)}
                />
                {/* Dropdown */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    zIndex: 80,
                    background: "#1A1A1D",
                    border: "1px solid rgba(255,255,247,0.12)",
                    borderRadius: 14,
                    minWidth: 180,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-radr-text transition-colors cursor-pointer"
                    style={{ background: "transparent", border: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,247,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    Share
                  </button>
                  {isOwner && (
                    <>
                      <div style={{ height: 1, background: "rgba(255,255,247,0.08)" }} />
                      <button
                        onClick={() => { setMenuOpen(false); handleDelete(); }}
                        disabled={deleting}
                        className="w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
                        style={{ color: "#f87171", background: "transparent", border: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        {deleting ? "Deleting\u2026" : "Delete workout"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          RSVP PICKER — three-state inline buttons (non-host only)
          ============================================================ */}
      {isOwner ? (
        <div className="px-6 mt-4">
          <div
            className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: "rgba(42, 212, 114, 0.08)",
              color: "rgba(42, 212, 114, 0.7)",
              border: "1.5px solid rgba(42, 212, 114, 0.15)",
            }}
          >
            You&rsquo;re hosting
          </div>
        </div>
      ) : (
        <div className="px-6 mt-4">
          <div className="flex gap-2">
            {RSVP_OPTIONS.map((opt) => {
              const selected = myStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleRsvpChange(opt.value)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: selected ? opt.activeBg : "rgba(255,255,247,0.04)",
                    color: selected ? opt.activeColor : "rgba(255,255,247,0.5)",
                    border: selected
                      ? `1.5px solid ${opt.activeBorder}`
                      : "1.5px solid rgba(255,255,247,0.1)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="px-6">
        <div className="flex items-center gap-4 mt-4">
          <button onClick={handleCalendar} className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer" style={{ background: calAdded ? "rgba(42,212,114,0.15)" : "transparent", borderColor: calAdded ? "#2AD472" : "var(--radr-border)" }} aria-label={calAdded ? "Added to calendar" : "Add to calendar"}>
            {calAdded ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2AD472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            )}
          </button>
          <button onClick={handleShare} className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer" style={{ background: shareCopied ? "rgba(42,212,114,0.15)" : "transparent", borderColor: shareCopied ? "#2AD472" : "var(--radr-border)" }} aria-label={shareCopied ? "Link copied" : "Share"}>
            {shareCopied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2AD472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            )}
          </button>
          <button onClick={handleBell} className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer" style={{ background: bellOn ? "rgba(12,93,233,0.15)" : "transparent", borderColor: bellOn ? "var(--radr-cobalt)" : "var(--radr-border)" }} aria-label={bellOn ? "Notifications on" : "Notifications off"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bellOn ? "var(--radr-cobalt)" : "none"} stroke={bellOn ? "var(--radr-cobalt)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={bellOn ? "" : "text-radr-text-muted"}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* HOSTED BY ROW */}
      <div className="px-6 mt-6">
        <p className="text-sm text-radr-text-muted mb-2">Hosted by</p>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${host.username}`} className="no-underline text-inherit flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <UserAvatar user={host} size={40} />
            <div className="min-w-0">
              <p className="font-medium text-radr-text" style={{ fontSize: "1.125rem" }}>{host.full_name}</p>
              <p className="text-sm text-radr-text-muted">@{host.username}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* LOCATION ROW */}
      {locationParts.length > 0 && (
        <div className="px-6 mt-5">
          <div className="flex gap-3" style={{ alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--radr-cobalt)" }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="min-w-0">
              <p className="font-medium text-radr-text">{locationParts[0]}</p>
              {locationParts.length > 1 && (
                <p className="text-sm text-radr-text-muted mt-0.5">{locationParts.slice(1).join(", ")}</p>
              )}
              {bookingUrl && (
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold mt-2 no-underline" style={{ color: "var(--radr-cobalt)" }}>
                  Book a spot &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      {description && (
        <div className="px-6 mt-6">
          <p className="text-base text-radr-text-muted leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}

      {/* WHO'S GOING */}
      <div className="px-6 mt-10">
        <SectionHeader title="Who's Going" />
        <p className="text-sm text-radr-text-muted -mt-2 mb-5">
          {goingParticipants.length} going{maybeParticipants.length > 0 ? ` \u00b7 ${maybeParticipants.length} maybe` : ""}
        </p>

        {goingParticipants.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {goingParticipants.map((p) => (
              <Link
                key={p.user_id}
                href={`/profile/${p.user.username}`}
                className="flex flex-col items-center gap-1.5 no-underline text-inherit"
                style={{ width: 72 }}
              >
                <UserAvatar user={p.user} size={44} />
                <span className="text-xs text-radr-text-muted text-center leading-tight truncate w-full">
                  {p.user.full_name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-radr-text-dim italic">
            Nobody yet &mdash; be the first to lock in.
          </p>
        )}

        {maybeParticipants.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-radr-text-dim font-medium mb-3">Maybe</p>
            <div className="flex flex-wrap gap-4">
              {maybeParticipants.map((p) => (
                <Link
                  key={p.user_id}
                  href={`/profile/${p.user.username}`}
                  className="flex flex-col items-center gap-1.5 no-underline text-inherit opacity-60"
                  style={{ width: 72 }}
                >
                  <UserAvatar user={p.user} size={44} />
                  <span className="text-xs text-radr-text-dim text-center leading-tight truncate w-full">
                    {p.user.full_name.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          ACTIVITY FEED (from get_workout_activity RPC)
          ============================================================ */}
      <div className="px-6 mt-10">
        <SectionHeader title="Activity" />

        <div className="flex flex-col">
          {feed.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-3"
              style={i > 0 ? { borderTop: "1px solid rgba(255,255,247,0.08)" } : undefined}
            >
              <Link href={`/profile/${item.actor.username}`} className="no-underline shrink-0">
                <UserAvatar user={item.actor} size={32} className="mt-0.5" />
              </Link>
              <div className="flex-1 min-w-0">
                {item.type === "comment" ? (
                  <>
                    <p className="text-sm">
                      <Link href={`/profile/${item.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                        {item.actor.full_name.split(" ")[0]}
                      </Link>
                    </p>
                    <p className="text-sm text-radr-text-muted mt-0.5">{item.comment_body}</p>
                  </>
                ) : item.type === "reaction" ? (
                  <p className="text-sm">
                    <Link href={`/profile/${item.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                      {item.actor.full_name.split(" ")[0]}
                    </Link>
                    {" "}
                    <span className="text-radr-text-muted">
                      reacted {item.reaction_emoji ?? ""}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm">
                    <Link href={`/profile/${item.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                      {item.actor.full_name.split(" ")[0]}
                    </Link>
                    {" "}
                    <span className="text-radr-text-muted">
                      {item.type === "rsvp" && item.rsvp_status
                        ? rsvpActionText(item.rsvp_status)
                        : "created this workout"}
                    </span>
                  </p>
                )}
                <p className="text-xs text-radr-text-dim mt-0.5">{item.time_label}</p>
              </div>
            </div>
          ))}

          {feed.length === 0 && (
            <p className="text-sm text-radr-text-dim italic py-3">No activity yet.</p>
          )}
        </div>
      </div>

      {/* ============================================================
          THREADED COMMENTS (from workout_comments table)
          ============================================================ */}
      <div className="px-6 mt-10">
        <SectionHeader title="Comments" />

        {topLevelComments.length === 0 && (
          <p className="text-sm text-radr-text-dim italic mb-4">
            No comments yet &mdash; be the first.
          </p>
        )}

        <div className="flex flex-col">
          {topLevelComments.map((comment, i) => {
            const replies = repliesByParent.get(comment.id) ?? [];
            return (
              <div key={comment.id}>
                {/* Top-level comment */}
                <div
                  className="flex items-start gap-3 py-3"
                  style={i > 0 ? { borderTop: "1px solid rgba(255,255,247,0.08)" } : undefined}
                >
                  <Link href={`/profile/${comment.actor.username}`} className="no-underline shrink-0">
                    <UserAvatar user={comment.actor} size={32} className="mt-0.5" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link href={`/profile/${comment.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                        {comment.actor.full_name.split(" ")[0]}
                      </Link>
                    </p>
                    <p className="text-sm text-radr-text-muted mt-0.5">{comment.text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-radr-text-dim">{comment.time_label}</span>
                      <button
                        onClick={() => handleReply(comment.id, comment.actor.full_name.split(" ")[0])}
                        className="text-xs font-medium cursor-pointer"
                        style={{ color: "var(--radr-cobalt)", background: "transparent", border: "none", padding: 0 }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="flex items-start gap-3 py-2.5 ml-11"
                    style={{ borderTop: "1px solid rgba(255,255,247,0.04)" }}
                  >
                    <Link href={`/profile/${reply.actor.username}`} className="no-underline shrink-0">
                      <UserAvatar user={reply.actor} size={24} className="mt-0.5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <Link href={`/profile/${reply.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                          {reply.actor.full_name.split(" ")[0]}
                        </Link>
                      </p>
                      <p className="text-xs text-radr-text-muted mt-0.5">{reply.text}</p>
                      <span className="text-xs text-radr-text-dim mt-0.5 inline-block">{reply.time_label}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Comment composer */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,247,0.08)" }}>
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-radr-text-dim">
                Replying to <span className="text-radr-text-muted font-medium">{replyingTo.name}</span>
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-xs cursor-pointer"
                style={{ color: "var(--radr-cobalt)", background: "transparent", border: "none", padding: 0 }}
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <UserAvatar user={currentUser} size={32} />
            <div
              className="flex-1 flex items-center rounded-full border border-radr-border px-4"
              style={{ height: 40, background: "rgba(255,255,247,0.04)" }}
            >
              <input
                ref={commentInputRef}
                type="text"
                placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Add a comment..."}
                className="flex-1 bg-transparent text-sm text-radr-text placeholder-radr-text-dim outline-none border-none"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
              />
              <button
                className="text-sm font-semibold ml-2 cursor-pointer"
                style={{
                  color: commentText.trim() ? "var(--radr-cobalt)" : "rgba(255,255,247,0.2)",
                  background: "transparent",
                  border: "none",
                }}
                disabled={!commentText.trim()}
                onClick={handlePostComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SPACING */}
      <div style={{ height: 80 }} />
    </>
  );
}
