export const APP_STORE_URL =
  "https://apps.apple.com/us/app/radr-calendar/id6758311100";
export const FALLBACK_IMAGE = "/assets/images/Radr icon.png";

// Transform Supabase storage object URLs into resized renders.
// Cuts page weight from multi-MB originals to ~10KB thumbnails.
export function avatarThumb(url: string | null | undefined, size = 200): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const base = url.slice(0, i);
  const path = url.slice(i + marker.length);
  return `${base}/storage/v1/render/image/public/${path}?width=${size}&height=${size}&resize=cover`;
}

export const previewStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #000;
    color: #FFFFF7;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .stripe {
    height: 8px;
    width: 100%;
  }
  .stripe-cobalt { background: #0C5DE9; }
  .stripe-green  { background: #2AD472; }
  .stripe-purple { background: #9A5AF0; }

  .page {
    min-height: calc(100vh - 8px);
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 24px 56px;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .brand {
    font-size: 22px;
    font-weight: 700;
    font-style: italic;
    letter-spacing: -0.01em;
    color: #FFFFF7;
  }
  .brand .dot { font-style: normal; }
  .brand-cobalt .dot { color: #0C5DE9; }
  .brand-green  .dot { color: #2AD472; }
  .brand-purple .dot { color: #9A5AF0; }

  .pill {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
  }
  .pill-cobalt { background: rgba(12, 93, 233, 0.18);  color: #4d8cff; }
  .pill-green  { background: rgba(42, 212, 114, 0.18); color: #5be09a; }
  .pill-purple { background: rgba(154, 90, 240, 0.18); color: #c39cff; }

  .host-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
  }
  .host-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }
  .host-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .host-label {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #888;
    text-transform: uppercase;
  }
  .host-name {
    font-size: 22px;
    font-weight: 600;
    color: #FFFFF7;
    line-height: 1.15;
  }

  .title {
    font-size: clamp(40px, 7vw, 72px);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -0.025em;
    color: #FFFFF7;
    margin: 0 0 18px;
    word-break: break-word;
  }
  .subtitle-accent {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 14px;
  }
  .subtitle-cobalt { color: #4d8cff; }
  .subtitle-green  { color: #5be09a; }
  .subtitle-purple { color: #c39cff; }

  .meta-line {
    font-size: 18px;
    color: #999;
    margin: 0 0 36px;
  }

  .divider {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin: 32px 0;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #888;
    text-transform: uppercase;
    margin: 0 0 18px;
  }

  .avatar-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }
  .avatar-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    color: inherit;
  }
  .avatar-link img,
  .avatar-link .avatar-fallback {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.08);
  }
  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    font-size: 22px;
  }
  .avatar-link span {
    font-size: 12px;
    color: #aaa;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: 24px 0 32px;
  }
  .profile-avatar {
    width: 168px;
    height: 168px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.08);
    margin-bottom: 20px;
  }
  .profile-avatar.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    font-size: 64px;
  }
  .profile-name {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0 0 6px;
  }
  .profile-handle {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 14px;
  }
  .profile-bio {
    font-size: 17px;
    color: #aaa;
    line-height: 1.55;
    margin: 0 0 22px;
    max-width: 52ch;
  }
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 28px;
    font-size: 16px;
    color: #888;
  }
  .stats-row strong {
    color: #fff;
    font-weight: 700;
    margin-right: 6px;
  }

  .cta {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 32px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    padding: 0 24px;
    border-radius: 999px;
    font-size: 17px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 120ms, opacity 120ms;
  }
  .btn:active { transform: scale(0.98); }
  .btn-primary { color: #fff; }
  .btn-cobalt { background: #0C5DE9; }
  .btn-cobalt:hover { background: #0A4FC5; }
  .btn-green  { background: #2AD472; color: #06170E; }
  .btn-green:hover { background: #25BC65; }
  .btn-purple { background: #9A5AF0; }
  .btn-purple:hover { background: #8748DC; }
  .btn-secondary {
    background: #141418;
    color: #fff;
    border: 1px solid #232328;
    font-weight: 600;
  }
  .btn-secondary:hover { background: #1c1c22; }

  .not-found {
    margin: 80px 0;
    text-align: center;
    color: #888;
  }
  .not-found h1 {
    font-size: 36px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px;
  }
  .not-found p {
    margin: 0 0 28px;
    font-size: 16px;
  }

  @media (min-width: 600px) {
    .page { padding: 36px 36px 64px; }
    .host-avatar { width: 72px; height: 72px; }
    .avatar-link img, .avatar-link .avatar-fallback { width: 72px; height: 72px; }
    .profile-avatar { width: 200px; height: 200px; }
    .profile-avatar.fallback { font-size: 76px; }
  }
`;
