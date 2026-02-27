import { FastifyInstance } from "fastify";
import { ReportController } from "./report.controller.js";
import { salesReportQueryJsonSchema } from "./report.schema.js";

export async function reportRoutes(fastify: FastifyInstance, controller: ReportController): Promise<void> {
  // GET /api/reports/dashboard  (FR-22 → FR-25)
  fastify.get(
    "/dashboard",
    {
      schema: {
        tags: ["Reports"],
        summary: "Lấy dữ liệu dashboard tổng quan (hôm nay)",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  revenueToday: { type: "number" },
                  profitToday: { type: "number" },
                  salesCountToday: { type: "integer" },
                  totalStockQuantity: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    controller.getDashboard,
  );

  // GET /api/reports/sales  (FR-17 → FR-21 – grouped by period)
  fastify.get(
    "/sales",
    {
      schema: {
        tags: ["Reports"],
        summary: "Báo cáo doanh thu / lợi nhuận theo khoảng thời gian, nhóm theo period",
        querystring: salesReportQueryJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  groupBy: { type: "string", enum: ["day", "week", "month"] },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  summary: {
                    type: "object",
                    properties: {
                      totalRevenue: { type: "number" },
                      totalProfit: { type: "number" },
                      totalItemsSold: { type: "integer" },
                    },
                  },
                  rows: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        period: { type: "string" },
                        totalRevenue: { type: "number" },
                        totalProfit: { type: "number" },
                        totalItemsSold: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    controller.getSalesReport,
  );
}
