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
  UseGuards,
} from '@nestjs/common';
import { CreateLaptopDto } from './dtos/create-laptop.dto';
import { LaptopsService } from './laptops.service';
import { UpdateLaptopDto } from './dtos/update-laptop.dto';
import { AuthGuard } from 'src/auth.guard';
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
    const laptop = await this.laptopsService.findOne(parseInt(id));
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    return laptop;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createLaptop(@Body() body: CreateLaptopDto) {
    const laptop = await this.laptopsService.create(body);
    return laptop;
  }

  @Delete('/:id')
  async removeLaptop(@Param('id') id: string) {
    const laptop = await this.laptopsService.findOne(parseInt(id));
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    await this.laptopsService.remove(parseInt(id));
    return laptop;
  }

  @Patch('/:id')
  async updateLaptop(@Param('id') id: string, @Body() body: UpdateLaptopDto) {
    const laptop = await this.laptopsService.findOne(parseInt(id));
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    await this.laptopsService.update(parseInt(id), body);
    return laptop;
  }
}
