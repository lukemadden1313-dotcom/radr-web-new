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

function ScheduleIcon({ active }: { active: boolean }) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="8" y="14" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "none"} />
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
  const isSchedule = pathname === "/schedule";
  const isNotifications = pathname === "/notifications";
  const isCreate = pathname === "/create";

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 bg-radr-bg/90 backdrop-blur-xl border-b border-radr-border">
      <Link href="/dashboard" className="no-underline">
        <RadrWordmark />
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/dashboard" aria-label="Home" className="relative flex flex-col items-center">
          <HomeIcon active={isHome} />
          {isHome && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
        <Link href="/schedule" aria-label="Schedule" className="relative flex flex-col items-center">
          <ScheduleIcon active={isSchedule} />
          {isSchedule && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
        <Link href="/notifications" aria-label="Notifications" className="relative flex flex-col items-center">
          <BellIcon active={isNotifications} hasUnread />
          {isNotifications && (
            <span className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-radr-cobalt" />
          )}
        </Link>
        <Link
          href="/create"
          aria-label="Create workout"
          className="ml-1 flex items-center justify-center w-8 h-8 rounded-full no-underline transition-transform hover:scale-105"
          style={{
            background: isCreate
              ? "linear-gradient(135deg, #0C5DE9, #3B7BF7)"
              : "var(--radr-cobalt)",
            boxShadow: isCreate ? "0 0 0 2px rgba(12, 93, 233, 0.3)" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>

        <AvatarMenu />
      </div>
    </nav>
  );
}
