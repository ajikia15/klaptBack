import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateLaptopDto } from './dtos/update-laptop.dto';
import { Laptop } from './laptop.entity';
import { CreateLaptopDto } from './dtos/create-laptop.dto';
import { User } from 'src/users/user.entity';
import { SearchLaptopDto } from './dtos/search-laptop.dto';
@Injectable()
export class LaptopsService {
  constructor(@InjectRepository(Laptop) private repo: Repository<Laptop>) {}

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  findAll() {
    return this.repo.find();
  }

  async create(laptopDto: CreateLaptopDto, user: User) {
    const laptop = this.repo.create(laptopDto);
    laptop.user = user;
    return this.repo.save(laptop);
  }

  findByTerm(term: string) {
    return this.repo
      .createQueryBuilder('laptop')
      .where('LOWER(laptop.title) LIKE LOWER(:term)', { term: `%${term}%` })
      .getMany();
  }

  findWithFilters(filters: SearchLaptopDto) {
    const query = this.repo.createQueryBuilder('laptop');

    // Search by title
    if (filters.term) {
      query.andWhere('LOWER(laptop.title) LIKE LOWER(:term)', {
        term: `%${filters.term}%`,
      });
    }

    // Filter by brand
    if (filters.brand) {
      query.andWhere('LOWER(laptop.brand) LIKE LOWER(:brand)', {
        brand: `%${filters.brand}%`,
      });
    }

    // Filter by model
    if (filters.model) {
      query.andWhere('LOWER(laptop.model) LIKE LOWER(:model)', {
        model: `%${filters.model}%`,
      });
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      query.andWhere('laptop.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('laptop.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Filter by GPU brand
    if (filters.gpuBrand) {
      query.andWhere('LOWER(laptop.gpuBrand) LIKE LOWER(:gpuBrand)', {
        gpuBrand: `%${filters.gpuBrand}%`,
      });
    }

    // Filter by GPU model
    if (filters.gpuModel) {
      query.andWhere('LOWER(laptop.gpuModel) LIKE LOWER(:gpuModel)', {
        gpuModel: `%${filters.gpuModel}%`,
      });
    }

    if (filters.processorBrand) {
      query.andWhere('laptop.processorBrand = :processorBrand', {
        processorBrand: filters.processorBrand,
      });
    }

    // Filter by RAM type
    if (filters.ramType) {
      query.andWhere('laptop.ramType = :ramType', {
        ramType: filters.ramType,
      });
    }

    // Filter by storage type
    if (filters.storageType) {
      query.andWhere('laptop.storageType = :storageType', {
        storageType: filters.storageType,
      });
    }

    // Filter by year
    if (filters.year) {
      query.andWhere('laptop.year = :year', {
        year: filters.year,
      });
    }

    // Filter by stock status
    if (filters.stockStatus) {
      query.andWhere('laptop.stockStatus = :stockStatus', {
        stockStatus: filters.stockStatus,
      });
    }

    return query.getMany();
  }
  async remove(id: number) {
    const laptop = await this.findOne(id);
    if (!laptop) {
      throw new NotFoundException('Laptop not found');
    }
    return this.repo.remove(laptop);
  }

  async update(id: number, attrs: Partial<Laptop>) {
    const laptop = await this.findOne(id);
    if (!laptop) {
      throw new NotFoundException('user not found');
    }
    Object.assign(laptop, attrs);
    return this.repo.save(laptop);
  }

  async changeStatus(
    id: number,
    status: 'approved' | 'pending' | 'rejected' | 'archived',
  ) {
    // ???
    const laptop = await this.repo.findOne({ where: { id: id } });
    if (!laptop) {
      throw new NotFoundException('user not found');
    }
    laptop.status = status;
    return this.repo.save(laptop);
  }
}
