import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateLaptopDto } from './dtos/update-laptop.dto';
import { Laptop } from './laptop.entity';
import { CreateLaptopDto } from './dtos/create-laptop.dto';
import { User } from 'src/users/user.entity';
import { SearchLaptopDto } from './dtos/search-laptop.dto';
import { FilterOptions } from './filterOptions';
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

  async getFilterOptions(): Promise<FilterOptions> {
    const [
      brand,
      // gpuBrands,
      gpuModel,
      // processorBrands,
      processorModel,
      ramType,
      ramSize,
      storageType,
      storageSize,
      stockStatuse,
      screenSize,
      screenResolution,
    ] = await Promise.all([
      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.brand', 'value')
        .where('laptop.brand IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

      this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.gpuModel', 'value')
        .where('laptop.gpuModel IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany(),

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
      brands: brand.map((item) => item.value),
      // gpuBrands: gpuBrands.map((item) => item.value),
      gpuModels: gpuModel.map((item) => item.value),
      // processorBrands: processorBrands.map((item) => item.value),
      processorModels: processorModel.map((item) => item.value),
      ramTypes: ramType.map((item) => item.value),
      ram: ramSize.map((item) => item.value),
      storageTypes: storageType.map((item) => item.value),
      storageCapacity: storageSize.map((item) => item.value),
      stockStatuses: stockStatuse.map((item) => item.value),
      screenSizes: screenSize.map((item) => item.value),
      screenResolutions: screenResolution.map((item) => item.value),
      priceRange: {
        min: minPrice?.min || 0,
        max: maxPrice?.max || 0,
      },
    };
  }

  findWithFilters(filters: SearchLaptopDto) {
    const query = this.repo.createQueryBuilder('laptop');

    // Search by title (no change - single value)
    if (filters.term) {
      query.andWhere('LOWER(laptop.title) LIKE LOWER(:term)', {
        term: `%${filters.term}%`,
      });
    }

    // Filter by brand (array)
    if (
      filters.brand &&
      Array.isArray(filters.brand) &&
      filters.brand.length > 0
    ) {
      const conditions = filters.brand
        .map((_, index) => `LOWER(laptop.brand) LIKE LOWER(:brand${index})`)
        .join(' OR ');

      const params = {};
      filters.brand.forEach((value, index) => {
        params[`brand${index}`] = `%${value}%`;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by model (array)
    if (
      filters.model &&
      Array.isArray(filters.model) &&
      filters.model.length > 0
    ) {
      const conditions = filters.model
        .map((_, index) => `LOWER(laptop.model) LIKE LOWER(:model${index})`)
        .join(' OR ');

      const params = {};
      filters.model.forEach((value, index) => {
        params[`model${index}`] = `%${value}%`;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by price range (no change - single values)
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

    // Filter by GPU brand (array)
    if (
      filters.gpuBrand &&
      Array.isArray(filters.gpuBrand) &&
      filters.gpuBrand.length > 0
    ) {
      const conditions = filters.gpuBrand
        .map(
          (_, index) => `LOWER(laptop.gpuBrand) LIKE LOWER(:gpuBrand${index})`,
        )
        .join(' OR ');

      const params = {};
      filters.gpuBrand.forEach((value, index) => {
        params[`gpuBrand${index}`] = `%${value}%`;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by GPU model (array)
    if (
      filters.gpuModel &&
      Array.isArray(filters.gpuModel) &&
      filters.gpuModel.length > 0
    ) {
      const conditions = filters.gpuModel
        .map(
          (_, index) => `LOWER(laptop.gpuModel) LIKE LOWER(:gpuModel${index})`,
        )
        .join(' OR ');

      const params = {};
      filters.gpuModel.forEach((value, index) => {
        params[`gpuModel${index}`] = `%${value}%`;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by processor brand (array)
    if (
      filters.processorBrand &&
      Array.isArray(filters.processorBrand) &&
      filters.processorBrand.length > 0
    ) {
      query.andWhere('laptop.processorBrand IN (:...processorBrand)', {
        processorBrand: filters.processorBrand,
      });
    }

    // Filter by processor model (array)
    if (
      filters.processorModel &&
      Array.isArray(filters.processorModel) &&
      filters.processorModel.length > 0
    ) {
      const conditions = filters.processorModel
        .map(
          (_, index) =>
            `LOWER(laptop.processorModel) LIKE LOWER(:processorModel${index})`,
        )
        .join(' OR ');

      const params = {};
      filters.processorModel.forEach((value, index) => {
        params[`processorModel${index}`] = `%${value}%`;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by RAM type (array)
    if (
      filters.ramType &&
      Array.isArray(filters.ramType) &&
      filters.ramType.length > 0
    ) {
      query.andWhere('laptop.ramType IN (:...ramType)', {
        ramType: filters.ramType,
      });
    }

    // Filter by RAM amount (array)
    if (filters.ram && Array.isArray(filters.ram) && filters.ram.length > 0) {
      const conditions = filters.ram
        .map((_, index) => `laptop.ram = :ram${index}`)
        .join(' OR ');

      const params = {};
      filters.ram.forEach((value, index) => {
        params[`ram${index}`] = value;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by storage type (array)
    if (
      filters.storageType &&
      Array.isArray(filters.storageType) &&
      filters.storageType.length > 0
    ) {
      query.andWhere('laptop.storageType IN (:...storageType)', {
        storageType: filters.storageType,
      });
    }

    // Filter by storage capacity (array)
    if (
      filters.storageCapacity &&
      Array.isArray(filters.storageCapacity) &&
      filters.storageCapacity.length > 0
    ) {
      const conditions = filters.storageCapacity
        .map((_, index) => `laptop.storageCapacity = :storageCapacity${index}`)
        .join(' OR ');

      const params = {};
      filters.storageCapacity.forEach((value, index) => {
        params[`storageCapacity${index}`] = value;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by screen size (array)
    if (
      filters.screenSize &&
      Array.isArray(filters.screenSize) &&
      filters.screenSize.length > 0
    ) {
      const conditions = filters.screenSize
        .map((_, index) => `laptop.screenSize = :screenSize${index}`)
        .join(' OR ');

      const params = {};
      filters.screenSize.forEach((value, index) => {
        params[`screenSize${index}`] = value;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by screen resolution (array)
    if (
      filters.screenResolution &&
      Array.isArray(filters.screenResolution) &&
      filters.screenResolution.length > 0
    ) {
      const conditions = filters.screenResolution
        .map(
          (_, index) => `laptop.screenResolution = :screenResolution${index}`,
        )
        .join(' OR ');

      const params = {};
      filters.screenResolution.forEach((value, index) => {
        params[`screenResolution${index}`] = value;
      });

      query.andWhere(`(${conditions})`, params);
    }

    // Filter by year (array)
    if (
      filters.year &&
      Array.isArray(filters.year) &&
      filters.year.length > 0
    ) {
      query.andWhere('laptop.year IN (:...year)', {
        year: filters.year,
      });
    }

    // Filter by stock status (array)
    if (
      filters.stockStatus &&
      Array.isArray(filters.stockStatus) &&
      filters.stockStatus.length > 0
    ) {
      query.andWhere('laptop.stockStatus IN (:...stockStatus)', {
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
