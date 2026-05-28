"use client";

import { useState } from "react";
import Link from "next/link";
import { AvatarImg } from "@/components/avatar-img";

// ----------------------------------------------------------------
// Serializable types (cross server/client boundary)
// ----------------------------------------------------------------

export type SerializableUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  gradient_seed: string;
};

export type FeedItem = {
  id: string;
  actor: SerializableUser;
  action: string;
  timeAgo: string;
};

// ----------------------------------------------------------------
// Avatar helpers (duplicated for client component isolation)
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

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

type Props = {
  initialFeed: FeedItem[];
  currentUser: SerializableUser;
  groupId: string;
};

export function GroupActivityInteractive({ initialFeed, currentUser, groupId }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [commentText, setCommentText] = useState("");

  function handlePostComment() {
    const text = commentText.trim();
    if (!text) return;

    // TODO: wire post_comment(group_id, 'group', body) RPC
    const newItem: FeedItem = {
      id: `comment-${Date.now()}`,
      actor: currentUser,
      action: text,
      timeAgo: "just now",
    };
    setFeed((prev) => [newItem, ...prev]);
    setCommentText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  }

  return (
    <div>
      {/* Feed items */}
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
              <p className="text-sm">
                <Link href={`/profile/${item.actor.username}`} className="no-underline font-medium text-radr-text hover:underline">
                  {item.actor.full_name.split(" ")[0]}
                </Link>
                {" "}
                <span className="text-radr-text-muted">{item.action}</span>
              </p>
              <p className="text-xs text-radr-text-dim mt-0.5">
                {item.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,247,0.08)" }}>
        <UserAvatar user={currentUser} size={32} />
        <div
          className="flex-1 flex items-center rounded-full border border-radr-border px-4"
          style={{ height: 40, background: "rgba(255,255,247,0.04)" }}
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-radr-text placeholder-radr-text-dim outline-none border-none"
          />
          <button
            onClick={handlePostComment}
            disabled={!commentText.trim()}
            className="text-sm font-semibold ml-2 cursor-pointer"
            style={{
              color: commentText.trim() ? "var(--radr-green)" : "var(--radr-text-dim)",
              background: "transparent",
              border: "none",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
