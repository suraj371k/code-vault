"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Database, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/auth/useLogout";
import { useProfile } from "@/hooks/auth/useProfile";
import toast from "react-hot-toast";

export default function TopNavbar() {
  const router = useRouter();
  const { slug } = useParams();
  const { data: profile } = useProfile();
  const { mutate, isPending } = useLogout();

  const currentSlug = Array.isArray(slug) ? slug[0] : slug;

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

  return (
    <div className="w-full flex items-center justify-between gap-3">
      <Link href="/" className="group flex items-center gap-2.5 min-w-0">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #0f766e, #0d9488)",
            boxShadow: "0 0 12px 2px rgba(20,184,166,0.28)",
          }}
        >
          <Database className="size-4 text-teal-100" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-none truncate group-hover:text-teal-200 transition-colors">
            Code-Vault
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 leading-none truncate">
            Go to homepage
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2.5 border border-teal-950/30 bg-teal-950/10 text-zinc-200 hover:bg-teal-950/20 hover:text-zinc-100 focus-visible:text-zinc-100 data-[state=open]:text-zinc-100"
          >
            <User className="size-4 text-zinc-300" />
            <span className="max-w-28 truncate text-xs">
              {profile?.name ?? "Account"}
            </span>
            <ChevronDown className="size-3.5 text-zinc-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 border border-white/8"
          style={{
            background: "#191919",
            borderRadius: "10px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <DropdownMenuLabel className="px-2 py-2">
            <p className="text-[13px] font-medium text-neutral-200 truncate">
              {profile?.name ?? "Logged in user"}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {profile?.email ?? "No email available"}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/8" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  currentSlug
                    ? `/organization/${currentSlug}/dashboard/settings`
                    : "/settings"
                )
              }
              className="cursor-pointer text-neutral-200 focus:bg-white/8 focus:text-neutral-100"
            >
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/8" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-400 focus:bg-red-950/30 focus:text-red-300"
          >
            <LogOut className="size-4 text-red-400" />
            {isPending ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
