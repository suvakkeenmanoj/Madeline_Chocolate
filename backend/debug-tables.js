const { PrismaClient } = require("./node_modules/@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const res = await prisma.$queryRawUnsafe(
    "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 200"
  );
  console.log(JSON.stringify(res, null, 2));
  await prisma.$disconnect();
})();
