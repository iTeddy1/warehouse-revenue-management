import { z } from 'zod';
import { MSG } from '@/common/constants/messages.vi.js';
import { GROUP_BY_VALUES } from './report.dtos.js';

// ─── Sales Report Query Schema ────────────────────────────────────────────────

export const salesReportQuerySchema = z.object({
  startDate: z.coerce
    .date({ message: MSG.VALIDATION.INVALID_DATE })
    .refine((d) => !isNaN(d.getTime()), MSG.VALIDATION.INVALID_DATE),
  endDate: z.coerce
    .date({ message: MSG.VALIDATION.INVALID_DATE })
    .refine((d) => !isNaN(d.getTime()), MSG.VALIDATION.INVALID_DATE),
  groupBy: z.enum(GROUP_BY_VALUES, {
    message: `groupBy phải là một trong: ${GROUP_BY_VALUES.join(', ')}`,
  }).default('day'),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'startDate phải nhỏ hơn hoặc bằng endDate',
    path: ['startDate'],
  },
);

export type SalesReportQueryInput = z.infer<typeof salesReportQuerySchema>;

// ─── Fastify Route JSON Schemas (for Swagger / serialisation) ─────────────────

export const salesReportQueryJsonSchema = {
  type: 'object',
  required: ['startDate', 'endDate'],
  properties: {
    startDate: {
      type: 'string',
      format: 'date',
      description: 'Ngày bắt đầu (ISO 8601), ví dụ: 2026-01-01T00:00:00.000Z',
    },
    endDate: {
      type: 'string',
      format: 'date',
      description: 'Ngày kết thúc (ISO 8601), ví dụ: 2026-12-31T23:59:59.999Z',
    },
    groupBy: {
      type: 'string',
      enum: GROUP_BY_VALUES,
      default: 'day',
      description: 'Nhóm dữ liệu theo: day | week | month | quarter | year (FR-17 → FR-21)',
    },
  },
};
