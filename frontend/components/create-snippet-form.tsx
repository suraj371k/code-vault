"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { ScrollArea } from "./ui/scroll-area";
import { Code2, ChevronDown, Check, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateSnippet } from "@/hooks/snippets/useCreateSnippets";
import { Language } from "@/types/snippets";
import { api } from "@/lib/api";

const CreateSnippetForm = ({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<{
    title: string;
    code: string;
    category: string;
    language: Language | undefined;
  }>({
    title: "",
    code: "",
    category: "",
    language: undefined,
  });

  const { mutate, isPending } = useCreateSnippet(organizationId);

  useEffect(() => {
    async function getAllLanguages() {
      try {
        const res = await api.get("/api/snippets/all/languages");
        setLanguages(res.data.data as Language[]);
      } catch (error) {
        console.error(`error in fetching all languages: ${error}`);
      }
    }
    getAllLanguages();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
        setLangSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectLanguage = (lang: Language) => {
    setData((prev) => ({
      ...prev,
      language: prev.language === lang ? undefined : lang,
    }));
    setLangDropdownOpen(false);
    setLangSearch("");
  };

  const handleSubmit = () => {
    mutate(
      {
        title: data.title,
        code: data.code,
        category: data.category || undefined,
        language: data.language,
      },
      {
        onSuccess: () => {
          toast.success("Snippet saved!", {
            style: {
              background: "#0f172a",
              border: "1px solid rgba(20,184,166,0.3)",
              color: "#2dd4bf",
              fontSize: "13px",
            },
          });
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "something went wrong");
        },
      },
    );
  };

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(langSearch.toLowerCase()),
  );

  // Pretty-print enum value → "TypeScript" style
  const formatLang = (lang: string) =>
    lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#d4d4d4",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 border-0 overflow-visible"
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)",
        }}
      >
        {/* shimmer line */}
        <div
          className="h-px w-full rounded-t-xl"
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
              {/* ── Language single-select dropdown ── */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <Label className="text-[11px] font-medium uppercase tracking-widest text-[#525252]">
                  Language
                </Label>

                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen((v) => !v)}
                  className="w-full h-9 px-3 rounded-lg text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${langDropdownOpen ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
                    color: data.language ? "#d4d4d4" : "#555",
                  }}
                >
                  <span className="text-[13px] truncate flex items-center gap-2">
                    {data.language ? (
                      <>
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"
                          style={{ boxShadow: "0 0 6px rgba(45,212,191,.8)" }}
                        />
                        {formatLang(data.language)}
                      </>
                    ) : (
                      "Select language…"
                    )}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {data.language && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setData((p) => ({ ...p, language: undefined }));
                        }}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors"
                      >
                        <X className="size-3" style={{ color: "#666" }} />
                      </span>
                    )}
                    <ChevronDown
                      className="size-3.5 transition-transform duration-200"
                      style={{
                        color: "#555",
                        transform: langDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </div>
                </button>

                {/* Dropdown panel */}
                {langDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-full z-50 rounded-xl overflow-hidden"
                    style={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                    }}
                  >
                    {/* Search */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      <Search
                        className="size-3.5 shrink-0"
                        style={{ color: "#555" }}
                      />
                      <input
                        autoFocus
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Search…"
                        className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-[#444]"
                        style={{ color: "#d4d4d4" }}
                      />
                    </div>

                    <ScrollArea className="h-44">
                      <div className="p-1">
                        {filteredLanguages.length === 0 ? (
                          <p className="py-4 text-center text-[12px] text-[#444]">
                            No results
                          </p>
                        ) : (
                          filteredLanguages.map((lang) => {
                            const selected = data.language === lang;
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => selectLanguage(lang)}
                                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[12.5px] transition-colors group"
                                style={{
                                  color: selected ? "#2dd4bf" : "#a3a3a3",
                                  background: selected
                                    ? "rgba(20,184,166,0.08)"
                                    : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (!selected)
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.04)";
                                }}
                                onMouseLeave={(e) => {
                                  if (!selected)
                                    e.currentTarget.style.background =
                                      "transparent";
                                }}
                              >
                                <span>{formatLang(lang)}</span>
                                {selected && (
                                  <Check className="size-3.5 shrink-0 text-teal-400" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Category */}
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
                placeholder="Paste your code here…"
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
                className="h-9 px-4 text-[13px] text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!data.title || !data.code || isPending}
                className="h-9 px-4 text-[13px] font-semibold bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isPending ? "Saving…" : "Save Snippet"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSnippetForm;
