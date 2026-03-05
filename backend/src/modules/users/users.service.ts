import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async onModuleInit() {
    const defaultEmail = 'test@gmail.com';
    const existing = await this.userModel.findOne({ email: defaultEmail });
    if (!existing) {
      const passwordHash = await bcrypt.hash('123456', 10);
      const admin = new this.userModel({
        email: defaultEmail,
        passwordHash,
        name: 'System Admin',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Seeded default test user: test@gmail.com / 123456');
    }

    const assignees = [
      { email: 'engineera@example.com', name: 'Engineer A', role: 'engineer' },
      { email: 'engineerb@example.com', name: 'Engineer B', role: 'engineer' },
      { email: 'techc@example.com', name: 'Technician C', role: 'engineer' }
    ];

    for (const user of assignees) {
      const exists = await this.userModel.findOne({ email: user.email });
      if (!exists) {
        const passwordHash = await bcrypt.hash('123456', 10);
        await new this.userModel({
          email: user.email,
          passwordHash,
          name: user.name,
          role: user.role
        }).save();
      }
    }
  }

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
}