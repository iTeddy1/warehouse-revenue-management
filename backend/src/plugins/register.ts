import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { ServiceContainer } from "../container.js";
import path from "path";
import mime from "mime-types";

import { errorHandler } from "../common/middlewares/error-handler.js";
import { ProductRepository } from "../modules/products/product.repo.js";
import { ProductService } from "../modules/products/product.service.js";
import { ProductController } from "../modules/products/product.controller.js";
import { productRoutes } from "../modules/products/product.routes.js";
import { ImportRepository } from "../modules/imports/import.repo.js";
import { ImportService } from "../modules/imports/import.service.js";
import { ImportController } from "../modules/imports/import.controller.js";
import { importRoutes } from "../modules/imports/import.routes.js";
import { SaleRepository } from "../modules/sales/sale.repo.js";
import { SaleService } from "../modules/sales/sale.service.js";
import { SaleController } from "../modules/sales/sale.controller.js";
import { saleRoutes } from "../modules/sales/sale.routes.js";
import { ReportRepository } from "../modules/reports/report.repo.js";
import { ReportService } from "../modules/reports/report.service.js";
import { ReportController } from "../modules/reports/report.controller.js";
import { reportRoutes } from "../modules/reports/report.routes.js";
import { SystemService } from "../modules/system/system.service.js";
import { SystemController } from "../modules/system/system.controller.js";
import { systemRoutes } from "../modules/system/system.routes.js";

const prisma = new PrismaClient();
const container = new ServiceContainer(prisma);

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
    container: ServiceContainer;
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

export async function registerPlugins(app: FastifyInstance) {
  // Register error handler
  app.setErrorHandler(errorHandler);

  // Decorate app with db and container
  app.decorate("db", prisma);
  app.decorate("container", container);

  // Initialize repositories
  const productRepository = new ProductRepository(prisma);
  const importRepository = new ImportRepository(prisma);
  const saleRepository = new SaleRepository(prisma);
  const reportRepository = new ReportRepository(prisma);

  // Initialize services
  const productService = new ProductService(productRepository);
  const importService = new ImportService(importRepository, productRepository, prisma);
  const saleService = new SaleService(saleRepository, prisma);
  const reportService = new ReportService(reportRepository);
  const systemService = new SystemService();

  // Initialize controllers
  const productController = new ProductController(productService);
  const importController = new ImportController(importService);
  const saleController = new SaleController(saleService);
  const reportController = new ReportController(reportService);
  const systemController = new SystemController(systemService);

  // Decorate app with authenticate middleware
  // const authMiddleware = createAuthMiddleware(authService, userRepository);
  // app.decorate("authenticate", authMiddleware);

  // Register routes
  await app.register(async (instance) => {
    // await authRoutes(instance, authController);
    await instance.register(
      async (api) => {
        await productRoutes(api, productController);
      },
      { prefix: '/api/products' },
    );
    await instance.register(
      async (api) => {
        await importRoutes(api, importController);
      },
      { prefix: '/api/imports' },
    );
    await instance.register(
      async (api) => {
        await saleRoutes(api, saleController);
      },
      { prefix: '/api/sales' },
    );
    await instance.register(
      async (api) => {
        await reportRoutes(api, reportController);
      },
      { prefix: '/api/reports' },
    );
    await instance.register(
      async (api) => {
        await systemRoutes(api, systemController);
      },
      { prefix: '/api/system' },
    );
  });

  //? Register static file serving for uploads with enhanced security headers
  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    index: false,
    decorateReply: false,
    setHeaders: (res, filePath) => {
      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);

      // For PDF files, set headers to allow inline viewing
      if (mimeType === "application/pdf") {
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("Cache-Control", "public, max-age=3600");
      } else if (mimeType.startsWith("image/")) {
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Content-Disposition", "attachment");
        res.setHeader("Cache-Control", "public, max-age=3600");
      }

      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  });

  await app.register(swagger, {
    openapi: {
      info: { title: "TVE Management API", version: "1.0.0" },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });
}
