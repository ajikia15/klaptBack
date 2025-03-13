import { Module } from '@nestjs/common';
import { LaptopsController } from './laptops.controller';
import { LaptopsService } from './laptops.service';
import { LaptopsRepository } from './laptops.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laptop } from './laptop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Laptop])],
  controllers: [LaptopsController],
  providers: [LaptopsService, LaptopsRepository],
  // things that can be used as dependencies for other classses
})
export class LaptopsModule {}
