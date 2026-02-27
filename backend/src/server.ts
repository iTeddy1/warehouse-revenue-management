import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { config } from "dotenv";
import { registerPlugins } from "./plugins/register.js";
import { Decimal } from "@prisma/client/runtime/library";

config();

(Decimal.prototype as any).toJSON = function () {
  return Number(this.toString());
};

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.50.106:3000"];

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD", "PUT"],
  });
  await app.register(multipart, { attachFieldsToBody: true });

  // Health check endpoint
  app.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await registerPlugins(app);

  return app;
}

async function start() {
  try {
    const app = await createApp();

    const port = Number(process.env.PORT || 4000);
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
    app.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
