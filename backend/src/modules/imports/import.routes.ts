import { FastifyInstance } from 'fastify';
import { ImportController } from './import.controller.js';
import {
  importBodySchema,
  importIdParamsSchema,
  importListQuerySchema,
} from './import.schema.js';

/**
 * Import Routes
 * All routes are prefixed with `/api/imports` (configured in register.ts).
 */
export async function importRoutes(
  fastify: FastifyInstance,
  controller: ImportController,
) {
  // GET /api/imports
  fastify.get('/', {
    schema: {
      tags: ['Imports'],
      summary: 'Lịch sử nhập kho (FR-07)',
      description: 'Lấy danh sách phiếu nhập kho, hỗ trợ lọc theo sản phẩm và phân trang',
      querystring: importListQuerySchema,
    },
    handler: controller.getImports.bind(controller),
  });

  // GET /api/imports/:id
  fastify.get('/:id', {
    schema: {
      tags: ['Imports'],
      summary: 'Chi tiết phiếu nhập (FR-07)',
      description: 'Lấy thông tin chi tiết của một phiếu nhập kho bao gồm thông tin sản phẩm',
      params: importIdParamsSchema,
    },
    handler: controller.getImportById.bind(controller),
  });

  // POST /api/imports
  fastify.post('/', {
    schema: {
      tags: ['Imports'],
      summary: 'Tạo phiếu nhập kho (FR-05, FR-06)',
      description:
        'Tạo phiếu nhập kho và tự động tăng tồn kho sản phẩm trong một transaction nguyên tử.',
      body: importBodySchema,
    },
    handler: controller.createImport.bind(controller),
  });
}
