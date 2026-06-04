import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "./edit-form";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url, bio")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/sign-in");

  const initial = (profile.full_name || "?").charAt(0).toUpperCase();

  return (
    <SiteShell glow="purple">
      <EditProfileForm
        fullName={profile.full_name ?? ""}
        username={profile.username ?? ""}
        bio={profile.bio ?? ""}
        avatarUrl={profile.avatar_url ?? null}
        gradientSeed={initial}
      />
    </SiteShell>
  );
}
