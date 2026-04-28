import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.getradr.app"),
  title: "Radr — The Social Calendar for Workouts",
  description:
    "See what your friends are training, share your schedule, and show up together. No more group chat chaos.",
  openGraph: {
    title: "Radr — The Social Calendar for Workouts",
    description:
      "See what your friends are training, share your schedule, and show up together.",
    url: "/",
    siteName: "Radr",
    images: [{ url: "/assets/images/Radr icon.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radr — The Social Calendar for Workouts",
    description:
      "See what your friends are training, share your schedule, and show up together.",
    images: ["/assets/images/Radr icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
