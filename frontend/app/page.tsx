"use client";

import { useEffect } from "react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data } = useProfile();
 
  return (
    <div>
      <h1 className="text-4xl text-white font-bold">{data?.name}</h1>
    </div>
  );
}
