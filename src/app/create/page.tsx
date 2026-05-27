import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import BrandDot from "@/components/brand-dot";

export default function CreatePage() {
  return (
    <SiteShell glow="cobalt">
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1
          className="font-bold italic text-radr-text leading-tight"
          style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
        >
          Call a workout<span className="not-italic">.</span>
          <BrandDot />
        </h1>

        <p className="mt-4 text-base text-radr-text-muted leading-relaxed">
          iOS handles workout creation &mdash; open the app to call one in.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {/* App download CTA */}
          {/* TODO: link to actual App Store URL when published */}
          <a
            href="https://apps.apple.com/us/app/radr-calendar/id6758311100"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl no-underline text-inherit hover:bg-radr-surface-2 transition-colors"
            style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
          >
            <span
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "var(--radr-cobalt)" }}
            >
              R
            </span>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-base font-semibold text-radr-text">
                Get the Radr app
              </p>
              <p className="text-sm text-radr-text-muted mt-0.5">
                Available on iOS
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>

          {/* Dashboard return */}
          <Link
            href="/dashboard"
            className="flex items-center gap-4 p-5 rounded-2xl no-underline text-inherit hover:bg-radr-surface-2 transition-colors"
            style={{ background: "var(--radr-surface-1)", border: "1px solid var(--radr-border)" }}
          >
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(12, 93, 233, 0.15)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--radr-cobalt)" }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-base font-semibold text-radr-text">
                Back to dashboard
              </p>
              <p className="text-sm text-radr-text-muted mt-0.5">
                See what&apos;s on your Radr
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <p className="mt-8 text-sm text-radr-text-dim italic">
          Workout creation is in the works on web.
        </p>
      </div>
    </SiteShell>
  );
}
