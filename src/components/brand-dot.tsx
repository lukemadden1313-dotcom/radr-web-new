const COLOR_MAP: Record<string, string> = {
  cobalt: "var(--radr-cobalt)",
  green: "var(--radr-green)",
  purple: "var(--radr-purple)",
};

export default function BrandDot({
  size = 8,
  color = "cobalt",
}: {
  size?: number;
  color?: "cobalt" | "green" | "purple";
}) {
  return (
    <span
      className="inline-block rounded-full ml-1 align-middle"
      style={{
        width: size + "px",
        height: size + "px",
        background: COLOR_MAP[color],
        transform: "translateY(-2px)",
      }}
    />
  );
}
