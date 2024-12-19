import { Module } from '@nestjs/common';
import { LaptopsController } from './laptops.controller';
import { LaptopsService } from './laptops.service';
import { LaptopsRepository } from './laptops.repository';

@Module({
  controllers: [LaptopsController],
  providers: [LaptopsService, LaptopsRepository],
  // things that can be used as dependencies for other classses
})
export class LaptopsModule {}
