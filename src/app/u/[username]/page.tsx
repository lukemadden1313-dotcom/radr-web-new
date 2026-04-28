import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, FALLBACK_IMAGE } from "@/app/preview-styles";

type Props = {
  params: Promise<{ username: string }>;
};

const LOGO_URL = "/assets/images/Radr blue logotype.png";

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

  const displayName = profile.full_name || profile.username;
  const image = profile.avatar_url || FALLBACK_IMAGE;
  const title = `${displayName} (@${profile.username}) on Radr`;
  const description = "Connect and share workouts on Radr";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/u/${profile.username}`,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
        <main className="page">
          <div className="topbar">
            <img src={LOGO_URL} alt="Radr" className="logo" />
          </div>
          <div className="not-found">
            <p>User not found</p>
            <a href={APP_STORE_URL} className="btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const displayName = profile.full_name || profile.username;
  const nameLength = displayName.length;
  const titleScaleClass =
    nameLength > 24 ? "title sm" : nameLength > 16 ? "title md" : "title";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <main className="page">
        <div className="topbar">
          <img src={LOGO_URL} alt="Radr" className="logo" />
        </div>

        <img
          src={profile.avatar_url || FALLBACK_IMAGE}
          alt={displayName}
          className="hero-avatar"
        />

        <h1 className={titleScaleClass}>{displayName}</h1>
        <p className="location">@{profile.username}</p>

        <div className="cta">
          <a href={`radr://u/${profile.username}`} className="btn-primary">
            View Profile on Radr
          </a>
          <a href={APP_STORE_URL} className="btn-secondary">
            Download Radr
          </a>
        </div>
      </main>
    </>
  );
}
