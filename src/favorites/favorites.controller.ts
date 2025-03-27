import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { AdminGuard } from 'src/guards/admin.guard';
import { Favorite } from './favorite.entity';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get('/all')
  @UseGuards(AdminGuard)
  listFavorites(): Promise<Favorite[]> {
    return this.favoritesService.findAll();
  }

  @Get('/:id')
  getFavorite(@Param('id') id: string, @CurrentUser() user: User) {
    return this.favoritesService.findForLaptop(+id, user.id);
  }

  // TODO: for now it just returns the id-s. for a real app we need relations and returning of the actual laptops.
  @Get()
  getFavorites(@CurrentUser() user: User): Promise<Favorite[]> {
    return this.favoritesService.findForUser(user.id);
  }

  @Post()
  create(@Body() body: { laptopId: number }, @CurrentUser() user: User) {
    return this.favoritesService.create(user.id, body.laptopId);
  }

  @Delete('/:id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.favoritesService.remove(user.id, +id);
  }

  @Get('/count/:id')
  count(@Param('id') id: string): Promise<number> {
    return this.favoritesService.count(+id);
  }
}
