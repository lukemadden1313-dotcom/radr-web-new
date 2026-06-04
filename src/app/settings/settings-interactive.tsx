"use client";

import { useState, useTransition } from "react";
import { signOut } from "./actions";

// ----------------------------------------------------------------
// Interactive Toggle — visual on/off with useState
// TODO: wire update_user_preference(key, value) RPC
// ----------------------------------------------------------------

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        background: active ? "var(--radr-cobalt)" : "rgba(255,255,247,0.12)",
        position: "relative",
        transition: "background 200ms",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
      aria-label={active ? "Enabled" : "Disabled"}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 9999,
          background: "#FFFFF7",
          position: "absolute",
          top: 2,
          left: active ? 22 : 2,
          transition: "left 200ms",
        }}
      />
    </button>
  );
}

function InteractiveToggleRow({
  icon,
  label,
  defaultActive,
  showBorder,
}: {
  icon: React.ReactNode;
  label: string;
  defaultActive: boolean;
  showBorder: boolean;
}) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div
      className="flex items-center gap-3 py-3.5 px-4"
      style={{
        borderTop: showBorder ? "1px solid var(--radr-border)" : undefined,
      }}
    >
      <span className="text-radr-text-muted shrink-0">{icon}</span>
      <span className="flex-1 text-base font-medium text-radr-text">{label}</span>
      <Toggle active={active} onToggle={() => setActive(!active)} />
    </div>
  );
}

// ----------------------------------------------------------------
// Open-in-app row for management actions (Calendar Sync, Blocked Users)
// ----------------------------------------------------------------

function OpenInAppRow({
  icon,
  label,
  deepLink,
  showBorder,
}: {
  icon: React.ReactNode;
  label: string;
  deepLink: string;
  showBorder: boolean;
}) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPrompt(true)}
        className="flex items-center gap-3 py-3.5 px-4 w-full text-left hover:bg-radr-surface-2 transition-colors cursor-pointer"
        style={{
          background: "transparent",
          border: "none",
          borderTop: showBorder ? "1px solid var(--radr-border)" : undefined,
        }}
      >
        <span className="text-radr-text-muted shrink-0">{icon}</span>
        <span className="flex-1 text-base font-medium text-radr-text">{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {showPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={() => setShowPrompt(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: "var(--radr-surface-1)",
              border: "1px solid var(--radr-border)",
            }}
          >
            <p className="text-xl font-semibold italic text-radr-text">
              {label} lives in the app.
            </p>
            <p className="text-base text-radr-text-muted mt-3">
              Open Radr to manage your {label.toLowerCase()}.
            </p>

            <div className="flex flex-col gap-3 mt-8">
              {/* TODO: confirm exact universal link URL scheme */}
              <button
                onClick={() => { window.location.href = deepLink; }}
                className="w-full py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
                style={{ background: "var(--radr-cobalt)", border: "none" }}
              >
                Open in Radr
              </button>
              <a
                href="https://apps.apple.com/us/app/radr-calendar/id6758311100"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm no-underline"
                style={{ color: "var(--radr-text-muted)" }}
              >
                Don&apos;t have the app? Get it
              </a>
            </div>

            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "transparent", border: "none", color: "var(--radr-text-dim)" }}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------
// Log out button
// ----------------------------------------------------------------

function LogOutButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          return;
        }
        startTransition(async () => {
          await signOut();
        });
      }}
      disabled={isPending}
      className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-base font-medium cursor-pointer"
      style={{
        background: "var(--radr-surface-1)",
        border: "none",
        color: "#EF4444",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {isPending ? "Signing out..." : confirming ? "Tap again to confirm" : "Log out"}
    </button>
  );
}

// ----------------------------------------------------------------
// Exports
// ----------------------------------------------------------------

export { InteractiveToggleRow, OpenInAppRow, LogOutButton };
