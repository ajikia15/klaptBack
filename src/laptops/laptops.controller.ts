import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { createLaptopDto } from './dtos/create-laptop.dto';
import { LaptopsService } from './laptops.service';
import { updateLaptopDto } from './dtos/update-laptop.dto';
@Controller('laptops')
export class LaptopsController {
  constructor(public laptopsService: LaptopsService) {}

  @Get()
  async listLaptops() {
    return await this.laptopsService.findAll();
  }

  @Get('search')
  findByTerm(@Query('term') term: string) {
    return this.laptopsService.findByTerm(term);
  }

  @Get('/:id')
  async getLaptop(@Param('id') id: string) {
    const laptop = await this.laptopsService.findOne(id);
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    return laptop;
  }

  @Post()
  async createLaptop(@Body() body: createLaptopDto) {
    const laptop = await this.laptopsService.create(body.title, body.price);
    return laptop;
  }

  @Delete('/:id')
  async removeLaptop(@Param('id') id: string) {
    const laptop = await this.laptopsService.findOne(id);
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    await this.laptopsService.remove(parseInt(id));
    return laptop;
  }

  @Patch('/:id')
  async updateLaptop(@Param('id') id: string, @Body() body: updateLaptopDto) {
    const laptop = await this.laptopsService.findOne(id);
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    await this.laptopsService.update(parseInt(id), body);
    return laptop;
  }
}
