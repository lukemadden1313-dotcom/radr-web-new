"use client";

import { useState, useEffect, useRef } from "react";
import type { RSVPStatus } from "@/lib/mock-data";

// TODO: wire upsert_rsvp(workout_id, status) — status in {going, maybe, cant}. Currently optimistic-only, resets on reload.

type RSVPControlProps = {
  workoutId: string;
  initialStatus: RSVPStatus | null;
  onStatusChange?: (status: RSVPStatus) => void;
};

const OPTIONS: { value: RSVPStatus; emoji: string; label: string; glowColor: string }[] = [
  { value: "going", emoji: "\u{1F44D}", label: "Going", glowColor: "12, 93, 233" },    // cobalt
  { value: "maybe", emoji: "\u{1F914}", label: "Maybe", glowColor: "245, 166, 35" },    // amber
  { value: "cant", emoji: "\u{1F622}", label: "Can\u2019t go", glowColor: "255, 255, 247" }, // dim
];

function buttonStyle(status: RSVPStatus | null): React.CSSProperties {
  switch (status) {
    case "going":
      return {
        background: "#0C5DE9",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
      };
    case "maybe":
      return {
        background: "rgba(255,255,247,0.12)",
        color: "#F5A623",
        border: "1px solid rgba(245,166,35,0.3)",
      };
    case "cant":
      return {
        background: "rgba(255,255,247,0.08)",
        color: "rgba(255,255,247,0.45)",
        border: "1px solid rgba(255,255,247,0.1)",
      };
    default:
      return {
        background: "rgba(255,255,255,0.95)",
        color: "#000",
        border: "none",
      };
  }
}

function buttonLabel(status: RSVPStatus | null): string {
  switch (status) {
    case "going":
      return "\u{1F44D} Going";
    case "maybe":
      return "\u{1F914} Maybe";
    case "cant":
      return "Can\u2019t go";
    default:
      return "+ Join";
  }
}

export function RSVPControl({ workoutId: _workoutId, initialStatus, onStatusChange }: RSVPControlProps) {
  const [status, setStatus] = useState<RSVPStatus | null>(initialStatus);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Main pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          ...buttonStyle(status),
          padding: "10px 22px",
          borderRadius: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
          transition: "all 150ms ease",
        }}
      >
        {buttonLabel(status)}
      </button>

      {/* Dropdown menu — glowing emoji bubbles */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 12px)",
            right: 0,
            display: "flex",
            gap: 8,
            zIndex: 50,
          }}
        >
          {OPTIONS.map((opt) => {
            const selected = status === opt.value;
            const glowOpacity = selected ? 0.45 : 0.15;
            const ringBorder = selected
              ? `2px solid rgba(${opt.glowColor}, 0.7)`
              : "1px solid rgba(255,255,247,0.12)";

            return (
              <button
                key={opt.value}
                onClick={() => {
                  setStatus(opt.value);
                  setOpen(false);
                  onStatusChange?.(opt.value);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "14px 16px 10px",
                  minWidth: 80,
                  background: `radial-gradient(ellipse at center, rgba(${opt.glowColor}, ${glowOpacity}) 0%, rgba(30,30,34,0.96) 70%)`,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  borderRadius: 16,
                  border: ringBorder,
                  boxShadow: selected
                    ? `0 0 20px rgba(${opt.glowColor}, 0.3), 0 8px 32px rgba(0,0,0,0.5)`
                    : "0 8px 32px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = `radial-gradient(ellipse at center, rgba(${opt.glowColor}, 0.25) 0%, rgba(30,30,34,0.96) 70%)`;
                    e.currentTarget.style.border = `1px solid rgba(${opt.glowColor}, 0.35)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `radial-gradient(ellipse at center, rgba(${opt.glowColor}, ${glowOpacity}) 0%, rgba(30,30,34,0.96) 70%)`;
                  e.currentTarget.style.border = ringBorder;
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{opt.emoji}</span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: selected ? `rgba(${opt.glowColor}, 1)` : "rgba(255,255,247,0.65)",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}>
                  {opt.label}
                </span>
                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: `rgba(${opt.glowColor}, 1)`, marginTop: 2 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
