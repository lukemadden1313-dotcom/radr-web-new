"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function RadrWordmark() {
  return (
    <img
      src="/radr-logo.png"
      alt="radr."
      className="h-5 w-auto"
      draggable={false}
    />
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-radr-cobalt" : "text-radr-text-muted"}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      {!active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-radr-cobalt" : "text-radr-text-muted"}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function BellIcon({ active, hasUnread }: { active: boolean; hasUnread: boolean }) {
  return (
    <span className="relative">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-radr-cobalt" : "text-radr-text-muted"}
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {hasUnread && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-radr-cobalt" />
      )}
    </span>
  );
}

import { AvatarMenu } from "./avatar-menu";

export function TopNav() {
  const pathname = usePathname();

  const isHome = pathname === "/dashboard" || pathname === "/home";
  const isExplore = pathname === "/explore";
  const isNotifications = pathname === "/notifications";

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 bg-radr-bg/90 backdrop-blur-xl border-b border-radr-border">
      <Link href="/dashboard" className="no-underline">
        <RadrWordmark />
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/dashboard" aria-label="Home" className="relative flex flex-col items-center">
          <HomeIcon active={isHome} />
          {isHome && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
        <Link href="/explore" aria-label="Explore" className="relative flex flex-col items-center">
          <ExploreIcon active={isExplore} />
          {isExplore && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
        <Link href="/notifications" aria-label="Notifications" className="relative flex flex-col items-center">
          <BellIcon active={isNotifications} hasUnread />
          {isNotifications && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
      </div>

      <AvatarMenu />
    </nav>
  );
}
