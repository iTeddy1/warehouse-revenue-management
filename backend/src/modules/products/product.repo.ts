import { PrismaClient, Product, Prisma } from "@prisma/client";
import { CreateProductDto, UpdateProductDto } from "./product.dtos.js";

/**
 * Product Repository - Contains only Prisma database operations
 */
export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find all products with optional search filter (FR-04)
   * Searches by product name or product code (case-insensitive)
   */
  async findAll(params: { search?: string; page?: number; limit?: number }): Promise<Product[]> {
    const { search, page = 1, limit = 10 } = params;

    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find a single product by its UUID
   */
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Find a product by its unique code
   */
  async findByCode(code: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { code },
    });
  }

  /**
   * Create a new product (FR-01)
   */
  async create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        code: data.code,
        name: data.name,
        unit: data.unit,
        costPrice: data.costPrice,
        sellPrice: data.sellPrice,
        stockQty: data.stockQty ?? 0,
        alertLevel: data.alertLevel ?? 10,
      },
    });
  }

  /**
   * Update an existing product (FR-02, FR-16)
   */
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.sellPrice !== undefined && { sellPrice: data.sellPrice }),
        ...(data.stockQty !== undefined && { stockQty: data.stockQty }),
        ...(data.alertLevel !== undefined && { alertLevel: data.alertLevel }),
      },
    });
  }

  /**
   * Delete a product by ID (FR-03)
   * Note: The database has Restrict constraints on ImportRecord and SaleDetail
   * which will raise a P2003 error if related records exist.
   */
  async delete(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get all products where stockQty <= alertLevel (FR-14, FR-15)
   * Uses raw SQL because Prisma does not support field-to-field comparisons
   * in the standard WHERE clause.
   */
  async findLowStock(): Promise<Product[]> {
    return this.prisma.$queryRaw<Product[]>(
      Prisma.sql`
        SELECT
          id::text           AS "id",
          product_code       AS "code",
          product_name       AS "name",
          unit               AS "unit",
          cost_price         AS "costPrice",
          sell_price         AS "sellPrice",
          stock_qty          AS "stockQty",
          alert_level        AS "alertLevel",
          created_at         AS "createdAt",
          updated_at         AS "updatedAt"
        FROM products
        WHERE stock_qty <= alert_level
        ORDER BY stock_qty ASC
      `,
    );
  }
}
