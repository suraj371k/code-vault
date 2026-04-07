import { prisma } from "../lib/prisma.js";

async function main() {
  // Step 1: Create an Organization first (required by Snippet)
  const org = await prisma.organization.create({
    data: {
      name: "Test Org",
    },
  });

  console.log("Org created:", org);

  // Step 2: Create User
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "123456",
      name: "Suraj",
    },
  });

  console.log("User created:", user);

  // Step 3: Create Snippet (needs both authorId + organizationId)
  const snippet = await prisma.snippet.create({
    data: {
      title: "Hello World",
      code: "console.log('Hello World')",
      summary: ["Basic JS example"],  // ✅ String[]
      authorId: user.id,
      organizationId: org.id,         // ✅ required, was missing
      // created_at is auto-set by @default(now()), no need to pass
    },
  });

  console.log("Snippet created:", snippet);

  // Step 4: Fetch users with snippets
  const result = await prisma.user.findMany({
    include: {
      snippets: true,
    },
  });

  console.log("All users:", result);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });