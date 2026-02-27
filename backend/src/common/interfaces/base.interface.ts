/**
 * Base Response Interface
 * All entity response interfaces should extend this
 */
export interface BaseResponse {
  id: string;
  createdAt: Date; // Keep as Date, JSON.stringify handles formatting
  updatedAt: Date;
}
