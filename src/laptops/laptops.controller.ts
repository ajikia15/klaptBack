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
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { LaptopDto } from './dtos/laptop.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ApproveLaptopDto } from './dtos/approve-laptop.dto';
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
  @Serialize(LaptopDto)
  createLaptop(@Body() body: CreateLaptopDto, @CurrentUser() user: User) {
    return this.laptopsService.create(body, user);
  }

  @Delete('/:id')
  async removeLaptop(@Param('id') id: string) {
    // TODO: un-async
    const laptop = await this.laptopsService.findOne(parseInt(id));
    if (!laptop) throw new NotFoundException('No laptop found with such id');
    await this.laptopsService.remove(parseInt(id));
    return laptop;
  }

  @Patch('/:id') // ???
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
