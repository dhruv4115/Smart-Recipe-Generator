import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((e) => ({
        property: e.property,
        constraints: e.constraints,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: messages,
      });
    }

    return object;
  }

  private isPrimitive(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return types.includes(metatype);
  }
}
