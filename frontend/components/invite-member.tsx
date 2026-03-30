import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Users, X } from "lucide-react";
import { useInviteMembers } from "@/hooks/organization/useInviteMember";
import toast from "react-hot-toast";

export default function InviteMembersDialog({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: any;
}) {
  const [email, setEmail] = useState("");

  const {
    mutate: inviteMember,
    isPending,
    isError,
    error,
  } = useInviteMembers(organizationId);

  const handleSubmit = () => {
    inviteMember(
      { email },
      {
        onSuccess: () => {
          onOpenChange(false);
          setEmail("");
          toast.success("member added successfully!");
        },
        onError: (err) => {
          console.error("Invite failed", err);
        },
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-120 p-0 gap-0 border-0 shadow-2xl overflow-hidden"
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        <div className="p-6">
          <DialogHeader className="space-y-0 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <div
                  className="flex items-center justify-center size-9 rounded-lg shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Users
                    className="size-4"
                    style={{ color: "#e5e5e5" }}
                    strokeWidth={1.6}
                  />
                </div>
                <div>
                  <DialogTitle
                    className="text-[15px] font-semibold tracking-tight"
                    style={{
                      color: "#f5f5f5",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Invite members
                  </DialogTitle>
                  <DialogDescription className="text-[12.5px] mt-0.5 text-[#6a6a6a]">
                    Add teammates to your workspace
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Email field */}
          <div className="space-y-2 mb-6">
            <Label
              htmlFor="email"
              className="text-[12px] font-medium tracking-wide uppercase"
              style={{ color: "#525252", letterSpacing: "0.06em" }}
            >
              Email address
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none text-[#6a6a6a]"
                strokeWidth={1.8}
              />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="pl-9 text-[13px] h-10 rounded-lg border-0 placeholder:text-[#383838] focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#d4d4d4",
                }}
              />
            </div>
            <p className="text-[11.5px] text-[#6a6a6a]">
              They'll receive an email invite to join your workspace.
            </p>
          </div>

          {/* Divider */}
          <div
            className="h-px w-full mb-5"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <DialogFooter className="flex items-center gap-2 sm:justify-between">
            {/* Left: member count hint */}
            <span className="text-[11.5px] hidden sm:block text-[#6a6a6a]">
              Up to 10 members on free plan
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-[13px] font-medium rounded-lg border-0 hover:bg-white/5 transition-colors text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !email}
                onClick={handleSubmit}
                className="h-9 px-4 text-[13px] font-semibold rounded-lg border-0 transition-all hover:opacity-90 active:scale-[0.98] bg-teal-600 text-[#6a6a6a]"
              >
                Send invite
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
