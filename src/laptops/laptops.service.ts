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

  async getFilterOptions() {
    const [
      brands,
      // gpuBrands,
      gpuModels,
      // processorBrands,
      processorModels,
      ramTypes,
      ramSizes,
      storageTypes,
      storageSizes,
      stockStatuses,
      screenSizes,
      screenResolutions,
    ] = await Promise.all([
      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.brand', 'value')
        .where('laptop.brand IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      // this.repo
      //   .createQueryBuilder('laptop')
      //   .select('DISTINCT laptop.gpuBrand', 'value')
      //   .where('laptop.gpuBrand IS NOT NULL')
      //   .orderBy('value', 'ASC')
      //   .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.gpuModel', 'value')
        .where('laptop.gpuModel IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      // this.repo
      //   .createQueryBuilder('laptop')
      //   .select('DISTINCT laptop.processorBrand', 'value')
      //   .where('laptop.processorBrand IS NOT NULL')
      //   .orderBy('value', 'ASC')
      //   .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.processorModel', 'value')
        .where('laptop.processorModel IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.ramType', 'value')
        .where('laptop.ramType IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.ram', 'value')
        .where('laptop.ram IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.storageType', 'value')
        .where('laptop.storageType IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.storageCapacity', 'value')
        .where('laptop.storageCapacity IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.stockStatus', 'value')
        .where('laptop.stockStatus IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.screenSize', 'value')
        .where('laptop.screenSize IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.screenResolution', 'value')
        .where('laptop.screenResolution IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),
    ]);

    // Get min and max prices
    const minPrice = await this.repo
      .createQueryBuilder('laptop')
      .select('MIN(laptop.price)', 'min')
      .getRawOne();

    const maxPrice = await this.repo
      .createQueryBuilder('laptop')
      .select('MAX(laptop.price)', 'max')
      .getRawOne();

    return {
      brands: brands.map((item) => item.value),
      // gpuBrands: gpuBrands.map((item) => item.value),
      gpuModels: gpuModels.map((item) => item.value),
      // processorBrands: processorBrands.map((item) => item.value),
      processorModels: processorModels.map((item) => item.value),
      ramTypes: ramTypes.map((item) => item.value),
      ram: ramSizes.map((item) => item.value),
      storageTypes: storageTypes.map((item) => item.value),
      storageCapacity: storageSizes.map((item) => item.value),
      stockStatuses: stockStatuses.map((item) => item.value),
      screenSizes: screenSizes.map((item) => item.value),
      screenResolutions: screenResolutions.map((item) => item.value),
      priceRange: {
        min: minPrice?.min || 0,
        max: maxPrice?.max || 0,
      },
    };
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

  async getRandomLaptopTitle() {
    // Using database's random selection capability with ORDER BY RANDOM() LIMIT 1
    const laptop = await this.repo
      .createQueryBuilder('laptop')
      .select('laptop.title')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!laptop) {
      throw new NotFoundException('No laptops found');
    }

    return { title: laptop.title };
  }
}
