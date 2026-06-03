import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { createClient } from "@/lib/supabase/server";
import { FriendsContent } from "./friends-content";

// ----------------------------------------------------------------
// Types shared with the client component
// ----------------------------------------------------------------

export type FriendUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  gradient_seed: string;
};

export type IncomingRequest = {
  friendship_id: string;
  user: FriendUser;
};

export type RecommendedUser = {
  user: FriendUser;
  mutual_count: number;
};

function initial(name: string | null): string {
  return (name || "?").charAt(0).toUpperCase();
}

// ----------------------------------------------------------------
// Page (server component — fetches all data)
// ----------------------------------------------------------------

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const userId = user.id;

  // ── Round 1: parallel queries ──
  const [
    acceptedResult,
    incomingResult,
    outgoingResult,
    recsResult,
  ] = await Promise.all([
    // Accepted friendships
    supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "accepted"),

    // Incoming pending requests (I'm the receiver)
    supabase
      .from("friendships")
      .select("id, requester_id")
      .eq("receiver_id", userId)
      .eq("status", "pending"),

    // Outgoing pending requests (I'm the requester)
    supabase
      .from("friendships")
      .select("id, receiver_id")
      .eq("requester_id", userId)
      .eq("status", "pending"),

    // Discover recommendations
    supabase.rpc("get_friend_recommendations"),
  ]);

  const accepted = acceptedResult.data ?? [];
  const incoming = incomingResult.data ?? [];
  const outgoing = outgoingResult.data ?? [];
  const recsRaw = (recsResult.data ?? []) as Array<{
    id: string; username: string; full_name: string; avatar_url: string | null; mutual_count?: number;
  }>;
  // Dedupe recommendations
  const recs = recsRaw.filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);

  // ── Collect all user IDs we need profiles for ──
  const friendOtherIds = accepted.map((f: any) =>
    f.requester_id === userId ? f.receiver_id : f.requester_id,
  );
  const incomingRequesterIds = incoming.map((r: any) => r.requester_id);
  const outgoingReceiverIds = outgoing.map((r: any) => r.receiver_id);

  const allProfileIds = [...new Set([...friendOtherIds, ...incomingRequesterIds, ...outgoingReceiverIds])];

  // ── Round 2: fetch profiles ──
  let profileMap = new Map<string, FriendUser>();

  if (allProfileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", allProfileIds);

    for (const p of profiles ?? []) {
      profileMap.set(p.id, {
        id: p.id,
        full_name: p.full_name ?? "User",
        username: p.username ?? "user",
        avatar_url: p.avatar_url,
        gradient_seed: initial(p.full_name),
      });
    }
  }

  const unknownUser = (id: string): FriendUser => ({
    id,
    full_name: "User",
    username: "user",
    avatar_url: null,
    gradient_seed: "U",
  });

  // ── Build structured data ──

  // Friends list (sorted by name)
  const friends: FriendUser[] = friendOtherIds
    .map((id: string) => profileMap.get(id) ?? unknownUser(id))
    .sort((a: FriendUser, b: FriendUser) => a.full_name.localeCompare(b.full_name));

  // Incoming requests
  const incomingRequests: IncomingRequest[] = incoming.map((r: any) => ({
    friendship_id: r.id,
    user: profileMap.get(r.requester_id) ?? unknownUser(r.requester_id),
  }));

  // Outgoing request IDs (so client knows which users have pending sent requests)
  const outgoingSentToIds = new Set(outgoingReceiverIds);

  // Discover (exclude people I'm already friends with or have pending with)
  const excludeIds = new Set([
    userId,
    ...friendOtherIds,
    ...incomingRequesterIds,
    ...outgoingReceiverIds,
  ]);

  const recommendations: RecommendedUser[] = recs
    .filter((r) => !excludeIds.has(r.id))
    .map((r) => ({
      user: {
        id: r.id,
        full_name: r.full_name ?? "User",
        username: r.username ?? "user",
        avatar_url: r.avatar_url,
        gradient_seed: initial(r.full_name),
      },
      mutual_count: r.mutual_count ?? 0,
    }));

  return (
    <SiteShell glow="cobalt">
      <FriendsContent
        friends={friends}
        incomingRequests={incomingRequests}
        outgoingSentToIds={[...outgoingSentToIds]}
        recommendations={recommendations}
      />
    </SiteShell>
  );
}
