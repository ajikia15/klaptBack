import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
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

  async getFilterOptions(filters?: SearchLaptopDto): Promise<FilterOptions> {
    // Get all options first
    const allOptions = await this.getAllFilterOptions();

    if (!filters || this.areFiltersEmpty(filters)) {
      // No filters, everything enabled
      return {
        brands: allOptions.brands.map((value) => ({ value, disabled: false })),
        processorModels: allOptions.processorModels.map((value) => ({
          value,
          disabled: false,
        })),
        gpuModels: [],
        ramTypes: [],
        ram: [],
        storageTypes: [],
        storageCapacity: [],
        stockStatuses: [],
        screenSizes: [],
        screenResolutions: [],
        priceRange: allOptions.priceRange,
      };
    }

    // For debugging: If brand filter is applied, directly check which processors exist
    if (filters.brand && filters.brand.length > 0) {
      // Direct DB query to check which processors exist for this brand
      const brandProcessors = await this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.processorModel', 'model')
        .where('laptop.brand IN (:...brands)', { brands: filters.brand })
        .getRawMany();

      const availableProcessors = brandProcessors.map((p) => p.model);

      // Create result with direct filtering
      return {
        brands: allOptions.brands.map((value) => ({
          value,
          disabled: false,
        })),
        processorModels: allOptions.processorModels.map((value) => {
          const exists = availableProcessors.some(
            (p) => p && p.toLowerCase().trim() === value.toLowerCase().trim(),
          );
          return {
            value,
            disabled: !exists,
          };
        }),
        gpuModels: [],
        ramTypes: [],
        ram: [],
        storageTypes: [],
        storageCapacity: [],
        stockStatuses: [],
        screenSizes: [],
        screenResolutions: [],
        priceRange: allOptions.priceRange,
      };
    }

    // For processor model filters, only disable brands that don't have this processor
    if (filters.processorModel && filters.processorModel.length > 0) {
      // Direct DB query to check which brands have these processors
      const processorBrands = await this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.brand', 'brand')
        .where('laptop.processorModel IN (:...processors)', {
          processors: filters.processorModel,
        })
        .getRawMany();

      const availableBrands = processorBrands.map((b) => b.brand);

      return {
        brands: allOptions.brands.map((value) => {
          const exists = availableBrands.some(
            (b) => b && b.toLowerCase().trim() === value.toLowerCase().trim(),
          );

          return {
            value,
            disabled: !exists,
          };
        }),
        processorModels: allOptions.processorModels.map((value) => ({
          value,
          disabled: false,
        })),
        gpuModels: [],
        ramTypes: [],
        ram: [],
        storageTypes: [],
        storageCapacity: [],
        stockStatuses: [],
        screenSizes: [],
        screenResolutions: [],
        priceRange: allOptions.priceRange,
      };
    }

    // For all other filter combinations, use the existing complex logic
    const filteredOptions = await this.getFilteredOptions(filters);

    const activeFilters = Object.keys(filters).filter(
      (k) =>
        filters[k] &&
        (Array.isArray(filters[k]) ? filters[k].length > 0 : true),
    );

    return {
      brands: allOptions.brands.map((value) => ({
        value,
        disabled:
          !activeFilters.includes('brand') &&
          !filteredOptions.brands.some(
            (b) => b.toLowerCase().trim() === value.toLowerCase().trim(),
          ),
      })),
      processorModels: allOptions.processorModels.map((value) => {
        const normalized = value.toLowerCase().trim();
        const isDisabled =
          !activeFilters.includes('processorModel') &&
          !filteredOptions.processorModels
            .map((p) => p.toLowerCase().trim())
            .includes(normalized);

        return {
          value,
          disabled: isDisabled,
        };
      }),
      gpuModels: [],
      ramTypes: [],
      ram: [],
      storageTypes: [],
      storageCapacity: [],
      stockStatuses: [],
      screenSizes: [],
      screenResolutions: [],
      priceRange: filteredOptions.priceRange || allOptions.priceRange,
    };
  }

  private areFiltersEmpty(filters: SearchLaptopDto): boolean {
    if (filters.term) return false;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      return false;

    const arrayFilters = [
      'brand',
      'model',
      'gpuBrand',
      'gpuModel',
      'processorBrand',
      'processorModel',
      'ramType',
      'ram',
      'storageType',
      'storageCapacity',
      'screenSize',
      'screenResolution',
      'stockStatus',
      'year',
    ];

    for (const filter of arrayFilters) {
      if (
        filters[filter] &&
        Array.isArray(filters[filter]) &&
        filters[filter].length > 0
      ) {
        return false;
      }
    }

    return true;
  }

  private async getAllFilterOptions(): Promise<any> {
    const [
      brand,
      gpuModel,
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
      gpuModels: gpuModel.map((item) => item.value),
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

  private async getFilteredOptions(filters: SearchLaptopDto): Promise<any> {
    // Get brands available with current processor filters
    const getAvailableBrands = async () => {
      const query = this.repo.createQueryBuilder('laptop');

      // Apply only processor filters (skip brand filters)
      if (filters.processorModel && filters.processorModel.length > 0) {
        query.andWhere('laptop.processorModel IN (:...processorModels)', {
          processorModels: filters.processorModel,
        });
      }

      // Apply all other filters except brand
      const filteredFilters = { ...filters };
      delete filteredFilters.brand;
      this.applyFilters(query, filteredFilters);

      const results = await query
        .select('DISTINCT laptop.brand', 'value')
        .where('laptop.brand IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));

      return results;
    };

    // Get processor models available with current brand filters
    const getAvailableProcessorModels = async () => {
      const query = this.repo.createQueryBuilder('laptop');

      // Apply only brand filters (skip processor filters)
      if (filters.brand && filters.brand.length > 0) {
        query.andWhere('laptop.brand IN (:...brands)', {
          brands: filters.brand,
        });
      }

      // Apply all other filters except processorModel
      const filteredFilters = { ...filters };
      delete filteredFilters.processorModel;
      this.applyFilters(query, filteredFilters);

      const results = await query
        .select('DISTINCT laptop.processorModel', 'value')
        .where('laptop.processorModel IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));

      return results;
    };

    // Execute both queries
    const [brands, processorModels] = await Promise.all([
      getAvailableBrands(),
      getAvailableProcessorModels(),
    ]);

    // Get price range
    const priceQuery = this.repo.createQueryBuilder('laptop');
    this.applyFilters(priceQuery, filters);

    const minPrice = await priceQuery
      .clone()
      .select('MIN(laptop.price)', 'min')
      .getRawOne();

    const maxPrice = await priceQuery
      .clone()
      .select('MAX(laptop.price)', 'max')
      .getRawOne();

    // Create a result object with filtered options
    return {
      brands,
      processorModels,
      gpuModels: [],
      ramTypes: [],
      ram: [],
      storageTypes: [],
      storageCapacity: [],
      stockStatuses: [],
      screenSizes: [],
      screenResolutions: [],
      priceRange: {
        min: minPrice?.min || 0,
        max: maxPrice?.max || 0,
      },
    };
  }

  private applyFilters(
    query: SelectQueryBuilder<Laptop>,
    filters: SearchLaptopDto,
  ) {
    if (!filters) return;

    if (filters.term) {
      query.andWhere('LOWER(laptop.title) LIKE LOWER(:term)', {
        term: `%${filters.term}%`,
      });
    }

    if (
      filters.brand &&
      Array.isArray(filters.brand) &&
      filters.brand.length > 0
    ) {
      // Use exact match with IN clause
      query.andWhere('laptop.brand IN (:...brands)', {
        brands: filters.brand,
      });
    }

    if (
      filters.processorModel &&
      Array.isArray(filters.processorModel) &&
      filters.processorModel.length > 0
    ) {
      // Use exact match with IN clause
      query.andWhere('laptop.processorModel IN (:...processorModels)', {
        processorModels: filters.processorModel,
      });
    }
  }

  find(filters: SearchLaptopDto) {
    const query = this.repo.createQueryBuilder('laptop');
    this.applyFilters(query, filters);
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
    const laptop = await this.repo.findOne({ where: { id: id } });
    if (!laptop) {
      throw new NotFoundException('user not found');
    }
    laptop.status = status;
    return this.repo.save(laptop);
  }

  async getRandomLaptopTitle() {
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
