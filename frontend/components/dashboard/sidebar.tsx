"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Clock,
  Folder,
  Heart,
  Mail,
  SquareDashedBottomCode,
  LayoutDashboard,
  LogOut,
  ChevronsUpDown,
  Building2,
  Plus,
  UserPlus,
  Bell,
} from "lucide-react";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLogout } from "@/hooks/auth/useLogout";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import toast from "react-hot-toast";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import InviteMembersDialog from "../invite-member";
import CreateOrganizationDialog from "../create-organization";

const items = [
  { id: 0, path: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
  {
    id: 1,
    path: "/dashboard/snippets",
    title: "Snippets",
    icon: SquareDashedBottomCode,
  },
  { id: 4, path: "/dashboard/teams", title: "Teams", icon: Mail },
  {
    id: 5,
    path: "/dashboard/notifications",
    title: "Notifications",
    icon: Bell,
  },
];

const DashboardSidebar = () => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const { data, isPending } = useOrganizations();
  const { slug } = useParams();
  const pathname = usePathname();

  const { mutate, isPending: loading } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        router.push("/");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Logout failed. Please try again.");
      },
    });
  };

  const currentSlug = Array.isArray(slug) ? slug[0] : slug;
  const activeOrganization = data?.find((org) => org.slug === currentSlug);

  // Derive active item from the current URL — works on refresh, back/forward, direct navigation
  const activeId = (() => {
    // Sort by descending path length so more specific paths match first
    // e.g. /dashboard/snippets matches before /dashboard
    const sorted = [...items].sort((a, b) => b.path.length - a.path.length);
    const match = sorted.find((item) =>
      pathname.includes(item.path.replace("/dashboard", "dashboard")),
    );
    return match?.id ?? 0;
  })();

  useEffect(() => {
    if (isPending || !data?.length) return;

    const hasValidSlug = currentSlug
      ? data.some((org) => org.slug === currentSlug)
      : false;

    if (!hasValidSlug) {
      router.replace(`/organization/${data[0].slug}/dashboard`);
    }
  }, [data, isPending, slug, router]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ "--sidebar": "black" } as React.CSSProperties}
    >
      <Sidebar
        collapsible="icon"
        className="border-r border-teal-950/60 bg-[#0a0a0f] text-zinc-100 relative overflow-hidden h-screen!"
      >
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)",
          }}
        />

        {/*  HEADER  */}
        <SidebarHeader className="px-4 py-5 border-b border-teal-950/50 relative z-10">
          {/*Organization Card */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-teal-950/30 group-data-[collapsible=icon]:justify-center"
            style={{ background: "rgba(20,184,166,0.04)" }}
          >
            {/* Org Avatar */}
            <div
              className="flex items-center justify-center size-7 rounded-lg shrink-0"
              style={{
                background: "linear-gradient(135deg, #0f766e, #0d9488)",
                boxShadow: "0 0 12px 2px rgba(20,184,166,0.38)",
              }}
            >
              <Building2 className="size-3.5 text-teal-100" strokeWidth={1.8} />
            </div>

            <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-teal-700 leading-none">
                Organization
              </p>
              <div className="text-[13px] font-semibold text-slate-200 mt-0.75 truncate leading-none">
                <p>{activeOrganization?.name ?? "..."}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ChevronsUpDown className="size-3.5 shrink-0 text-teal-800 group-data-[collapsible=icon]:hidden cursor-pointer" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 p-0 overflow-hidden border border-white/8"
                align="start"
                style={{
                  background: "#191919",
                  borderRadius: "10px",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                {/* Header label */}
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-neutral-500">
                    Workspaces
                  </p>
                </div>

                {/* Org list */}
                <div className="px-1 pb-1">
                  {data?.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() =>
                        router.push(`/organization/${org.slug}/dashboard`)
                      }
                      className="flex items-center gap-2.5 px-2 py-2 rounded-[6px] cursor-pointer hover:bg-white/6 focus:bg-white/6 focus:text-neutral-200 hover:text-neutral-200"
                      style={{ color: "#e5e5e5" }}
                    >
                      <div
                        className="flex items-center justify-center size-6 rounded-md shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #0f766e, #0d9488)",
                        }}
                      >
                        <Building2
                          className="size-3 text-teal-100"
                          strokeWidth={1.8}
                        />
                      </div>
                      <span className="flex-1 text-[13px] font-medium truncate ">
                        {org.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0  hover:bg-white/6 focus:bg-white/6 focus:text-neutral-200 hover:text-neutral-200"
                        style={{
                          background: "rgba(20,184,166,0.15)",
                          color: "#2dd4bf",
                        }}
                      >
                        {org.role}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>

                <div className="mx-3 border-t border-white/6" />

                {/* Invite member */}
                <div className="px-1 py-1">
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-2 py-2 rounded-[6px] cursor-pointer hover:bg-white/6 focus:bg-white/6 focus:text-neutral-200 hover:text-neutral-200"
                    style={{ color: "#a3a3a3" }}
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setInviteOpen(true)}
                  >
                    <div
                      className="flex items-center justify-center size-6 rounded-md shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <UserPlus
                        className="size-3.5"
                        style={{ color: "#a3a3a3" }}
                        strokeWidth={1.8}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-neutral-300">
                        Invite members
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Add teammates via email
                      </p>
                    </div>
                  </DropdownMenuItem>
                  {activeOrganization && (
                    <InviteMembersDialog
                      open={inviteOpen}
                      onOpenChange={setInviteOpen}
                      organizationId={activeOrganization.id}
                    />
                  )}
                </div>

                <div className="mx-3 border-t border-white/6" />

                {/* Create org */}
                <div className="px-1 py-1 pb-1.5">
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setOrgOpen(true)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-[6px] cursor-pointer  hover:bg-white/6 focus:bg-white/6 focus:text-neutral-200 hover:text-neutral-200"
                    style={{ color: "#a3a3a3" }}
                  >
                    <div
                      className="flex items-center justify-center size-6 rounded-md shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <Plus
                        className="size-3.5"
                        style={{ color: "#a3a3a3" }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-neutral-300">
                        Create organization
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Set up a new workspace
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateOrganizationDialog
              open={orgOpen}
              onOpenChange={setOrgOpen}
            />
          </div>
        </SidebarHeader>

        {/*NAV ITEMS */}
        <SidebarContent className="px-2 py-4 relative z-10">
          <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-teal-800 px-3 mb-2 group-data-[collapsible=icon]:hidden">
            Main Menu
          </p>

          <SidebarMenu className="space-y-0.75">
            {items.map((item, i) => {
              const isActive = activeId === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: i * 0.055,
                    ease: "easeOut",
                  }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="group/item relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors duration-200 border"
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(120deg, rgba(20,184,166,0.13) 0%, rgba(45,212,191,0.07) 100%)",
                              borderColor: "rgba(20,184,166,0.28)",
                              boxShadow: "0 0 16px rgba(20,184,166,0.1)",
                            }
                          : {
                              borderColor: "transparent",
                              background: "transparent",
                            }
                      }
                    >
                      <Link
                        href={`/organization/${slug}/${item.path}`}
                        className="flex items-center gap-3 w-full"
                      >
                        {/* Animated active left pill */}
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-pill"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 rounded-r-full"
                            style={{
                              height: "58%",
                              background:
                                "linear-gradient(180deg, #2dd4bf, #5eead4)",
                              boxShadow: "0 0 10px 3px rgba(45,212,191,0.65)",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                          />
                        )}

                        {/* Icon */}
                        <motion.span
                          animate={
                            isActive
                              ? {
                                  color: "#5eead4",
                                  filter:
                                    "drop-shadow(0 0 6px rgba(94,234,212,0.75))",
                                }
                              : {
                                  color: "#52525b",
                                  filter: "drop-shadow(0 0 0px transparent)",
                                }
                          }
                          transition={{ duration: 0.2 }}
                          className="shrink-0"
                        >
                          <item.icon
                            className="size-4"
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                        </motion.span>

                        {/* Label */}
                        <motion.span
                          className="text-sm font-medium group-data-[collapsible=icon]:hidden"
                          animate={{ color: isActive ? "#f0fdfa" : "#6b7280" }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.title}
                        </motion.span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* footer */}
        <SidebarFooter className="border-t border-teal-950/50 px-2 py-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38, ease: "easeOut" }}
            className="space-y-1"
          >
            {/* ── Logout Button ── */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group/logout w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-transparent transition-all duration-200 hover:border-red-900/40 hover:bg-red-950/20 group-data-[collapsible=icon]:justify-center"
              onClick={() => {
                handleLogout();
              }}
            >
              <div
                className="flex items-center justify-center size-7 rounded-lg shrink-0 transition-all duration-200 group-hover/logout:bg-red-950/40"
                style={{ background: "rgba(239,68,68,0.08)" }}
              >
                <LogOut
                  className="size-3.5 text-red-500/70 group-hover/logout:text-red-400 transition-colors duration-200"
                  strokeWidth={1.8}
                />
              </div>

              <span className="group-data-[collapsible=icon]:hidden text-[13px] font-medium text-zinc-500 group-hover/logout:text-red-400 transition-colors duration-200">
                {loading ? "Logging out..." : "Logout"}
              </span>
            </motion.button>
          </motion.div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DashboardSidebar;
