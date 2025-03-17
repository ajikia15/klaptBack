import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class SearchLaptopDto {
  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Max(10000)
  @Transform(({ value }) => parseInt(value, 10))
  maxPrice?: number;

  @IsOptional()
  @IsString()
  gpuBrand?: string;

  @IsOptional()
  @IsString()
  gpuModel?: string;

  @IsOptional()
  @IsEnum(['Intel', 'AMD'])
  processorBrand?: 'Intel' | 'AMD';

  @IsOptional()
  @IsEnum(['DDR3', 'DDR4', 'DDR5'])
  ramType?: 'DDR3' | 'DDR4' | 'DDR5';

  @IsOptional()
  @IsEnum(['HDD', 'SSD', 'Hybrid'])
  storageType?: 'HDD' | 'SSD' | 'Hybrid';

  @IsOptional()
  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus?: 'reserved' | 'sold' | 'in stock';

  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2030)
  year?: number;
}
