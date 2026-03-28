import DashboardSidebar from "@/components/dashboard/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import TopNavbar from "@/components/dashboard/top-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-black h-screen overflow-hidden flex">
      <DashboardSidebar />

      <SidebarInset className="relative bg-black flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(20, 184, 166, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20, 184, 166, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Center glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 184, 166, 0.18) 0%, transparent 70%)",
          }}
        />

        {/* Secondary glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 10% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
          }}
        />

        <header className="relative z-10 flex h-16 shrink-0 items-center gap-3 px-4 border-b border-zinc-800/70 bg-black/65 backdrop-blur-xl">
          <SidebarTrigger className="text-white hover:bg-zinc-800 hover:text-white" />
          <TopNavbar />
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
