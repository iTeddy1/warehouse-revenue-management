import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get a random element from an array */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get N unique random elements from an array (no duplicates) */
function getRandomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/** Get a random integer between min and max (inclusive) */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Get a random date between start and end */
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

/** Return a date N days before today */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ============================================================================
// PRODUCT CATALOG (25 items)
// ============================================================================

const PRODUCT_CATALOG = [
  // Thời trang
  { name: "Áo thun cotton unisex", unit: "Cái", cost: 80_000, sell: 150_000 },
  { name: "Áo sơ mi nam dài tay", unit: "Cái", cost: 180_000, sell: 350_000 },
  { name: "Quần jean nam slim fit", unit: "Cái", cost: 250_000, sell: 480_000 },
  { name: "Giày thể thao nữ", unit: "Đôi", cost: 350_000, sell: 650_000 },
  { name: "Túi xách da nữ", unit: "Cái", cost: 420_000, sell: 850_000 },
  // Điện tử - Máy tính
  { name: "Bàn phím cơ RGB TKL", unit: "Cái", cost: 750_000, sell: 1_200_000 },
  { name: "Chuột không dây Bluetooth", unit: "Cái", cost: 280_000, sell: 520_000 },
  { name: "Màn hình 24 inch Full HD", unit: "Cái", cost: 2_800_000, sell: 4_500_000 },
  { name: "Tai nghe chụp tai chống ồn", unit: "Cái", cost: 1_200_000, sell: 2_100_000 },
  { name: "Webcam Full HD 1080p", unit: "Cái", cost: 450_000, sell: 820_000 },
  { name: "USB Hub 7 cổng", unit: "Cái", cost: 120_000, sell: 220_000 },
  { name: "Cáp sạc Type-C 100W", unit: "Sợi", cost: 55_000, sell: 110_000 },
  { name: "Ổ cứng SSD 256GB", unit: "Cái", cost: 850_000, sell: 1_400_000 },
  { name: "RAM DDR4 8GB 3200MHz", unit: "Thanh", cost: 650_000, sell: 1_050_000 },
  // Gia dụng - Văn phòng
  { name: "Bình giữ nhiệt 500ml", unit: "Cái", cost: 95_000, sell: 189_000 },
  { name: "Đèn bàn LED chống cận", unit: "Cái", cost: 150_000, sell: 290_000 },
  { name: "Giá đỡ laptop nhôm", unit: "Cái", cost: 220_000, sell: 420_000 },
  { name: "Bàn di chuột cỡ lớn XL", unit: "Cái", cost: 80_000, sell: 160_000 },
  { name: "Móc treo đồ dán tường", unit: "Bộ", cost: 25_000, sell: 59_000 },
  { name: "Kệ sách gỗ 3 tầng", unit: "Cái", cost: 380_000, sell: 720_000 },
  // Thực phẩm - Sức khỏe
  { name: "Cà phê rang xay Arabica 500g", unit: "Gói", cost: 120_000, sell: 220_000 },
  { name: "Trà xanh Đà Lạt hộp 100g", unit: "Hộp", cost: 65_000, sell: 130_000 },
  { name: "Vitamin C 1000mg hộp 30 viên", unit: "Hộp", cost: 85_000, sell: 165_000 },
  { name: "Sữa tươi nguyên kem 1 lít", unit: "Hộp", cost: 28_000, sell: 52_000 },
  { name: "Dầu ô liu nguyên chất 500ml", unit: "Chai", cost: 145_000, sell: 275_000 },
];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // --------------------------------------------------------------------------
  // STEP 1 — CLEANUP (respect FK order)
  // --------------------------------------------------------------------------
  console.log("🧹 Cleaning up existing data...");
  await prisma.saleDetail.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.importRecord.deleteMany();
  await prisma.product.deleteMany();
  console.log("   ✔ All tables cleared.\n");

  // --------------------------------------------------------------------------
  // STEP 2 — SEED PRODUCTS (25 items, stockQty = 0)
  // --------------------------------------------------------------------------
  console.log("📦 Seeding products...");
  const createdProducts = await Promise.all(
    PRODUCT_CATALOG.map((p, i) =>
      prisma.product.create({
        data: {
          code: `SP${String(i + 1).padStart(3, "0")}`,
          name: p.name,
          unit: p.unit,
          costPrice: new Prisma.Decimal(p.cost),
          sellPrice: new Prisma.Decimal(p.sell),
          stockQty: 0,
          alertLevel: getRandomInt(10, 20),
        },
      }),
    ),
  );
  console.log(`   ✔ Created ${createdProducts.length} products.\n`);

  // --------------------------------------------------------------------------
  // STEP 3 — SEED IMPORT RECORDS (restock each product 1-2 times)
  // --------------------------------------------------------------------------
  console.log("📥 Seeding import records...");
  const importStart = daysAgo(90);
  const importEnd = daysAgo(60);

  // Keep a mutable map of stockQty so we can track it during sales seeding
  const stockMap = new Map<string, number>(createdProducts.map(p => [p.id, 0]));

  for (const product of createdProducts) {
    const numberOfImports = getRandomInt(1, 2);
    for (let i = 0; i < numberOfImports; i++) {
      const qty = getRandomInt(50, 150);
      await prisma.importRecord.create({
        data: {
          productId: product.id,
          quantity: qty,
          costPrice: product.costPrice,
          importDate: getRandomDate(importStart, importEnd),
        },
      });
      stockMap.set(product.id, (stockMap.get(product.id) ?? 0) + qty);
    }
    // Persist the accumulated stockQty to the database
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQty: stockMap.get(product.id) },
    });
  }
  console.log(`   ✔ Import records created and stock levels updated.\n`);

  // --------------------------------------------------------------------------
  // STEP 4 — SEED SALES (50+ invoices, spread over last 60 days)
  // --------------------------------------------------------------------------
  console.log("🛒 Seeding sales...");
  const saleStart = daysAgo(60);
  const saleEnd = new Date();
  const TARGET_SALES = 55;

  let salesCreated = 0;

  for (let s = 0; s < TARGET_SALES; s++) {
    // Pick 1-4 unique products that still have stock
    const availableProducts = createdProducts.filter(
      p => (stockMap.get(p.id) ?? 0) > 0,
    );
    if (availableProducts.length === 0) break;

    const numItems = Math.min(getRandomInt(1, 4), availableProducts.length);
    const selectedProducts = getRandomSample(availableProducts, numItems);

    let totalAmount = new Prisma.Decimal(0);
    let totalProfit = new Prisma.Decimal(0);

    // Build detail payloads, respecting current stock
    const detailPayloads: {
      productId: string;
      quantity: number;
      sellPrice: Prisma.Decimal;
      profit: Prisma.Decimal;
    }[] = [];

    for (const product of selectedProducts) {
      const currentStock = stockMap.get(product.id) ?? 0;
      if (currentStock <= 0) continue;

      const maxQty = Math.min(currentStock, 10); // cap at 10 per line to preserve stock
      const qty = getRandomInt(1, maxQty);
      const itemAmount = product.sellPrice.mul(qty);
      const itemProfit = product.sellPrice.sub(product.costPrice).mul(qty);

      detailPayloads.push({
        productId: product.id,
        quantity: qty,
        sellPrice: product.sellPrice,
        profit: itemProfit,
      });

      totalAmount = totalAmount.add(itemAmount);
      totalProfit = totalProfit.add(itemProfit);

      // Deduct from in-memory map immediately
      stockMap.set(product.id, currentStock - qty);
    }

    if (detailPayloads.length === 0) continue;

    // Persist Sale + SaleDetails + updated stockQty in a transaction
    await prisma.$transaction(async tx => {
      const sale = await tx.sale.create({
        data: {
          saleDate: getRandomDate(saleStart, saleEnd),
          totalAmount,
          totalProfit,
          details: {
            create: detailPayloads,
          },
        },
      });

      // Update each product's stockQty in the DB
      for (const detail of detailPayloads) {
        await tx.product.update({
          where: { id: detail.productId },
          data: { stockQty: { decrement: detail.quantity } },
        });
      }

      return sale;
    });

    salesCreated++;
  }
  console.log(`   ✔ Created ${salesCreated} sales invoices.\n`);

  // --------------------------------------------------------------------------
  // STEP 5 — EDGE CASE: Force 4-5 products below alertLevel
  // --------------------------------------------------------------------------
  console.log("⚠️  Forcing low-stock edge cases...");

  // Sort products by current stock descending, pick the top ones with most stock
  // to drain them down to just below their alertLevel
  const productsToDerive = createdProducts
    .sort((a, b) => (stockMap.get(b.id) ?? 0) - (stockMap.get(a.id) ?? 0))
    .slice(0, 5);

  for (const product of productsToDerive) {
    const currentStock = stockMap.get(product.id) ?? 0;
    const alertLevel = product.alertLevel;
    // Target stockQty in range [0, alertLevel - 1]
    const targetStock = getRandomInt(0, Math.max(0, alertLevel - 1));
    const drainQty = currentStock - targetStock;

    if (drainQty <= 0) continue;

    // Create a "drain" sale to keep financial records consistent
    const itemProfit = product.sellPrice.sub(product.costPrice).mul(drainQty);
    const itemAmount = product.sellPrice.mul(drainQty);

    await prisma.$transaction(async tx => {
      await tx.sale.create({
        data: {
          saleDate: getRandomDate(daysAgo(5), new Date()),
          totalAmount: itemAmount,
          totalProfit: itemProfit,
          details: {
            create: {
              productId: product.id,
              quantity: drainQty,
              sellPrice: product.sellPrice,
              profit: itemProfit,
            },
          },
        },
      });
      await tx.product.update({
        where: { id: product.id },
        data: { stockQty: targetStock },
      });
    });

    stockMap.set(product.id, targetStock);
    console.log(
      `   • "${product.name}" → stockQty=${targetStock} (alertLevel=${alertLevel})`,
    );
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  const [productCount, importCount, saleCount, detailCount] = await Promise.all([
    prisma.product.count(),
    prisma.importRecord.count(),
    prisma.sale.count(),
    prisma.saleDetail.count(),
  ]);

  // Column-to-column comparison requires raw SQL
  const lowStockResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count FROM products WHERE stock_qty <= alert_level
  `;
  const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

  console.log("\n✅ Seeding complete!");
  console.log("─────────────────────────────────");
  console.log(`  Products      : ${productCount}`);
  console.log(`  Import records: ${importCount}`);
  console.log(`  Sales         : ${saleCount}`);
  console.log(`  Sale details  : ${detailCount}`);
  console.log(`  Low-stock items (stockQty ≤ alertLevel): ${lowStockCount}`);
  console.log("─────────────────────────────────\n");
}

main()
  .catch(e => {
    console.error("❌ Error during seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
