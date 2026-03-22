"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Auth routes that should never trigger the redirect logic
const AUTH_PATHS = ["/login", "/signup", "/"];

function RootRedirect() {
  const { data: org, isPending, error } = useOrganizations();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only auto-redirect from the bare root path "/"
    if (pathname !== "/") return;
    // Wait until the query has settled
    if (isPending) return;
    // If there's an error (e.g. 401 – not logged in), stay on "/"
    // so the landing page or login can handle it
    if (error) return;
    // Logged-in user with no org yet → create one
    if (!org || (Array.isArray(org) && org.length === 0)) {
      router.push("/organization/create");
    } else if (Array.isArray(org) && org.length > 0) {
      router.push(`/organization/${org[0].slug}/dashboard`);
    }
  }, [org, isPending, error, router, pathname]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't auto-retry on 401/403 – they're auth failures, not transient errors
            retry: (failureCount, error: any) => {
              const status = error?.response?.status;
              if (status === 401 || status === 403) return false;
              return failureCount < 2;
            },
          },
        },
      }),
    []
  );

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

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111118",
                color: "#e4e4e7",
                border: "1px solid rgba(20,184,166,0.25)",
                borderRadius: "10px",
                fontSize: "13px",
              },
              success: {
                iconTheme: { primary: "#14b8a6", secondary: "#000" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
          <RootRedirect />
          {children}
        </body>
      </QueryClientProvider>
    </html>
  );
}
