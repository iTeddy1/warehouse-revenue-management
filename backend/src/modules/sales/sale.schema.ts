import { z } from 'zod';
import { MSG } from '@/common/constants/messages.vi.js';

// ─── Sale Item Schema ─────────────────────────────────────────────────────────

const saleItemSchema = z.object({
  productId: z
    .string({ message: MSG.VALIDATION.REQUIRED })
    .uuid(MSG.VALIDATION.INVALID_UUID),
  quantity: z
    .number({ message: MSG.VALIDATION.INVALID_NUMBER })
    .int()
    .positive(MSG.VALIDATION.POSITIVE_NUMBER),
});

// ─── Create Sale Schema ───────────────────────────────────────────────────────

export const createSaleSchema = z.object({
  items: z
    .array(saleItemSchema, { message: MSG.VALIDATION.REQUIRED })
    .min(1, 'Hóa đơn phải có ít nhất một sản phẩm'),
  saleDate: z.coerce
    .date({ message: MSG.VALIDATION.INVALID_DATE })
    .optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

// ─── Query Schema ─────────────────────────────────────────────────────────────

export const saleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

export type SaleQueryInput = z.infer<typeof saleQuerySchema>;

// ─── Params Schema ────────────────────────────────────────────────────────────

export const saleParamsSchema = z.object({
  id: z.uuid(MSG.VALIDATION.INVALID_UUID),
});

export type SaleParamsInput = z.infer<typeof saleParamsSchema>;

// ─── Fastify Route JSON Schemas (for Swagger / serialisation) ─────────────────

export const saleBodySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    saleDate: {
      type: 'string',
      format: 'date-time',
      description: 'Ngày bán (mặc định là hiện tại)',
    },
    items: {
      type: 'array',
      minItems: 1,
      description: 'Danh sách sản phẩm trong hóa đơn (FR-09)',
      items: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', format: 'uuid', description: 'ID sản phẩm' },
          quantity: { type: 'integer', minimum: 1, description: 'Số lượng bán' },
        },
      },
    },
  },
};

export const saleIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'ID hóa đơn bán hàng' },
  },
};

export const saleListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1, description: 'Trang hiện tại' },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10,
      description: 'Số bản ghi mỗi trang',
    },
  },
};
