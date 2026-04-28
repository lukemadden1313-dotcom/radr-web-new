import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, FALLBACK_IMAGE } from "@/app/preview-styles";

type Props = {
  params: Promise<{ username: string }>;
};

async function getProfile(username: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("username", username)
    .single();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return {
      title: "User not found — Radr",
      description: "This profile doesn't exist or has been removed.",
    };
  }

  const image = profile.avatar_url || FALLBACK_IMAGE;

  return {
    title: `${profile.full_name} (@${profile.username}) on Radr`,
    description: "Connect and share workouts on Radr",
    openGraph: {
      title: `${profile.full_name} (@${profile.username}) on Radr`,
      description: "Connect and share workouts on Radr",
      url: `https://getradr.app/u/${profile.username}`,
      images: [{ url: image }],
      type: "website",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <div className="container">
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
          <p className="not-found">User not found</p>
          <div className="buttons">
            <a href={APP_STORE_URL} className="btn-primary">Download Radr</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="container">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="avatar" />
        ) : (
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
        )}
        <h1>{profile.full_name}</h1>
        <p className="subtitle">@{profile.username}</p>
        <div className="buttons">
          <a href={`radr://u/${profile.username}`} className="btn-primary">View Profile on Radr</a>
          <a href={APP_STORE_URL} className="btn-secondary">Download Radr</a>
        </div>
      </div>
    </>
  );
}
