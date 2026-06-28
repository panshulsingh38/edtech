const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'aayushverma.262008@gmail.com' },
      data: { 
        insights: 2000,
        role: 'PRO' // Might as well make him a PRO user too!
      }
    });
    console.log('Successfully updated user:', user.email);
    console.log('New Insights Balance:', user.insights);
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('Error: User not found in the database. Are you sure they signed in?');
    } else {
      console.error(error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
