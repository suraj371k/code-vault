import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "../../components/dashboard/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-black">

      <DashboardSidebar />

      <SidebarInset className="bg-black">
        <header className="flex h-16 items-center px-4 border-b">
          <SidebarTrigger className="text-white hover:bg-gray-300" />
        </header>

        <main className="p-4">
          {children}
        </main>
      </SidebarInset>

    </SidebarProvider>
  );
}