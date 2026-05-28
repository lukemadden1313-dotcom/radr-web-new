"use client";

import { useState } from "react";

export function CreateCrewButton({ className, style, children }: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        style={{ ...style, cursor: "pointer", border: "none" }}
      >
        {children}
      </button>

      {open && (
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
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: "var(--radr-surface-1)",
              border: "1px solid var(--radr-border)",
            }}
          >
            {/* Icon */}
            <div
              className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(42, 212, 114, 0.15)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2AD472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>

            <p className="text-xl font-semibold italic text-radr-text">
              Crews are made in the app.
            </p>
            <p className="text-base text-radr-text-muted mt-3">
              Open Radr to create a crew and invite your people.
            </p>

            <div className="flex flex-col gap-3 mt-8">
              {/* TODO (Luke): confirm exact universal link URL scheme */}
              <button
                onClick={() => {
                  window.location.href = "radr://create-group";
                }}
                className="w-full py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
                style={{ background: "var(--radr-green)", border: "none" }}
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

            {/* Close X */}
            <button
              onClick={() => setOpen(false)}
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
