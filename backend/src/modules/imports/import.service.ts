import { PrismaClient } from '@prisma/client';
import { ImportRepository } from './import.repo.js';
import { ProductRepository } from '../products/product.repo.js';
import {
  CreateImportDto,
  ImportRecordResponse,
  ImportListResponse,
} from './import.dtos.js';
import { NotFoundError } from '@/common/exceptions/app-error.js';
import { MSG } from '@/common/constants/messages.vi.js';

/**
 * Converts a raw Prisma record (with product relation) to the response DTO.
 * Coerces Decimal fields to plain JS numbers.
 */
function toResponse(record: any): ImportRecordResponse {
  return {
    id: record.id,
    importDate: record.importDate,
    productId: record.productId,
    quantity: record.quantity,
    costPrice: Number(record.costPrice),
    createdAt: record.createdAt,
    product: {
      id: record.product.id,
      code: record.product.code,
      name: record.product.name,
      unit: record.product.unit,
    },
  };
}

/**
 * Import Service - Orchestrates import business logic and the atomic transaction.
 */
export class ImportService {
  constructor(
    private readonly importRepo: ImportRepository,
    private readonly productRepo: ProductRepository,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * Return a paginated list of import records (FR-07).
   * Can be filtered by productId.
   */
  async getImports(params: {
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<ImportListResponse> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const { records, total } = await this.importRepo.findAll({
      productId: params.productId,
      skip,
      take: limit,
    });

    return {
      data: records.map(toResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Return the full details of a single import record (FR-07).
   */
  async getImportById(id: string): Promise<ImportRecordResponse> {
    const record = await this.importRepo.findById(id);
    if (!record) {
      throw new NotFoundError(MSG.IMPORT.NOT_FOUND);
    }
    return toResponse(record);
  }

  /**
   * Create an import record AND atomically increment the product's stockQty (FR-05, FR-06).
   *
   * Transaction guarantee:
   *   1. INSERT into import_records
   *   2. UPDATE products SET stock_qty = stock_qty + quantity
   * If either step fails the entire transaction is rolled back.
   */
  async createImport(dto: CreateImportDto): Promise<ImportRecordResponse> {
    // Validate that the target product exists before opening the transaction
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new NotFoundError(MSG.PRODUCT.NOT_FOUND);
    }

    // Atomic: create the record and update stock in one transaction
    const createdRecord = await this.prisma.$transaction(async (tx) => {
      const record = await this.importRepo.createRecord(dto, tx);
      await this.importRepo.incrementProductStock(dto.productId, dto.quantity, tx);
      return record;
    });

    // Re-fetch with the product relation so we can build the full response DTO
    const fullRecord = await this.importRepo.findById(createdRecord.id);
    return toResponse(fullRecord!);
  }
}
