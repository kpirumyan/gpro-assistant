import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPRO Assistant",
  description:
    "Collect, visualize, and analyze data from the GPRO racing manager API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-row bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  );
}

