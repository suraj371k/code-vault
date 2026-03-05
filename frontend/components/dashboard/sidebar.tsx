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
  Database,
  User2,
  ChevronUp,
  LogOut,
  ChevronsUpDown,
  Building2,
} from "lucide-react";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLogout } from "@/hooks/auth/useLogout";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/auth/useProfile";

const items = [
  { id: 0, path: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
  {
    id: 1,
    path: "/dashboard/snippets",
    title: "Snippets",
    icon: SquareDashedBottomCode,
  },
  { id: 2, path: "/dashboard/fav", title: "Favorites", icon: Heart },
  { id: 3, path: "/dashboard/recent", title: "Recent", icon: Clock },
  { id: 4, path: "/dashboard/teams", title: "Teams", icon: Mail },
  { id: 5, path: "/dashboard/collections", title: "Collections", icon: Folder },
];
const DashboardSidebar = () => {
  const [activeId, setActiveId] = useState(0);
  const { data, isPending, error } = useProfile();

  const { mutate } = useLogout();

  const router = useRouter();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  return (
    <div
      className="h-screen"
      style={{ "--sidebar": "#0a0a0f" } as React.CSSProperties}
    >
      <Sidebar
        collapsible="icon"
        className="border-r border-teal-950/60 bg-[#0a0a0f] text-zinc-100 relative overflow-hidden"
      >
        {/* ── Ambient teal glow orbs ── */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)",
          }}
        />

        {/* ── Glowing right border ── */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-px z-50"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.45) 30%, rgba(45,212,191,0.55) 50%, rgba(20,184,166,0.45) 70%, transparent 100%)",
          }}
        />

        {/* ──────────── HEADER ──────────── */}
        <SidebarHeader className="px-4 py-5 border-b border-teal-950/50 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo with teal glow pulse */}
              <motion.div
                className="flex items-center justify-center size-8 rounded-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
                  boxShadow: "0 0 16px 4px rgba(20,184,166,0.45)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 12px 3px rgba(20,184,166,0.4)",
                    "0 0 22px 6px rgba(20,184,166,0.65)",
                    "0 0 12px 3px rgba(20,184,166,0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Database className="size-4 text-white" strokeWidth={2.2} />
              </motion.div>

              <div className="group-data-[collapsible=icon]:hidden min-w-0">
                <p className="font-bold tracking-tight text-white text-[15px] leading-none">
                  Code<span className="text-teal-400">Vault</span>
                </p>
                <p className="text-[10px] tracking-[0.16em] uppercase font-semibold text-teal-700/80 mt-[3px]">
                  Workspace
                </p>
              </div>
            </Link>
          </motion.div>
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
                      onClick={() => setActiveId(item.id)}
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
                        href={item.path}
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

        {/* ──────────── FOOTER ──────────── */}
        <SidebarFooter className="border-t border-teal-950/50 px-2 py-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38, ease: "easeOut" }}
            className="space-y-1"
          >
            {/* ── Organization Card ── */}
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
                <Building2
                  className="size-3.5 text-teal-100"
                  strokeWidth={1.8}
                />
              </div>

              <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-teal-700 leading-none">
                  Organization
                </p>
                <p className="text-[13px] font-semibold text-slate-200 mt-[3px] truncate leading-none">
                  Acme Corp
                </p>
              </div>

              <ChevronsUpDown className="size-3.5 shrink-0 text-teal-800 group-data-[collapsible=icon]:hidden" />
            </div>
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
                Log out
              </span>
            </motion.button>
          </motion.div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DashboardSidebar;
