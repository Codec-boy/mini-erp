import { Role, CustomerStatus, ProductStatus, MovementType, MovementRefType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.config';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash common password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users (All 4 roles)
  console.log('👤 Seeding Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@minierp.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: {
      name: 'Rahul Sharma (Sales Mgr)',
      email: 'sales@minierp.com',
      passwordHash,
      role: Role.SALES,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@minierp.com' },
    update: {},
    create: {
      name: 'Vikram Singh (Warehouse Mgr)',
      email: 'warehouse@minierp.com',
      passwordHash,
      role: Role.WAREHOUSE,
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@minierp.com' },
    update: {},
    create: {
      name: 'Priya Mehta (Accounts Mgr)',
      email: 'accounts@minierp.com',
      passwordHash,
      role: Role.ACCOUNTS,
      isActive: true,
    },
  });

  console.log(`✅ Users seeded: Admin (${adminUser.email}), Sales (${salesUser.email}), Warehouse (${warehouseUser.email}), Accounts (${accountsUser.email})`);

  // 2. Seed Customers
  console.log('🏢 Seeding CRM Customers...');
  const customer1 = await prisma.customer.upsert({
    where: { code: 'CUST-1001' },
    update: {},
    create: {
      code: 'CUST-1001',
      companyName: 'Apex Industrial Electronics Pvt Ltd',
      contactPerson: 'Amit Patel',
      email: 'amit@apexindustrial.com',
      phone: '+91 98765 43210',
      address: 'Plot 45, GIDC Industrial Estate, Ahmedabad, Gujarat',
      gstin: '24AAACA123411Z5',
      creditLimit: 500000.0,
      outstandingBalance: 125000.0,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { code: 'CUST-1002' },
    update: {},
    create: {
      code: 'CUST-1002',
      companyName: 'Global Wholesale Hardware Traders',
      contactPerson: 'Suresh Kumar',
      email: 'suresh@globalwholesale.in',
      phone: '+91 98111 22334',
      address: 'Shop 12-14, Hardware Market, Old Delhi, New Delhi',
      gstin: '07BBBCC567822Z9',
      creditLimit: 750000.0,
      outstandingBalance: 0.0,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { code: 'CUST-1003' },
    update: {},
    create: {
      code: 'CUST-1003',
      companyName: 'Metro Electricals & Distribution',
      contactPerson: 'Rajesh Nair',
      email: 'contact@metroelectricals.com',
      phone: '+91 94470 12345',
      address: '88 MG Road, Ernakulam, Kochi, Kerala',
      gstin: '32DDDEE901233Z1',
      creditLimit: 250000.0,
      outstandingBalance: 180000.0,
      status: CustomerStatus.ACTIVE,
    },
  });

  console.log('✅ Customers seeded.');

  // 3. Seed Products & Stock Levels
  console.log('📦 Seeding Products & Initial Inventory Stock...');
  const productsData = [
    {
      sku: 'SKU-ELEC-001',
      name: 'Heavy Duty 24V Power Supply Module',
      description: 'Industrial grade 24V 10A DIN Rail mounting power supply unit',
      category: 'Electronics',
      unit: 'PCS',
      unitPrice: 2850.0,
      costPrice: 1900.0,
      initialStock: 120,
      minThresholdQuantity: 25,
      reorderQuantity: 100,
    },
    {
      sku: 'SKU-ELEC-002',
      name: 'Smart IoT Temperature Sensor Hub',
      description: 'Wireless Bluetooth/Wi-Fi industrial telemetry sensor module',
      category: 'Electronics',
      unit: 'PCS',
      unitPrice: 4200.0,
      costPrice: 2800.0,
      initialStock: 45,
      minThresholdQuantity: 15,
      reorderQuantity: 50,
    },
    {
      sku: 'SKU-HDW-005',
      name: 'Stainless Steel Flange Bolts M12x50',
      description: 'High tensile grade 316 stainless steel hex head flange bolts (Box of 100)',
      category: 'Hardware',
      unit: 'BOX',
      unitPrice: 1450.0,
      costPrice: 950.0,
      initialStock: 8, // Low stock trigger test!
      minThresholdQuantity: 20,
      reorderQuantity: 60,
    },
    {
      sku: 'SKU-CAB-010',
      name: 'Cat6 Shielded Armored Ethernet Cable 305m',
      description: 'Outdoor shielded UV resistant copper networking cable drum',
      category: 'Cables',
      unit: 'DRUM',
      unitPrice: 8900.0,
      costPrice: 6200.0,
      initialStock: 30,
      minThresholdQuantity: 10,
      reorderQuantity: 25,
    },
    {
      sku: 'SKU-PKG-020',
      name: 'Heavy Duty Corrugated Shipping Boxes (Pack of 50)',
      description: '5-Ply 18x12x12 inch shipping cardboard boxes',
      category: 'Packaging',
      unit: 'PACK',
      unitPrice: 1200.0,
      costPrice: 750.0,
      initialStock: 0, // Out of stock trigger test!
      minThresholdQuantity: 15,
      reorderQuantity: 50,
    },
  ];

  for (const prodData of productsData) {
    const { initialStock, minThresholdQuantity, reorderQuantity, ...item } = prodData;

    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });

    const stock = await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        currentQuantity: initialStock,
        minThresholdQuantity,
        reorderQuantity,
      },
    });

    if (initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: MovementType.INWARD_PURCHASE,
          quantity: initialStock,
          referenceType: MovementRefType.PURCHASE_ORDER,
          referenceId: 'PO-SEED-2026-001',
          reason: 'Initial opening stock intake during system initialization',
          createdById: warehouseUser.id,
        },
      });
    }
  }

  console.log('✅ Products and inventory stock seeded successfully.');
  console.log('🎉 Database Seeding Completed Cleanly!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
