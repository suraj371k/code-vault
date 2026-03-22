import DashboardSidebar from "@/components/dashboard/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-black h-screen overflow-hidden flex">

      <DashboardSidebar />

      <SidebarInset className="bg-black flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center px-4 border-b border-zinc-800/60">
          <SidebarTrigger className="text-white hover:bg-gray-300" />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>

    </SidebarProvider>
  );
}
