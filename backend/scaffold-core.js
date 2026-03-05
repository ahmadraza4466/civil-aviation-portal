const fs = require('fs');
const path = require('path');

const files = {
    'src/main.ts': `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: '*' }); 
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('CIVIL AVIATION PORTAL API')
    .setDescription('The backend API for the Civil Aviation Maintenance Portal.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(\`🚀 Application is running on: http://localhost:\${port}/api/v1\`);
}
bootstrap();
`,

    'src/app.module.ts': `import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CasesModule } from './modules/cases/cases.module';
import { PartsModule } from './modules/parts/parts.module';
import { LogbookModule } from './modules/logbook/logbook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DevicesModule,
    CasesModule,
    PartsModule,
    LogbookModule,
  ],
})
export class AppModule {}
`,

    'src/core/interceptors/transform.interceptor.ts': `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        message: 'Request successful',
        data: data || null,
      })),
    );
  }
}
`,

    'src/core/filters/all-exceptions.filter.ts': `import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

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
`,

    '.env.example': `PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/airsim?retryWrites=true&w=majority
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=7d
`,

    'render.yaml': `services:
  - type: web
    name: air-sim-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}

console.log('App Core structure scaffolded successfully.');
