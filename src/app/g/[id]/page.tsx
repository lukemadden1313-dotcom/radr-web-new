import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, avatarThumb } from "@/app/preview-styles";

type Props = { params: Promise<{ id: string }> };

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

async function getGroup(id: string) {
  // RLS on `groups` blocks anon table reads, so route through the
  // SECURITY DEFINER RPC. The RPC does not return the members list
  // (group_members RLS is preserved); we render without per-member
  // avatars on the public card.
  const { data, error } = await supabase.rpc("get_group_for_deep_link", {
    p_group_id: id,
  });

  if (error || !data) return null;
  const rows = data as GroupForDeepLink[];
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    group: {
      id: row.id,
      name: row.name,
      avatar_url: row.avatar_url,
    },
    memberCount: row.member_count,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getGroup(id);

  if (!data) {
    return {
      title: "Group unavailable on Radr",
      description: "This group doesn't exist or has been removed.",
    };
  }

  const { group, memberCount } = data;
  const memberLabel = memberCount === 1 ? "member" : "members";
  const description = `${memberCount} ${memberLabel} on Radr`;
  const title = `${group.name} on Radr`;

  return {
    title,
    description,
    openGraph: { title, description, url: `/g/${id}`, type: "website" },
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

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const data = await getGroup(id);

  if (!data) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <div className="stripe stripe-green" />
        <main className="page">
          <div className="topbar">
            <span className="brand brand-green">
              radr<span className="dot">.</span>
            </span>
            <span className="pill pill-green">UNAVAILABLE</span>
          </div>
          <div className="not-found">
            <h1>Group unavailable</h1>
            <p>This may have been removed or hidden.</p>
            <a href={APP_STORE_URL} className="btn btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const { group, memberCount } = data;
  const memberLabel = memberCount === 1 ? "member" : "members";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="stripe stripe-green" />
      <main className="page">
        <div className="topbar">
          <span className="brand brand-green">
            radr<span className="dot">.</span>
          </span>
          <span className="pill pill-green">GROUP</span>
        </div>

        <div className="host-row">
          <AvatarImg
            url={group.avatar_url}
            fallback={group.name}
            className="host-avatar"
          />
          <div className="host-meta">
            <span className="host-label">Group</span>
            <span className="host-name">{group.name}</span>
          </div>
        </div>

        <h1 className="title">{group.name}</h1>
        <p className="subtitle-accent subtitle-green">
          {memberCount} {memberLabel} on Radr
        </p>

        <div className="cta">
          <a href={`radr://g/${id}`} className="btn btn-primary btn-green">
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
