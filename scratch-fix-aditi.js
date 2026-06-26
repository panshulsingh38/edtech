const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'Aditi',
        mode: 'insensitive'
      }
    }
  });
  console.log(JSON.stringify(users, null, 2));

  if (users.length === 1) {
    const updated = await prisma.user.update({
      where: { id: users[0].id },
      data: { insights: users[0].insights + 25 }
    });
    console.log("Successfully credited 25 insights to Aditi!");
  } else {
    console.log("Found multiple or zero Aditis. Could not update automatically.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
