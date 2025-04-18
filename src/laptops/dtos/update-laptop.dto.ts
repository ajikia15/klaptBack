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
  shortDesc?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsEnum(['Integrated', 'Dedicated'])
  graphicsType?: 'Integrated' | 'Dedicated';

  @IsOptional()
  @IsString()
  gpuBrand?: string;

  @IsOptional()
  @IsString()
  gpuModel?: string;

  @IsOptional()
  @IsNumber()
  vram?: number;

  @IsOptional()
  @IsString()
  backlightType?: string;

  @IsOptional()
  @IsEnum(['Intel', 'AMD', 'Apple'])
  processorBrand?: 'Intel' | 'AMD' | 'Apple';

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
  @IsNumber()
  ram?: number;

  @IsOptional()
  @IsEnum(['DDR3', 'DDR4', 'DDR5'])
  ramType?: 'DDR3' | 'DDR4' | 'DDR5';

  @IsOptional()
  @IsEnum(['HDD', 'SSD', 'HDD + SSD'])
  storageType?: 'HDD' | 'SSD' | 'HDD + SSD';

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
  @IsArray()
  @IsString({ each: true })
  tag?: string[];

  @IsOptional()
  @IsEnum(['new', 'like-new', 'used', 'damaged'])
  condition?: 'new' | 'like-new' | 'used' | 'damaged';

  @IsOptional()
  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus?: 'reserved' | 'sold' | 'in stock';

  @IsOptional()
  @IsEnum(['approved', 'pending', 'rejected', 'archived'])
  status?: 'approved' | 'pending' | 'rejected' | 'archived';
}
