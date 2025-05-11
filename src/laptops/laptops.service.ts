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
  isBoolean?: boolean; // Add optional flag for boolean fields
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
    {
      resultField: 'isCertifiedValues',
      filterField: 'isCertified',
      isBoolean: true,
    }, // Added for isCertified
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
    const getDistinctValues = async (
      column: string,
      isBoolean = false,
    ): Promise<any[]> => {
      if (isBoolean) {
        // For boolean fields, the distinct values are true and false
        // We can check if there are any records with true and any with false
        const trueCount = await this.repo.count({ where: { [column]: true } });
        const falseCount = await this.repo.count({
          where: { [column]: false },
        });
        const values = [];
        if (trueCount > 0) values.push(true);
        if (falseCount > 0) values.push(false);
        return values;
      }
      return this.repo
        .createQueryBuilder('laptop')
        .select(`DISTINCT laptop.${column}`, 'value')
        .where(`laptop.${column} IS NOT NULL`)
        .orderBy('value', 'ASC')
        .getRawMany()
        .then((results) => results.map((item) => item.value));
    };

    const nonTagFieldsInMap = this.filterFieldMap.filter(
      (f) => f.filterField !== 'tag',
    );

    // Get all distinct values for each column
    const results = await Promise.all([
      // Get values for each non-tag filter field
      ...nonTagFieldsInMap.map(({ filterField, isBoolean }) =>
        getDistinctValues(filterField, isBoolean),
      ),
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

    // Iterate over the original filterFieldMap to ensure all fields are considered for the options object
    this.filterFieldMap.forEach(({ resultField, filterField }) => {
      if (filterField === 'tag') {
        // 'tag' results are the last element in the 'results' array
        // (because getTagValues() is the last promise in the Promise.all call above)
        options[resultField] = results[results.length - 1];
      } else {
        // For non-tag fields, find their index based on the 'nonTagFieldsInMap'
        // which directly corresponds to their position in the first part of the 'results' array.
        const indexInNonTagResults = nonTagFieldsInMap.findIndex(
          (f) => f.filterField === filterField,
        );
        if (indexInNonTagResults !== -1) {
          // Should always be found if it's not 'tag'
          options[resultField] = results[indexInNonTagResults];
        }
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
    for (const { filterField, isBoolean } of this.filterFieldMap) {
      // Special handling for tag field which is an array in the database
      if (filterField === 'tag') {
        this.applyTagFilter(query, filters.tag);
        continue;
      }

      // Apply standard filters (now includes boolean)
      this.applyArrayFilter(
        query,
        filterField,
        filters[filterField],
        isBoolean,
      );
    }
  }

  /**
   * Apply standard array filter (now handles boolean)
   */
  private applyArrayFilter(
    query: SelectQueryBuilder<Laptop>,
    field: string,
    values: (string | number | boolean)[], // Updated to include boolean
    isBoolean = false,
  ): void {
    if (values && Array.isArray(values) && values.length > 0) {
      // For boolean fields, ensure values are actual booleans if they came as strings like "true"
      // The DTO transformation should handle this, but as a safeguard:
      const processedValues = isBoolean
        ? values
            .map((v) => {
              if (typeof v === 'string') {
                if (v.toLowerCase() === 'true') return true;
                if (v.toLowerCase() === 'false') return false;
              }
              return v;
            })
            .filter((v) => typeof v === 'boolean')
        : values;

      if (processedValues.length > 0) {
        query.andWhere(`laptop.${field} IN (:...${field}Values)`, {
          [`${field}Values`]: processedValues,
        });
      }
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

  // migration example if needed in future
  // async migrateOldDescriptionsToEn(): Promise<{
  //   migrated: number;
  //   updated: number;
  //   failed: number;
  //   total: number;
  // }> {
  //   // Fetch raw data to avoid TypeORM trying to parse string as JSON prematurely
  //   const rawLaptops = await this.repo.query(
  //     'SELECT id, description FROM laptop',
  //   );
  //   let migratedCount = 0;
  //   let updatedCount = 0;
  //   let failedCount = 0;

  //   for (const rawLaptop of rawLaptops) {
  //     try {
  //       const laptopId = rawLaptop.id;
  //       const currentDescription = rawLaptop.description;

  //       // Check if the description is a string (old format)
  //       if (currentDescription && typeof currentDescription === 'string') {
  //         // Ensure it's not already a JSON string that happens to be a simple string
  //         // This is a basic check; more sophisticated checks might be needed if strings could look like JSON
  //         try {
  //           JSON.parse(currentDescription);
  //           // If it parses, it might be an old JSON string or a new one already migrated.
  //           // For simplicity, we assume if it's a string and parses, it might be an error or already handled.
  //           // Let's be cautious and only migrate if it does NOT parse as JSON, meaning it's a plain string.
  //         } catch (e) {
  //           // It's a plain string, not a JSON string, so migrate it.
  //           const newDescription = {
  //             en: currentDescription,
  //             ka: undefined,
  //             ru: undefined,
  //           };
  //           await this.repo.update(laptopId, {
  //             description: newDescription as any,
  //           });
  //           migratedCount++;
  //           updatedCount++;
  //           continue; // Move to the next laptop
  //         }
  //       }

  //       // If currentDescription is already an object (new format or other JSON), we don't migrate it here.
  //       // If currentDescription is null/undefined, we also don't touch it in this specific migration.
  //       // If it was a string that successfully parsed as JSON, we also skip it based on the logic above.
  //     } catch (error) {
  //       console.error(
  //         `Failed to migrate laptop with ID ${rawLaptop.id}:`,
  //         error,
  //       );
  //       failedCount++;
  //     }
  //   }
  //   return {
  //     migrated: migratedCount,
  //     updated: updatedCount,
  //     failed: failedCount,
  //     total: rawLaptops.length,
  //   };
  // }
}
