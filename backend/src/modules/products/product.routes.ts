import { FastifyInstance } from 'fastify';
import { ProductController } from './product.controller.js';
import {
  productBodySchema,
  updateProductBodySchema,
  productIdParamsSchema,
  productListQuerySchema,
} from './product.schema.js';

/**
 * Product Routes
 * All routes are prefixed with `/api/products` (configured in register.ts)
 */
export async function productRoutes(
  fastify: FastifyInstance,
  controller: ProductController,
) {
  // GET /api/products/low-stock  ← must be registered BEFORE /:id to avoid conflict
  fastify.get('/low-stock', {
    schema: {
      tags: ['Products'],
      summary: 'Danh sách sản phẩm sắp hết hàng (FR-14, FR-15)',
      description: 'Trả về các sản phẩm có tồn kho <= ngưỡng cảnh báo',
    },
    handler: controller.getLowStockProducts.bind(controller),
  });

  // GET /api/products
  fastify.get('/', {
    schema: {
      tags: ['Products'],
      summary: 'Danh sách sản phẩm (FR-04)',
      description: 'Lấy danh sách sản phẩm, hỗ trợ tìm kiếm theo tên hoặc mã',
      querystring: productListQuerySchema,
    },
    handler: controller.getProducts.bind(controller),
  });

  // POST /api/products
  fastify.post('/', {
    schema: {
      tags: ['Products'],
      summary: 'Tạo sản phẩm mới (FR-01)',
      body: productBodySchema,
    },
    handler: controller.createProduct.bind(controller),
  });

  // PATCH /api/products/:id
  fastify.patch('/:id', {
    schema: {
      tags: ['Products'],
      summary: 'Cập nhật sản phẩm (FR-02, FR-16)',
      params: productIdParamsSchema,
      body: updateProductBodySchema,
    },
    handler: controller.updateProduct.bind(controller),
  });

  // DELETE /api/products/:id
  fastify.delete('/:id', {
    schema: {
      tags: ['Products'],
      summary: 'Xóa sản phẩm (FR-03)',
      description: 'Chỉ xóa được nếu sản phẩm chưa có lịch sử giao dịch',
      params: productIdParamsSchema,
    },
    handler: controller.deleteProduct.bind(controller),
  });
}
