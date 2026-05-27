const ICON_PATHS: Record<string, string> = {
  Running: "M13 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-1.5 2.5L9 11l2 2v5h2v-6.5l-2-2 .5-3 1.5 2h3v-2h-2l-2.5-3.5a1.5 1.5 0 0 0-1.3-.7c-.3 0-.5.1-.8.3L5 7v4h2V8.5l2.5-2Z",
  Cycling: "M5 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-2 3L9 11l3 3v5h2v-6l-3-3 1-3 2 2h3V8h-4l-2-3c-.3-.4-.7-.5-1.2-.5-.4 0-.8.2-1 .5l-2 2.5c-.3.4-.5.9-.5 1.5s.3 1 .8 1.3L9 12",
  Climbing: "M12 3v18M8 7l4-4 4 4M6 12h12M8 17l4 4 4-4M4 9h3M17 9h3M4 15h3M17 15h3",
  HIIT: "M13 2L3 14h9l-1 8 10-12h-9l1-8Z",
  Yoga: "M12 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM9.5 7.5l-4 8h2l2-4v9h2v-5h1v5h2v-9l2 4h2l-4-8c-.3-.6-.9-1-1.5-1h-2c-.6 0-1.2.4-1.5 1Z",
  Strength: "M6.5 6v12M17.5 6v12M2 9v6M22 9v6M4 8h5M15 8h5M4 16h5M15 16h5M9 6v12M15 6v12",
};

export function ActivityIcon({
  type,
  size = 16,
  className = "",
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const d = ICON_PATHS[type];
  if (!d) return null;

  const isComplex = type === "Cycling";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "text-radr-cobalt"}
    >
      {isComplex ? (
        <path d={d} />
      ) : (
        <path d={d} />
      )}
    </svg>
  );
}
