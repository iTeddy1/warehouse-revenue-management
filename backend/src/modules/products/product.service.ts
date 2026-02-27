import { Prisma } from "@prisma/client";
import { ProductRepository } from "./product.repo.js";
import { CreateProductDto, UpdateProductDto, ProductResponse, ProductListResponse } from "./product.dtos.js";
import { NotFoundError, BadRequestError, ConflictError } from "@/common/exceptions/app-error.js";
import { MSG } from "@/common/constants/messages.vi.js";

/**
 * Converts a Prisma Product record to the public-facing ProductResponse DTO.
 * Prisma returns `costPrice` and `sellPrice` as `Prisma.Decimal`;
 * we coerce them to plain JS numbers for the API response.
 */
function toProductResponse(product: any): ProductResponse {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    unit: product.unit,
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
    stockQty: Number(product.stockQty),
    alertLevel: Number(product.alertLevel),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Product Service - Contains all business logic for the Product module
 */
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  /**
   * Get all products, optionally filtered by a search string (FR-04)
   * Searches by name or product code (case-insensitive)
   */
  async getProducts(query: { search?: string; page?: number; limit?: number }): Promise<ProductListResponse> {
    const products = await this.productRepo.findAll({ search: query.search, page: query.page, limit: query.limit });
    return {
      data: products.map(toProductResponse),
      total: products.length,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(products.length / (query.limit || 10)),
    };
  }

  /**
   * Get the list of products whose stock has fallen to or below the alert level (FR-14, FR-15)
   */
  async getLowStockProducts(query: { page?: number; limit?: number }): Promise<ProductListResponse> {
    const products = await this.productRepo.findLowStock();
    return {
      data: products.map(toProductResponse),
      total: products.length,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(products.length / (query.limit || 10)),
    };
  }

  /**
   * Create a new product (FR-01)
   * Validates that the product code is unique before inserting.
   */
  async createProduct(dto: CreateProductDto): Promise<ProductResponse> {
    // Ensure product code is not already taken
    const existing = await this.productRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(MSG.PRODUCT.CODE_EXISTS);
    }

    const product = await this.productRepo.create(dto);
    return toProductResponse(product);
  }

  /**
   * Update an existing product (FR-02, FR-16)
   * Validates existence first; also validates new code uniqueness if code changes.
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    // Verify product exists
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(MSG.PRODUCT.NOT_FOUND);
    }

    // If the code is being changed, ensure the new code is not already taken by another product
    if (dto.code && dto.code !== existing.code) {
      const codeConflict = await this.productRepo.findByCode(dto.code);
      if (codeConflict) {
        throw new ConflictError(MSG.PRODUCT.CODE_EXISTS);
      }
    }

    const updated = await this.productRepo.update(id, dto);
    return toProductResponse(updated);
  }

  /**
   * Delete a product (FR-03)
   * Only allowed when no ImportRecord or SaleDetail references this product.
   * Prisma uses `onDelete: Restrict` on both FK relations, which causes a
   * `P2003` error on delete if related records exist — caught and surfaced as HTTP 400.
   */
  async deleteProduct(id: string): Promise<void> {
    // Verify product exists first so we can give a meaningful 404
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(MSG.PRODUCT.NOT_FOUND);
    }

    try {
      await this.productRepo.delete(id);
    } catch (error) {
      // Prisma foreign-key constraint violation → product has transaction history
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new BadRequestError(MSG.PRODUCT.HAS_TRANSACTIONS);
      }
      throw error;
    }
  }
}
