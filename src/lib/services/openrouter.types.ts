import { z } from "zod";

// Configuration interface
export interface OpenRouterConfiguration {
  apiKey: string;
  apiEndpoint: string;
  defaultModel: string;
  modelParameters: {
    temperature: number;
    max_tokens: number;
    [key: string]: any;
  };
  defaultSystemMessage: string;
}

// Response interface
export interface ChatResponse {
  answer: string;
  note: string;
}

// Custom error types
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class NetworkError extends OpenRouterError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR");
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message, "RATE_LIMIT_ERROR");
  }
}

// Response schema for validation
export const chatResponseSchema = z.object({
  answer: z.string(),
  note: z.string(),
});
