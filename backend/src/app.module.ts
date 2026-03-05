import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CasesModule } from './modules/cases/cases.module';
import { PartsModule } from './modules/parts/parts.module';
import { LogbookModule } from './modules/logbook/logbook.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          const mongod = await MongoMemoryServer.create();
          uri = mongod.getUri();
          console.log(`\nLocal in-memory MongoDB started dynamically for testing: ${uri}`);
        }
        return { uri };
      },
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
export class AppModule { }
