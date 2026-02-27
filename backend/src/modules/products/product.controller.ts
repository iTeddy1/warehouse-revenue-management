import { FastifyRequest, FastifyReply } from "fastify";
import { ProductService } from "./product.service.js";
import { createProductSchema, updateProductSchema, productQuerySchema, productParamsSchema } from "./product.schema.js";
import { MSG } from "@/common/constants/messages.vi.js";

/**
 * Product Controller - Thin layer: validates input, delegates to Service, returns responses
 */
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /api/products
   * Returns all products or a filtered subset when `?search=` is provided (FR-04)
   */
  async getProducts(request: FastifyRequest<{ Querystring: { search?: string } }>, reply: FastifyReply) {
    const query = productQuerySchema.parse(request.query);
    const res = await this.productService.getProducts(query);

    return reply.status(200).send({
      success: true,
      message: MSG.SUCCESS.FETCHED,
      data: res.data,
      pagination: {
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      },
    });
  }

  /**
   * GET /api/products/low-stock
   * Returns products whose stockQty <= alertLevel (FR-14, FR-15)
   */
  async getLowStockProducts(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply,
  ) {
    const query = productQuerySchema.parse(request.query);
    const res = await this.productService.getLowStockProducts(query);

    return reply.status(200).send({
      success: true,
      message: MSG.SUCCESS.FETCHED,
      data: res.data,
      pagination: {
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      },
    });
  }

  /**
   * POST /api/products
   * Creates a new product (FR-01)
   */
  async createProduct(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
    const dto = createProductSchema.parse(request.body);
    const data = await this.productService.createProduct(dto);

    return reply.status(201).send({
      success: true,
      message: MSG.PRODUCT.CREATED,
      data,
    });
  }

  /**
   * PUT /api/products/:id
   * Updates an existing product (FR-02, FR-16)
   */
  async updateProduct(request: FastifyRequest<{ Params: { id: string }; Body: unknown }>, reply: FastifyReply) {
    const { id } = productParamsSchema.parse(request.params);
    const dto = updateProductSchema.parse(request.body);
    const data = await this.productService.updateProduct(id, dto);

    return reply.status(200).send({
      success: true,
      message: MSG.PRODUCT.UPDATED,
      data,
    });
  }

  /**
   * DELETE /api/products/:id
   * Deletes a product if it has no transaction history (FR-03)
   */
  async deleteProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = productParamsSchema.parse(request.params);
    await this.productService.deleteProduct(id);

    return reply.status(200).send({
      success: true,
      message: MSG.PRODUCT.DELETED,
    });
  }
}
