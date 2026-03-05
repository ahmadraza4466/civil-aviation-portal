import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const cleanMessage = typeof message === 'object' && message['message'] ? message['message'] : message;

    response.status(status).json({
      success: false,
      message: Array.isArray(cleanMessage) ? cleanMessage[0] : cleanMessage,
      data: null,
    });
  }
}
