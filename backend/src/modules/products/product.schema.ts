import { z } from "zod";
import { MSG } from "@/common/constants/messages.vi.js";

// ─── Create Product Schema ────────────────────────────────────────────────────

export const createProductSchema = z.object({
  code: z.string({ message: MSG.VALIDATION.REQUIRED }).min(1, MSG.VALIDATION.REQUIRED).trim(),
  name: z.string({ message: MSG.VALIDATION.REQUIRED }).min(1, MSG.VALIDATION.REQUIRED).trim(),
  unit: z.string({ message: MSG.VALIDATION.REQUIRED }).min(1, MSG.VALIDATION.REQUIRED).trim(),
  costPrice: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).positive(MSG.VALIDATION.POSITIVE_NUMBER),
  sellPrice: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).positive(MSG.VALIDATION.POSITIVE_NUMBER),
  stockQty: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).int().nonnegative().default(0),
  alertLevel: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).int().nonnegative().default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ─── Update Product Schema ────────────────────────────────────────────────────

export const updateProductSchema = z.object({
  code: z.string().min(1, MSG.VALIDATION.REQUIRED).trim().optional(),
  name: z.string().min(1, MSG.VALIDATION.REQUIRED).trim().optional(),
  unit: z.string().min(1, MSG.VALIDATION.REQUIRED).trim().optional(),
  costPrice: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).positive(MSG.VALIDATION.POSITIVE_NUMBER).optional(),
  sellPrice: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).positive(MSG.VALIDATION.POSITIVE_NUMBER).optional(),
  stockQty: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).int().nonnegative().optional(),
  alertLevel: z.number({ message: MSG.VALIDATION.INVALID_NUMBER }).int().nonnegative().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── Query Schema ─────────────────────────────────────────────────────────────

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;

// ─── Params Schema ────────────────────────────────────────────────────────────

export const productParamsSchema = z.object({
  id: z.uuid(MSG.VALIDATION.INVALID_UUID),
});

export type ProductParamsInput = z.infer<typeof productParamsSchema>;

// ─── Fastify Route JSON Schemas (for Swagger docs & serialization) ────────────

export const productBodySchema = {
  type: "object",
  required: ["code", "name", "unit", "costPrice", "sellPrice"],
  properties: {
    code: { type: "string", description: "Mã sản phẩm (duy nhất)" },
    name: { type: "string", description: "Tên sản phẩm" },
    unit: { type: "string", description: "Đơn vị tính" },
    costPrice: { type: "number", description: "Giá nhập" },
    sellPrice: { type: "number", description: "Giá bán" },
    stockQty: { type: "number", description: "Số lượng tồn kho", default: 0 },
    alertLevel: { type: "number", description: "Ngưỡng cảnh báo tồn kho", default: 10 },
  },
};

export const updateProductBodySchema = {
  type: "object",
  properties: {
    code: { type: "string", description: "Mã sản phẩm" },
    name: { type: "string", description: "Tên sản phẩm" },
    unit: { type: "string", description: "Đơn vị tính" },
    costPrice: { type: "number", description: "Giá nhập" },
    sellPrice: { type: "number", description: "Giá bán" },
    stockQty: { type: "number", description: "Số lượng tồn kho" },
    alertLevel: { type: "number", description: "Ngưỡng cảnh báo tồn kho" },
  },
};

export const productIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid", description: "ID sản phẩm" },
  },
};

export const productListQuerySchema = {
  type: "object",
  properties: {
    search: { type: "string", description: "Tìm kiếm theo tên hoặc mã sản phẩm" },
  },
};
