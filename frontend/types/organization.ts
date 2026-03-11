import { User } from "./auth";

export interface Organizations {
  id: number;
  name: string;
  slug: string;
  role: Role;
}

export interface OrganizationInput {
  name: string;
}

type Role = "MEMBER" | "OWNER";

interface Members {
  id: number;
  userId: number;
  organizationId: number;
  role: Role;
  user: User;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  members: Members[];
}

export interface MembershipInput {
  email: string;
}

export interface MembershipResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number;
    organizationId: number;
    role: string;
  };
}
