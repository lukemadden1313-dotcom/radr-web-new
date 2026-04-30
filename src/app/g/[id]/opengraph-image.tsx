import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import {
  SIZE,
  CONTENT_TYPE,
  TOKENS,
  AvatarStack,
  BrandRow,
  truncate,
  notFoundCard,
} from "@/app/og-helpers";

export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Radr group";
export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

type Group = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type MemberProfile = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

async function getGroup(id: string) {
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, avatar_url")
    .eq("id", id)
    .single<Group>();

  if (!group) return null;

  const { data: memberRows, count } = await supabase
    .from("group_members")
    .select("profiles:user_id(username, full_name, avatar_url), joined_at", {
      count: "exact",
    })
    .eq("group_id", id)
    .order("joined_at", { ascending: true });

  const memberAvatars: MemberProfile[] = (memberRows || []).flatMap((row) => {
    const raw = (row as { profiles: MemberProfile | MemberProfile[] | null }).profiles;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  });

  return {
    group,
    memberAvatars,
    memberCount: count ?? memberAvatars.length,
  };
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const data = await getGroup(id);

  if (!data) return notFoundCard("Group unavailable");

  const { group, memberAvatars, memberCount } = data;
  const accent = TOKENS.green;
  const accentText = TOKENS.pillText.green;
  const memberLabel = memberCount === 1 ? "member" : "members";

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
          <BrandRow pillLabel="GROUP" accent="green" />

          {/* Title + subtitle */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span
              style={{
                fontSize: 96,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.0,
                letterSpacing: -2,
              }}
            >
              {truncate(group.name, 40)}
            </span>
            <span style={{ fontSize: 32, fontWeight: 600, color: accentText, display: "flex" }}>
              <span style={{ color: "#fff", fontWeight: 700, marginRight: 8 }}>
                {memberCount}
              </span>
              {memberLabel} on Radr
            </span>
          </div>

          {/* Bottom: members + CTA */}
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
              {memberAvatars.length > 0 ? (
                <AvatarStack avatars={memberAvatars} max={4} size={48} />
              ) : (
                <span style={{ fontSize: 22, color: "#666", display: "flex" }}>
                  Be the first to join
                </span>
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
              Join Group
            </span>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
