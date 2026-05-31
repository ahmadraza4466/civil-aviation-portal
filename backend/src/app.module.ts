import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CasesModule } from './modules/cases/cases.module';
import { PartsModule } from './modules/parts/parts.module';
import { LogbookModule } from './modules/logbook/logbook.module';
import { TimeLogsModule } from './modules/time-logs/time-logs.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

// Helper to test if a MongoDB URI is reachable
async function testMongoConnection(uri: string): Promise<boolean> {
  const conn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 2500);
      conn.once('open', () => {
        clearTimeout(timeout);
        resolve();
      });
      conn.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    await conn.close();
    return true;
  } catch (err) {
    await conn.close().catch(() => {});
    return false;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('MONGODB_URI');
        let connected = false;

        if (uri) {
          console.log(`\n🔍 Checking connection to MONGODB_URI: ${uri}...`);
          connected = await testMongoConnection(uri);
          if (connected) {
            console.log('✅ Successfully connected to configured MONGODB_URI.');
          } else {
            console.warn('❌ Failed to connect to configured MONGODB_URI.');
          }
        }

        // Fallback 1: Local MongoDB instance
        if (!connected) {
          const localUri = 'mongodb://127.0.0.1:27017/avio-training-management';
          console.log(`🔍 Checking fallback to local MongoDB: ${localUri}...`);
          connected = await testMongoConnection(localUri);
          if (connected) {
            uri = localUri;
            console.log('✅ Connected to local MongoDB fallback.');
          } else {
            console.log('❌ Local MongoDB is not running or unreachable.');
          }
        }

        // Fallback 2: Dynamic in-memory MongoDB Server
        if (!connected) {
          console.log('💡 Falling back to dynamic local in-memory MongoDB server (zero-setup)...');
          const mongod = await MongoMemoryServer.create();
          uri = mongod.getUri();
          console.log(`✅ In-memory MongoDB started successfully at: ${uri}`);
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
    TimeLogsModule,
    ShiftsModule,
  ],
})
export class AppModule { }
