"use client";

import { useState } from "react";

// ----------------------------------------------------------------
// Action icon buttons for group detail (calendar, share, bell, more)
// TODO: wire calendar sync, Web Share API, toggle_group_notifications, group menu
// ----------------------------------------------------------------

export function GroupActionButtons({ groupId }: { groupId: string }) {
  const [shareCopied, setShareCopied] = useState(false);
  const [calAdded, setCalAdded] = useState(false);
  const [bellOn, setBellOn] = useState(false);

  function handleCalendar() {
    // TODO: wire calendar sync — open-in-app or .ics download
    setCalAdded(true);
    setTimeout(() => setCalAdded(false), 2000);
  }

  function handleShare() {
    // TODO: wire Web Share API / copy link
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  function handleBell() {
    // TODO: wire toggle_group_notifications(group_id)
    setBellOn((prev) => !prev);
  }

  const iconBtnBase = "w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-4 mt-4">
      {/* Calendar */}
      <button onClick={handleCalendar} className={iconBtnBase} style={{ background: calAdded ? "rgba(42,212,114,0.15)" : "transparent", borderColor: calAdded ? "#2AD472" : "var(--radr-border)" }} aria-label={calAdded ? "Added" : "Sync calendar"}>
        {calAdded ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2AD472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
          </svg>
        )}
      </button>

      {/* Share */}
      <button onClick={handleShare} className={iconBtnBase} style={{ background: shareCopied ? "rgba(42,212,114,0.15)" : "transparent", borderColor: shareCopied ? "#2AD472" : "var(--radr-border)" }} aria-label={shareCopied ? "Link copied" : "Share"}>
        {shareCopied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2AD472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-muted">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>

      {/* Bell */}
      <button onClick={handleBell} className={iconBtnBase} style={{ background: bellOn ? "rgba(42,212,114,0.15)" : "transparent", borderColor: bellOn ? "#2AD472" : "var(--radr-border)" }} aria-label={bellOn ? "Notifications on" : "Notifications off"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={bellOn ? "#2AD472" : "none"} stroke={bellOn ? "#2AD472" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={bellOn ? "" : "text-radr-text-muted"}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </button>

      {/* More menu */}
      <button className={iconBtnBase} style={{ background: "transparent", borderColor: "var(--radr-border)" }} aria-label="More">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-radr-text-muted">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

// ----------------------------------------------------------------
// Join/Leave pill for group cover
// TODO: wire join_group(group_id) / leave_group(group_id)
// ----------------------------------------------------------------

export function JoinLeavePill({ isMember, groupId }: { isMember: boolean; groupId: string }) {
  const [member, setMember] = useState(isMember);

  return (
    <button
      onClick={() => setMember((prev) => !prev)}
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        padding: "10px 22px",
        borderRadius: 9999,
        background: member ? "rgba(42, 212, 114, 0.95)" : "rgba(255,255,255,0.95)",
        border: member ? "1px solid rgba(255,255,255,0.2)" : "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      <span style={{
        color: member ? "#fff" : "#000",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1,
      }}>
        {member ? "\ud83d\udc4b Joined" : "+ Join Crew"}
      </span>
    </button>
  );
}
