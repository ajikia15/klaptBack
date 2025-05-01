import { Controller, Get, Query } from '@nestjs/common';
import { ScrapService } from './scrap.service';

@Controller('scrap')
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}
  @Get('products')
  getProducts(@Query('product') product: string) {
    return this.scrapService.getCompetitorPrices();
  }
}
