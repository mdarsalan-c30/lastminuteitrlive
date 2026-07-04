import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const codes = await prisma.referralCode.findMany();
    console.log("Success! Codes:", codes);
  } catch (e) {
    console.error("Error connecting to DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
