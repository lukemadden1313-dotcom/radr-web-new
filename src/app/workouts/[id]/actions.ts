"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ----------------------------------------------------------------
// Comments (workout_comments table — text column, nullable parent_id)
// ----------------------------------------------------------------

export async function postComment(
  workoutId: string,
  text: string,
  parentId?: string | null,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const row: Record<string, unknown> = {
    workout_id: workoutId,
    user_id: user.id,
    text,
  };
  if (parentId) row.parent_id = parentId;

  const { data, error } = await supabase
    .from("workout_comments")
    .insert(row)
    .select("id, created_at")
    .single();

  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const initial = (profile?.full_name || "?").charAt(0).toUpperCase();

  return {
    comment: {
      id: data.id,
      parent_id: parentId ?? null,
      text,
      created_at: data.created_at,
      actor: {
        id: user.id,
        full_name: profile?.full_name ?? "You",
        username: profile?.username ?? "you",
        avatar_url: profile?.avatar_url ?? null,
        gradient_seed: initial,
      },
    },
  };
}

// ----------------------------------------------------------------
// RSVP (workout_participants — status column: going/maybe/cant)
// ----------------------------------------------------------------

export async function updateRsvp(workoutId: string, status: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!status) {
    // Clear RSVP — remove from participants
    const { error } = await supabase
      .from("workout_participants")
      .delete()
      .eq("workout_id", workoutId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { ok: true };
  }

  // Map web status values to DB values (iOS uses "accepted"/"declined")
  const dbStatus = status === "cant" ? "declined" : status === "going" ? "accepted" : status;

  // Upsert the RSVP with the new status value
  const { error } = await supabase
    .from("workout_participants")
    .upsert(
      { workout_id: workoutId, user_id: user.id, status: dbStatus },
      { onConflict: "workout_id,user_id" },
    );

  if (error) return { error: error.message };
  return { ok: true };
}

// ----------------------------------------------------------------
// Delete workout (owner only)
// ----------------------------------------------------------------

export async function deleteWorkout(workoutId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: workout } = await supabase
    .from("workouts")
    .select("creator_id")
    .eq("id", workoutId)
    .single();

  if (!workout || workout.creator_id !== user.id) {
    return { error: "Not the workout owner" };
  }

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId);

  if (error) return { error: error.message };

  redirect("/dashboard");
}
