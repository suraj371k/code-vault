-- Add tenant columns as nullable first (safe for existing rows)
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "organizationId" INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "organizationId" INTEGER;

-- 1) Backfill Conversation.organizationId from related Group if available
UPDATE "Conversation" c
SET "organizationId" = g."organizationId"
FROM "Group" g
WHERE g."conversationId" = c."id"
  AND c."organizationId" IS NULL;

-- 2) Backfill Conversation.organizationId from Conversation members' memberships
UPDATE "Conversation" c
SET "organizationId" = src."organizationId"
FROM (
  SELECT cm."conversationId", MIN(m."organizationId") AS "organizationId"
  FROM "ConversationMember" cm
  JOIN "Membership" m ON m."userId" = cm."userId"
  GROUP BY cm."conversationId"
) src
WHERE c."id" = src."conversationId"
  AND c."organizationId" IS NULL;

-- 3) Last-resort fallback for orphan conversations
UPDATE "Conversation"
SET "organizationId" = (
  SELECT "id" FROM "Organization" ORDER BY "id" ASC LIMIT 1
)
WHERE "organizationId" IS NULL;

-- 4) Backfill Message.organizationId from Conversation
UPDATE "Message" m
SET "organizationId" = c."organizationId"
FROM "Conversation" c
WHERE m."conversationId" = c."id"
  AND m."organizationId" IS NULL;

-- 5) Backfill Message.organizationId from Group
UPDATE "Message" m
SET "organizationId" = g."organizationId"
FROM "Group" g
WHERE m."groupId" = g."id"
  AND m."organizationId" IS NULL;

-- 6) Backfill Message.organizationId from sender membership
UPDATE "Message" m
SET "organizationId" = src."organizationId"
FROM (
  SELECT "userId", MIN("organizationId") AS "organizationId"
  FROM "Membership"
  GROUP BY "userId"
) src
WHERE m."senderId" = src."userId"
  AND m."organizationId" IS NULL;

-- 7) Last-resort fallback for orphan messages
UPDATE "Message"
SET "organizationId" = (
  SELECT "id" FROM "Organization" ORDER BY "id" ASC LIMIT 1
)
WHERE "organizationId" IS NULL;

-- Make columns required after backfill
ALTER TABLE "Conversation" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add foreign keys if they do not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Conversation_organizationId_fkey'
  ) THEN
    ALTER TABLE "Conversation"
    ADD CONSTRAINT "Conversation_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Message_organizationId_fkey'
  ) THEN
    ALTER TABLE "Message"
    ADD CONSTRAINT "Message_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
