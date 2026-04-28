export const previewStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #000;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .container {
    text-align: center;
    padding: 40px 24px;
    max-width: 420px;
    width: 100%;
  }
  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 24px;
    border: 2px solid #222;
  }
  .cover {
    width: 100%;
    height: 200px;
    border-radius: 16px;
    object-fit: cover;
    margin-bottom: 24px;
    border: 1px solid #222;
  }
  .logo {
    width: 48px;
    height: 48px;
    margin-bottom: 24px;
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #fff;
  }
  .subtitle {
    font-size: 16px;
    color: #888;
    margin-bottom: 32px;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .btn-primary {
    display: block;
    padding: 16px 24px;
    background: #0C5DE9;
    color: #fff;
    text-decoration: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 600;
    transition: background 0.2s;
  }
  .btn-primary:hover {
    background: #0A4FC5;
  }
  .btn-secondary {
    display: block;
    padding: 16px 24px;
    background: #1A1A1A;
    color: #fff;
    text-decoration: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 600;
    border: 1px solid #333;
    transition: background 0.2s;
  }
  .btn-secondary:hover {
    background: #222;
  }
  .not-found {
    color: #666;
    font-size: 18px;
    margin-bottom: 32px;
  }
`;

export const APP_STORE_URL = "https://apps.apple.com/us/app/radr-calendar/id6758311100";
export const FALLBACK_IMAGE = "https://getradr.app/assets/images/Radr%20icon.png";
