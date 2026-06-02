"use server";

import { createClient } from "@/lib/supabase/server";

export async function postComment(workoutId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ workout_id: workoutId, user_id: user.id, content })
    .select("id, created_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Fetch the user's profile for the feed item
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const initial = (profile?.full_name || "?").charAt(0).toUpperCase();

  return {
    comment: {
      id: data.id,
      actor: {
        id: user.id,
        full_name: profile?.full_name ?? "You",
        username: profile?.username ?? "you",
        avatar_url: profile?.avatar_url ?? null,
        gradient_seed: initial,
      },
      content,
      created_at: data.created_at,
    },
  };
}
