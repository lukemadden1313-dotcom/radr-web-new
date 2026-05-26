import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
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

type DeepLinkWorkout = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  duration: number | null;
  booking_url: string | null;
  open_to_join: boolean;
  visibility: string;
  activity_name: string | null;
  category: string | null;
  creator_username: string | null;
  creator_full_name: string | null;
  creator_avatar_url: string | null;
  participants: Array<{
    user_id: string;
    status: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }>;
};

// ---------- Data fetching (cached across generateMetadata + page render) ----------

const getWorkout = cache(async (id: string): Promise<DeepLinkWorkout | null> => {
  const { supabase } = await import("@/lib/supabase");

  const { data } = await supabase.rpc("get_workout_for_deep_link", {
    p_workout_id: id,
  });

  const rows = (data ?? []) as DeepLinkWorkout[];
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

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const tz = "America/New_York";
  const weekday = d.toLocaleString("en-US", { weekday: "long", timeZone: tz });
  const month = d.toLocaleString("en-US", { month: "long", timeZone: tz });
  const day = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
  return { date: `${weekday}, ${month} ${day}`, time };
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

function AvatarImage({
  url,
  name,
  size = 48,
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

function MapPinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-0.5"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ---------- Metadata ----------

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const w = await getWorkout(id);

  if (!w) {
    return {
      title: "Workout not found — Radr",
      description: "This workout doesn't exist or has been removed.",
    };
  }

  const creatorLabel = w.creator_full_name || w.creator_username || "Someone";

  return {
    title: `${w.title} on Radr`,
    description: `${creatorLabel} on Radr`,
    openGraph: {
      title: w.title,
      description: `${creatorLabel} on Radr`,
      images: [`https://getradr.app/w/${w.id}/opengraph-image`],
      url: `https://getradr.app/w/${w.id}`,
    },
    twitter: { card: "summary_large_image" },
    other: {
      "apple-itunes-app": `app-id=6758311100, app-argument=https://getradr.app/w/${w.id}`,
    },
  };
}

// ---------- Page ----------

export default async function WorkoutV2Page({ params }: Props) {
  const { id } = await params;
  const w = await getWorkout(id);

  if (!w) {
    return (
      <main
        className="min-h-screen bg-black text-[#FFFFF7]"
        style={{ background: "#000", color: "#FFFFF7" }}
      >
        <div className="h-2 w-full bg-[#0C5DE9]" />
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#666] mb-6">
            radr
          </p>
          <h1 className="text-4xl font-extrabold mb-3">Workout not found</h1>
          <p className="text-[#888] mb-10">
            This workout may have been removed or is no longer available.
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

  const creatorName = w.creator_full_name || w.creator_username || "Someone";
  const { date, time } = formatDateTime(w.start_time);
  const accepted = w.participants.filter((p) => p.status === "accepted");
  const goingCount = accepted.length;

  return (
    <main
      className="min-h-screen bg-black text-[#FFFFF7]"
      style={{ background: "#000", color: "#FFFFF7" }}
    >
      {/* Accent stripe */}
      <div className="h-2 w-full bg-[#0C5DE9]" />

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 md:px-8 md:pt-12">
        {/* Brand */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-xl font-bold italic text-[#FFFFF7] tracking-tight">
            radr<span className="text-[#0C5DE9] not-italic">.</span>
          </span>
          <span className="inline-flex items-center h-7 px-3.5 rounded-full text-[11px] font-bold tracking-[0.18em] bg-[rgba(12,93,233,0.18)] text-[#4d8cff]">
            WORKOUT
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-extrabold leading-[1.0] tracking-tight text-[#FFFFF7] mb-5 break-words"
          style={{ fontSize: "clamp(40px, 7vw, 72px)", letterSpacing: "-0.025em" }}
        >
          {w.title}
        </h1>

        {/* Date + time */}
        <p className="text-lg font-semibold mb-1">
          <span className="text-[#4d8cff]">{date}</span>
          <span className="text-[#666] mx-2">·</span>
          <span className="text-[#FFFFF7]">{time}</span>
        </p>

        {/* Duration */}
        {w.duration && (
          <p className="text-sm text-[#666] mb-5">
            {w.duration} min
          </p>
        )}

        {/* Location */}
        {w.location && (
          <div className="flex items-start gap-2 text-[#999] mb-8">
            <MapPinIcon />
            <span className="text-base">{w.location}</span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.08] my-8" />

        {/* Creator */}
        <div className="flex items-center gap-4 mb-8">
          <AvatarImage
            url={w.creator_avatar_url}
            name={creatorName}
            size={56}
            className="border-2 border-white/[0.08]"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-[#888]">
              Hosted by
            </span>
            <span className="text-lg font-semibold text-[#FFFFF7] leading-tight">
              {creatorName}
            </span>
            {w.creator_username && (
              <Link
                href={`/u/${w.creator_username}`}
                className="text-sm text-[#666] hover:text-[#999] transition-colors"
              >
                @{w.creator_username}
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        {w.description && (
          <p className="text-base text-[#aaa] leading-relaxed mb-8 whitespace-pre-line">
            {w.description}
          </p>
        )}

        {/* Going section — privacy-gated */}
        {goingCount > 0 && (
          <>
            <div className="h-px bg-white/[0.08] my-8" />
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#888] mb-5">
              Going
            </p>

            {w.open_to_join ? (
              /* PUBLIC: show avatars + names */
              <div className="flex flex-wrap gap-4">
                {accepted.slice(0, 8).map((p, i) => {
                  const name = p.full_name || p.username || "";
                  const inner = (
                    <div className="flex flex-col items-center gap-1.5 w-[72px]">
                      <AvatarImage
                        url={p.avatar_url}
                        name={name}
                        size={56}
                        className="border-2 border-white/[0.08]"
                      />
                      {p.username && (
                        <span className="text-[11px] text-[#aaa] text-center break-all leading-tight">
                          @{p.username}
                        </span>
                      )}
                    </div>
                  );
                  return p.username ? (
                    <Link
                      key={`${p.username}-${i}`}
                      href={`/u/${p.username}`}
                      className="no-underline text-inherit"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={`anon-${i}`}>{inner}</div>
                  );
                })}
                {goingCount > 8 && (
                  <div className="flex flex-col items-center gap-1.5 w-[72px]">
                    <span
                      className="rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white/[0.08]"
                      style={{ width: 56, height: 56, background: "#1a1a1a" }}
                    >
                      +{goingCount - 8}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* PRIVATE: count only, no names or avatars */
              <p className="text-base text-[#aaa]">
                <span className="text-[#FFFFF7] font-semibold">
                  {creatorName.split(" ")[0]}
                </span>
                {goingCount > 1 && (
                  <span>
                    {" "}+ {goingCount - 1} going
                  </span>
                )}
                {goingCount === 1 && <span> is going</span>}
              </p>
            )}
          </>
        )}

        {/* Booking URL */}
        {w.booking_url && (
          <>
            <div className="h-px bg-white/[0.08] my-8" />
            <a
              href={w.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#4d8cff] font-semibold text-base hover:text-[#6da0ff] transition-colors"
            >
              Book a spot
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-10">
          <a
            href={APP_STORE_URL}
            className="flex items-center justify-center h-14 rounded-full bg-[#0C5DE9] text-white font-bold text-[17px] hover:bg-[#0A4FC5] active:scale-[0.98] transition-all"
          >
            Open in Radr
          </a>
        </div>
      </div>
    </main>
  );
}
