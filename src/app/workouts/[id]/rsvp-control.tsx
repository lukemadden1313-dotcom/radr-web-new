"use client";

import { useState, useEffect, useRef } from "react";
import type { RSVPStatus } from "@/lib/mock-data";

// TODO: wire upsert_rsvp(workout_id, status) — status in {going, maybe, cant}. Currently optimistic-only, resets on reload.

type RSVPControlProps = {
  workoutId: string;
  initialStatus: RSVPStatus | null;
};

const OPTIONS: { value: RSVPStatus; emoji: string; label: string }[] = [
  { value: "going", emoji: "\u{1F44D}", label: "Going" },
  { value: "maybe", emoji: "\u{1F914}", label: "Maybe" },
  { value: "cant", emoji: "\u{1F6AB}", label: "Can\u2019t go" },
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

export function RSVPControl({ workoutId: _workoutId, initialStatus }: RSVPControlProps) {
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

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            background: "rgba(30,30,34,0.96)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,247,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          {OPTIONS.map((opt, i) => {
            const selected = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setStatus(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "12px 16px",
                  background: selected ? "rgba(12,93,233,0.15)" : "transparent",
                  border: "none",
                  borderTop: i > 0 ? "1px solid rgba(255,255,247,0.08)" : "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  color: selected ? "#5B9BFF" : "rgba(255,255,247,0.8)",
                  transition: "background 100ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = "rgba(255,255,247,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selected ? "rgba(12,93,233,0.15)" : "transparent";
                }}
              >
                <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                <span>{opt.label}</span>
                {selected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: "auto" }}
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
