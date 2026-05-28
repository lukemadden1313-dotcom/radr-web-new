"use client";

// TODO: All friend actions (add/accept/decline) are LOCAL ONLY — optimistic state
// resets on reload. Wire to RPCs when backend ready.

import { useState } from "react";
import Link from "next/link";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import {
  getIncomingFriendRequests,
  getSuggestedUsers,
  getFriendStatus,
  searchUsers,
  MOCK_FRIENDS,
} from "@/lib/mock-data";
import type {
  MockUser,
  FriendStatus,
} from "@/lib/mock-data";

// ----------------------------------------------------------------
// Avatar helpers (same pattern as dashboard/workouts/etc.)
// ----------------------------------------------------------------

const AVATAR_GRADIENTS: [string, string][] = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#fccb90", "#d57eeb"],
  ["#e0c3fc", "#8ec5fc"],
];

function avatarGradient(seed: string): string {
  const idx = (seed.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  const [from, to] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

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
  size = 44,
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

// ----------------------------------------------------------------
// Small components
// ----------------------------------------------------------------

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <h2 className="text-xl font-bold leading-tight">
      <span className="italic">{title}</span>
      <BrandDot color="cobalt" />
      {count !== undefined && count > 0 && (
        <span className="ml-2 text-sm font-normal text-radr-text-muted">
          ({count})
        </span>
      )}
    </h2>
  );
}

function MutualAvatarStack({
  avatars,
  count,
}: {
  avatars: MockUser[];
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="flex -space-x-1.5">
        {avatars.slice(0, 3).map((u) => (
          <UserAvatar
            key={u.id}
            user={u}
            size={20}
            className="border border-radr-bg"
          />
        ))}
      </div>
      <span className="text-xs text-radr-text-muted">
        {count} mutual friend{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function ActionButton({
  status,
  onAdd,
}: {
  status: FriendStatus | "requested";
  onAdd?: () => void;
}) {
  if (status === "friends") {
    return (
      <span className="flex items-center gap-1 text-sm text-radr-text-muted">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--radr-cobalt)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Friends
      </span>
    );
  }
  if (status === "request_sent" || status === "requested") {
    return (
      <span
        className="inline-flex items-center gap-1 py-1.5 px-3.5 rounded-full text-sm font-semibold"
        style={{
          background: "var(--radr-surface-2)",
          color: "var(--radr-text-muted)",
        }}
      >
        {status === "requested" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {status === "requested" ? "Requested" : "Pending"}
      </span>
    );
  }
  return (
    <button
      onClick={onAdd}
      className="inline-flex items-center py-1.5 px-3.5 rounded-full text-sm font-semibold text-white cursor-pointer transition-transform active:scale-95"
      style={{ background: "var(--radr-cobalt)", border: "none" }}
    >
      + Add
    </button>
  );
}

function Divider() {
  return (
    <div
      className="h-px ml-14"
      style={{ background: "var(--radr-border)" }}
    />
  );
}

// ----------------------------------------------------------------
// Main content
// ----------------------------------------------------------------

export function FriendsContent() {
  const [search, setSearch] = useState("");
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());
  const [dismissedRequestIds, setDismissedRequestIds] = useState<Set<string>>(new Set());

  const hasSearch = search.trim().length > 0;
  const searchResults = hasSearch ? searchUsers(search) : [];
  const allIncomingRequests = getIncomingFriendRequests();
  const visibleRequests = allIncomingRequests.filter((r) => !dismissedRequestIds.has(r.id));
  const suggestedUsers = getSuggestedUsers();
  const friends = MOCK_FRIENDS;

  function handleAdd(userId: string) {
    // TODO: wire send_friend_request RPC
    setAddedUserIds((prev) => new Set(prev).add(userId));
  }

  function handleAccept(requestId: string) {
    // TODO: wire accept_friend_request RPC
    setDismissedRequestIds((prev) => new Set(prev).add(requestId));
  }

  function handleDecline(requestId: string) {
    // TODO: wire decline_friend_request RPC
    setDismissedRequestIds((prev) => new Set(prev).add(requestId));
  }

  function resolveStatus(userId: string): FriendStatus | "requested" {
    if (addedUserIds.has(userId)) return "requested";
    return getFriendStatus(userId);
  }

  return (
    <div className="pb-20">
      {/* Page header */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          <span className="italic">Find friends</span>
          <BrandDot color="cobalt" />
        </h1>
        <p className="text-base text-radr-text-muted mt-2">
          Search for your crew or discover new people.
        </p>
      </div>

      {/* Search input */}
      <div className="max-w-2xl mx-auto px-6 mt-5">
        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-radr-text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username"
            className="w-full py-3 px-4 pl-11 rounded-full text-base text-radr-text placeholder:text-radr-text-muted outline-none transition-shadow focus:ring-2 focus:ring-radr-cobalt/40"
            style={{
              background: "var(--radr-surface-1)",
              border: "1px solid var(--radr-border)",
            }}
          />
          {hasSearch && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-radr-text-muted hover:text-radr-text cursor-pointer"
              style={{ background: "none", border: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search results mode */}
      {hasSearch ? (
        <div className="max-w-2xl mx-auto px-6 mt-6">
          <SectionHeader title="Results" />
          {searchResults.length === 0 ? (
            <p className="text-center text-radr-text-muted italic mt-8">
              No one matches &lsquo;{search}&rsquo;.
            </p>
          ) : (
            <div className="mt-3">
              {searchResults.map((user, i) => {
                const status = resolveStatus(user.id);
                return (
                  <div key={user.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-3 py-3">
                      <Link href={`/profile/${user.username}`} className="shrink-0">
                        <UserAvatar user={user} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-radr-text truncate">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-radr-text-muted truncate">
                          @{user.username}
                        </p>
                      </div>
                      <ActionButton
                        status={status}
                        onAdd={() => handleAdd(user.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Friend requests section */}
          {visibleRequests.length > 0 && (
            <div className="max-w-2xl mx-auto px-6 mt-6">
              <SectionHeader
                title="Friend requests"
                count={visibleRequests.length}
              />
              <div className="mt-3">
                {visibleRequests.map((req, i) => (
                  <div key={req.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-3 py-3">
                      <Link href={`/profile/${req.user.username}`} className="shrink-0">
                        <UserAvatar user={req.user} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-radr-text truncate">
                          {req.user.full_name}
                        </p>
                        <p className="text-sm text-radr-text-muted truncate">
                          @{req.user.username}
                        </p>
                        {req.mutual_friends_count > 0 && (
                          <p className="text-xs text-radr-text-muted mt-0.5">
                            {req.mutual_friends_count} mutual friend
                            {req.mutual_friends_count !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="py-1.5 px-3 rounded-full text-sm font-semibold text-white cursor-pointer transition-transform active:scale-95"
                          style={{
                            background: "var(--radr-cobalt)",
                            border: "none",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="py-1.5 px-3 rounded-full text-sm font-semibold cursor-pointer transition-transform active:scale-95"
                          style={{
                            background: "var(--radr-surface-2)",
                            color: "var(--radr-text)",
                            border: "none",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discover section */}
          <div className="max-w-2xl mx-auto px-6 mt-8">
            <SectionHeader
              title="Discover"
              count={suggestedUsers.length}
            />
            <p className="text-sm text-radr-text-muted mt-1">
              People in your network
            </p>
            {suggestedUsers.length === 0 ? (
              <p className="text-center text-radr-text-muted italic mt-8">
                No one new to suggest right now.
              </p>
            ) : (
              <div className="mt-3">
                {suggestedUsers.map((s, i) => {
                  const status = resolveStatus(s.user.id);
                  return (
                    <div key={s.user.id}>
                      {i > 0 && <Divider />}
                      <div className="flex items-center gap-3 py-3">
                        <Link href={`/profile/${s.user.username}`} className="shrink-0">
                          <UserAvatar user={s.user} />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-radr-text truncate">
                            {s.user.full_name}
                          </p>
                          <p className="text-sm text-radr-text-muted truncate">
                            @{s.user.username}
                          </p>
                          <MutualAvatarStack
                            avatars={s.mutual_friend_avatars}
                            count={s.mutual_friends_count}
                          />
                        </div>
                        <ActionButton
                          status={status}
                          onAdd={() => handleAdd(s.user.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Your friends section */}
          {friends.length > 0 && (
            <div className="max-w-2xl mx-auto px-6 mt-8">
              <SectionHeader title="Your friends" count={friends.length} />
              <div className="mt-3">
                {friends.slice(0, 20).map((friend, i) => (
                  <div key={friend.id}>
                    {i > 0 && <Divider />}
                    <div className="flex items-center gap-3 py-3">
                      <Link href={`/profile/${friend.username}`} className="shrink-0">
                        <UserAvatar user={friend} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-radr-text truncate">
                          {friend.full_name}
                        </p>
                        <p className="text-sm text-radr-text-muted truncate">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
