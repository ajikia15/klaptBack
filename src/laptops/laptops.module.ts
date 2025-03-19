import { Module } from '@nestjs/common';
import { LaptopsController } from './laptops.controller';
import { LaptopsService } from './laptops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laptop } from './laptop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Laptop])],
  controllers: [LaptopsController],
  providers: [LaptopsService],
  // things that can be used as dependencies for other classses
})
export class LaptopsModule {}
