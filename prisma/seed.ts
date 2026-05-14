import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@cargohs54.ru';
  const adminPassword = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Администратор',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
