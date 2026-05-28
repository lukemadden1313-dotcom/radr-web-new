import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { CURRENT_USER, type MockUser } from "@/lib/mock-data";
import { InteractiveToggleRow, OpenInAppRow, LogOutButton } from "./settings-interactive";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

const AVATAR_GRADIENTS: [string, string][] = [
  ["#4a5d8f", "#2c3a5e"],
  ["#8f4a4a", "#5e2c2c"],
  ["#4a8f6f", "#2c5e4a"],
  ["#8f7a4a", "#5e4f2c"],
  ["#5b3d8f", "#3d2c5e"],
];

function avatarGradient(seed: string): string {
  const idx = (seed.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  const [from, to] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function AvatarFallback({
  name,
  seed,
  size,
}: {
  name: string;
  seed: string;
  size: number;
}) {
  return (
    <span
      className="rounded-full shrink-0 flex items-center justify-center text-white font-semibold"
      style={{
        width: size,
        height: size,
        background: avatarGradient(seed),
        fontSize: size * 0.4,
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function UserAvatar({ user, size = 56 }: { user: MockUser; size?: number }) {
  if (user.avatar_url) {
    return (
      <AvatarImg
        src={user.avatar_url}
        alt={user.full_name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        fallback={
          <AvatarFallback
            name={user.full_name}
            seed={user.gradient_seed}
            size={size}
          />
        }
      />
    );
  }
  return (
    <AvatarFallback
      name={user.full_name}
      seed={user.gradient_seed}
      size={size}
    />
  );
}

// Toggle + ToggleRow moved to settings-interactive.tsx (client component for useState)

// ----------------------------------------------------------------
// Icons (inline SVGs)
// ----------------------------------------------------------------

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBan() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ----------------------------------------------------------------
// Settings row components
// ----------------------------------------------------------------

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="mt-7 mb-2 px-2 text-xs font-medium uppercase"
      style={{ color: "var(--radr-text-muted)", letterSpacing: "0.08em" }}
    >
      {label}
    </p>
  );
}

function NavRow({
  icon,
  label,
  href,
  showBorder,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  showBorder: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-3.5 px-4 no-underline text-inherit hover:bg-radr-surface-2 transition-colors"
      style={{
        borderTop: showBorder
          ? "1px solid var(--radr-border)"
          : undefined,
      }}
    >
      <span className="text-radr-text-muted shrink-0">{icon}</span>
      <span className="flex-1 text-base font-medium text-radr-text">
        {label}
      </span>
      <IconChevronRight />
    </Link>
  );
}

function ExternalRow({
  icon,
  label,
  href,
  showBorder,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  showBorder: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3.5 px-4 no-underline text-inherit hover:bg-radr-surface-2 transition-colors"
      style={{
        borderTop: showBorder
          ? "1px solid var(--radr-border)"
          : undefined,
      }}
    >
      <span className="text-radr-text-muted shrink-0">{icon}</span>
      <span className="flex-1 text-base font-medium text-radr-text">
        {label}
      </span>
      <IconExternalLink />
    </a>
  );
}

// ToggleRow moved to settings-interactive.tsx (InteractiveToggleRow)

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function SettingsPage() {
  return (
    <SiteShell glow="cobalt">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK ROW
            ============================================================ */}
        <div
          className="flex items-center px-6 py-3"
          style={{ minHeight: 48 }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* ============================================================
            2. PAGE HEADER
            ============================================================ */}
        <div className="px-6 pt-4">
          <h1
            className="font-bold italic text-radr-text leading-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)" }}
          >
            Settings<span className="not-italic">.</span>
            <BrandDot />
          </h1>
        </div>

        {/* ============================================================
            3. PROFILE PEEK ROW
            ============================================================ */}
        <div className="px-6 mt-6">
          <Link
            href={`/profile/${CURRENT_USER.username}`}
            className="flex items-center gap-3 p-4 rounded-2xl no-underline text-inherit hover:bg-radr-surface-2 transition-colors"
            style={{ background: "var(--radr-surface-1)" }}
          >
            <UserAvatar user={CURRENT_USER} size={56} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-radr-text">
                {CURRENT_USER.full_name}
              </p>
              <p className="text-sm" style={{ color: "var(--radr-text-muted)" }}>
                @{CURRENT_USER.username}
              </p>
            </div>
            <IconChevronRight />
          </Link>
        </div>

        {/* ============================================================
            4. SETTINGS SECTIONS
            ============================================================ */}
        <div className="px-6">
          {/* ACCOUNT */}
          <SectionLabel label="Account" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--radr-surface-1)" }}
          >
            <NavRow
              icon={<IconUser />}
              label="Edit Profile"
              href="/profile/edit"
              showBorder={false}
            />
            <NavRow
              icon={<IconBell />}
              label="Notifications"
              href="/notifications"
              showBorder={true}
            />
            <OpenInAppRow
              icon={<IconCalendar />}
              label="Calendar Sync"
              deepLink="radr://settings/calendar"
              showBorder={true}
            />
            <OpenInAppRow
              icon={<IconBan />}
              label="Blocked Users"
              deepLink="radr://settings/blocked"
              showBorder={true}
            />
          </div>

          {/* PREFERENCES */}
          <SectionLabel label="Preferences" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--radr-surface-1)" }}
          >
            <InteractiveToggleRow
              icon={<IconBell />}
              label="Push Notifications"
              defaultActive={true}
              showBorder={false}
            />
            <InteractiveToggleRow
              icon={<IconMail />}
              label="Email Updates"
              defaultActive={false}
              showBorder={true}
            />
            <InteractiveToggleRow
              icon={<IconGlobe />}
              label="Public Profile"
              defaultActive={true}
              showBorder={true}
            />
            <InteractiveToggleRow
              icon={<IconEye />}
              label="Show Workouts on Profile"
              defaultActive={true}
              showBorder={true}
            />
          </div>

          {/* SOCIAL */}
          <SectionLabel label="Social" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--radr-surface-1)" }}
          >
            <ExternalRow
              icon={<IconCamera />}
              label="Instagram"
              href="https://instagram.com/getradr"
              showBorder={false}
            />
            <ExternalRow
              icon={<IconMusic />}
              label="TikTok"
              href="https://tiktok.com/@getradr"
              showBorder={true}
            />
            <ExternalRow
              icon={<IconX />}
              label="X (Twitter)"
              href="https://x.com/getradr"
              showBorder={true}
            />
          </div>

          {/* SUPPORT & LEGAL */}
          <SectionLabel label="Support & Legal" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--radr-surface-1)" }}
          >
            <ExternalRow
              icon={<IconMail />}
              label="Contact Us"
              href="mailto:getradrapp@gmail.com"
              showBorder={false}
            />
            <NavRow
              icon={<IconFileText />}
              label="Terms of Service"
              href="/terms.html"
              showBorder={true}
            />
            <NavRow
              icon={<IconShield />}
              label="Privacy Policy"
              href="/privacy.html"
              showBorder={true}
            />
            <NavRow
              icon={<IconFileText />}
              label="Cookie Policy"
              href="/cookies.html"
              showBorder={true}
            />
          </div>
        </div>

        {/* ============================================================
            5. LOG OUT BUTTON
            ============================================================ */}
        <div className="px-6 mt-8">
          <LogOutButton />
        </div>

        {/* ============================================================
            6. VERSION + COPYRIGHT
            ============================================================ */}
        <div className="mt-6 pb-20 text-center">
          <p className="text-xs" style={{ color: "var(--radr-text-dim)" }}>
            Radr &middot; v0.1.0 &middot; Made in NYC
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--radr-text-dim)" }}
          >
            &copy; 2026 Radr. All rights reserved.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
