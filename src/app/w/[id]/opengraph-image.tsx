import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import {
  SIZE,
  CONTENT_TYPE,
  TOKENS,
  Avatar,
  AvatarStack,
  BrandRow,
  formatDayTime,
  truncate,
  notFoundCard,
} from "@/app/og-helpers";

export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Radr workout";
export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

type Workout = {
  id: string;
  title: string;
  start_time: string | null;
  location: string | null;
  category: string | null;
  activity_name: string | null;
  deleted_at: string | null;
  hidden_at: string | null;
  creator_id: string;
};

type Profile = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

async function getWorkout(id: string) {
  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "id, title, start_time, location, category, activity_name, deleted_at, hidden_at, creator_id",
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

  return {
    workout,
    host,
    goingAvatars,
    goingCount: goingAvatars.length,
  };
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const data = await getWorkout(id);

  if (!data) return notFoundCard("Workout unavailable");

  const { workout, host, goingAvatars, goingCount } = data;
  const accent = TOKENS.cobalt;
  const accentText = TOKENS.pillText.cobalt;
  const subtitle = workout.start_time ? formatDayTime(workout.start_time) : null;
  const hostName = host?.full_name || host?.username || "Someone";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#000",
        }}
      >
        <div style={{ width: 16, background: accent }} />

        <div
          style={{
            flex: 1,
            padding: 60,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: TOKENS.cardBg,
          }}
        >
          <BrandRow pillLabel="WORKOUT" accent="cobalt" />

          {/* Middle: host + title + meta */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Avatar url={host?.avatar_url} fallback={hostName} size={80} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 22, color: "#888" }}>Hosted by</span>
                <span style={{ fontSize: 30, fontWeight: 600, color: "#fff" }}>
                  {truncate(hostName, 40)}
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.0,
                letterSpacing: -2,
              }}
            >
              {truncate(workout.title, 50)}
            </span>

            {subtitle && (
              <span style={{ fontSize: 30, fontWeight: 600, color: accentText }}>
                {subtitle}
              </span>
            )}

            {workout.location && (
              <span style={{ fontSize: 26, color: "#999" }}>
                {truncate(workout.location, 60)}
              </span>
            )}
          </div>

          {/* Bottom: going + CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 28,
              borderTop: `1px solid ${TOKENS.divider}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {goingAvatars.length > 0 && (
                <AvatarStack avatars={goingAvatars} max={4} size={48} />
              )}
              <span style={{ fontSize: 24, color: "#aaa", display: "flex" }}>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    marginRight: 6,
                  }}
                >
                  {goingCount}
                </span>
                going
              </span>
            </div>
            <span
              style={{
                padding: "14px 28px",
                background: accent,
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 999,
                display: "flex",
              }}
            >
              Join on Radr
            </span>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
