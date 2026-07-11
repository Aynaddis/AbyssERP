import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@abysserp.com' },
    update: {},
    create: {
      email: 'admin@abysserp.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@abysserp.com' },
    update: {},
    create: {
      email: 'manager@abysserp.com',
      password: managerPassword,
      name: 'Manager User',
      role: 'MANAGER',
    },
  });

  console.log('Created manager user:', manager.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@abysserp.com' },
    update: {},
    create: {
      email: 'staff@abysserp.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'STAFF',
    },
  });

  console.log('Created staff user:', staff.email);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
