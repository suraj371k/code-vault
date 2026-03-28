import { User } from "./auth";

export interface Organizations {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

export interface OrganizationInput {
  name: string;
}

type Role = "MEMBER" | "OWNER";

interface Members {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  user: User;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  members?: Members[];
}

export interface MembershipInput {
  email: string;
} 

export interface MembershipResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
  };
}
