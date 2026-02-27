import { FastifyRequest, FastifyReply } from "fastify";
import { MSG } from "@/common/constants/messages.vi.js";
import { AppError } from "@/common/exceptions/app-error.js";
import { salesReportQuerySchema } from "./report.schema.js";
import { ReportService } from "./report.service.js";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // GET /api/reports/dashboard
  getDashboard = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = await this.reportService.getDashboard();
    reply.send({ success: true, message: MSG.SUCCESS.FETCHED, data });
  };

  // GET /api/reports/sales
  getSalesReport = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = salesReportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(e => e.message).join("; ");
      throw new AppError(msg, 400);
    }
    const data = await this.reportService.getSalesReport(parsed.data);
    reply.send({ success: true, message: MSG.SUCCESS.FETCHED, data });
  };
}
