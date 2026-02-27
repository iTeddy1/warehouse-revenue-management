import { FastifyRequest, FastifyReply } from 'fastify';
import { SaleService } from './sale.service.js';
import {
  createSaleSchema,
  saleQuerySchema,
  saleParamsSchema,
} from './sale.schema.js';
import { MSG } from '@/common/constants/messages.vi.js';

/**
 * Sale Controller - Thin layer: validates input, delegates to Service, returns responses.
 */
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  /**
   * GET /api/sales
   * Returns a paginated list of sale invoices (newest first).
   */
  async getSales(
    request: FastifyRequest<{
      Querystring: { page?: string; limit?: string };
    }>,
    reply: FastifyReply,
  ) {
    const query = saleQuerySchema.parse(request.query);
    const result = await this.saleService.getSales(query);

    return reply.status(200).send({
      success: true,
      message: MSG.SUCCESS.FETCHED,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }

  /**
   * GET /api/sales/:id
   * Returns the full details of one sale invoice including all nested sale items (FR-08, FR-09).
   */
  async getSaleById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = saleParamsSchema.parse(request.params);
    const data = await this.saleService.getSaleById(id);

    return reply.status(200).send({
      success: true,
      message: MSG.SUCCESS.FETCHED,
      data,
    });
  }

  /**
   * POST /api/sales
   * Creates a new sale invoice: validates stock, deducts stock, calculates
   * revenue/profit, and saves all records atomically (FR-08 → FR-13).
   */
  async createSale(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ) {
    const dto = createSaleSchema.parse(request.body);
    const data = await this.saleService.createSale(dto);

    return reply.status(201).send({
      success: true,
      message: MSG.SALE.CREATED,
      data,
    });
  }
}
