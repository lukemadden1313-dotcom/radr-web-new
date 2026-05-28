import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import BrandDot from "@/components/brand-dot";

export default function NotFound() {
  return (
    <SiteShell glow="cobalt">
      <div className="max-w-md mx-auto px-6 pt-20 pb-20 text-center">
        <p
          className="text-6xl font-bold text-radr-text-dim"
          style={{ letterSpacing: "-0.02em" }}
        >
          404
        </p>

        <h1
          className="mt-6 font-bold italic text-radr-text leading-tight"
          style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
        >
          Lost the trail<BrandDot size={10} color="cobalt" />
        </h1>

        <p className="mt-3 text-base text-radr-text-muted max-w-xs mx-auto">
          This page isn&apos;t on your Radr. Let&apos;s get you back.
        </p>

        <Link
          href="/dashboard"
          className="inline-block mt-8 px-8 py-3 rounded-full font-semibold text-base text-white no-underline"
          style={{ background: "var(--radr-cobalt)" }}
        >
          Back to dashboard
        </Link>
      </div>
    </SiteShell>
  );
}
