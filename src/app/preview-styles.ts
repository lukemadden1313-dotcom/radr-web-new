export const previewStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #000;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .page {
    min-height: 100vh;
    max-width: 480px;
    margin: 0 auto;
    padding: 20px 24px 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .topbar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  .logo {
    height: 22px;
    width: auto;
    display: block;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    border: 2px solid #555;
    color: #aaa;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .hero {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    border-width: 2px;
    border-style: solid;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    overflow: hidden;
  }
  .hero-icon {
    font-size: 128px;
    line-height: 1;
  }
  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hero-avatar {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.15);
    margin-bottom: 28px;
    display: block;
  }

  .date {
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: #999;
    text-transform: uppercase;
    margin: 4px 0 16px;
  }

  .title {
    font-size: 84px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.025em;
    color: #fff;
    margin: 0 0 16px;
    word-break: break-word;
  }
  .title.md { font-size: 64px; }
  .title.sm { font-size: 48px; }

  .location {
    font-size: 26px;
    font-weight: 400;
    color: #999;
    margin: 0 0 28px;
  }

  .row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
  }

  .host-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }
  .host-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .host-label {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #888;
    text-transform: uppercase;
  }
  .host-name {
    font-size: 26px;
    font-weight: 600;
    color: #fff;
    line-height: 1.1;
  }

  .avatar-stack {
    display: flex;
    align-items: center;
  }
  .going-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 5px solid #000;
    flex-shrink: 0;
  }
  .going-label {
    font-size: 26px;
    font-weight: 600;
    color: #fff;
  }

  .cta {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 40px;
  }
  .btn-primary,
  .btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 56px;
    border-radius: 999px;
    font-size: 17px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 120ms;
  }
  .btn-primary {
    background: #0C5DE9;
    color: #fff;
  }
  .btn-primary:hover { background: #0A4FC5; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-secondary {
    background: #1A1A1A;
    color: #fff;
    border: 1px solid #2a2a2a;
    font-weight: 600;
  }
  .btn-secondary:hover { background: #222; }
  .btn-secondary:active { transform: scale(0.98); }

  .not-found {
    margin-top: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    color: #888;
    font-size: 18px;
  }
  .not-found .btn-secondary { width: auto; padding: 0 32px; }

  @media (max-width: 380px) {
    .hero { width: 240px; height: 240px; }
    .hero-icon { font-size: 108px; }
    .title { font-size: 64px; }
    .title.md { font-size: 52px; }
    .title.sm { font-size: 40px; }
  }
`;

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/radr-calendar/id6758311100";
export const FALLBACK_IMAGE = "/assets/images/Radr icon.png";
