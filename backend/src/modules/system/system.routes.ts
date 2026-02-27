import { FastifyInstance } from 'fastify';
import { SystemController } from './system.controller.js';

/**
 * System Routes
 * All routes are prefixed with `/api/system` (configured in register.ts)
 */
export async function systemRoutes(
  fastify: FastifyInstance,
  controller: SystemController,
) {
  // POST /api/system/backup
  // Streams a pg_dump .sql file back to the caller as a file download
  fastify.post('/backup', {
    schema: {
      tags: ['System'],
      summary: 'Tạo bản sao lưu cơ sở dữ liệu',
      description: 'Chạy pg_dump và trả về file .sql để tải về',
    },
    handler: controller.backup.bind(controller),
  });

  // POST /api/system/restore
  // Accepts a multipart/form-data upload with field name `file` (.sql file)
  fastify.post('/restore', {
    schema: {
      tags: ['System'],
      summary: 'Phục hồi dữ liệu từ file sao lưu',
      description: 'Nhận file .sql qua multipart và chạy psql để phục hồi',
      consumes: ['multipart/form-data'],
    },
    handler: controller.restore.bind(controller),
  });
}
