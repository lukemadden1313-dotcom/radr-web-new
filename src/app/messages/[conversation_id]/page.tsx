import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { AvatarImg } from "@/components/avatar-img";
import { getConversation, getOtherParticipant, type MockUser } from "@/lib/mock-data";
import { OpenInRadrButton } from "./open-in-radr-button";

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

function UserAvatar({ user, size }: { user: MockUser; size: number }) {
  return (
    <AvatarImg
      src={user.avatar_url ?? ""}
      alt={user.full_name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      fallback={
        <span
          className="flex items-center justify-center rounded-full text-white font-semibold select-none"
          style={{
            width: size,
            height: size,
            background: avatarGradient(user.gradient_seed),
            fontSize: size * 0.38,
          }}
        >
          {user.initials}
        </span>
      }
    />
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

type Props = { params: Promise<{ conversation_id: string }> };

export default async function ConversationLandingPage({ params }: Props) {
  const { conversation_id } = await params;
  const conv = getConversation(conversation_id);
  if (!conv) notFound();

  const other = getOtherParticipant(conv);
  const firstName = other?.full_name.split(" ")[0] ?? "them";

  return (
    <SiteShell glow="cobalt">
      <div className="max-w-md mx-auto px-6 pt-8 pb-20 text-center">
        <div className="py-12 flex flex-col items-center">
          {/* Avatar */}
          {other && <UserAvatar user={other} size={96} />}

          {/* Name */}
          {other && (
            <>
              <p className="text-2xl font-semibold text-radr-text mt-4">
                {other.full_name}
              </p>
              <p className="text-sm text-radr-text-muted">@{other.username}</p>
            </>
          )}

          {/* CTA copy */}
          <p className="text-xl font-semibold italic text-radr-text mt-8">
            Messages live in the Radr app.
          </p>
          <p className="text-base text-radr-text-muted mt-3 max-w-xs mx-auto">
            Open the app to read your thread with {firstName} and send a message.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto w-full mt-10">
            <OpenInRadrButton conversationId={conversation_id} />
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
        </div>
      </div>
    </SiteShell>
  );
}
