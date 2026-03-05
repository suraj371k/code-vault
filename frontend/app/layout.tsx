"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased absolute inset-0 `}
          style={{
            backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.07) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        >
          {/* Radial glow — center */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 184, 166, 0.18) 0%, transparent 70%)",
            }}
          />

          {/* Secondary glow — bottom left */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 10% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            }}
          />
          <Toaster />
          {children}
        </body>
      </QueryClientProvider>
    </html>
  );
}
