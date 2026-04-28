import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, FALLBACK_IMAGE } from "@/app/preview-styles";

type Props = {
  params: Promise<{ id: string }>;
};

const LOGO_URL = "/assets/images/Radr blue logotype.png";
const GROUP_TINT = "#0C5DE9";

function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

async function getGroup(id: string) {
  const { data } = await supabase
    .from("groups")
    .select("id, name, cover_image_url, member_count")
    .eq("id", id)
    .single();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const group = await getGroup(id);

  if (!group) {
    return {
      title: "Group not found — Radr",
      description: "This group doesn't exist or has been removed.",
    };
  }

  const image = group.cover_image_url || FALLBACK_IMAGE;
  const description =
    group.member_count != null ? `${group.member_count} members on Radr` : "Group on Radr";
  const title = `${group.name} on Radr`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/g/${id}`,
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

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const group = await getGroup(id);

  if (!group) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
        <main className="page">
          <div className="topbar">
            <img src={LOGO_URL} alt="Radr" className="logo" />
          </div>
          <div className="not-found">
            <p>Group not found</p>
            <a href={APP_STORE_URL} className="btn-secondary">
              Download Radr
            </a>
          </div>
        </main>
      </>
    );
  }

  const nameLength = group.name.length;
  const titleScaleClass =
    nameLength > 40 ? "title sm" : nameLength > 24 ? "title md" : "title";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <main className="page">
        <div className="topbar">
          <img src={LOGO_URL} alt="Radr" className="logo" />
        </div>

        {group.cover_image_url ? (
          <div
            className="hero"
            style={{
              backgroundColor: hexWithAlpha(GROUP_TINT, 0.15),
              borderColor: hexWithAlpha(GROUP_TINT, 0.35),
            }}
          >
            <img
              src={group.cover_image_url}
              alt={group.name}
              className="hero-image"
            />
          </div>
        ) : (
          <div
            className="hero"
            style={{
              backgroundColor: hexWithAlpha(GROUP_TINT, 0.15),
              borderColor: hexWithAlpha(GROUP_TINT, 0.35),
            }}
          >
            <span className="hero-icon" aria-hidden>
              👥
            </span>
          </div>
        )}

        <h1 className={titleScaleClass}>{group.name}</h1>
        {group.member_count != null && (
          <p className="location">
            {group.member_count} {group.member_count === 1 ? "member" : "members"}
          </p>
        )}

        <div className="cta">
          <a href={`radr://g/${id}`} className="btn-primary">
            Join Group on Radr
          </a>
          <a href={APP_STORE_URL} className="btn-secondary">
            Download Radr
          </a>
        </div>
      </main>
    </>
  );
}
