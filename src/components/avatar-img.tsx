"use client";

import { useState, type ReactNode } from "react";

export function AvatarImg({
  src,
  alt,
  width,
  height,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
