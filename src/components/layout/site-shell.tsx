import { TopNav } from "./top-nav";
import { Footer } from "./footer";

type GlowVariant = "cobalt" | "green" | "purple" | "warm" | "none";

const GLOW_LAYERS: Record<Exclude<GlowVariant, "none">, [string, string, string]> = {
  cobalt: [
    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(12, 93, 233, 0.30) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(42, 212, 114, 0.10) 0%, transparent 60%)",
    "radial-gradient(ellipse 50% 35% at 70% 0%, rgba(154, 90, 240, 0.08) 0%, transparent 50%)",
  ],
  green: [
    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(42, 212, 114, 0.28) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(12, 93, 233, 0.10) 0%, transparent 60%)",
    "radial-gradient(ellipse 50% 35% at 70% 0%, rgba(154, 90, 240, 0.08) 0%, transparent 50%)",
  ],
  purple: [
    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(154, 90, 240, 0.28) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(12, 93, 233, 0.10) 0%, transparent 60%)",
    "radial-gradient(ellipse 50% 35% at 70% 0%, rgba(42, 212, 114, 0.08) 0%, transparent 50%)",
  ],
  warm: [
    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(12, 93, 233, 0.22) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(154, 90, 240, 0.14) 0%, transparent 60%)",
    "radial-gradient(ellipse 50% 35% at 70% 0%, rgba(42, 212, 114, 0.06) 0%, transparent 50%)",
  ],
};

export function SiteShell({
  children,
  glow = "warm",
}: {
  children: React.ReactNode;
  glow?: GlowVariant;
}) {
  const layers = glow !== "none" ? GLOW_LAYERS[glow] : null;

  return (
    <div className="min-h-screen flex flex-col bg-radr-bg text-radr-text relative">
      {layers && (
        <>
          <div
            className="absolute top-0 inset-x-0 h-[500px] pointer-events-none"
            style={{ background: layers[0] }}
            aria-hidden
          />
          <div
            className="absolute top-0 inset-x-0 h-[400px] pointer-events-none"
            style={{ background: layers[1] }}
            aria-hidden
          />
          <div
            className="absolute top-0 inset-x-0 h-[300px] pointer-events-none"
            style={{ background: layers[2] }}
            aria-hidden
          />
        </>
      )}

      <TopNav />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
