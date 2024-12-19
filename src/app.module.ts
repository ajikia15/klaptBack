import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaptopsModule } from './laptops/laptops.module';
@Module({
  imports: [LaptopsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
