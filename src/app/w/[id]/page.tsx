import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles } from "@/app/preview-styles";

type Props = {
  params: Promise<{ id: string }>;
};

const APP_STORE_URL =
  "https://apps.apple.com/us/app/radr-calendar/id6758311100";
const FALLBACK_AVATAR = "/assets/images/Radr icon.png";
const LOGO_URL = "/assets/images/Radr blue logotype.png";

type CategoryStyle = { color: string; icon: string };

function getCategoryStyle(category: string | null | undefined): CategoryStyle {
  const c = (category || "").toLowerCase();
  if (/run|track/.test(c)) return { color: "#F05A5A", icon: "🏃" };
  if (/yoga|pilates|barre/.test(c)) return { color: "#9A5AF0", icon: "🧘" };
  if (/hiit|hyrox|crossfit/.test(c)) return { color: "#F0A040", icon: "⚡" };
  if (/cycle/.test(c)) return { color: "#2AD4D4", icon: "🚴" };
  if (/strength|core/.test(c)) return { color: "#0C5DE9", icon: "🏋️" };
  if (/swim/.test(c)) return { color: "#2AD472", icon: "🏊" };
  if (/hike|climb/.test(c)) return { color: "#2AD472", icon: "🥾" };
  if (/box|martial/.test(c)) return { color: "#F05AA0", icon: "🥊" };
  return { color: "#0C5DE9", icon: "⚡" };
}

function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

function formatEastern(dateStr: string) {
  const date = new Date(dateStr);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const weekday = get("weekday").toUpperCase();
  const month = get("month").toUpperCase();
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toUpperCase();
  return `${weekday} · ${month} ${day} · ${hour}:${minute} ${dayPeriod}`;
}

function formatShortEastern(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

type Profile = {
  id?: string;
  username: string | null;
  full_name?: string | null;
  avatar_url: string | null;
};

type Workout = {
  id: string;
  title: string;
  location: string | null;
  start_time: string | null;
  duration: number | null;
  category: string | null;
  open_to_join: boolean | null;
  creator_id: string;
};

type Participant = {
  user_id: string;
  status: string;
  profiles: Profile | null;
};

async function getWorkout(id: string) {
  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "id, title, location, start_time, duration, category, open_to_join, creator_id",
    )
    .eq("id", id)
    .single<Workout>();

  if (!workout) return null;

  const { data: creator } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", workout.creator_id)
    .single<Profile>();

  const { data: participantRows } = await supabase
    .from("workout_participants")
    .select("user_id, status, profiles:user_id(username, avatar_url)")
    .eq("workout_id", id)
    .eq("status", "accepted")
    .limit(5);

  const participants: Participant[] = (participantRows || []).map((row) => {
    const raw = (row as { profiles: Profile | Profile[] | null }).profiles;
    const profile = Array.isArray(raw) ? raw[0] ?? null : raw;
    return {
      user_id: (row as { user_id: string }).user_id,
      status: (row as { status: string }).status,
      profiles: profile,
    };
  });

  return { workout, creator, participants };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getWorkout(id);

  if (!data) {
    return {
      title: "Workout not found — Radr",
      description: "This workout doesn't exist or has been removed.",
    };
  }

  const { workout, creator } = data;
  const hostName = creator?.full_name || creator?.username || "someone";
  const image = creator?.avatar_url || FALLBACK_AVATAR;
  const dateStr = workout.start_time ? formatShortEastern(workout.start_time) : null;
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

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params;
  const data = await getWorkout(id);

  if (!data) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <main className="page">
          <div className="topbar">
            <img src={LOGO_URL} alt="Radr" className="logo" />
          </div>
          <div className="not-found">
            <p>Workout not found</p>
            <a href={APP_STORE_URL} className="btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const { workout, creator, participants } = data;
  const hostName = creator?.full_name || creator?.username || "someone";
  const cat = getCategoryStyle(workout.category);
  const titleLength = workout.title.length;
  const titleScaleClass =
    titleLength > 40 ? "title sm" : titleLength > 24 ? "title md" : "title";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <main className="page">
        <div className="topbar">
          <img src={LOGO_URL} alt="Radr" className="logo" />
          {workout.open_to_join === false && (
            <span className="pill">INVITE ONLY</span>
          )}
        </div>

      <div
        className="hero"
        style={{
          backgroundColor: hexWithAlpha(cat.color, 0.15),
          borderColor: hexWithAlpha(cat.color, 0.35),
        }}
      >
        <span className="hero-icon" aria-hidden>
          {cat.icon}
        </span>
      </div>

      {workout.start_time && (
        <p className="date">{formatEastern(workout.start_time)}</p>
      )}

      <h1 className={titleScaleClass}>{workout.title}</h1>

      {workout.location && <p className="location">{workout.location}</p>}

      <div className="row hosted-by">
        <img
          src={creator?.avatar_url || FALLBACK_AVATAR}
          alt={hostName}
          className="host-avatar"
        />
        <div className="host-meta">
          <span className="host-label">HOSTED BY</span>
          <span className="host-name">{hostName}</span>
        </div>
      </div>

      {participants.length > 0 && (
        <div className="row going">
          <div className="avatar-stack">
            {participants.slice(0, 5).map((p, i) => (
              <img
                key={p.user_id}
                src={p.profiles?.avatar_url || FALLBACK_AVATAR}
                alt={p.profiles?.username || "Participant"}
                className="going-avatar"
                style={{ marginLeft: i === 0 ? 0 : -18, zIndex: 5 - i }}
              />
            ))}
          </div>
          <span className="going-label">{participants.length} going</span>
        </div>
      )}

        <div className="cta">
          <a href={`radr://w/${id}`} className="btn-primary">
            Join on Radr
          </a>
          <a href={APP_STORE_URL} className="btn-secondary">
            Download Radr
          </a>
        </div>
      </main>
    </>
  );
}
