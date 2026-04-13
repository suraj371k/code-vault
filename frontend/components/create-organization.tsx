import React, { useState } from "react";
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
import { Building2 } from "lucide-react";
import { useCreateOrganization } from "@/hooks/organization/useCreateOrganization";
import toast from "react-hot-toast";

export default function CreateOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate, isPending } = useCreateOrganization();
  const [data, setData] = useState({
    name: "",
    slug: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(data, {
      onSuccess: () => {
        toast.success("Organization created successfully!");
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || "Failed to create organization",
        );
      },
    });
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

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <DialogHeader className="space-y-0 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center size-9 rounded-lg shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Building2
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
                      Create organization
                    </DialogTitle>
                    <DialogDescription className="text-[12.5px] mt-0.5 text-[#6a6a6a]">
                      Set up a new workspace for your team
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Fields */}
            <div className="space-y-4 mb-6">
              {/* Org Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="org-name"
                  className="text-[12px] font-medium tracking-wide uppercase"
                  style={{ color: "#525252", letterSpacing: "0.06em" }}
                >
                  Organization name
                </Label>
                <Input
                  id="org-name"
                  type="text"
                  value={data.name}
                  // ✅ Fixed: was `setData(e.target.value)` which overwrote the whole state with a string
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Acme Inc."
                  className="text-[13px] h-10 rounded-lg border-0 placeholder:text-[#383838] focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#d4d4d4",
                  }}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label
                  htmlFor="org-slug"
                  className="text-[12px] font-medium tracking-wide uppercase"
                  style={{ color: "#525252", letterSpacing: "0.06em" }}
                >
                  URL slug
                </Label>
                <div
                  className="flex items-center h-10 rounded-lg overflow-hidden"
                  style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    className="px-3 text-[13px] border-r h-full flex items-center shrink-0"
                    style={{
                      color: "#525252",
                      borderColor: "rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    app.acme.com/
                  </span>

                  <input
                    id="org-slug"
                    type="text"
                    value={data.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="acme-inc"
                    className="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[#383838]"
                    style={{ color: "#d4d4d4" }}
                  />
                </div>
                <p className="text-[11.5px] text-[#6a6a6a]">
                  This will be your organization's unique URL.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px w-full mb-5"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />

            <DialogFooter className="flex items-center gap-2 sm:justify-between">
              <span className="text-[11.5px] hidden sm:block text-[#6a6a6a]">
                You'll be the owner of this org
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-9 px-4 text-[13px] font-medium rounded-lg border-0 hover:bg-white/5 transition-colors text-zinc-400"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-9 px-4 text-[13px] font-semibold rounded-lg border-0 transition-all hover:opacity-90 active:scale-[0.98] bg-teal-600 text-white disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create organization"}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
