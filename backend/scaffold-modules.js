const fs = require('fs');
const path = require('path');

const files = {
    // --- USERS MODULE ---
    'src/modules/users/users.module.ts': `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}`,

    'src/modules/users/schemas/user.schema.ts': `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true, enum: ['admin', 'engineer'], default: 'engineer' }) role: string;
}
export const UserSchema = SchemaFactory.createForClass(User);`,

    'src/modules/users/dto/create-user.dto.ts': `import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() name: string;
  @IsEnum(['admin', 'engineer']) role: string;
}`,

    'src/modules/users/users.service.ts': `import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('User already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, passwordHash });
    await user.save();
    return this.sanitize(user);
  }

  async findByEmail(email: string) { return this.userModel.findOne({ email }); }
  async findAll() { return this.userModel.find().select('-passwordHash'); }
  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async remove(id: string) { return this.userModel.findByIdAndDelete(id); }
  sanitize(user: any) { const { passwordHash, ...res } = user.toObject(); return res; }
}`,

    'src/modules/users/users.controller.ts': `import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }
  @Get() findAll() { return this.usersService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.usersService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.usersService.remove(id); }
}`,

    // --- AUTH MODULE ---
    'src/modules/auth/auth.module.ts': `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}`,

    'src/modules/auth/jwt.strategy.ts': `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}`,

    'src/modules/auth/dto/login.dto.ts': `import { IsEmail, IsString } from 'class-validator';
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}`,

    'src/modules/auth/auth.service.ts': `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.usersService.sanitize(user)
    };
  }
}`,

    'src/modules/auth/auth.controller.ts': `import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) { return this.authService.login(loginDto); }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) { return req.user; }
}`,

    // --- DEVICES MODULE ---
    'src/modules/devices/devices.module.ts': `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device, DeviceSchema } from './schemas/device.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }])],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}`,

    'src/modules/devices/schemas/device.schema.ts': `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ required: true, unique: true }) code: string;
  @Prop({ required: true }) type: string;
  @Prop({ required: true }) location: string;
  @Prop({ default: 'Active' }) status: string;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);`,

    'src/modules/devices/dto/create-device.dto.ts': `import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateDeviceDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsNotEmpty() location: string;
  @IsString() @IsOptional() status?: string;
}
export class UpdateDeviceDto {
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() status?: string;
}`,

    'src/modules/devices/devices.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from './schemas/device.schema';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(@InjectModel(Device.name) private readonly model: Model<Device>) {}
  async create(dto: CreateDeviceDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Device not found');
    return e;
  }
  async update(id: string, dto: UpdateDeviceDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Device not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}`,

    'src/modules/devices/devices.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/create-device.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('devices')
export class DevicesController {
  constructor(private readonly srv: DevicesService) {}
  @Post() create(@Body() dto: CreateDeviceDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}`,

    // CASES
    'src/modules/cases/cases.module.ts': `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { Case, CaseSchema } from './schemas/case.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Case.name, schema: CaseSchema }])],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}`,

    'src/modules/cases/schemas/case.schema.ts': `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Case extends Document {
  @Prop({ required: true, unique: true }) sequenceNumber: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) deviceId: string;
  @Prop({ required: true }) description: string;
  @Prop({ default: 'Open' }) status: string;
  @Prop({ required: true }) reportedBy: string;
}
export const CaseSchema = SchemaFactory.createForClass(Case);`,

    'src/modules/cases/dto/create-case.dto.ts': `import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateCaseDto {
  @IsString() @IsNotEmpty() sequenceNumber: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() deviceId: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsNotEmpty() reportedBy: string;
}
export class UpdateCaseDto {
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() description?: string;
}`,

    'src/modules/cases/cases.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case } from './schemas/case.schema';
import { CreateCaseDto, UpdateCaseDto } from './dto/create-case.dto';

@Injectable()
export class CasesService {
  constructor(@InjectModel(Case.name) private readonly model: Model<Case>) {}
  async create(dto: CreateCaseDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Case not found');
    return e;
  }
  async update(id: string, dto: UpdateCaseDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Case not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}`,

    'src/modules/cases/cases.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/create-case.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cases')
export class CasesController {
  constructor(private readonly srv: CasesService) {}
  @Post() create(@Body() dto: CreateCaseDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateCaseDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}`,

    // PARTS
    'src/modules/parts/parts.module.ts': `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { Part, PartSchema } from './schemas/part.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }])],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}`,

    'src/modules/parts/schemas/part.schema.ts': `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Part extends Document {
  @Prop({ required: true, unique: true }) partNumber: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true, default: 0 }) quantity: number;
  @Prop({ required: true }) location: string;
}
export const PartSchema = SchemaFactory.createForClass(Part);`,

    'src/modules/parts/dto/create-part.dto.ts': `import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class CreatePartDto {
  @IsString() @IsNotEmpty() partNumber: string;
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() quantity: number;
  @IsString() @IsNotEmpty() location: string;
}
export class UpdatePartDto {
  @IsNumber() @IsOptional() quantity?: number;
  @IsString() @IsOptional() location?: string;
}`,

    'src/modules/parts/parts.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Part } from './schemas/part.schema';
import { CreatePartDto, UpdatePartDto } from './dto/create-part.dto';

@Injectable()
export class PartsService {
  constructor(@InjectModel(Part.name) private readonly model: Model<Part>) {}
  async create(dto: CreatePartDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Part not found');
    return e;
  }
  async update(id: string, dto: UpdatePartDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Part not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}`,

    'src/modules/parts/parts.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto, UpdatePartDto } from './dto/create-part.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('parts')
export class PartsController {
  constructor(private readonly srv: PartsService) {}
  @Post() create(@Body() dto: CreatePartDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdatePartDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}`,

    // LOGBOOK
    'src/modules/logbook/logbook.module.ts': `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { Logbook, LogbookSchema } from './schemas/logbook.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Logbook.name, schema: LogbookSchema }])],
  controllers: [LogbookController],
  providers: [LogbookService],
})
export class LogbookModule {}`,

    'src/modules/logbook/schemas/logbook.schema.ts': `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Logbook extends Document {
  @Prop({ required: true }) entryCode: string;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true }) notes: string;
  @Prop({ required: true }) deviceId: string;
}
export const LogbookSchema = SchemaFactory.createForClass(Logbook);`,

    'src/modules/logbook/dto/create-logbook.dto.ts': `import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateLogbookDto {
  @IsString() @IsNotEmpty() entryCode: string;
  @IsString() @IsNotEmpty() authorId: string;
  @IsString() @IsNotEmpty() notes: string;
  @IsString() @IsNotEmpty() deviceId: string;
}
export class UpdateLogbookDto {
  @IsString() @IsOptional() notes?: string;
}`,

    'src/modules/logbook/logbook.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logbook } from './schemas/logbook.schema';
import { CreateLogbookDto, UpdateLogbookDto } from './dto/create-logbook.dto';

@Injectable()
export class LogbookService {
  constructor(@InjectModel(Logbook.name) private readonly model: Model<Logbook>) {}
  async create(dto: CreateLogbookDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Logbook entry not found');
    return e;
  }
  async update(id: string, dto: UpdateLogbookDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Logbook entry not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}`,

    'src/modules/logbook/logbook.controller.ts': `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto, UpdateLogbookDto } from './dto/create-logbook.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('logbook')
export class LogbookController {
  constructor(private readonly srv: LogbookService) {}
  @Post() create(@Body() dto: CreateLogbookDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLogbookDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}
console.log('Modules scaffolded.');
