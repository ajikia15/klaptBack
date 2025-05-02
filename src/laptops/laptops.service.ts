import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UpdateLaptopDto } from './dtos/update-laptop.dto';
import { Laptop } from './laptop.entity';
import { CreateLaptopDto } from './dtos/create-laptop.dto';
import { User } from 'src/users/user.entity';
import { SearchLaptopDto } from './dtos/search-laptop.dto';
import { FilterOptions } from './filterOptions';

interface FilterField {
  resultField: string;
  filterField: string;
}

@Injectable()
export class LaptopsService {
  // Map of filter fields - DB fields to DTO properties
  private readonly filterFieldMap: FilterField[] = [
    { resultField: 'brands', filterField: 'brand' },
    { resultField: 'processorModels', filterField: 'processorModel' },
    { resultField: 'gpuModels', filterField: 'gpuModel' },
    { resultField: 'ramTypes', filterField: 'ramType' },
    { resultField: 'ram', filterField: 'ram' },
    { resultField: 'storageTypes', filterField: 'storageType' },
    { resultField: 'storageCapacity', filterField: 'storageCapacity' },
    { resultField: 'stockStatuses', filterField: 'stockStatus' },
    { resultField: 'screenSizes', filterField: 'screenSize' },
    { resultField: 'screenResolutions', filterField: 'screenResolution' },
    { resultField: 'processorBrands', filterField: 'processorBrand' },
    { resultField: 'gpuBrands', filterField: 'gpuBrand' },
    { resultField: 'graphicsTypes', filterField: 'graphicsType' },
    { resultField: 'backlightTypes', filterField: 'backlightType' },
    { resultField: 'refreshRates', filterField: 'refreshRate' },
    { resultField: 'vram', filterField: 'vram' },
    { resultField: 'years', filterField: 'year' },
    { resultField: 'models', filterField: 'model' },
    { resultField: 'tags', filterField: 'tag' },
    { resultField: 'conditions', filterField: 'condition' },
  ];

  constructor(@InjectRepository(Laptop) private repo: Repository<Laptop>) {}

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async create(laptopDto: CreateLaptopDto, user: User) {
    const laptop = this.repo.create(laptopDto);
    laptop.user = user;
    if (!user.admin) laptop.status = 'pending';
    else laptop.status = 'approved';
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

  /**
   * Get filter options, with incompatible options disabled based on current selections
   */
  async getFilterOptions(filters?: SearchLaptopDto): Promise<FilterOptions> {
    // Get all possible options
    const allOptions = await this.getAllFilterOptions();

    // If no filters or empty filters, return all options enabled
    if (!filters || this.areFiltersEmpty(filters)) {
      return this.createEnabledFilterOptions(allOptions);
    }

    // Start with all options enabled
    const result = this.createEnabledFilterOptions(allOptions);

    // For each filter field, check compatibility for all unselected values
    for (const { resultField, filterField } of this.filterFieldMap) {
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

        // If this field already has selections, test this value as an ALTERNATIVE
        // not as an addition to existing selections
        if (selectedValues.length > 0) {
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

  /**
   * Find laptops by applying filters
   */
  async find(filters: SearchLaptopDto, page = 1, limit = 20) {
    const query = this.repo.createQueryBuilder('laptop');
    this.applyFilters(query, filters);
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async remove(id: number, user: User) {
    let laptop: Laptop;
    if (user.admin) {
      laptop = await this.repo.findOne({ where: { id } });
    } else {
      laptop = await this.repo.findOne({ where: { id, user } });
    }
    if (!laptop) {
      throw new NotFoundException('Laptop not found');
    }
    return this.repo.remove(laptop);
  }

  // async removeAll() {
  //   const laptops = await this.findAll();
  //    return this.repo.remove(laptops);
  // }

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

  /**
   * Create filter options with all options enabled
   */
  private createEnabledFilterOptions(allOptions: any): FilterOptions {
    const result: Partial<FilterOptions> = {};

    // Create enabled options for each filter field
    for (const { resultField } of this.filterFieldMap) {
      result[resultField] =
        allOptions[resultField]?.map((value) => ({
          value,
          disabled: false,
        })) || [];
    }

    // Add price range
    result.priceRange = allOptions.priceRange || { min: 0, max: 0 };

    return result as FilterOptions;
  }

  /**
   * Check if filters are empty (no selections made)
   */
  private areFiltersEmpty(filters: SearchLaptopDto): boolean {
    // Check for search term
    if (filters.term) return false;

    // Check for user filter
    if (filters.userId !== undefined) return false;

    // Check for price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      return false;

    // Check all array filter fields
    for (const { filterField } of this.filterFieldMap) {
      if (
        filters[filterField] &&
        Array.isArray(filters[filterField]) &&
        filters[filterField].length > 0
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all possible filter options from the database
   */
  private async getAllFilterOptions(): Promise<any> {
    // Helper function to get distinct column values
    const getDistinctValues = async (column: string): Promise<string[]> => {
      return this.repo
        .createQueryBuilder('laptop')
        .select(`DISTINCT laptop.${column}`, 'value')
        .where(`laptop.${column} IS NOT NULL`)
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));
    };

    // Get all distinct values for each column
    const results = await Promise.all([
      // Get values for each filter field
      ...this.filterFieldMap
        .filter(({ filterField }) => filterField !== 'tag') // Handle tags separately
        .map(({ filterField }) => getDistinctValues(filterField)),
      // Special handling for tags array field
      this.getTagValues(),
    ]);

    // Get price range
    const [minPrice, maxPrice] = await Promise.all([
      this.repo
        .createQueryBuilder('laptop')
        .select('MIN(laptop.price)', 'min')
        .getRawOne(),
      this.repo
        .createQueryBuilder('laptop')
        .select('MAX(laptop.price)', 'max')
        .getRawOne(),
    ]);

    // Map results to field names
    const options: any = {};
    this.filterFieldMap.forEach(({ resultField, filterField }, index) => {
      if (filterField === 'tag') {
        // Tags will be the last item in the results array
        options[resultField] = results[results.length - 1];
      } else {
        options[resultField] = results[index];
      }
    });

    options.priceRange = {
      min: minPrice?.min || 0,
      max: maxPrice?.max || 0,
    };

    return options;
  }

  /**
   * Apply filters to a query builder
   */
  private applyFilters(
    query: SelectQueryBuilder<Laptop>,
    filters: SearchLaptopDto,
  ): void {
    if (!filters) return;

    // Apply text search
    if (filters.term) {
      query.andWhere('LOWER(laptop.title) LIKE LOWER(:term)', {
        term: `%${filters.term}%`,
      });
    }

    // Apply user filter
    if (filters.userId !== undefined) {
      query.andWhere('laptop.userId = :userId', {
        userId: filters.userId,
      });
    }

    // Apply price range
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

    // Apply all other filters
    for (const { filterField } of this.filterFieldMap) {
      // Special handling for tag field which is an array in the database
      if (filterField === 'tag') {
        this.applyTagFilter(query, filters.tag);
        continue;
      }

      // Apply standard filters
      this.applyArrayFilter(query, filterField, filters[filterField]);
    }
  }

  /**
   * Apply standard array filter
   */
  private applyArrayFilter(
    query: SelectQueryBuilder<Laptop>,
    field: string,
    values: (string | number)[],
  ): void {
    if (values && Array.isArray(values) && values.length > 0) {
      query.andWhere(`laptop.${field} IN (:...${field}Values)`, {
        [`${field}Values`]: values,
      });
    }
  }

  private applyTagFilter(
    query: SelectQueryBuilder<Laptop>,
    values: string[],
  ): void {
    if (values && Array.isArray(values) && values.length > 0) {
      values.forEach((value) => {
        const sanitizedValue = value.replace(/'/g, "''");
        query.andWhere(`laptop.tag LIKE '%${sanitizedValue}%'`);
      });
    }
  }

  /**
   * Get all unique tag values from the database
   */
  private async getTagValues(): Promise<string[]> {
    const query = this.repo.createQueryBuilder('laptop');
    return this.getAvailableTagValues(query);
  }

  /**
   * Extract unique tag values from query results
   */
  private async getAvailableTagValues(query): Promise<string[]> {
    // Get all laptops with their tags that match filters
    const laptopsWithTags = await query
      .select('laptop.tag')
      .where('laptop.tag IS NOT NULL')
      .getRawMany();

    const allTags = new Set<string>();

    laptopsWithTags.forEach((laptop) => {
      let tagArray: string[] = null;

      if (laptop.laptop_tag) {
        tagArray = this.parseTagArray(laptop.laptop_tag);
      } else if (laptop.tag) {
        tagArray = this.parseTagArray(laptop.tag);
      }

      if (tagArray) {
        tagArray.forEach((tag) => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      }
    });

    return Array.from(allTags).sort();
  }

  private parseTagArray(tagData: any): string[] {
    if (Array.isArray(tagData)) {
      return tagData;
    } else if (typeof tagData === 'string') {
      return tagData.replace(/[{}]/g, '').split(',').filter(Boolean);
    }
    return null;
  }

  async getUserLaptops(userId: number, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }
}
