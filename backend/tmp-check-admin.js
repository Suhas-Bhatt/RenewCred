const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const admin = await prisma.admin.findUnique({ where: { email: 'admin@renewcred.dev' } });
  console.log(JSON.stringify(admin, null, 2));
  if (admin) {
    console.log('passwordMatch', await bcrypt.compare('ChangeMe123!', admin.passwordHash));
  }
  await prisma.$disconnect();
})();
