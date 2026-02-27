import { FastifyInstance } from 'fastify';
import { SaleController } from './sale.controller.js';
import {
  saleBodySchema,
  saleIdParamsSchema,
  saleListQuerySchema,
} from './sale.schema.js';

/**
 * Sale Routes
 * All routes are prefixed with `/api/sales` (configured in register.ts).
 */
export async function saleRoutes(
  fastify: FastifyInstance,
  controller: SaleController,
) {
  // GET /api/sales
  fastify.get('/', {
    schema: {
      tags: ['Sales'],
      summary: 'Danh sách hóa đơn bán hàng',
      description: 'Lấy danh sách hóa đơn bán hàng, phân trang, sắp xếp mới nhất trước',
      querystring: saleListQuerySchema,
    },
    handler: controller.getSales.bind(controller),
  });

  // GET /api/sales/:id
  fastify.get('/:id', {
    schema: {
      tags: ['Sales'],
      summary: 'Chi tiết hóa đơn (FR-08, FR-09)',
      description: 'Lấy thông tin đầy đủ của một hóa đơn bao gồm tất cả sản phẩm trong hóa đơn',
      params: saleIdParamsSchema,
    },
    handler: controller.getSaleById.bind(controller),
  });

  // POST /api/sales
  fastify.post('/', {
    schema: {
      tags: ['Sales'],
      summary: 'Tạo hóa đơn bán hàng (FR-08 → FR-13)',
      description: [
        'Tạo hóa đơn bán hàng với nhiều sản phẩm (FR-09).',
        'Kiểm tra tồn kho (FR-11), trừ tồn kho (FR-10),',
        'tính doanh thu (FR-12) và lợi nhuận = (giá bán - giá nhập) × số lượng (FR-13).',
        'Toàn bộ thao tác thực hiện trong một transaction nguyên tử.',
      ].join(' '),
      body: saleBodySchema,
    },
    handler: controller.createSale.bind(controller),
  });
}
