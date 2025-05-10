import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateGenerationCommand, GenerationDto, FlashcardProposalDto } from "../../types";
import { createHash } from "../utils/hash";
import { OpenRouterService } from "./openrouter.service";
import type { OpenRouterConfiguration } from "./openrouter.types";

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 200,
  WINDOW_HOURS: 24,
};

// OpenRouter configuration
const OPENROUTER_CONFIG: OpenRouterConfiguration = {
  apiKey: import.meta.env.OPENROUTER_API_KEY || "",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  defaultModel: "openai/gpt-4o-mini",
  modelParameters: {
    temperature: 0.7,
    max_tokens: 1000,
  },
  defaultSystemMessage: `You are a helpful AI assistant specialized in creating educational flashcards.
Your task is to generate clear and concise flashcards that capture key concepts and important details.
IMPORTANT: You must ALWAYS respond with a valid JSON object containing an array of flashcards.

The response MUST follow this EXACT structure:
{
  "flashcards": [
    {
      "front": "question or prompt here",
      "back": "answer or explanation here"
    }
  ]
}

Rules:
1. ONLY return the JSON object, no other text
2. Each flashcard MUST have exactly two fields: "front" and "back"
3. Both fields MUST be non-empty strings
4. The "flashcards" array MUST contain at least one flashcard and maximum 6 flashcards`,
};

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string = "GENERATION_ERROR",
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

export class GenerationService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    openRouterConfig: OpenRouterConfiguration = OPENROUTER_CONFIG
  ) {
    if (!openRouterConfig.apiKey) {
      throw new GenerationError(
        "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.",
        "CONFIGURATION_ERROR",
        500
      );
    }
    this.openRouter = new OpenRouterService(openRouterConfig);
  }

  async createGeneration(command: CreateGenerationCommand, userId: string): Promise<GenerationDto> {
    const startTime = Date.now();

    try {
      // Check rate limit
      await this.checkRateLimit(userId);

      // Generate flashcards using OpenRouter
      const response = await this.openRouter.sendChatMessage(
        `Please generate educational flashcards from the following text. Each flashcard should have a question/prompt on the front and a clear answer/explanation on the back.

Remember to format your response EXACTLY as a JSON object with a 'flashcards' array containing objects with 'front' and 'back' properties.

Here's the text to process:

${command.source_text}`
      );

      // Parse the response and convert to FlashcardProposalDto format
      const proposals = this.parseFlashcardProposals(response.answer);
      const generationDuration = Date.now() - startTime;

      // Create generation record in database
      const sourceTextHash = await createHash(command.source_text);

      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          model: this.openRouter.modelName,
          generated_count: proposals.length,
          source_text_hash: sourceTextHash,
          source_text_length: command.source_text.length,
          generation_duration: generationDuration,
        })
        .select()
        .single();

      if (insertError) {
        throw new GenerationError("Failed to create generation record", "DB_INSERT_ERROR", 500);
      }

      return {
        id: generation.id,
        model: generation.model,
        generated_count: generation.generated_count,
        source_text_length: generation.source_text_length,
        generation_duration: generation.generation_duration,
        created_at: generation.created_at,
        status: "completed",
        flashcards_proposals: proposals,
      };
    } catch (error) {
      // Log error and create error log record
      console.error("Generation service error:", error);
      await this.createErrorLog(error, command, userId);

      if (error instanceof GenerationError) {
        throw error;
      }

      throw new GenerationError("Failed to process generation request", "UNKNOWN_ERROR", 500);
    }
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT.WINDOW_HOURS);

    const { count, error: countError } = await this.supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", windowStart.toISOString());

    if (countError) {
      throw new GenerationError("Failed to check rate limit", "RATE_LIMIT_CHECK_ERROR", 500);
    }

    if ((count ?? 0) >= RATE_LIMIT.MAX_REQUESTS) {
      throw new GenerationError(
        `Rate limit exceeded. Maximum ${RATE_LIMIT.MAX_REQUESTS} requests allowed per ${RATE_LIMIT.WINDOW_HOURS} hours.`,
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }
  }

  private async createErrorLog(error: any, command: CreateGenerationCommand, userId: string) {
    try {
      const sourceTextHash = await createHash(command.source_text);

      await this.supabase.from("generations_error_logs").insert({
        user_id: userId,
        error_code: error instanceof GenerationError ? error.code : "UNKNOWN_ERROR",
        error_message: error.message || "Unknown error",
        model: this.openRouter.modelName,
        source_text_hash: sourceTextHash,
        source_text_length: command.source_text.length,
      });
    } catch (logError) {
      console.error("Failed to create error log:", logError);
    }
  }

  private parseFlashcardProposals(content: string): FlashcardProposalDto[] {
    try {
      const data = JSON.parse(content);
      if (!Array.isArray(data?.flashcards)) {
        throw new Error("Invalid response format: expected flashcards array");
      }

      return data.flashcards.map((card: any, index: number) => ({
        id: index + 1,
        front: card.front || card.question,
        back: card.back || card.answer,
        source: "ai-full" as const,
      }));
    } catch (error) {
      console.error("Failed to parse flashcard proposals:", error);
      throw new GenerationError("Failed to parse AI response", "INVALID_RESPONSE_FORMAT", 500);
    }
  }
}
