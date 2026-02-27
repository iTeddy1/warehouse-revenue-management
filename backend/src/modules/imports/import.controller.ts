import { FastifyRequest, FastifyReply } from 'fastify';
import { ImportService } from './import.service.js';
import {
  createImportSchema,
  importQuerySchema,
  importParamsSchema,
} from './import.schema.js';
import { MSG } from '@/common/constants/messages.vi.js';

/**
 * Import Controller - Thin layer: validates input, delegates to Service, returns responses.
 */
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /**
   * GET /api/imports
   * Returns a paginated list of import records, optionally filtered by productId (FR-07).
   */
  async getImports(
    request: FastifyRequest<{
      Querystring: { productId?: string; page?: string; limit?: string };
    }>,
    reply: FastifyReply,
  ) {
    const query = importQuerySchema.parse(request.query);
    const result = await this.importService.getImports(query);

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
   * GET /api/imports/:id
   * Returns details of a specific import record including related product info (FR-07).
   */
  async getImportById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = importParamsSchema.parse(request.params);
    const data = await this.importService.getImportById(id);

    return reply.status(200).send({
      success: true,
      message: MSG.SUCCESS.FETCHED,
      data,
    });
  }

  /**
   * POST /api/imports
   * Creates a new import record and atomically increments the product's stockQty (FR-05, FR-06).
   */
  async createImport(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply,
  ) {
    const dto = createImportSchema.parse(request.body);
    const data = await this.importService.createImport(dto);

    return reply.status(201).send({
      success: true,
      message: MSG.IMPORT.CREATED,
      data,
    });
  }
}
