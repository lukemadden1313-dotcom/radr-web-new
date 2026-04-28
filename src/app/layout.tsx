import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radr — The Social Calendar for Workouts",
  description:
    "See what your friends are training, share your schedule, and show up together. No more group chat chaos.",
  icons: { icon: "/assets/images/Radr icon.png" },
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
