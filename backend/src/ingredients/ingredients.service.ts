import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { normalizeIngredients } from '../common/utils/ingredients-normalizer';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(private readonly aiService: AiService) {}

  async detectFromImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException({
        message: 'No images uploaded',
        code: 'NO_IMAGES',
      });
    }

    const allLabels: string[] = [];

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException({
          message: `Invalid file type: ${file.originalname}`,
          code: 'INVALID_FILE_TYPE',
        });
      }

      this.logger.debug(`Processing image: ${file.originalname}`);
      // To call gemini vision API via AiService
      const labels = await this.aiService.detectIngredientsFromImage(
        file.buffer,
        file.mimetype,
      );
      allLabels.push(...labels);
    }

    const detectedIngredients = normalizeIngredients(allLabels);

    return { detectedIngredients };
  }
}
