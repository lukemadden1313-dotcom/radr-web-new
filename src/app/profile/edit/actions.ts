"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(fields: {
  full_name: string;
  username: string;
  bio: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const username = fields.username.toLowerCase().replace(/\s/g, "").trim();
  if (!username) return { error: "Username cannot be empty" };
  if (!fields.full_name.trim()) return { error: "Name cannot be empty" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fields.full_name.trim(),
      username,
      bio: fields.bio.trim() || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { ok: true, username };
}
