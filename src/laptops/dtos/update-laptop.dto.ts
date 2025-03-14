import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';

export class UpdateLaptopDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  gpuBrand?: string;

  @IsOptional()
  @IsString()
  gpuModel?: string;

  @IsOptional()
  @IsString()
  vram?: string;

  @IsOptional()
  @IsEnum(['none', 'rgb', 'white'])
  backlightType?: 'none' | 'rgb' | 'white';

  @IsOptional()
  @IsEnum(['Intel', 'AMD'])
  processorBrand?: 'Intel' | 'AMD';

  @IsOptional()
  @IsString()
  processorModel?: string;

  @IsOptional()
  @IsNumber()
  cores?: number;

  @IsOptional()
  @IsNumber()
  threads?: number;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsEnum(['DDR3', 'DDR4', 'DDR5'])
  ramType?: 'DDR3' | 'DDR4' | 'DDR5';

  @IsOptional()
  @IsEnum(['HDD', 'SSD', 'Hybrid'])
  storageType?: 'HDD' | 'SSD' | 'Hybrid';

  @IsOptional()
  @IsString()
  storageCapacity?: string;

  @IsOptional()
  @IsString()
  screenSize?: string;

  @IsOptional()
  @IsString()
  screenResolution?: string;

  @IsOptional()
  @IsNumber()
  refreshRate?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus?: 'reserved' | 'sold' | 'in stock';
}
