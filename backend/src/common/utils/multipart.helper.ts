import { MultipartFile, MultipartValue } from "@fastify/multipart";

/**
 * Multipart Helper - Utilities for handling multipart/form-data requests
 * Works with @fastify/multipart configured with attachFieldsToBody: true
 */

export interface ParsedMultipartBody {
  fields: Record<string, any>;
  files: MultipartFile[];
}

/**
 * Extract field value from multipart field
 * When attachFieldsToBody is true, fields have a .value property
 */
export function getFieldValue(field: MultipartValue<string> | undefined): string | undefined {
  if (!field) return undefined;
  return typeof field === 'object' && 'value' in field ? field.value : undefined;
}

/**
 * Extract numeric field value from multipart field
 */
export function getNumericFieldValue(field: MultipartValue<string> | undefined): number | undefined {
  const value = getFieldValue(field);
  if (value === undefined || value === '') return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse multipart body with attachFieldsToBody: true
 * Extracts files and field values from the body
 * 
 * @param body - The request body from Fastify
 * @returns Parsed fields (with values extracted) and array of files
 */
export function parseMultipartBody(body: any): ParsedMultipartBody {
  const fields: Record<string, any> = {};
  const files: MultipartFile[] = [];

  if (!body) {
    return { fields, files };
  }

  for (const [key, value] of Object.entries(body)) {
    if (!value) continue;

    // Check if this is a file or array of files
    if (isMultipartFile(value)) {
      files.push(value);
    } else if (Array.isArray(value)) {
      // Handle array of files (e.g., files[])
      const fileArray = value.filter(isMultipartFile);
      if (fileArray.length > 0) {
        files.push(...fileArray);
      } else {
        // Array of field values
        fields[key] = value.map((v: any) => 
          typeof v === 'object' && 'value' in v ? v.value : v
        );
      }
    } else if (typeof value === 'object' && 'value' in value) {
      // Regular field with .value property
      fields[key] = (value as MultipartValue<string>).value;
    } else {
      // Direct value (shouldn't happen with attachFieldsToBody but handle anyway)
      fields[key] = value;
    }
  }

  return { fields, files };
}

/**
 * Check if a value is a MultipartFile
 */
export function isMultipartFile(value: any): value is MultipartFile {
  return (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === 'file' &&
    'filename' in value &&
    'toBuffer' in value &&
    typeof value.toBuffer === 'function'
  );
}

/**
 * Validate that at least one file was uploaded
 */
export function validateFilesRequired(files: MultipartFile[], message = "Vui lòng đính kèm ít nhất một file"): void {
  if (!files || files.length === 0) {
    const error = new Error(message);
    (error as any).statusCode = 400;
    throw error;
  }
}
