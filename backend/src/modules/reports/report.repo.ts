import { PrismaClient, Prisma } from "@prisma/client";
import { GroupBy, SalesReportRow } from "./report.dtos.js";

// ─── Raw query result shape ───────────────────────────────────────────────────

interface RawSalesReportRow {
  period: Date;
  totalRevenue: Prisma.Decimal;
  totalProfit: Prisma.Decimal;
  totalItemsSold: bigint;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [salesToday, salesCountToday, stockAgg] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { saleDate: { gte: todayStart, lte: todayEnd } },
        _sum: { totalAmount: true, totalProfit: true },
      }),
      this.prisma.sale.count({
        where: { saleDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.product.aggregate({
        _sum: { stockQty: true },
      }),
    ]);

    return {
      revenueToday: Number(salesToday._sum.totalAmount ?? 0),
      profitToday: Number(salesToday._sum.totalProfit ?? 0),
      salesCountToday,
      totalStockQuantity: Number(stockAgg._sum.stockQty ?? 0),
    };
  }

  // ── Sales Report (FR-17 → FR-21) ─────────────────────────────────────────────

  async getSalesReport(startDate: Date, endDate: Date, groupBy: GroupBy): Promise<SalesReportRow[]> {
    const rows = await this.prisma.$queryRaw<RawSalesReportRow[]>`
      SELECT
        DATE_TRUNC(${Prisma.raw(`'${groupBy}'`)}, s.sale_date)   AS "period",
        SUM(s.total_amount)                                       AS "totalRevenue",
        SUM(s.total_profit)                                       AS "totalProfit",
        CAST(SUM(sd.quantity) AS BIGINT)                         AS "totalItemsSold"
      FROM sales s
      JOIN sale_details sd ON sd.sale_id = s.sale_id
      WHERE s.sale_date >= ${startDate}
        AND s.sale_date <= ${endDate} + interval '1 day'
      GROUP BY DATE_TRUNC(${Prisma.raw(`'${groupBy}'`)}, s.sale_date)
      ORDER BY "period" ASC
    `;

    return rows.map(r => ({
      period: (r.period as Date).toISOString(),
      totalRevenue: Number(r.totalRevenue),
      totalProfit: Number(r.totalProfit),
      totalItemsSold: Number(r.totalItemsSold),
    }));
  }
}
