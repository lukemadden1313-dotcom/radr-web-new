export default function BrandDot({ size = 8 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full ml-1 align-middle"
      style={{
        width: size + "px",
        height: size + "px",
        background: "var(--radr-cobalt)",
        transform: "translateY(-2px)",
      }}
    />
  );
}
