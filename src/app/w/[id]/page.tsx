import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { previewStyles, APP_STORE_URL, FALLBACK_IMAGE } from "@/app/preview-styles";

type Props = {
  params: Promise<{ id: string }>;
};

async function getWorkout(id: string) {
  const { data: workout } = await supabase
    .from("workouts")
    .select("id, title, location, start_time, duration, category, creator_id")
    .eq("id", id)
    .single();

  if (!workout) return null;

  const { data: creator } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", workout.creator_id)
    .single();

  return { workout, creator };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  const creatorName = creator?.full_name || "someone";
  const image = creator?.avatar_url || FALLBACK_IMAGE;
  const description = [workout.location, workout.start_time ? formatDate(workout.start_time) : null]
    .filter(Boolean)
    .join(" · ");

  return {
    title: `${workout.title} with ${creatorName} on Radr`,
    description,
    openGraph: {
      title: `${workout.title} with ${creatorName} on Radr`,
      description,
      url: `https://getradr.app/w/${id}`,
      images: [{ url: image }],
      type: "website",
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
        <div className="container">
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
          <p className="not-found">Workout not found</p>
          <div className="buttons">
            <a href={APP_STORE_URL} className="btn-primary">Download Radr</a>
          </div>
        </div>
      </>
    );
  }

  const { workout, creator } = data;
  const creatorName = creator?.full_name || "someone";
  const avatarUrl = creator?.avatar_url;
  const description = [workout.location, workout.start_time ? formatDate(workout.start_time) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div className="container">
        {avatarUrl ? (
          <img src={avatarUrl} alt={creatorName} className="avatar" />
        ) : (
          <img src="/assets/images/Radr%20icon.png" alt="Radr" className="logo" />
        )}
        <h1>{workout.title}</h1>
        <p className="subtitle">
          with {creatorName}
          {description && <><br />{description}</>}
        </p>
        <div className="buttons">
          <a href={`radr://w/${id}`} className="btn-primary">Open in Radr</a>
          <a href={APP_STORE_URL} className="btn-secondary">Download Radr</a>
        </div>
      </div>
    </>
  );
}
