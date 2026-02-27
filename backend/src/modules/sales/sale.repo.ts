import { PrismaClient, Sale, SaleDetail, Product, Prisma } from '@prisma/client';

// ─── Type Helpers ─────────────────────────────────────────────────────────────

/** Product fields needed to validate stock and compute financials */
export type ProductForSale = Pick<
  Product,
  'id' | 'code' | 'name' | 'unit' | 'costPrice' | 'sellPrice' | 'stockQty'
>;

/** SaleDetail enriched with its product snapshot (for responses) */
export type SaleDetailWithProduct = SaleDetail & {
  product: Pick<Product, 'id' | 'code' | 'name' | 'unit'>;
};

/** Full Sale with nested details and product snapshots (for GET /:id) */
export type SaleWithDetails = Sale & {
  details: SaleDetailWithProduct[];
};

/** Slim Sale with detail count (for GET / list) */
export type SaleWithItemCount = Sale & {
  _count: { details: number };
};

/** Fields selected for the embedded product snapshot */
const productSnapshotSelect = {
  id: true,
  code: true,
  name: true,
  unit: true,
} as const;

/**
 * Sale Repository - Contains only Prisma database operations.
 * Every mutating method accepts a `Prisma.TransactionClient` so the
 * caller (SaleService) owns the transaction boundary.
 */
export class SaleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ─── Read operations (use PrismaClient, outside any transaction) ───────────

  /**
   * Fetch a paginated list of sales, newest first.
   * Each record includes a count of its detail lines.
   */
  async findAll(params: {
    skip: number;
    take: number;
  }): Promise<{ sales: SaleWithItemCount[]; total: number }> {
    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { saleDate: 'desc' },
        include: { _count: { select: { details: true } } },
      }),
      this.prisma.sale.count(),
    ]);

    return { sales, total };
  }

  /**
   * Fetch a single sale by ID, including all details with their product snapshots.
   */
  async findById(id: string): Promise<SaleWithDetails | null> {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        details: {
          include: { product: { select: productSnapshotSelect } },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  // ─── Transactional write operations ────────────────────────────────────────

  /**
   * Fetch current product data (stockQty, prices) for ALL requested productIds
   * inside the transaction so we read consistent, locked data.
   */
  async findProductsForSale(
    productIds: string[],
    tx: Prisma.TransactionClient,
  ): Promise<ProductForSale[]> {
    return tx.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        costPrice: true,
        sellPrice: true,
        stockQty: true,
      },
    });
  }

  /**
   * Atomically decrement a product's stockQty within a transaction (FR-10).
   */
  async deductProductStock(
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: quantity } },
    });
  }

  /**
   * Create the Sale header record within a transaction (FR-12, FR-13).
   */
  async createSale(
    data: {
      saleDate?: Date;
      totalAmount: Prisma.Decimal | number;
      totalProfit: Prisma.Decimal | number;
    },
    tx: Prisma.TransactionClient,
  ): Promise<Sale> {
    return tx.sale.create({
      data: {
        saleDate: data.saleDate ?? new Date(),
        totalAmount: data.totalAmount,
        totalProfit: data.totalProfit,
      },
    });
  }

  /**
   * Bulk-create all SaleDetail rows linked to the new sale (FR-09, FR-13).
   * Uses createMany for a single round-trip.
   */
  async createSaleDetails(
    saleId: string,
    items: Array<{
      productId: string;
      quantity: number;
      sellPrice: Prisma.Decimal | number;
      profit: Prisma.Decimal | number;
    }>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.saleDetail.createMany({
      data: items.map((item) => ({
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        sellPrice: item.sellPrice,
        profit: item.profit,
      })),
    });
  }
}
