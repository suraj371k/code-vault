"use client";

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
import { Textarea } from "./ui/textarea";
import { Code2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateSnippet } from "@/hooks/snippets/useCreateSnippets";

const CreateSnippetForm = ({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}) => {
  const [data, setData] = useState({
    title: "",
    code: "",
    category: "",
    language: "",
  });

  const { mutate, isPending, error } = useCreateSnippet(organizationId);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    mutate(data, {
      onSuccess: () => {
        toast.success("snippet created!!");
      },
    });
    setData({
      title: "",
      code: "",
      category: "",
      language: "",
    });
    onOpenChange(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#d4d4d4",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 border-0 overflow-hidden"
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)",
        }}
      >
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center size-9 rounded-lg shrink-0"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Code2
                  className="size-4"
                  style={{ color: "#e5e5e5" }}
                  strokeWidth={1.6}
                />
              </div>
              <div>
                <DialogTitle
                  className="text-[15px] font-semibold tracking-tight"
                  style={{ color: "#f5f5f5" }}
                >
                  New snippet
                </DialogTitle>
                <DialogDescription className="text-[12.5px] mt-0.5 text-[#6a6a6a]">
                  Save and organize your code
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 mb-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-widest text-[#525252]">
                Title
              </Label>
              <Input
                name="title"
                value={data.title}
                onChange={handleChange}
                placeholder="e.g. Debounce hook"
                className="h-9 text-[13px] rounded-lg border-0 focus-visible:ring-1 focus-visible:ring-white/20"
                style={inputStyle}
              />
            </div>

            {/* Language + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-widest text-[#525252]">
                  Language
                </Label>
                <Input
                  name="language"
                  value={data.language}
                  onChange={handleChange}
                  placeholder="e.g. TypeScript"
                  className="h-9 text-[13px] rounded-lg border-0 focus-visible:ring-1 focus-visible:ring-white/20"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-widest text-[#525252]">
                  Category
                </Label>
                <Input
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                  placeholder="e.g. Hooks"
                  className="h-9 text-[13px] rounded-lg border-0 focus-visible:ring-1 focus-visible:ring-white/20"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-widest text-[#525252]">
                Code
              </Label>
              <Textarea
                name="code"
                value={data.code}
                onChange={handleChange}
                placeholder="Paste your code here..."
                className="text-[12.5px] font-mono rounded-lg border-0 resize-none h-36 overflow-y-scroll focus-visible:ring-1 focus-visible:ring-white/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            className="h-px w-full mb-4"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <DialogFooter className="flex items-center sm:justify-between">
            <span className="text-[11.5px] hidden sm:block text-[#6a6a6a]">
              Snippets are private by default
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-[13px]  text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!data.title || !data.code}
                className="h-9 px-4 text-[13px] font-semibold bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isPending ? "Loading..." : "Save Snippet"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSnippetForm;
