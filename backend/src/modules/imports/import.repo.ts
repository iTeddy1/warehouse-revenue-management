import { PrismaClient, ImportRecord, Prisma } from '@prisma/client';
import { CreateImportDto } from './import.dtos.js';

// ─── Type Helpers ─────────────────────────────────────────────────────────────

/** ImportRecord with its related Product snapshot (used for list & detail) */
export type ImportRecordWithProduct = ImportRecord & {
  product: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
};

/** Fields selected for the embedded product snapshot */
const productSelect = {
  id: true,
  code: true,
  name: true,
  unit: true,
} as const;

/**
 * Import Repository - Contains only Prisma database operations
 */
export class ImportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Fetch a paginated list of import records (FR-07).
   * Optionally filtered by productId.
   * Always includes the related product snapshot.
   */
  async findAll(params: {
    productId?: string;
    skip: number;
    take: number;
  }): Promise<{ records: ImportRecordWithProduct[]; total: number }> {
    const where: Prisma.ImportRecordWhereInput = params.productId
      ? { productId: params.productId }
      : {};

    const [records, total] = await Promise.all([
      this.prisma.importRecord.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { importDate: 'desc' },
        include: { product: { select: productSelect } },
      }),
      this.prisma.importRecord.count({ where }),
    ]);

    return { records, total };
  }

  /**
   * Fetch a single import record by ID, including the product snapshot.
   */
  async findById(id: string): Promise<ImportRecordWithProduct | null> {
    return this.prisma.importRecord.findUnique({
      where: { id },
      include: { product: { select: productSelect } },
    });
  }

  /**
   * Create a new ImportRecord inside an existing transaction (FR-05).
   * The caller (Service) owns and commits the transaction.
   */
  async createRecord(
    data: CreateImportDto,
    tx: Prisma.TransactionClient,
  ): Promise<ImportRecord> {
    return tx.importRecord.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        costPrice: data.costPrice,
        importDate: data.importDate ?? new Date(),
      },
    });
  }

  /**
   * Increment a product's stockQty inside an existing transaction (FR-06).
   * Uses Prisma's atomic `increment` to prevent race conditions.
   */
  async incrementProductStock(
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { increment: quantity } },
    });
  }
}
