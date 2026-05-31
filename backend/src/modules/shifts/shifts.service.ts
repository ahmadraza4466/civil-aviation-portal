import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift } from './schemas/shift.schema';
import { User } from '../users/schemas/user.schema';
import { CreateShiftDto, UpdateShiftDto } from './dto/create-shift.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ShiftsService implements OnModuleInit {
  constructor(
    @InjectModel(Shift.name) private readonly shiftModel: Model<Shift>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    // 1. Ensure our 4 core engineers are seeded
    const engineers = [
      { name: 'Rizvans Hafizs', email: 'rizvans@example.com', role: 'engineer' },
      { name: 'Vitalijs Babans', email: 'vitalijs@example.com', role: 'engineer' },
      { name: 'Ivars Liepins', email: 'ivars@example.com', role: 'engineer' },
      { name: 'Maksims Krasovskis', email: 'maksims@example.com', role: 'engineer' },
    ];

    const usersMap: Record<string, string> = {};

    for (const eng of engineers) {
      let user = await this.userModel.findOne({ email: eng.email });
      if (!user) {
        const passwordHash = await bcrypt.hash('123456', 10);
        user = await new this.userModel({
          email: eng.email,
          passwordHash,
          name: eng.name,
          role: eng.role,
        }).save();
        console.log(`✅ Seeded engineer user: ${eng.name}`);
      }
      usersMap[eng.name] = user._id.toString();
    }

    // 2. Check if we have shifts seeded. If not, seed them for March 2026!
    const count = await this.shiftModel.countDocuments();
    if (count === 0) {
      console.log('💡 Seeding sample shift schedule for March 2026...');

      const shiftsToSeed: any[] = [];

      // Helper to generate padded date string: March YYYY-MM-DD
      const marchDate = (day: number) => `2026-03-${day.toString().padStart(2, '0')}`;

      // --- Rizvans Hafizs shifts ---
      const rizId = usersMap['Rizvans Hafizs'];
      if (rizId) {
        // Vacation days 15 to 30
        shiftsToSeed.push({
          engineerId: rizId,
          type: 'Vacation',
          startDate: marchDate(15),
          endDate: marchDate(30),
          hours: 0,
          notes: 'Annual Paid Vacation',
        });
        // Day 1, 2: Morning
        shiftsToSeed.push(
          { engineerId: rizId, type: 'Morning', startDate: marchDate(1), endDate: marchDate(1), startTime: '08:00', endTime: '16:00', hours: 8, notes: 'A300 FFS' },
          { engineerId: rizId, type: 'Morning', startDate: marchDate(2), endDate: marchDate(2), startTime: '08:00', endTime: '16:00', hours: 8, notes: 'A300 FFS' }
        );
        // Day 5, 6, 7, 8: Evening
        for (let d = 5; d <= 8; d++) {
          shiftsToSeed.push({ engineerId: rizId, type: 'Evening', startDate: marchDate(d), endDate: marchDate(d), startTime: '16:00', endTime: '24:00', hours: 8, notes: 'B737 FTD' });
        }
        // Day 11, 12, 13, 14: Night
        for (let d = 11; d <= 14; d++) {
          shiftsToSeed.push({ engineerId: rizId, type: 'Night', startDate: marchDate(d), endDate: marchDate(d), startTime: '00:00', endTime: '08:00', hours: 8, notes: 'Night Patrol' });
        }
        // Day 31: Morning
        shiftsToSeed.push({ engineerId: rizId, type: 'Morning', startDate: marchDate(31), endDate: marchDate(31), startTime: '08:00', endTime: '16:00', hours: 8, notes: 'A300 FFS' });
      }

      // --- Vitalijs Babans shifts ---
      const vitId = usersMap['Vitalijs Babans'];
      if (vitId) {
        shiftsToSeed.push(
          { engineerId: vitId, type: 'Night', startDate: marchDate(3), endDate: marchDate(3), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(4), endDate: marchDate(4), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(5), endDate: marchDate(5), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(6), endDate: marchDate(6), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(9), endDate: marchDate(9), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(10), endDate: marchDate(10), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(11), endDate: marchDate(11), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(12), endDate: marchDate(12), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: vitId, type: 'Evening', startDate: marchDate(16), endDate: marchDate(16), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: vitId, type: 'Evening', startDate: marchDate(17), endDate: marchDate(17), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(18), endDate: marchDate(18), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(19), endDate: marchDate(19), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Evening', startDate: marchDate(22), endDate: marchDate(22), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: vitId, type: 'Evening', startDate: marchDate(23), endDate: marchDate(23), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(24), endDate: marchDate(24), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Night', startDate: marchDate(25), endDate: marchDate(25), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(29), endDate: marchDate(29), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: vitId, type: 'Morning', startDate: marchDate(30), endDate: marchDate(30), startTime: '08:00', endTime: '16:00', hours: 8 }
        );
      }

      // --- Ivars Liepins shifts ---
      const ivarId = usersMap['Ivars Liepins'];
      if (ivarId) {
        // Vacation days 5 to 14
        shiftsToSeed.push({
          engineerId: ivarId,
          type: 'Vacation',
          startDate: marchDate(5),
          endDate: marchDate(14),
          hours: 0,
          notes: 'Annual Paid Vacation',
        });
        shiftsToSeed.push(
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(3), endDate: marchDate(3), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(4), endDate: marchDate(4), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: ivarId, type: 'Evening', startDate: marchDate(15), endDate: marchDate(15), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: ivarId, type: 'Evening', startDate: marchDate(16), endDate: marchDate(16), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: ivarId, type: 'Evening', startDate: marchDate(17), endDate: marchDate(17), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: ivarId, type: 'Evening', startDate: marchDate(18), endDate: marchDate(18), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: ivarId, type: 'Night', startDate: marchDate(21), endDate: marchDate(21), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: ivarId, type: 'Night', startDate: marchDate(22), endDate: marchDate(22), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: ivarId, type: 'Night', startDate: marchDate(23), endDate: marchDate(23), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: ivarId, type: 'Night', startDate: marchDate(24), endDate: marchDate(24), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(27), endDate: marchDate(27), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(28), endDate: marchDate(28), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(29), endDate: marchDate(29), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: ivarId, type: 'Morning', startDate: marchDate(30), endDate: marchDate(30), startTime: '08:00', endTime: '16:00', hours: 8 }
        );
      }

      // --- Maksims Krasovskis shifts ---
      const makId = usersMap['Maksims Krasovskis'];
      if (makId) {
        shiftsToSeed.push(
          { engineerId: makId, type: 'Evening', startDate: marchDate(1), endDate: marchDate(1), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Evening', startDate: marchDate(2), endDate: marchDate(2), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(7), endDate: marchDate(7), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(8), endDate: marchDate(8), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(9), endDate: marchDate(9), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(10), endDate: marchDate(10), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: makId, type: 'Evening', startDate: marchDate(13), endDate: marchDate(13), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Evening', startDate: marchDate(14), endDate: marchDate(14), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(15), endDate: marchDate(15), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(16), endDate: marchDate(16), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(19), endDate: marchDate(19), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(20), endDate: marchDate(20), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: makId, type: 'Evening', startDate: marchDate(21), endDate: marchDate(21), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Evening', startDate: marchDate(22), endDate: marchDate(22), startTime: '16:00', endTime: '24:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(25), endDate: marchDate(25), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Night', startDate: marchDate(26), endDate: marchDate(26), startTime: '00:00', endTime: '08:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(27), endDate: marchDate(27), startTime: '08:00', endTime: '16:00', hours: 8 },
          { engineerId: makId, type: 'Morning', startDate: marchDate(28), endDate: marchDate(28), startTime: '08:00', endTime: '16:00', hours: 8 }
        );
      }

      await this.shiftModel.insertMany(shiftsToSeed);
      console.log('✅ Seeded March 2026 shifts successfully!');
    }
  }

  async create(dto: CreateShiftDto) {
    return new this.shiftModel(dto).save();
  }

  async findAll(month?: string, engineerId?: string) {
    const query: any = {};
    if (engineerId) {
      query.engineerId = engineerId;
    }
    if (month) {
      // Find all shifts that overlap with the selected month (format YYYY-MM)
      const startOfMonth = `${month}-01`;
      const endOfMonth = `${month}-31`; // safe simple comparison for Mongo query
      query.$or = [
        { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { startDate: { $lte: startOfMonth }, endDate: { $gte: endOfMonth } },
      ];
    }
    return this.shiftModel.find(query).exec();
  }

  async findOne(id: string) {
    const shift = await this.shiftModel.findById(id).exec();
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, dto: UpdateShiftDto) {
    const shift = await this.shiftModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async remove(id: string) {
    const result = await this.shiftModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Shift not found');
    return result;
  }
}
