import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  perServing: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ---- Nutritional estimates (LLM – placeholder for now) ----
  async getNutritionEstimate(
    ingredients: string[],
    servings: number,
  ): Promise<NutritionInfo> {
    // TODO: implement using LLM API
    // For now, returning dummy values so other parts of the system work.
    return {
      calories: 400,
      protein: 20,
      carbs: 50,
      fat: 10,
      perServing: true,
    };
  }

  // ---- Substitution suggestions (LLM – placeholder for now) ----
  async getSubstitutionSuggestions(
    ingredients: string[],
    dietaryPreferences: string[],
  ): Promise<{ substitutions: any[]; notes: string }> {
    // TODO: implement using LLM API
    return {
      substitutions: [],
      notes: 'Substitution suggestions not yet implemented',
    };
  }

  // ---- Embeddings (placeholder – to be wired to real embeddings API later) ----
  async getEmbedding(text: string): Promise<number[]> {
    // TODO: call embeddings API (OpenAI / HF) in Phase 7/8
    // Placeholder embedding
    return [0.1, 0.2, 0.3];
  }

// ---- Vision: detect ingredients from image (Structured JSON Output) ----
async detectIngredientsFromImage(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string[]> {
  const apiKey = this.configService.get<string>('vision.apiKey');
  const modelId = this.configService.get<string>('vision.modelId'); // gemini-2.0-flash
  const baseUrl = this.configService.get<string>('vision.baseUrl'); // https://generativelanguage.googleapis.com/v1beta/models

  if (!apiKey || !modelId || !baseUrl) {
    throw new InternalServerErrorException({
      message: 'Vision API is not configured',
      code: 'VISION_CONFIG_MISSING',
    });
  }

  // Convert image → Base64
  const base64Image = fileBuffer.toString('base64');

  // Build URL:
  const url = `${baseUrl}/${modelId}:generateContent`;

  // Build request payload:
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Analyze this food image and return ONLY the list of ingredients as a pure JSON array of strings.' +
              'NO sentences, NO explanation, NO extra text. Example output: ["cheese","tomato"].',
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  try {
    const response$ = this.httpService.post(url, payload, {
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const response = await firstValueFrom(response$);

    // Extract model text
    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON array from model response
    let ingredients: string[] = [];
    try {
      ingredients = JSON.parse(text);
    } catch (e) {
      this.logger.error('Failed to parse ingredients JSON', text);
      throw new InternalServerErrorException({
        message: 'Vision response was not valid JSON',
        code: 'VISION_BAD_JSON',
      });
    }

    return ingredients;
  } catch (error) {
    this.logger.error(
      'Error calling Gemini Vision',
      error?.response?.data || error.message,
    );
    throw new InternalServerErrorException({
      message: 'Image is unclear, Failed to detect ingredients from image.Please upload a new image.',
      code: 'VISION_CALL_FAILED',
    });
  }
}

}