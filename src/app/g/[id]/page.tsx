import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, avatarThumb } from "@/app/preview-styles";

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

  const { group, memberAvatars, memberCount } = data;
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

        <h1 className="title">{group.name}</h1>
        <p className="subtitle-accent subtitle-green">
          {memberCount} {memberLabel} on Radr
        </p>

        {memberAvatars.length > 0 && (
          <>
            <div className="divider" />
            <p className="section-label">Members</p>
            <div className="avatar-row">
              {memberAvatars.slice(0, 8).map((p, i) => {
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
              {memberAvatars.length > 8 && (
                <span className="avatar-link">
                  <span
                    className="avatar-fallback"
                    style={{ background: "#1a1a1a" }}
                  >
                    +{memberAvatars.length - 8}
                  </span>
                </span>
              )}
            </div>
          </>
        )}

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
