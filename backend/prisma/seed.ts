import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ── Users ──────────────────────────────────────────────
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

  // ── Categories ─────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const officeSupplies = await prisma.category.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: { name: 'Office Supplies' },
  });

  const furniture = await prisma.category.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: { name: 'Furniture' },
  });

  console.log('Created 3 categories');

  // ── Products (mix of healthy and low stock so the dashboard has something to show) ──
  const products = [
    { name: 'Wireless Keyboard', sku: 'KB-001', price: 29.99, costPrice: 15, quantity: 45, lowStockThreshold: 10, categoryId: electronics.id },
    { name: 'Wireless Mouse', sku: 'MS-001', price: 19.99, costPrice: 9, quantity: 60, lowStockThreshold: 15, categoryId: electronics.id },
    { name: '27" Monitor', sku: 'MN-027', price: 249.99, costPrice: 160, quantity: 8, lowStockThreshold: 10, categoryId: electronics.id },
    { name: 'USB-C Hub', sku: 'HUB-001', price: 34.99, costPrice: 18, quantity: 5, lowStockThreshold: 10, categoryId: electronics.id },
    { name: 'A4 Paper Ream', sku: 'PPR-A4', price: 5.99, costPrice: 3, quantity: 200, lowStockThreshold: 50, categoryId: officeSupplies.id },
    { name: 'Ballpoint Pens (Box of 50)', sku: 'PEN-050', price: 8.99, costPrice: 4, quantity: 30, lowStockThreshold: 20, categoryId: officeSupplies.id },
    { name: 'Stapler', sku: 'STP-001', price: 7.5, costPrice: 3.5, quantity: 3, lowStockThreshold: 10, categoryId: officeSupplies.id },
    { name: 'Office Chair', sku: 'CHR-001', price: 149.99, costPrice: 90, quantity: 12, lowStockThreshold: 5, categoryId: furniture.id },
    { name: 'Standing Desk', sku: 'DSK-001', price: 399.99, costPrice: 250, quantity: 2, lowStockThreshold: 5, categoryId: furniture.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }
  console.log(`Created ${products.length} products`);

  // ── Supplier ───────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-techsource' },
    update: {},
    create: {
      id: 'seed-supplier-techsource',
      name: 'TechSource Wholesale',
      email: 'orders@techsource.example.com',
      phone: '+251-911-000-000',
      address: 'Addis Ababa, Ethiopia',
    },
  });
  console.log('Created supplier:', supplier.name);

  // ── Customer ───────────────────────────────────────────
  const customer = await prisma.customer.upsert({
    where: { id: 'seed-customer-walkin' },
    update: {},
    create: {
      id: 'seed-customer-walkin',
      name: 'Walk-in Customer',
      email: 'walkin@example.com',
    },
  });
  console.log('Created customer:', customer.name);

  // ── Employees ──────────────────────────────────────────
  const employees = [
    { name: 'Abel Tesfaye', department: 'Sales', position: 'Sales Associate', salary: 32000 },
    { name: 'Sara Getachew', department: 'Warehouse', position: 'Inventory Clerk', salary: 28000 },
    { name: 'Dawit Bekele', department: 'Management', position: 'Store Manager', salary: 55000 },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@abysserp.com` },
      update: {},
      create: {
        ...emp,
        email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@abysserp.com`,
      },
    });
  }
  console.log(`Created ${employees.length} employees`);

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:   admin@abysserp.com / admin123');
  console.log('  Manager: manager@abysserp.com / manager123');
  console.log('  Staff:   staff@abysserp.com / staff123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });