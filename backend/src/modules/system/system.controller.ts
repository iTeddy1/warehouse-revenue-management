import { FastifyRequest, FastifyReply } from 'fastify';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SystemService } from './system.service.js';
import type { MultipartFile } from '@fastify/multipart';

export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * POST /api/system/backup
   * Runs pg_dump and streams the resulting .sql file to the client as a download.
   */
  async backup(_request: FastifyRequest, reply: FastifyReply) {
    const filePath = await this.systemService.createBackup();
    const filename = filePath.split(/[\\/]/).pop()!;

    const stream = this.systemService.createFileStream(filePath);

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);

    return reply.send(stream);
  }

  /**
   * POST /api/system/restore
   * Accepts a multipart .sql file upload and restores the database.
   *
   * Field name expected from the client: `file`
   */
  async restore(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { file?: MultipartFile };

    if (!body.file) {
      return reply.status(400).send({
        success: false,
        message: 'Vui lòng tải lên file .sql để phục hồi',
      });
    }

    const uploaded: MultipartFile = body.file;

    if (!uploaded.filename.endsWith('.sql')) {
      return reply.status(400).send({
        success: false,
        message: 'Chỉ chấp nhận file .sql',
      });
    }

    // Save to a temp file with a unique name so concurrent requests don't collide
    const tempPath = join(
      tmpdir(),
      `restore-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`,
    );

    try {
      const buffer = await uploaded.toBuffer();
      writeFileSync(tempPath, buffer);

      await this.systemService.restoreBackup(tempPath);

      return reply.status(200).send({
        success: true,
        message: 'Phục hồi dữ liệu thành công',
      });
    } finally {
      // Always clean up the temp file
      this.systemService.removeTempFile(tempPath);
    }
  }
}
