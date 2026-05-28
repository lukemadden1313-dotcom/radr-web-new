import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import BrandDot from "@/components/brand-dot";
import {
  getGroupById,
  resolveGroupMember,
  type MockUser,
  type GroupMember,
} from "@/lib/mock-data";

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

function UserAvatar({ user, size = 48 }: { user: MockUser; size?: number }) {
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

// ----------------------------------------------------------------
// Sort: creator first, then alphabetical by full_name
// ----------------------------------------------------------------

function sortMembers(members: GroupMember[], creatorId: string): GroupMember[] {
  return [...members].sort((a, b) => {
    if (a.user_id === creatorId) return -1;
    if (b.user_id === creatorId) return 1;
    return a.profile.full_name.localeCompare(b.profile.full_name);
  });
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ id: string }> };

export default async function GroupMembersPage({ params }: Props) {
  const { id } = await params;
  const group = getGroupById(id);
  if (!group) notFound();

  const sorted = sortMembers(group.members, group.creator_id);

  return (
    <SiteShell glow="green">
      <div className="max-w-2xl mx-auto">
        {/* ============================================================
            1. BACK ROW
            ============================================================ */}
        <div className="flex items-center px-6 py-3" style={{ minHeight: 48 }}>
          <Link
            href={`/groups/${group.id}`}
            className="flex items-center gap-1.5 text-radr-text-dim hover:text-radr-text-muted transition-colors no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">{group.name}</span>
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
            {group.name} &middot; Members<span className="not-italic">.</span>
            <BrandDot color="green" />
          </h1>
          <p className="mt-2 text-base text-radr-text-muted">
            <span className="font-semibold text-radr-text">{group.member_count}</span> members
          </p>
        </div>

        {/* ============================================================
            3. MEMBER LIST
            ============================================================ */}
        <div className="px-6 mt-6 flex flex-col">
          {sorted.map((m, i) => {
            const user = resolveGroupMember(m);
            const isCreator = m.user_id === group.creator_id;

            return (
              <Link
                key={m.user_id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 py-3.5 no-underline text-inherit"
                style={i > 0 ? { borderTop: "1px solid rgba(255,255,247,0.08)" } : undefined}
              >
                <UserAvatar user={user} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-radr-text truncate" style={{ fontSize: "1.0625rem" }}>
                      {user.full_name}
                    </p>
                    {isCreator && (
                      <span
                        className="shrink-0 text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(42, 212, 114, 0.15)",
                          color: "#2AD472",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Creator
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-radr-text-muted">
                    @{user.username}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-radr-text-dim shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            );
          })}
        </div>

        <div style={{ height: 80 }} />
      </div>
    </SiteShell>
  );
}
