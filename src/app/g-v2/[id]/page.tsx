import { cache } from "react";
import type { Metadata } from "next";
import { AvatarImg } from "@/components/avatar-img";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/radr-calendar/id6758311100";

const AVATAR_GRADIENTS: [string, string][] = [
  ["#4a5d8f", "#2c3a5e"],
  ["#8f4a4a", "#5e2c2c"],
  ["#4a8f6f", "#2c5e4a"],
  ["#8f7a4a", "#5e4f2c"],
  ["#5b3d8f", "#3d2c5e"],
];

type GroupForDeepLink = {
  id: string;
  name: string;
  avatar_url: string | null;
  creator_id: string;
  conversation_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  member_count: number;
};

// ---------- Data fetching (cached across generateMetadata + page render) ----------

const getGroup = cache(async (id: string): Promise<GroupForDeepLink | null> => {
  const { supabase } = await import("@/lib/supabase");

  const { data, error } = await supabase.rpc("get_group_for_deep_link", {
    p_group_id: id,
  });

  if (error || !data) return null;
  const rows = data as GroupForDeepLink[];
  return rows[0] ?? null;
});

// ---------- Helpers ----------

function avatarThumb(url: string | null | undefined, size = 200): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const base = url.slice(0, i);
  const path = url.slice(i + marker.length);
  return `${base}/storage/v1/render/image/public/${path}?width=${size}&height=${size}&resize=cover`;
}

function avatarGradient(seed: string): string {
  const idx = (seed.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  const [from, to] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// ---------- Components ----------

function AvatarFallback({
  name,
  size,
  className = "",
}: {
  name: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full shrink-0 flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: avatarGradient(name),
        fontSize: size * 0.4,
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function GroupAvatar({
  url,
  name,
  size = 120,
  className = "",
}: {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const thumb = avatarThumb(url, size * 2);
  if (thumb) {
    return (
      <AvatarImg
        src={thumb}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        fallback={<AvatarFallback name={name} size={size} className={className} />}
      />
    );
  }
  return <AvatarFallback name={name} size={size} className={className} />;
}

// ---------- Metadata ----------

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const g = await getGroup(id);

  if (!g) {
    return {
      title: "Group not found — Radr",
      description: "This group doesn't exist or has been removed.",
    };
  }

  const memberLabel = g.member_count === 1 ? "member" : "members";
  const description = `Join ${g.member_count} ${memberLabel} on Radr`;

  return {
    title: `${g.name} on Radr`,
    description,
    openGraph: {
      title: g.name,
      description,
      images: [`https://getradr.app/g/${g.id}/opengraph-image`],
      url: `https://getradr.app/g/${g.id}`,
    },
    twitter: { card: "summary_large_image" },
    other: {
      "apple-itunes-app": `app-id=6758311100, app-argument=https://getradr.app/g/${g.id}`,
    },
  };
}

// ---------- Page ----------

export default async function GroupV2Page({ params }: Props) {
  const { id } = await params;
  const g = await getGroup(id);

  if (!g) {
    return (
      <main
        className="min-h-screen bg-black text-[#FFFFF7]"
        style={{ background: "#000", color: "#FFFFF7" }}
      >
        <div className="h-2 w-full bg-[#2AD472]" />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#666] mb-6">
            radr
          </p>
          <h1 className="text-4xl font-extrabold mb-3">Group not found</h1>
          <p className="text-[#888] mb-10">
            This group may have been removed or is no longer available.
          </p>
          <a
            href={APP_STORE_URL}
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#141418] border border-[#232328] text-white font-semibold text-base hover:bg-[#1c1c22] transition-colors"
          >
            Download Radr
          </a>
        </div>
      </main>
    );
  }

  const memberLabel = g.member_count === 1 ? "member" : "members";

  return (
    <main
      className="min-h-screen bg-black text-[#FFFFF7]"
      style={{ background: "#000", color: "#FFFFF7" }}
    >
      {/* Green accent stripe */}
      <div className="h-2 w-full bg-[#2AD472]" />

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 md:px-8 md:pt-12">
        {/* Brand bar */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-xl font-bold italic text-[#FFFFF7] tracking-tight">
            radr<span className="text-[#2AD472] not-italic">.</span>
          </span>
          <span className="inline-flex items-center h-7 px-3.5 rounded-full text-[11px] font-bold tracking-[0.18em] bg-[rgba(42,212,114,0.18)] text-[#5be09a]">
            GROUP
          </span>
        </div>

        {/* Group avatar — hero, centered */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full ring-4 ring-[#2AD472]/25">
            <GroupAvatar
              url={g.avatar_url}
              name={g.name}
              size={200}
              className="border-2 border-white/[0.08] md:hidden"
            />
            <GroupAvatar
              url={g.avatar_url}
              name={g.name}
              size={240}
              className="border-2 border-white/[0.08] hidden md:flex"
            />
          </div>
        </div>

        {/* Group name as magazine headline */}
        <h1
          className="font-extrabold leading-[0.95] tracking-tight text-[#FFFFF7] mb-4 break-words text-center"
          style={{ fontSize: "clamp(40px, 7vw, 72px)", letterSpacing: "-0.025em" }}
        >
          {g.name}
        </h1>

        {/* Member count */}
        <p className="text-lg font-semibold text-center mb-4">
          <span className="text-[#5be09a]">{g.member_count}</span>
          <span className="text-[#888]"> {memberLabel} on Radr</span>
        </p>

        {/* Divider */}
        <div className="h-px bg-white/[0.08] my-4" />

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <a
            href={APP_STORE_URL}
            className="flex items-center justify-center h-14 rounded-full bg-[#2AD472] text-[#06170E] font-bold text-[17px] hover:bg-[#25BC65] active:scale-[0.98] transition-all"
          >
            Open in Radr
          </a>
          <p className="text-sm text-[#666] text-center mt-2">
            Workouts and members shown in the app
          </p>
        </div>
      </div>
    </main>
  );
}
