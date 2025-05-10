import type { OpenRouterConfiguration, ChatResponse } from "./openrouter.types";
import { OpenRouterError, NetworkError, RateLimitError, chatResponseSchema } from "./openrouter.types";
import type { Logger } from "./logger.types";
import { ConsoleLogger } from "./console.logger";
import { RateLimiter } from "./rate-limiter";
import { z } from "zod";

export class OpenRouterService {
  private readonly configuration: OpenRouterConfiguration;
  private lastResponse: ChatResponse | null = null;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiter;

  // Public fields as specified in the plan
  public readonly apiEndpoint: string;
  public readonly modelName: string;
  public readonly modelParameters: Record<string, any>;
  public readonly defaultSystemMessage: string;

  constructor(
    config: OpenRouterConfiguration,
    logger: Logger = new ConsoleLogger(),
    rateLimiter = new RateLimiter({ maxRequests: 50, windowMs: 60 * 1000 }) // 50 requests per minute
  ) {
    // Validate configuration
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    if (!config.apiEndpoint) {
      throw new Error("API endpoint is required");
    }

    this.configuration = config;
    this.apiEndpoint = config.apiEndpoint;
    this.modelName = config.defaultModel;
    this.modelParameters = config.modelParameters;
    this.defaultSystemMessage = config.defaultSystemMessage;
    this.logger = logger;
    this.rateLimiter = rateLimiter;

    this.logger.info("OpenRouter service initialized", {
      endpoint: this.apiEndpoint,
      model: this.modelName,
    });
  }

  // Private method to check rate limit
  private async checkRateLimit(): Promise<void> {
    const canProceed = await this.rateLimiter.checkLimit();
    if (!canProceed) {
      const timeUntilReset = this.rateLimiter.getTimeUntilReset();
      const remainingRequests = this.rateLimiter.getRemainingRequests();

      this.logger.warn("Rate limit reached", {
        timeUntilReset,
        remainingRequests,
      });

      throw new RateLimitError(`Rate limit exceeded. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`);
    }
  }

  // Public method to send chat message
  public async sendChatMessage(userMessage: string): Promise<ChatResponse> {
    if (!userMessage.trim()) {
      this.logger.warn("Empty user message received");
      throw new OpenRouterError("User message cannot be empty", "INVALID_INPUT");
    }

    await this.checkRateLimit();

    const payload = this.buildPayload(userMessage);
    this.logger.debug("Sending chat message", { model: this.modelName });

    try {
      const response = await this.makeRequest(payload);
      const result = await this.parseResponse(response);
      this.logger.info("Chat message sent successfully");
      return result;
    } catch (error) {
      if (error instanceof NetworkError && this.retryCount < this.maxRetries) {
        this.logger.warn(`Retrying request (attempt ${this.retryCount + 1}/${this.maxRetries})`);
        return this.retryRequest(payload);
      }
      throw this.handleError(error);
    }
  }

  // Public method to update configuration
  public updateConfiguration(config: Partial<OpenRouterConfiguration>): void {
    this.logger.debug("Updating configuration", config);
    this.validateConfiguration(config);

    // Update only provided values
    if (config.apiKey) {
      this.configuration.apiKey = config.apiKey;
      this.logger.info("API key updated");
    }
    if (config.apiEndpoint) {
      this.configuration.apiEndpoint = config.apiEndpoint;
      (this as any).apiEndpoint = config.apiEndpoint;
      this.logger.info("API endpoint updated", { endpoint: config.apiEndpoint });
    }
    if (config.defaultModel) {
      this.configuration.defaultModel = config.defaultModel;
      (this as any).modelName = config.defaultModel;
      this.logger.info("Default model updated", { model: config.defaultModel });
    }
    if (config.modelParameters) {
      this.configuration.modelParameters = {
        ...this.configuration.modelParameters,
        ...config.modelParameters,
      };
      (this as any).modelParameters = this.configuration.modelParameters;
      this.logger.info("Model parameters updated", { parameters: config.modelParameters });
    }
    if (config.defaultSystemMessage) {
      this.configuration.defaultSystemMessage = config.defaultSystemMessage;
      (this as any).defaultSystemMessage = config.defaultSystemMessage;
      this.logger.info("Default system message updated");
    }
  }

  // Public method to get last response
  public getLastResponse(): ChatResponse | null {
    return this.lastResponse;
  }

  // Private method to validate configuration
  private validateConfiguration(config: Partial<OpenRouterConfiguration>): void {
    if (config.apiKey && typeof config.apiKey !== "string") {
      throw new Error("API key must be a string");
    }
    if (config.apiEndpoint && typeof config.apiEndpoint !== "string") {
      throw new Error("API endpoint must be a string");
    }
    if (config.modelParameters) {
      if (
        typeof config.modelParameters.temperature !== "number" ||
        config.modelParameters.temperature < 0 ||
        config.modelParameters.temperature > 1
      ) {
        throw new Error("Temperature must be a number between 0 and 1");
      }
      if (typeof config.modelParameters.max_tokens !== "number" || config.modelParameters.max_tokens <= 0) {
        throw new Error("Max tokens must be a positive number");
      }
    }
  }

  // Private method to build payload for API request
  private buildPayload(userMessage: string): object {
    return {
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: this.defaultSystemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      ...this.modelParameters,
    };
  }

  // Private method to make API request
  private async makeRequest(payload: object): Promise<Response> {
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.configuration.apiKey}`,
        "HTTP-Referer": "https://10x-cards.com", // Your site URL
        "X-Title": "10x Cards", // Your site name
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw response;
    }

    return response;
  }

  // Private method to retry failed requests
  private async retryRequest(payload: object): Promise<ChatResponse> {
    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      const response = await this.makeRequest(payload);
      this.retryCount = 0; // Reset retry count on success
      return await this.parseResponse(response);
    } catch (error) {
      if (error instanceof NetworkError && this.retryCount < this.maxRetries) {
        return this.retryRequest(payload);
      }
      throw this.handleError(error);
    }
  }

  // Private method to handle errors
  private handleError(error: unknown): never {
    // Network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      this.logger.error("Network error occurred", error);
      throw new NetworkError("Failed to connect to OpenRouter API");
    }

    // Rate limiting errors
    if (error instanceof Response && error.status === 429) {
      const rateLimitError = new Error(`Rate limit exceeded: ${error.statusText}`);
      this.logger.error("Rate limit exceeded", rateLimitError);
      throw new RateLimitError("OpenRouter API rate limit exceeded");
    }

    // API errors
    if (error instanceof Response) {
      const apiError = new Error(`API error: ${error.statusText}`);
      this.logger.error(`API error: ${error.statusText}`, apiError);
      throw new OpenRouterError(`API error: ${error.statusText}`, `HTTP_${error.status}`);
    }

    // Unknown errors
    if (error instanceof Error) {
      this.logger.error("Unknown error occurred", error);
      throw new OpenRouterError(error.message, "UNKNOWN_ERROR");
    }

    this.logger.error("Unexpected error occurred", new Error("Unknown error"));
    throw new OpenRouterError("An unknown error occurred", "UNKNOWN_ERROR");
  }

  // Private method to parse and validate response
  private async parseResponse(response: Response): Promise<ChatResponse> {
    try {
      const data = await response.json();
      this.logger.debug("Raw API response:", { response: data });

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        this.logger.error("Invalid response structure", new Error("Invalid response structure"), { response: data });
        throw new Error("Invalid response structure from API");
      }

      const messageContent = data.choices[0].message?.content;
      if (!messageContent) {
        this.logger.error("No content in response", new Error("No content in response"), { choice: data.choices[0] });
        throw new Error("No content in API response");
      }

      this.logger.debug("Extracted content:", { content: messageContent });

      try {
        // Try to parse the content as JSON
        const parsedContent = JSON.parse(messageContent);

        // Check if we have the expected flashcards array
        if (Array.isArray(parsedContent.flashcards)) {
          // If we have flashcards array, create a formatted response
          const firstCard = parsedContent.flashcards[0] || {};
          return {
            answer: JSON.stringify(parsedContent),
            note: `Generated ${parsedContent.flashcards.length} flashcards`,
          };
        }

        // If we have a valid JSON but not in flashcards format
        return {
          answer: messageContent,
          note: "Response was in JSON format but not flashcards structure",
        };
      } catch (e) {
        // If content is not JSON at all
        return {
          answer: messageContent,
          note: "Response was not in JSON format",
        };
      }
    } catch (error) {
      this.logger.error("Error parsing response", error instanceof Error ? error : new Error("Unknown error"));
      if (error instanceof z.ZodError) {
        throw new OpenRouterError("Invalid response format from API", "INVALID_RESPONSE");
      }
      throw error;
    }
  }
}
