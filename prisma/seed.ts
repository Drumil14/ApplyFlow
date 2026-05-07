import { PrismaClient } from "@prisma/client";
import { ensureDemoWorkspace } from "../lib/demo";

const prisma = new PrismaClient();

async function main() {
  await ensureDemoWorkspace(prisma, { force: true });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
