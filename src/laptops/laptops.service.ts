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
    console.log('Creating laptop with user:', user);
    const laptop = this.repo.create(laptopDto);
    laptop.user = user;
    const savedLaptop = await this.repo.save(laptop);
    console.log('Saved laptop:', savedLaptop);
    return savedLaptop;
  }

  findByTerm(term: string) {
    return this.repo
      .createQueryBuilder('laptop')
      .where('LOWER(laptop.title) LIKE LOWER(:term)', { term: `%${term}%` })
      .getMany();
  }

  async getFilterOptions(filters?: SearchLaptopDto): Promise<FilterOptions> {
    // Get all possible options first
    const allOptions = await this.getAllFilterOptions();

    // If no filters, return everything enabled
    if (!filters || this.areFiltersEmpty(filters)) {
      return this.createEnabledFilterOptions(allOptions);
    }

    // Define the mapping between result field names and filter property names
    const fieldMapping = {
      brands: 'brand',
      processorModels: 'processorModel',
      gpuModels: 'gpuModel',
      ramTypes: 'ramType',
      ram: 'ram',
      storageTypes: 'storageType',
      storageCapacity: 'storageCapacity',
      stockStatuses: 'stockStatus',
      screenSizes: 'screenSize',
      screenResolutions: 'screenResolution',
      processorBrands: 'processorBrand',
      gpuBrands: 'gpuBrand',
      graphicsTypes: 'graphicsType',
      backlightTypes: 'backlightType',
      refreshRates: 'refreshRate',
      vram: 'vram',
      years: 'year',
      models: 'model',
    };

    // Start with creating enabled options for all filters
    const result = this.createEnabledFilterOptions(allOptions);

    // For each filter field, check compatibility for ALL unselected values
    for (const [resultField, filterField] of Object.entries(fieldMapping)) {
      const selectedValues = filters[filterField] || [];

      // Check each option in this field
      for (const option of result[resultField]) {
        // If this value is already selected, keep it enabled
        if (selectedValues.includes(option.value)) {
          option.disabled = false;
          continue;
        }

        // Create a test query with current filters plus this value
        const testQuery = this.repo.createQueryBuilder('laptop');
        const testFilters = { ...filters };

        // THIS IS THE KEY CHANGE: If this field already has selections,
        // we want to test this value AS AN ALTERNATIVE, not as an addition
        if (selectedValues.length > 0) {
          // Replace existing selection with this option to test if it's a valid alternative
          testFilters[filterField] = [option.value]; // Test as alternative
        } else {
          // Add this as a new filter if field has no selections yet
          testFilters[filterField] = [option.value];
        }

        // Apply all filters
        this.applyFilters(testQuery, testFilters);

        // Check if there would be any results with this combination
        const count = await testQuery.getCount();

        // If no results, this option is incompatible - disable it
        if (count === 0) {
          option.disabled = true;
        }
      }
    }

    return result;
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
      throw new NotFoundException('Laptop not found');
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

  private createEnabledFilterOptions(allOptions: any): FilterOptions {
    return {
      brands:
        allOptions.brands?.map((value) => ({ value, disabled: false })) || [],
      processorModels:
        allOptions.processorModels?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      gpuModels:
        allOptions.gpuModels?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      ramTypes:
        allOptions.ramTypes?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      ram:
        allOptions.ram?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      storageTypes:
        allOptions.storageTypes?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      storageCapacity:
        allOptions.storageCapacity?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      stockStatuses:
        allOptions.stockStatuses?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      screenSizes:
        allOptions.screenSizes?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      screenResolutions:
        allOptions.screenResolutions?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      processorBrands:
        allOptions.processorBrands?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      gpuBrands:
        allOptions.gpuBrands?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      graphicsTypes:
        allOptions.graphicsTypes?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      backlightTypes:
        allOptions.backlightTypes?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      refreshRates:
        allOptions.refreshRates?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      vram:
        allOptions.vram?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      years:
        allOptions.years?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      models:
        allOptions.models?.map((value) => ({
          value,
          disabled: false,
        })) || [],
      priceRange: allOptions.priceRange || { min: 0, max: 0 },
    };
  }

  private async getAvailableOptionsForFilters(
    filters: SearchLaptopDto,
  ): Promise<any> {
    // For each filter field, get available values while applying all other filters
    const getAvailableValuesForField = async (field: string) => {
      const query = this.repo.createQueryBuilder('laptop');

      // Apply all filters EXCEPT the current field's filter
      const filteredFilters = { ...filters };
      delete filteredFilters[field];
      this.applyFilters(query, filteredFilters);

      return query
        .select(`DISTINCT laptop.${field}`, 'value')
        .where(`laptop.${field} IS NOT NULL`)
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));
    };

    // Execute all queries in parallel
    const [
      brands,
      processorModels,
      gpuModels,
      ramTypes,
      ram,
      storageTypes,
      storageCapacity,
      stockStatuses,
      screenSizes,
      screenResolutions,
      processorBrands,
      gpuBrands,
      graphicsTypes,
      backlightTypes,
      refreshRates,
      vram,
      years,
      models,
    ] = await Promise.all([
      getAvailableValuesForField('brand'),
      getAvailableValuesForField('processorModel'),
      getAvailableValuesForField('gpuModel'),
      getAvailableValuesForField('ramType'),
      getAvailableValuesForField('ram'),
      getAvailableValuesForField('storageType'),
      getAvailableValuesForField('storageCapacity'),
      getAvailableValuesForField('stockStatus'),
      getAvailableValuesForField('screenSize'),
      getAvailableValuesForField('screenResolution'),
      getAvailableValuesForField('processorBrand'),
      getAvailableValuesForField('gpuBrand'),
      getAvailableValuesForField('graphicsType'),
      getAvailableValuesForField('backlightType'),
      getAvailableValuesForField('refreshRate'),
      getAvailableValuesForField('vram'),
      getAvailableValuesForField('year'),
      getAvailableValuesForField('model'),
    ]);

    // Get price range with all filters applied
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

    return {
      brands,
      processorModels,
      gpuModels,
      ramTypes,
      ram,
      storageTypes,
      storageCapacity,
      stockStatuses,
      screenSizes,
      screenResolutions,
      processorBrands,
      gpuBrands,
      graphicsTypes,
      backlightTypes,
      refreshRates,
      vram,
      years,
      models,
      priceRange: {
        min: minPrice?.min || 0,
        max: maxPrice?.max || 0,
      },
    };
  }

  private areFiltersEmpty(filters: SearchLaptopDto): boolean {
    if (filters.term) return false;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      return false;

    const arrayFilters = [
      'brand',
      'gpuModel',
      'processorModel',
      'ramType',
      'ram',
      'storageType',
      'storageCapacity',
      'screenSize',
      'screenResolution',
      'stockStatus',
      'processorBrand',
      'gpuBrand',
      'graphicsType',
      'backlightType',
      'refreshRate',
      'vram',
      'year',
      'model',
      'shortDesc',
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
    // Create a helper method for getting distinct column values
    const getDistinctValues = async (column: string) => {
      return this.repo
        .createQueryBuilder('laptop')
        .select(`DISTINCT laptop.${column}`, 'value')
        .where(`laptop.${column} IS NOT NULL`)
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));
    };

    // Execute all queries in parallel
    const [
      brands,
      processorModels,
      gpuModels,
      ramTypes,
      ram,
      storageTypes,
      storageCapacity,
      stockStatuses,
      screenSizes,
      screenResolutions,
      processorBrands,
      gpuBrands,
      graphicsTypes,
      backlightTypes,
      refreshRates,
      vram,
      years,
      models,
    ] = await Promise.all([
      getDistinctValues('brand'),
      getDistinctValues('processorModel'),
      getDistinctValues('gpuModel'),
      getDistinctValues('ramType'),
      getDistinctValues('ram'),
      getDistinctValues('storageType'),
      getDistinctValues('storageCapacity'),
      getDistinctValues('stockStatus'),
      getDistinctValues('screenSize'),
      getDistinctValues('screenResolution'),
      getDistinctValues('processorBrand'),
      getDistinctValues('gpuBrand'),
      getDistinctValues('graphicsType'),
      getDistinctValues('backlightType'),
      getDistinctValues('refreshRate'),
      getDistinctValues('vram'),
      getDistinctValues('year'),
      getDistinctValues('model'),
    ]);

    // Get price range
    const minPrice = await this.repo
      .createQueryBuilder('laptop')
      .select('MIN(laptop.price)', 'min')
      .getRawOne();

    const maxPrice = await this.repo
      .createQueryBuilder('laptop')
      .select('MAX(laptop.price)', 'max')
      .getRawOne();

    return {
      brands,
      processorModels,
      gpuModels,
      ramTypes,
      ram,
      storageTypes,
      storageCapacity,
      stockStatuses,
      screenSizes,
      screenResolutions,
      processorBrands,
      gpuBrands,
      graphicsTypes,
      backlightTypes,
      refreshRates,
      vram,
      years,
      models,
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

    // Apply all array-based filters using the same pattern
    const applyArrayFilter = (field: string, values: (string | number)[]) => {
      if (values && Array.isArray(values) && values.length > 0) {
        query.andWhere(`laptop.${field} IN (:...${field}Values)`, {
          [`${field}Values`]: values,
        });
      }
    };

    // Apply all filters
    applyArrayFilter('brand', filters.brand);
    applyArrayFilter('processorModel', filters.processorModel);
    applyArrayFilter('ramType', filters.ramType);
    applyArrayFilter('ram', filters.ram);
    applyArrayFilter('graphicsType', filters.graphicsType);
    applyArrayFilter('gpuModel', filters.gpuModel);
    applyArrayFilter('vram', filters.vram);
    applyArrayFilter('gpuBrand', filters.gpuBrand);
    applyArrayFilter('backlightType', filters.backlightType);
    applyArrayFilter('processorBrand', filters.processorBrand);
    applyArrayFilter('storageType', filters.storageType);
    applyArrayFilter('storageCapacity', filters.storageCapacity);
    applyArrayFilter('stockStatus', filters.stockStatus);
    applyArrayFilter('screenSize', filters.screenSize);
    applyArrayFilter('screenResolution', filters.screenResolution);
    applyArrayFilter('refreshRate', filters.refreshRate);
    applyArrayFilter('year', filters.year);
    applyArrayFilter('model', filters.model);

    // Apply price range filters
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
  }

  async getUserLaptops(userId: number) {
    // Using repository's find method instead of query builder
    return this.repo.find({
      where: { user: { id: userId } },
    });
  }
}
