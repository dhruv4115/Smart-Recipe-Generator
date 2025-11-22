import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttpException
      ? (exception as HttpException).getResponse()
      : null;

    const message =
      (errorResponse && (errorResponse as any).message) ||
      exception.message ||
      'Internal server error';

    const code = (errorResponse && (errorResponse as any).code) || 'INTERNAL_ERROR';

    response.status(status).json({
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
