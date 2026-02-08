import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  console.log(JSON.stringify(users, null, 2));
}
run();
