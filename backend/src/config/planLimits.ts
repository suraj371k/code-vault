export const PLAN_LIMITS = {
  FREE: {
    organizations: 2,
    snippetsPerOrg: 50,
    membersPerOrg: 3,
  },
  PRO: {
    organizations: 5,
    snippetsPerOrg: Infinity,
    membersPerOrg: 20,
  },
  ENTERPRISE: {
    organizations: Infinity,
    snippetsPerOrg: Infinity,
    membersPerOrg: Infinity,
  },
} as const;
