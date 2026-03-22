import { useState } from "react";

export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copy };
}