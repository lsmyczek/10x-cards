import type { Logger } from "./logger.types";

export class ConsoleLogger implements Logger {
  private readonly sensitiveKeys = ["apiKey", "password", "token", "secret", "authorization", "key"];

  private formatMeta(meta?: Record<string, unknown>): string {
    if (!meta) return "";
    const sanitizedMeta = this.sanitizeMetadata(meta);
    return ` ${JSON.stringify(sanitizedMeta)}`;
  }

  public sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(meta)) {
      // Check if the key contains any sensitive words
      if (this.sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitized[key] = "***REDACTED***";
      }
      // Handle nested objects
      else if (value && typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          item && typeof item === "object" ? this.sanitizeMetadata(item as Record<string, unknown>) : item
        );
      }
      // Pass through non-sensitive values
      else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}${this.formatMeta(meta)}`);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}${this.formatMeta(meta)}`);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}${this.formatMeta(meta)}`);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error, this.formatMeta(meta));
  }
}
