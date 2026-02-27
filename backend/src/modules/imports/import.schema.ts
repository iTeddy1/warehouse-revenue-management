import { z } from 'zod';
import { MSG } from '@/common/constants/messages.vi.js';

// ─── Create Import Schema ─────────────────────────────────────────────────────

export const createImportSchema = z.object({
  productId: z
    .string({ message: MSG.VALIDATION.REQUIRED })
    .uuid(MSG.VALIDATION.INVALID_UUID),
  quantity: z
    .number({ message: MSG.VALIDATION.INVALID_NUMBER })
    .int()
    .positive(MSG.VALIDATION.POSITIVE_NUMBER),
  costPrice: z
    .number({ message: MSG.VALIDATION.INVALID_NUMBER })
    .positive(MSG.VALIDATION.POSITIVE_NUMBER),
  importDate: z.coerce
    .date({ message: MSG.VALIDATION.INVALID_DATE })
    .optional(),
});

export type CreateImportInput = z.infer<typeof createImportSchema>;

// ─── Query Schema ─────────────────────────────────────────────────────────────

export const importQuerySchema = z.object({
  productId: z.uuid(MSG.VALIDATION.INVALID_UUID).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

export type ImportQueryInput = z.infer<typeof importQuerySchema>;

// ─── Params Schema ────────────────────────────────────────────────────────────

export const importParamsSchema = z.object({
  id: z.uuid(MSG.VALIDATION.INVALID_UUID),
});

export type ImportParamsInput = z.infer<typeof importParamsSchema>;

// ─── Fastify Route JSON Schemas (Swagger docs & serialisation) ────────────────

export const importBodySchema = {
  type: 'object',
  required: ['productId', 'quantity', 'costPrice'],
  properties: {
    productId: { type: 'string', format: 'uuid', description: 'ID sản phẩm' },
    quantity: { type: 'integer', minimum: 1, description: 'Số lượng nhập' },
    costPrice: { type: 'number', description: 'Giá nhập' },
    importDate: { type: 'string', format: 'date-time', description: 'Ngày nhập (mặc định là hiện tại)' },
  },
};

export const importIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'ID phiếu nhập' },
  },
};

export const importListQuerySchema = {
  type: 'object',
  properties: {
    productId: { type: 'string', format: 'uuid', description: 'Lọc theo ID sản phẩm' },
    page: { type: 'integer', minimum: 1, default: 1, description: 'Trang hiện tại' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Số bản ghi mỗi trang' },
  },
};
