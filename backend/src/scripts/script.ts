import { prisma } from "../lib/prisma.js";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "123456",
      name: "Suraj",
      created_at: new Date(),
    },
  });

  console.log("User created:", user);

  // Create snippet
  const snippet = await prisma.snippet.create({
    data: {
      title: "Hello World",
      code: "console.log('Hello World')",
      summary: "Basic JS example",
      created_at: new Date(),
      authorId: user.id,
    },
  });

  console.log("Snippet created:", snippet);

  // Fetch user with snippets
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