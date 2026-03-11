// store/org-store.ts
import { Organizations } from "@/types/organization";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface OrgStore {
  activeOrg?: null | Organizations;
  setActiveOrg: (org: Organizations) => void;
}

export const useOrgStore = create<OrgStore>()(
  persist(
    (set) => ({
      activeOrg: null,
      setActiveOrg: (org) => set({ activeOrg: org }),
    }),
    { name: "active-org" },
  ),
);
