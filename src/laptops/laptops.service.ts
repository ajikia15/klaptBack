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
    console.log('========== NEW FILTER REQUEST ==========');
    console.log('Incoming filters:', JSON.stringify(filters, null, 2));

    // Get all options first
    const allOptions = await this.getAllFilterOptions();

    if (!filters || this.areFiltersEmpty(filters)) {
      console.log('No filters applied, returning all options as enabled');
      return {
        brands: allOptions.brands.map((value) => ({ value, disabled: false })),
        processorModels: allOptions.processorModels.map((value) => ({
          value,
          disabled: false,
        })),
        // Keep other fields as placeholders with disabled: false
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
      console.log(`BRAND FILTER DETECTED: ${filters.brand.join(', ')}`);

      // Direct DB query to check which processors exist for this brand
      const brandProcessors = await this.repo
        .createQueryBuilder('laptop')
        .select('DISTINCT laptop.processorModel', 'model')
        .where('laptop.brand IN (:...brands)', { brands: filters.brand })
        .getRawMany();

      const availableProcessors = brandProcessors.map((p) => p.model);

      console.log(
        `DIRECT DB CHECK: Found ${availableProcessors.length} processors for brand ${filters.brand.join(
          ', ',
        )}:`,
      );
      console.log(availableProcessors);

      // Check if specific processors exist
      const testProcessors = ['Ryzen 9 7940HS', 'i7-13620H'];
      testProcessors.forEach((proc) => {
        const exists = availableProcessors.some(
          (p) => p && p.toLowerCase().trim() === proc.toLowerCase().trim(),
        );
        console.log(
          `DIRECT DB CHECK: ${proc} exists for ${filters.brand.join(
            ', ',
          )}: ${exists}`,
        );
      });

      // Create result with direct filtering
      return {
        brands: allOptions.brands.map((value) => ({
          value,
          disabled: !filters.brand.includes(value),
        })),
        processorModels: allOptions.processorModels.map((value) => {
          // Simple, direct check if processor exists for this brand
          const exists = availableProcessors.some(
            (p) => p && p.toLowerCase().trim() === value.toLowerCase().trim(),
          );

          console.log(`Setting processor '${value}' disabled=${!exists}`);

          return {
            value,
            disabled: !exists,
          };
        }),
        // Keep other fields as placeholders
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

    // For non-brand filters, use your existing implementation
    const filteredOptions = await this.getFilteredOptions(filters);

    // Using normalized comparison for all options
    return {
      brands: allOptions.brands.map((value) => ({
        value,
        disabled: !filteredOptions.brands.some(
          (b) => b.toLowerCase().trim() === value.toLowerCase().trim(),
        ),
      })),
      processorModels: allOptions.processorModels.map((value) => {
        const normalized = value.toLowerCase().trim();
        const isDisabled = !filteredOptions.processorModels
          .map((p) => p.toLowerCase().trim())
          .includes(normalized);

        return {
          value,
          disabled: isDisabled,
        };
      }),
      // Keep other fields as placeholders
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
    console.log(
      'Getting filtered options with filters:',
      Object.keys(filters).filter(
        (k) =>
          filters[k] &&
          (Array.isArray(filters[k]) ? filters[k].length > 0 : true),
      ),
    );

    // Get brands available with current processor filters
    const getAvailableBrands = async () => {
      const query = this.repo.createQueryBuilder('laptop');

      // Apply only processor filters (skip brand filters)
      if (filters.processorModel && filters.processorModel.length > 0) {
        query.andWhere('laptop.processorModel IN (:...processorModels)', {
          processorModels: filters.processorModel,
        });
        console.log(
          'Applied processorModel filter for brand filtering:',
          filters.processorModel,
        );
      }

      // Apply all other filters except brand
      const filteredFilters = { ...filters };
      delete filteredFilters.brand;
      this.applyFilters(query, filteredFilters);

      console.log('SQL for available brands:', query.getSql());

      const results = await query
        .select('DISTINCT laptop.brand', 'value')
        .where('laptop.brand IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));

      console.log('Available brands:', results);
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
        console.log(
          'Applied brand filter for processor filtering:',
          filters.brand,
        );

        // Debug: Check how many laptops match this brand
        const countQuery = this.repo
          .createQueryBuilder('laptop')
          .where('laptop.brand IN (:...brands)', { brands: filters.brand });

        const count = await countQuery.getCount();
        console.log(
          `Found ${count} laptops with brand(s): ${filters.brand.join(', ')}`,
        );
      }

      // Apply all other filters except processorModel
      const filteredFilters = { ...filters };
      delete filteredFilters.processorModel;
      this.applyFilters(query, filteredFilters);

      console.log('SQL for available processor models:', query.getSql());

      const results = await query
        .select('DISTINCT laptop.processorModel', 'value')
        .where('laptop.processorModel IS NOT NULL')
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));

      console.log(
        'Available processor models with brand filters:',
        results.length > 10
          ? results
              .slice(0, 5)
              .concat(['...', '(and', results.length - 5, 'more)'])
          : results,
      );

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

    const appliedFilters = [];

    if (filters.term) {
      query.andWhere('LOWER(laptop.title) LIKE LOWER(:term)', {
        term: `%${filters.term}%`,
      });
      appliedFilters.push('term');
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
      console.log('Applied brand filter with values:', filters.brand);
      appliedFilters.push('brand');
    }

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
      appliedFilters.push('model');
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('laptop.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
      appliedFilters.push('minPrice');
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('laptop.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
      appliedFilters.push('maxPrice');
    }

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
      appliedFilters.push('gpuBrand');
    }

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
      appliedFilters.push('gpuModel');
    }

    if (
      filters.processorBrand &&
      Array.isArray(filters.processorBrand) &&
      filters.processorBrand.length > 0
    ) {
      query.andWhere('laptop.processorBrand IN (:...processorBrand)', {
        processorBrand: filters.processorBrand,
      });
      appliedFilters.push('processorBrand');
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
      console.log(
        'Applied processorModel filter with values:',
        filters.processorModel,
      );
      appliedFilters.push('processorModel');
    }

    if (
      filters.ramType &&
      Array.isArray(filters.ramType) &&
      filters.ramType.length > 0
    ) {
      query.andWhere('laptop.ramType IN (:...ramType)', {
        ramType: filters.ramType,
      });
      appliedFilters.push('ramType');
    }

    if (filters.ram && Array.isArray(filters.ram) && filters.ram.length > 0) {
      const conditions = filters.ram
        .map((_, index) => `laptop.ram = :ram${index}`)
        .join(' OR ');

      const params = {};
      filters.ram.forEach((value, index) => {
        params[`ram${index}`] = value;
      });

      query.andWhere(`(${conditions})`, params);
      appliedFilters.push('ram');
    }

    if (
      filters.storageType &&
      Array.isArray(filters.storageType) &&
      filters.storageType.length > 0
    ) {
      query.andWhere('laptop.storageType IN (:...storageType)', {
        storageType: filters.storageType,
      });
      appliedFilters.push('storageType');
    }

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
      appliedFilters.push('storageCapacity');
    }

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
      appliedFilters.push('screenSize');
    }

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
      appliedFilters.push('screenResolution');
    }

    if (
      filters.year &&
      Array.isArray(filters.year) &&
      filters.year.length > 0
    ) {
      query.andWhere('laptop.year IN (:...year)', {
        year: filters.year,
      });
      appliedFilters.push('year');
    }

    if (
      filters.stockStatus &&
      Array.isArray(filters.stockStatus) &&
      filters.stockStatus.length > 0
    ) {
      query.andWhere('laptop.stockStatus IN (:...stockStatus)', {
        stockStatus: filters.stockStatus,
      });
      appliedFilters.push('stockStatus');
    }

    console.log('Applied filters to query:', appliedFilters.join(', '));
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
