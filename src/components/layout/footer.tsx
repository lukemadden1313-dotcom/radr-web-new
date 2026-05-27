import Link from "next/link";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/radr-calendar/id6758311100";

export function Footer() {
  return (
    <footer className="border-t border-radr-border mt-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 md:px-8 flex flex-col items-center gap-8">
        {/* Wordmark */}
        <span className="text-2xl font-bold italic tracking-tight text-radr-text">
          radr<span className="text-radr-cobalt not-italic">.</span>
        </span>

        {/* Action pills */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center h-10 px-5 rounded-full border border-radr-border text-sm font-semibold text-radr-text hover:bg-radr-surface-1 transition-colors no-underline"
          >
            Explore workouts
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center h-10 px-5 rounded-full bg-radr-text text-radr-bg text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
          >
            Create a workout
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-radr-text-dim">
          <a href="mailto:getradrapp@gmail.com" className="hover:text-radr-text transition-colors">Help</a>
          <Link href="/privacy.html" className="hover:text-radr-text transition-colors">Privacy</Link>
          <Link href="/terms.html" className="hover:text-radr-text transition-colors">About</Link>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-radr-text transition-colors">Get the app</a>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {/* TODO: Update hrefs when social accounts are confirmed */}
          <a href="https://instagram.com/getradr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-radr-text-dim hover:text-radr-text transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <path d="M17.5 6.5h.01" />
            </svg>
          </a>
          <a href="https://tiktok.com/@getradr" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-radr-text-dim hover:text-radr-text transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.4a4.85 4.85 0 01-3.58-1.5V6.69h3.58z" />
            </svg>
          </a>
          <a href="https://x.com/getradr" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-radr-text-dim hover:text-radr-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        <p className="text-xs text-radr-text-dim">&copy; 2026 Radr. All rights reserved.</p>
      </div>
    </footer>
  );
}
