import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEH Practice Test",
  description: "Certified Ethical Hacker practice questions with answers and explanations.",
  appleWebApp: {
    capable: true,
    title: "CEH Quiz",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f6feb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            CEH Practice
          </Link>
          <SiteNav />
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
