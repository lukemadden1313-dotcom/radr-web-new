import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, avatarThumb } from "@/app/preview-styles";

type Props = { params: Promise<{ username: string }> };

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_workouts: number | null;
  current_streak: number | null;
};

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

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, total_workouts, current_streak")
    .ilike("username", username)
    .single<Profile>();

  if (!profile) return null;

  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .eq("status", "accepted");

  return { profile, friendCount: count ?? 0 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    return {
      title: "Profile unavailable on Radr",
      description: "This profile doesn't exist or has been removed.",
    };
  }

  const { profile, friendCount } = data;
  const displayName = profile.full_name || profile.username;
  const title = `${displayName} (@${profile.username}) on Radr`;
  const totalWorkouts = profile.total_workouts ?? 0;
  const description =
    profile.bio || `${totalWorkouts} workouts · ${friendCount} friends on Radr`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/u/${profile.username}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <div className="stripe stripe-purple" />
        <main className="page">
          <div className="topbar">
            <span className="brand brand-purple">
              radr<span className="dot">.</span>
            </span>
            <span className="pill pill-purple">UNAVAILABLE</span>
          </div>
          <div className="not-found">
            <h1>Profile unavailable</h1>
            <p>This may have been removed or hidden.</p>
            <a href={APP_STORE_URL} className="btn btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const { profile, friendCount } = data;
  const displayName = profile.full_name || profile.username;
  const totalWorkouts = profile.total_workouts ?? 0;
  const streak = profile.current_streak ?? 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="stripe stripe-purple" />
      <main className="page">
        <div className="topbar">
          <span className="brand brand-purple">
            radr<span className="dot">.</span>
          </span>
          <span className="pill pill-purple">PROFILE</span>
        </div>

        <div className="profile-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarThumb(profile.avatar_url, 400) || profile.avatar_url}
              alt={displayName}
              className="profile-avatar"
            />
          ) : (
            <span
              className="profile-avatar fallback"
              style={{ background: avatarGradient(displayName) }}
            >
              {(displayName || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-handle subtitle-purple">@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="stats-row">
            <span>
              <strong>{totalWorkouts}</strong>workouts
            </span>
            <span>
              <strong>{friendCount}</strong>friends
            </span>
            {streak > 0 && (
              <span>
                <strong>{streak}</strong>day streak
              </span>
            )}
          </div>
        </div>

        <div className="cta">
          <a
            href={`radr://u/${profile.username}`}
            className="btn btn-primary btn-purple"
          >
            Add on Radr
          </a>
          <a href={APP_STORE_URL} className="btn btn-secondary">
            Download Radr
          </a>
        </div>
      </main>
    </>
  );
}
