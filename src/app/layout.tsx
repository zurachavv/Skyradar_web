import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyRadar Web",
  description: "SkyRadar Web Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
