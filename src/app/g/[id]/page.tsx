import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, FALLBACK_IMAGE } from "@/app/preview-styles";

type Props = {
  params: Promise<{ id: string }>;
};

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
  const description = group.member_count != null ? `${group.member_count} members` : "Group on Radr";

  return {
    title: `${group.name} on Radr`,
    description,
    openGraph: {
      title: `${group.name} on Radr`,
      description,
      url: `https://getradr.app/g/${id}`,
      images: [{ url: image }],
      type: "website",
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
        <div className="container">
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
          <p className="not-found">Group not found</p>
          <div className="buttons">
            <a href={APP_STORE_URL} className="btn-primary">Download Radr</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="container">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt={group.name} className="cover" />
        ) : (
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
        )}
        <h1>{group.name}</h1>
        <p className="subtitle">
          {group.member_count != null ? `${group.member_count} members` : "Group on Radr"}
        </p>
        <div className="buttons">
          <a href={`radr://g/${id}`} className="btn-primary">Join Group on Radr</a>
          <a href={APP_STORE_URL} className="btn-secondary">Download Radr</a>
        </div>
      </div>
    </>
  );
}
