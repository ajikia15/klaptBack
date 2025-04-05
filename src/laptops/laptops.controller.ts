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
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { LaptopDto } from './dtos/laptop.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ApproveLaptopDto } from './dtos/approve-laptop.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { SearchLaptopDto } from './dtos/search-laptop.dto';

@Controller('laptops')
export class LaptopsController {
  constructor(public laptopsService: LaptopsService) {}

  @Get()
  getAllLaptops() {
    return this.laptopsService.findAll();
  }

  // First, all the specific, non-parameterized routes
  @Get('search')
  find(@Query() searchDto: SearchLaptopDto) {
    return this.laptopsService.find(searchDto);
  }

  @Get('random')
  getRandomLaptopTitle() {
    return this.laptopsService.getRandomLaptopTitle();
  }

  @Get('filters')
  async getFilterOptions(@Query() filters: SearchLaptopDto) {
    return this.laptopsService.getFilterOptions(filters);
  }

  @Get('user-laptops')
  @UseGuards(AuthGuard)
  @Serialize(LaptopDto)
  getUserLaptops(@CurrentUser() user: User) {
    return this.laptopsService.getUserLaptops(user.id);
  }

  @Delete('all')
  @UseGuards(AuthGuard)
  @UseGuards(AdminGuard)
  removeAllLaptops() {
    return this.laptopsService.removeAll();
  }

  @Get('/:id')
  getLaptop(@Param('id') id: string) {
    return this.laptopsService.findOne(parseInt(id));
  }

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(LaptopDto)
  createLaptop(@Body() body: CreateLaptopDto, @CurrentUser() user: User) {
    return this.laptopsService.create(body, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  removeLaptop(@Param('id') id: string, @CurrentUser() user: User) {
    return this.laptopsService.remove(parseInt(id), user);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approveLaptop(@Param('id') id: string, @Body() body: ApproveLaptopDto) {
    return this.laptopsService.changeStatus(parseInt(id), body.status);
  }

  // @Patch('/:id')
  // async updateLaptop(@Param('id') id: string, @Body() body: UpdateLaptopDto) {
  //   const laptop = await this.laptopsService.findOne(parseInt(id));
  //   if (!laptop) throw new NotFoundException('No laptop found with such id');
  //   await this.laptopsService.update(parseInt(id), body);
  //   return laptop;
  // }
}
