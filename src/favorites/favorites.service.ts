import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private favoritesRepo: Repository<Favorite>,
  ) {}

  async create(userId: number, laptopId: number) {
    if (!userId || !laptopId) {
      throw new BadRequestException('User ID and Laptop ID are required');
    }

    try {
      const existingFavorite = await this.favoritesRepo.findOne({
        where: { userId, laptopId },
      });

      //   if (existingFavorite) {
      //     await this.favoritesRepo.remove(existingFavorite);
      //     return { message: 'Laptop unfavorited successfully' };
      //   }

      const favorite = this.favoritesRepo.create({
        userId,
        laptopId,
      });

      await this.favoritesRepo.save(favorite);
      return { message: 'Laptop favorited successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to process favorite operation');
    }
  }

  async findForLaptop(laptopId: number, userId: number) {
    if (!laptopId) {
      throw new BadRequestException('Laptop ID is required');
    }

    const favorite = await this.favoritesRepo.findOne({
      where: { laptopId, userId },
    });

    return favorite;
  }

  async findAll() {
    const favorites = await this.favoritesRepo.find();
    if (!favorites.length) {
      throw new NotFoundException('No favorites found');
    }
    return favorites;
  }

  async findForUser(userId: number) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const favorites = await this.favoritesRepo.find({
      where: { userId },
    });

    return favorites;
  }

  async count(laptopId: number) {
    if (!laptopId) {
      throw new BadRequestException('Laptop ID is required');
    }

    try {
      const count = await this.favoritesRepo.count({
        where: { laptopId },
      });

      return count;
    } catch (error) {
      throw new BadRequestException('Failed to count favorites for laptop');
    }
  }

  async remove(userId: number, laptopId: number) {
    if (!userId || !laptopId) {
      throw new BadRequestException('User ID and Laptop ID are required');
    }

    const result = await this.favoritesRepo.delete({ userId, laptopId });

    if (result.affected === 0) {
      throw new NotFoundException('Favorite not found');
    }

    return { message: 'Favorite successfully removed' };
  }
}
