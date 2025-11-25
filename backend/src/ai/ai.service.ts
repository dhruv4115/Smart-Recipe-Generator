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


  // --------------------------------------
// Gemini fallback embedding
// --------------------------------------
  async getGeminiEmbedding(text: string): Promise<number[]> {
  const apiKey = this.configService.get<string>('gemini.apiKey');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/embed-text-1:embedText?key=${apiKey}`;

  try {
    const response$ = this.httpService.post(
      url,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const res = await firstValueFrom(response$);

    const embedding = res?.data?.embedding?.value
                  || res?.data?.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      this.logger.error("Gemini embedding unexpected response", res.data);
      throw new InternalServerErrorException({
        message: "Gemini embedding bad response",
        code: "GEMINI_BAD_RESPONSE",
      });
    }

    return embedding;
  } catch (err: any) {
    this.logger.error("Error calling Gemini embedding API:", err?.response?.data || err.message);
    throw new InternalServerErrorException({
      message: "Failed to generate embedding",
      code: "EMBEDDING_CALL_FAILED",
    });
  }
}


  // ---------- Embeddings ----------

  async getEmbedding(text: string): Promise<number[]> {
  const baseUrl = this.configService.get('embeddings.baseUrl');
  const apiKey = this.configService.get('embeddings.apiKey');

  const url = `${baseUrl}?key=${apiKey}`;

  try {
    const response$ = this.httpService.post(
      url,
      {
        content: {
          parts: [
            { text }
          ]
        }
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const response = await firstValueFrom(response$);
    const values = response.data?.embedding?.values;

    if (!Array.isArray(values)) {
      throw new Error("Bad embedding API response");
    }

    return values;
  } catch (err) {
    this.logger.error("Error calling embedding API", err?.response?.data || err);
    throw new InternalServerErrorException({
      message: "Failed to generate embedding",
      code: "EMBEDDING_CALL_FAILED",
    });
  }
}



  // ---------- LLM: chat/completions helper ----------

  private async callChatModel(prompt: string): Promise<string> {
    const baseUrl = this.configService.get<string>('llm.baseUrl');
    const apiKey = this.configService.get<string>('llm.apiKey');
    const model = this.configService.get<string>('llm.model');

    if (!baseUrl || !apiKey || !model) {
      this.logger.error('LLM API config missing');
      throw new InternalServerErrorException({
        message: 'LLM API is not configured',
        code: 'LLM_CONFIG_MISSING',
      });
    }

    try {
      const response$ = this.httpService.post(
        baseUrl,
        {
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant for a recipe app. Always respond ONLY with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          // OpenAI-specific field; if your provider doesn’t support it, remove it.
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const response = await firstValueFrom(response$);
      const data = response.data;

      const content =
        data?.choices?.[0]?.message?.content ??
        JSON.stringify({ error: 'No content' });

      return content;
    } catch (error: any) {
      this.logger.error(
        'Error calling LLM API',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException({
        message: 'Failed to call LLM API',
        code: 'LLM_CALL_FAILED',
      });
    }
  }

  // ---- Nutritional estimates (LLM) ----
  async getNutritionEstimate(
    ingredients: string[],
    servings: number,
  ): Promise<NutritionInfo> {
    const prompt = `You are a nutrition assistant. Estimate approximate nutrition per serving for a recipe.
                    Ingredients: ${ingredients.join(', ')}
                    Number of servings: ${servings}

                    Return a JSON object with this exact structure (numbers in grams or kcal per serving):

                    {
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fat": number,
                    "perServing": true
                    }`;
    try {
      const content = await this.callChatModel(prompt);
      const parsed = JSON.parse(content);

      const result: NutritionInfo = {
        calories: Number(parsed.calories) || 0,
        protein: Number(parsed.protein) || 0,
        carbs: Number(parsed.carbs) || 0,
        fat: Number(parsed.fat) || 0,
        perServing: true,
      };

      return result;
    } catch (error: any) {
      this.logger.error(
        'Failed to parse nutrition estimate from LLM',
        error?.message,
      );
      // Fallback to safe defaults so the app still works
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        perServing: true,
      };
    }
  }

  // ---- Substitution suggestions ----
  async getSubstitutionSuggestions(
    ingredients: string[],
    dietaryPreferences: string[],
    allergies: string[],
  ): Promise<{ substitutions: any[]; notes: string }> {
    const prompt = `
        You are a culinary expert helping with ingredient substitutions.

        Ingredients in the recipe: ${ingredients.join(', ')}
        User dietary preferences: ${dietaryPreferences.join(', ') || 'none'}
        User allergies: ${allergies.join(', ') || 'none'}

        Suggest substitutions for ingredients that conflict with the dietary preferences or allergies.
        Also suggest any improvements to make the recipe more suitable.

        Return a JSON object with this exact structure:

        {
        "substitutions": [
            {
            "original": "butter",
            "suggested": "olive oil",
            "reason": "vegan, lactose-free"
            }
        ],
        "notes": "Additional overall tips or remarks."
        }
        `;

    try {
      const content = await this.callChatModel(prompt);
      const parsed = JSON.parse(content);

      const substitutions = Array.isArray(parsed.substitutions)
        ? parsed.substitutions
        : [];
      const notes =
        typeof parsed.notes === 'string' ? parsed.notes : '';

      return { substitutions, notes };
    } catch (error: any) {
      this.logger.error(
        'Failed to parse substitution suggestions from LLM',
        error?.message,
      );
      return {
        substitutions: [],
        notes: 'Could not generate substitution suggestions.',
      };
    }
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
      message: 'Image is unclear, Failed to detect ingredients from image.Please upload a new image in jpeg and not in .webp.',
      code: 'VISION_CALL_FAILED',
    });
  }
}

}