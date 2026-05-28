"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import { CURRENT_USER } from "@/lib/mock-data";

// TODO: wire updateProfile(username, full_name, bio, avatar_url) RPC

// ----------------------------------------------------------------
// Avatar helpers
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

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState(CURRENT_USER.full_name);
  const [username, setUsername] = useState(CURRENT_USER.username);
  const [bio, setBio] = useState(CURRENT_USER.bio ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // TODO: wire updateProfile RPC — currently optimistic-only, resets on reload
    setSaved(true);
    setTimeout(() => {
      router.push(`/profile/${username}`);
    }, 600);
  }

  function handleUsernameChange(value: string) {
    setUsername(value.toLowerCase().replace(/\s/g, ""));
  }

  const avatarSize = 96;

  return (
    <SiteShell glow="purple">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK ROW
            ============================================================ */}
        <div className="flex items-center px-6 py-3" style={{ minHeight: 48 }}>
          <Link
            href={`/profile/${CURRENT_USER.username}`}
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Profile</span>
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
            Edit profile<BrandDot size={10} color="purple" />
          </h1>
        </div>

        {/* ============================================================
            3. AVATAR
            ============================================================ */}
        <div className="px-6 mt-8 flex flex-col items-center gap-3">
          {CURRENT_USER.avatar_url ? (
            <AvatarImg
              src={CURRENT_USER.avatar_url}
              alt={CURRENT_USER.full_name}
              width={avatarSize}
              height={avatarSize}
              className="rounded-full object-cover"
              fallback={
                <span
                  className="rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    background: avatarGradient(CURRENT_USER.gradient_seed),
                    fontSize: avatarSize * 0.4,
                  }}
                >
                  {CURRENT_USER.initials.charAt(0)}
                </span>
              }
            />
          ) : (
            <span
              className="rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                width: avatarSize,
                height: avatarSize,
                background: avatarGradient(CURRENT_USER.gradient_seed),
                fontSize: avatarSize * 0.4,
              }}
            >
              {CURRENT_USER.initials.charAt(0)}
            </span>
          )}

          {/* TODO: wire avatar upload to Supabase storage */}
          <button
            className="text-sm font-semibold cursor-pointer"
            style={{ color: "var(--radr-purple)", background: "transparent", border: "none" }}
          >
            Change photo
          </button>
        </div>

        {/* ============================================================
            4. FORM FIELDS
            ============================================================ */}
        <div className="px-6 mt-8 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--radr-text-muted)", letterSpacing: "0.08em" }}
            >
              Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-base text-radr-text bg-transparent outline-none"
              style={{
                background: "var(--radr-surface-1)",
                border: "1px solid var(--radr-border)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--radr-purple)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--radr-border)")}
            />
          </div>

          {/* Username */}
          <div>
            <label
              className="block text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--radr-text-muted)", letterSpacing: "0.08em" }}
            >
              Username
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                style={{ color: "var(--radr-text-dim)" }}
              >
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="w-full rounded-2xl pl-9 pr-4 py-3 text-base text-radr-text bg-transparent outline-none"
                style={{
                  background: "var(--radr-surface-1)",
                  border: "1px solid var(--radr-border)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--radr-purple)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--radr-border)")}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              className="block text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--radr-text-muted)", letterSpacing: "0.08em" }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell your friends what you're about"
              className="w-full rounded-2xl px-4 py-3 text-base text-radr-text placeholder-radr-text-dim bg-transparent outline-none resize-none"
              style={{
                background: "var(--radr-surface-1)",
                border: "1px solid var(--radr-border)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--radr-purple)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--radr-border)")}
            />
          </div>
        </div>

        {/* ============================================================
            5. SAVE + CANCEL
            ============================================================ */}
        <div className="px-6 mt-8 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className="w-full py-3.5 rounded-2xl font-semibold text-base cursor-pointer transition-all"
            style={{
              background: saved ? "#2AD472" : "var(--radr-purple)",
              color: "#fff",
              border: "none",
              opacity: saved ? 0.9 : 1,
            }}
          >
            {saved ? "Saved \u2713" : "Save changes"}
          </button>

          <Link
            href={`/profile/${CURRENT_USER.username}`}
            className="w-full py-3 rounded-2xl font-medium text-base text-center no-underline"
            style={{ color: "var(--radr-text-muted)" }}
          >
            Cancel
          </Link>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
