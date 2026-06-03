"use server";

import { createClient } from "@/lib/supabase/server";

// ----------------------------------------------------------------
// Send friend request (insert pending row)
// ----------------------------------------------------------------

export async function sendFriendRequest(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Build user_pair (lexicographically sorted) for unique constraint
  const pair = [user.id, receiverId].sort().join("_");

  const { error } = await supabase
    .from("friendships")
    .insert({
      requester_id: user.id,
      receiver_id: receiverId,
      status: "pending",
      user_pair: pair,
    });

  if (error) return { error: error.message };
  return { ok: true };
}

// ----------------------------------------------------------------
// Accept friend request (update pending → accepted)
// ----------------------------------------------------------------

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { ok: true };
}

// ----------------------------------------------------------------
// Decline friend request (delete the pending row)
// ----------------------------------------------------------------

export async function declineFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { ok: true };
}
