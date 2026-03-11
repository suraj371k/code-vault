"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { useEffect, useMemo } from "react";
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function RootRedirect() {

  const { data: org, isPending, error } = useOrganizations();
  const router = useRouter();

  useEffect(() => {
    if (isPending || error) return;

    if (!org || (Array.isArray(org) && org.length === 0)) {
      router.push("/organization/create");
    } else if (Array.isArray(org)) {
      router.push(`/organization/${org[0].slug}/dashboard`);
    }
  }, [org, isPending, error, router]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased absolute inset-0 text-white`}
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
          <RootRedirect />
          {children}
        </body>
      </QueryClientProvider>
    </html>
  );
}
