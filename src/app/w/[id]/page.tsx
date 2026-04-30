import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, avatarThumb } from "@/app/preview-styles";

type Props = { params: Promise<{ id: string }> };

type Workout = {
  id: string;
  title: string;
  start_time: string | null;
  location: string | null;
  category: string | null;
  activity_name: string | null;
  open_to_join: boolean | null;
  deleted_at: string | null;
  hidden_at: string | null;
  creator_id: string;
};

type Profile = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
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

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  const tz = "America/New_York";
  const day = d.toLocaleString("en-US", { weekday: "long", timeZone: tz }).toUpperCase();
  const month = d.toLocaleString("en-US", { month: "short", timeZone: tz }).toUpperCase();
  const date = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
  return `${day} · ${month} ${date} · ${time}`;
}

function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

async function getWorkout(id: string) {
  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "id, title, start_time, location, category, activity_name, open_to_join, deleted_at, hidden_at, creator_id",
    )
    .eq("id", id)
    .single<Workout>();

  if (!workout || workout.deleted_at || workout.hidden_at) return null;

  const { data: host } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", workout.creator_id)
    .single<Profile>();

  const { data: participantRows } = await supabase
    .from("workout_participants")
    .select("profiles:user_id(username, full_name, avatar_url), joined_at")
    .eq("workout_id", id)
    .eq("status", "accepted")
    .order("joined_at", { ascending: true });

  const goingAvatars: Profile[] = (participantRows || []).flatMap((row) => {
    const raw = (row as { profiles: Profile | Profile[] | null }).profiles;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  });

  return { workout, host, goingAvatars };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getWorkout(id);

  if (!data) {
    return {
      title: "Workout unavailable on Radr",
      description: "This workout doesn't exist or has been removed.",
    };
  }

  const { workout, host } = data;
  const hostName = host?.full_name || host?.username || "someone";
  const dateStr = workout.start_time ? formatShort(workout.start_time) : null;
  const description = ["Hosted by " + hostName, dateStr, workout.location]
    .filter(Boolean)
    .join(" · ");
  const title = `${workout.title} with ${hostName} on Radr`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/w/${id}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function AvatarImg({
  url,
  fallback,
  className,
}: {
  url?: string | null;
  fallback: string;
  className?: string;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarThumb(url, 200) || url} alt={fallback} className={className} />;
  }
  return (
    <span
      className={`${className ?? ""} avatar-fallback`}
      style={{ background: avatarGradient(fallback) }}
    >
      {(fallback || "?").charAt(0).toUpperCase()}
    </span>
  );
}

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params;
  const data = await getWorkout(id);

  if (!data) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <div className="stripe stripe-cobalt" />
        <main className="page">
          <div className="topbar">
            <span className="brand brand-cobalt">
              radr<span className="dot">.</span>
            </span>
            <span className="pill pill-cobalt">UNAVAILABLE</span>
          </div>
          <div className="not-found">
            <h1>Workout unavailable</h1>
            <p>This may have been removed or hidden.</p>
            <a href={APP_STORE_URL} className="btn btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const { workout, host, goingAvatars } = data;
  const hostName = host?.full_name || host?.username || "Someone";
  const subtitle = workout.start_time ? formatLongDate(workout.start_time) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="stripe stripe-cobalt" />
      <main className="page">
        <div className="topbar">
          <span className="brand brand-cobalt">
            radr<span className="dot">.</span>
          </span>
          <span className="pill pill-cobalt">
            {workout.open_to_join === false ? "INVITE ONLY" : "WORKOUT"}
          </span>
        </div>

        <div className="host-row">
          <AvatarImg url={host?.avatar_url} fallback={hostName} className="host-avatar" />
          <div className="host-meta">
            <span className="host-label">Hosted by</span>
            <span className="host-name">{hostName}</span>
          </div>
        </div>

        <h1 className="title">{workout.title}</h1>
        {subtitle && <p className="subtitle-accent subtitle-cobalt">{subtitle}</p>}
        {workout.location && <p className="meta-line">{workout.location}</p>}

        {goingAvatars.length > 0 && (
          <>
            <div className="divider" />
            <p className="section-label">Going</p>
            <div className="avatar-row">
              {goingAvatars.slice(0, 8).map((p, i) => {
                const name = p.full_name || p.username || "";
                const inner = (
                  <>
                    <AvatarImg url={p.avatar_url} fallback={name} />
                    {p.username && <span>@{p.username}</span>}
                  </>
                );
                return p.username ? (
                  <Link
                    key={`${p.username}-${i}`}
                    href={`/u/${p.username}`}
                    className="avatar-link"
                  >
                    {inner}
                  </Link>
                ) : (
                  <span key={i} className="avatar-link">
                    {inner}
                  </span>
                );
              })}
              {goingAvatars.length > 8 && (
                <span className="avatar-link">
                  <span
                    className="avatar-fallback"
                    style={{ background: "#1a1a1a" }}
                  >
                    +{goingAvatars.length - 8}
                  </span>
                </span>
              )}
            </div>
          </>
        )}

        <div className="cta">
          <a href={`radr://w/${id}`} className="btn btn-primary btn-cobalt">
            Open in Radr
          </a>
          <a href={APP_STORE_URL} className="btn btn-secondary">
            Download Radr
          </a>
        </div>
      </main>
    </>
  );
}
