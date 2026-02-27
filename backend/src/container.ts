import type { PrismaClient } from "@prisma/client";

export class ServiceContainer {
  constructor(public db: PrismaClient) {}
}
