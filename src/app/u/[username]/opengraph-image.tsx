import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import {
  SIZE,
  CONTENT_TYPE,
  TOKENS,
  Avatar,
  BrandRow,
  truncate,
  notFoundCard,
} from "@/app/og-helpers";

export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Radr profile";
export const revalidate = 300;

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

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, total_workouts, current_streak")
    .ilike("username", username)
    .single<Profile>();

  if (!profile) return null;

  // Friendships count (accepted, requester or receiver)
  const { count: friendCount } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .eq("status", "accepted");

  return {
    profile,
    friendCount: friendCount ?? 0,
  };
}

export default async function Image({ params }: Props) {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) return notFoundCard("Profile unavailable");

  const { profile, friendCount } = data;
  const accent = TOKENS.purple;
  const accentText = TOKENS.pillText.purple;
  const displayName = profile.full_name || profile.username;
  const bioPreview = profile.bio ? truncate(profile.bio, 100) : null;
  const totalWorkouts = profile.total_workouts ?? 0;
  const streak = profile.current_streak ?? 0;

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
            alignItems: "center",
            background: TOKENS.cardBg,
          }}
        >
          <BrandRow pillLabel="PROFILE" accent="purple" />

          {/* Center: avatar + name + handle + bio */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Avatar url={profile.avatar_url} fallback={displayName} size={180} />
            <span
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -1.5,
                marginTop: 8,
              }}
            >
              {truncate(displayName, 30)}
            </span>
            <span style={{ fontSize: 28, fontWeight: 600, color: accentText }}>
              @{profile.username}
            </span>
            {bioPreview && (
              <span
                style={{
                  fontSize: 22,
                  color: "#999",
                  textAlign: "center",
                  maxWidth: 800,
                  marginTop: 4,
                }}
              >
                {bioPreview}
              </span>
            )}
          </div>

          {/* Bottom: stats + CTA */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 28,
              borderTop: `1px solid ${TOKENS.divider}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 22, color: "#aaa" }}>
              <span style={{ display: "flex" }}>
                <span style={{ color: "#fff", fontWeight: 700, marginRight: 6 }}>
                  {totalWorkouts}
                </span>
                workouts
              </span>
              <span style={{ color: "#444" }}>·</span>
              <span style={{ display: "flex" }}>
                <span style={{ color: "#fff", fontWeight: 700, marginRight: 6 }}>
                  {friendCount}
                </span>
                friends
              </span>
              {streak > 0 && (
                <>
                  <span style={{ color: "#444" }}>·</span>
                  <span style={{ display: "flex" }}>
                    <span style={{ color: "#fff", fontWeight: 700, marginRight: 6 }}>
                      {streak}
                    </span>
                    day streak
                  </span>
                </>
              )}
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
              Add on Radr
            </span>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
