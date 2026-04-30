import { ImageResponse } from "next/og";

export const SIZE = { width: 1200, height: 630 } as const;
export const CONTENT_TYPE = "image/png";

export const TOKENS = {
  bg: "#000000",
  cardBg: "linear-gradient(180deg, #0d0d0d 0%, #060606 100%)",
  textPrimary: "#FFFFF7",
  textSecondary: "#999999",
  textMuted: "#666666",
  divider: "rgba(255,255,255,0.08)",
  cobalt: "#0C5DE9",
  green: "#2AD472",
  purple: "#9A5AF0",
  pillBg: {
    cobalt: "rgba(12, 93, 233, 0.18)",
    green: "rgba(42, 212, 114, 0.18)",
    purple: "rgba(154, 90, 240, 0.18)",
  },
  pillText: {
    cobalt: "#4d8cff",
    green: "#5be09a",
    purple: "#c39cff",
  },
  avatarGradients: [
    ["#4a5d8f", "#2c3a5e"],
    ["#8f4a4a", "#5e2c2c"],
    ["#4a8f6f", "#2c5e4a"],
    ["#8f7a4a", "#5e4f2c"],
    ["#5b3d8f", "#3d2c5e"],
  ],
} as const;

export type Accent = "cobalt" | "green" | "purple";

const ACCENT_HEX: Record<Accent, string> = {
  cobalt: TOKENS.cobalt,
  green: TOKENS.green,
  purple: TOKENS.purple,
};

export function truncate(s: string | null | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

// Convert Supabase storage object URLs into resized image-rendering URLs.
// Avoids embedding multi-MB JPEGs into satori's SVG buffer.
export function transformAvatarUrl(url: string | null | undefined, size: number): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const base = url.slice(0, i);
  const path = url.slice(i + marker.length);
  return `${base}/storage/v1/render/image/public/${path}?width=${size}&height=${size}&resize=cover`;
}

export function formatDayTime(iso: string): string {
  const d = new Date(iso);
  const tz = "America/New_York";
  const day = d.toLocaleString("en-US", { weekday: "short", timeZone: tz }).toUpperCase();
  const month = d.toLocaleString("en-US", { month: "short", timeZone: tz }).toUpperCase();
  const date = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
  return `${day} · ${month} ${date} · ${time}`;
}

type AvatarShape = {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

export function Avatar({
  url,
  fallback,
  size,
}: {
  url?: string | null;
  fallback: string;
  size: number;
}) {
  const transformed = transformAvatarUrl(url, Math.min(size * 2, 400));
  if (transformed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={transformed}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  const seed = fallback ? fallback.charCodeAt(0) : 0;
  const idx = seed % TOKENS.avatarGradients.length;
  const [from, to] = TOKENS.avatarGradients[idx];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.4,
        fontWeight: 600,
      }}
    >
      {(fallback || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function AvatarStack({
  avatars,
  max = 4,
  size = 48,
  ringColor = "#000",
}: {
  avatars: AvatarShape[];
  max?: number;
  size?: number;
  ringColor?: string;
}) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  return (
    <div style={{ display: "flex" }}>
      {visible.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            marginLeft: i === 0 ? 0 : -14,
            border: `4px solid ${ringColor}`,
            borderRadius: "50%",
          }}
        >
          <Avatar
            url={a.avatar_url}
            fallback={a.full_name || a.username || "?"}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -14,
            width: size,
            height: size,
            border: `4px solid ${ringColor}`,
            borderRadius: "50%",
            background: "#1a1a1a",
            color: "#fff",
            fontSize: size * 0.36,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export function BrandRow({
  pillLabel,
  accent,
}: {
  pillLabel: string;
  accent: Accent;
}) {
  const hex = ACCENT_HEX[accent];
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontStyle: "italic",
          color: TOKENS.textPrimary,
        }}
      >
        radr<span style={{ color: hex }}>.</span>
      </span>
      <span
        style={{
          padding: "10px 22px",
          background: TOKENS.pillBg[accent],
          color: TOKENS.pillText[accent],
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
        }}
      >
        {pillLabel}
      </span>
    </div>
  );
}

export function notFoundCard(label: string) {
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
        <div style={{ width: 16, background: "#666" }} />
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
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                fontStyle: "italic",
                color: TOKENS.textPrimary,
              }}
            >
              radr<span style={{ color: "#666" }}>.</span>
            </span>
            <span
              style={{
                padding: "10px 22px",
                background: "rgba(102,102,102,0.18)",
                color: "#aaa",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 3,
                borderRadius: 999,
                display: "flex",
              }}
            >
              UNAVAILABLE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.05,
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 26, color: "#888" }}>
              This may have been removed or hidden.
            </span>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
