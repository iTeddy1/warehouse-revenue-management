import { BadRequestError } from '@/common/exceptions/app-error.js';
import { SalesReportQueryDto, SalesReportResponse, DashboardResponse } from './report.dtos.js';
import { ReportRepository } from './report.repo.js';

export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  // ── Dashboard (FR-22 → FR-25) ─────────────────────────────────────────────

  async getDashboard(): Promise<DashboardResponse> {
    return this.reportRepo.getDashboardStats();
  }

  // ── Sales Report (FR-17 → FR-21) ─────────────────────────────────────────

  async getSalesReport(dto: SalesReportQueryDto): Promise<SalesReportResponse> {
    if (dto.startDate > dto.endDate) {
      throw new BadRequestError('startDate phải nhỏ hơn hoặc bằng endDate');
    }

    const rows = await this.reportRepo.getSalesReport(dto.startDate, dto.endDate, dto.groupBy);

    const summary = rows.reduce(
      (acc, row) => ({
        totalRevenue: acc.totalRevenue + row.totalRevenue,
        totalProfit: acc.totalProfit + row.totalProfit,
        totalItemsSold: acc.totalItemsSold + row.totalItemsSold,
      }),
      { totalRevenue: 0, totalProfit: 0, totalItemsSold: 0 },
    );

    return {
      groupBy: dto.groupBy,
      startDate: dto.startDate.toISOString(),
      endDate: dto.endDate.toISOString(),
      summary,
      rows,
    };
  }
}
