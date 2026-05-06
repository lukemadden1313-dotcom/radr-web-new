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
export const alt = "Radr group";
export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

type GroupForDeepLink = {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
};

async function getGroup(id: string) {
  // RLS on `groups` blocks anon table reads, so route through the
  // SECURITY DEFINER RPC. Members list isn't returned (group_members RLS
  // is preserved), so we render the OG image with the group avatar +
  // member count instead of a per-member avatar stack.
  const { data, error } = await supabase.rpc("get_group_for_deep_link", {
    p_group_id: id,
  });

  if (error || !data) return null;
  const rows = data as GroupForDeepLink[];
  if (rows.length === 0) return null;

  return rows[0];
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const group = await getGroup(id);

  if (!group) return notFoundCard("Group unavailable");

  const accent = TOKENS.green;
  const accentText = TOKENS.pillText.green;
  const memberLabel = group.member_count === 1 ? "member" : "members";

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

          {/* Group avatar + name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Avatar url={group.avatar_url} fallback={group.name} size={96} />
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.0,
                  letterSpacing: -2,
                }}
              >
                {truncate(group.name, 32)}
              </span>
            </div>
            <span style={{ fontSize: 32, fontWeight: 600, color: accentText, display: "flex" }}>
              <span style={{ color: "#fff", fontWeight: 700, marginRight: 8 }}>
                {group.member_count}
              </span>
              {memberLabel} on Radr
            </span>
          </div>

          {/* Bottom: CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 28,
              borderTop: `1px solid ${TOKENS.divider}`,
            }}
          >
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
