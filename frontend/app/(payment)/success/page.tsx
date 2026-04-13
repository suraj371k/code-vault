// app/success/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const slug = useParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/organization/${slug}/dashboard`);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-500">
        Payment Successful 🎉
      </h1>
      <p className="text-zinc-400 mt-4">Redirecting to dashboard...</p>
    </div>
  );
}
