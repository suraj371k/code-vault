import { PLAN_LIMITS } from "../config/planLimits.js";
import { Language } from "../generated/prisma/enums.js";
import { prisma } from "./prisma.js";
import redisClient from "./redis.js";

export const invalidateSnippets = async (
  organizationId: number,
): Promise<number> => {
  try {
    const pattern = `org:${organizationId}:snippets:*`;
    const keys: string[] = [];
    let cursor = "0";

    do {
      const response = (await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      })) as { cursor: string; keys: string[] };

      cursor = response.cursor;
      keys.push(...response.keys);
    } while (cursor !== "0");

    if (keys.length > 0) {
      const BATCH_SIZE = 1000;
      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batch = keys.slice(i, i + BATCH_SIZE);
        await redisClient.del(batch);
      }
    }

    return keys.length;
  } catch (error) {
    console.error(
      `Error invalidating snippets for org ${organizationId}:`,
      error,
    );
    return 0;
  }
};

export function toLanguage(raw: unknown): Language | undefined {
  if (typeof raw !== "string") return undefined;
  const upper = raw.toUpperCase();
  if (Object.values(Language).includes(upper as Language)) {
    return upper as Language;
  }
  return undefined;
}

export const invalidateNotifications = async (organizationId: number) => {
  const keys = await redisClient.get(`org:${organizationId}:notifications:*`);
  if (keys && keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const generateSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Utility function to check if organization can perform an action
export const checkOrganizationLimit = async (
  organizationId: number,
  action: "snippets" | "members",
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}> => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: action === "members" ? true : false,
      snippets: action === "snippets" ? true : false,
    },
  });

  if (!organization) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "Organization not found",
    };
  }

  const limits = PLAN_LIMITS[organization.plan];
  let current = 0;
  let limit = 0;

  switch (action) {
    case "snippets":
      current = organization.snippets?.length || 0;
      limit = limits.snippetsPerOrg;
      if (limit === Infinity) return { allowed: true, current, limit };
      break;
    case "members":
      current = organization.members?.length || 0;
      limit = limits.membersPerOrg;
      if (limit === Infinity) return { allowed: true, current, limit };
      break;
  }

  const allowed = current < limit;
  return {
    allowed,
    current,
    limit,
    message: allowed
      ? undefined
      : `${action} limit reached. Your ${organization.plan} plan allows only ${limit} ${action}. Upgrade to add more.`,
  };
};
