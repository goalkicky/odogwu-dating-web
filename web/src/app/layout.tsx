import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0D0D0D',
};

export const metadata: Metadata = {
  title: "Odogwu Dating - Find Your Perfect Match",
  description: "Smart matching, verified profiles, real-time chat & calls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-y-auto flex flex-col">
        <link rel="preload" as="image" href="/o-logo.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/logo-icon.png?v=2" fetchPriority="high" />
        <link rel="preconnect" href="https://kamsirmdlabs.com" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
