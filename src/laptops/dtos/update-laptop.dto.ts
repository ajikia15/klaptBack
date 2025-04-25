import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class UpdateLaptopDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  price?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shortDesc?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  model?: string;

  @IsOptional()
  @IsEnum(['Integrated', 'Dedicated'])
  @IsNotEmpty()
  graphicsType?: 'Integrated' | 'Dedicated';

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
  @IsString()
  @IsNotEmpty()
  backlightType?: string;

  @IsOptional()
  @IsEnum(['Intel', 'AMD', 'Apple'])
  @IsNotEmpty()
  processorBrand?: 'Intel' | 'AMD' | 'Apple';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processorModel?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  cores?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  threads?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ram?: string;

  @IsOptional()
  @IsEnum(['DDR3', 'DDR4', 'DDR5'])
  @IsNotEmpty()
  ramType?: 'DDR3' | 'DDR4' | 'DDR5';

  @IsOptional()
  @IsEnum(['HDD', 'SSD', 'HDD + SSD'])
  @IsNotEmpty()
  storageType?: 'HDD' | 'SSD' | 'HDD + SSD';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  storageCapacity?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  screenSize?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  screenResolution?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshRate?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  year?: number;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag?: string[];

  @IsOptional()
  @IsEnum(['new', 'like-new', 'used', 'damaged'])
  @IsNotEmpty()
  condition?: 'new' | 'like-new' | 'used' | 'damaged';

  @IsOptional()
  @IsEnum(['reserved', 'sold', 'in stock'])
  @IsNotEmpty()
  stockStatus?: 'reserved' | 'sold' | 'in stock';

  @IsOptional()
  @IsEnum(['approved', 'pending', 'rejected', 'archived'])
  @IsNotEmpty()
  status?: 'approved' | 'pending' | 'rejected' | 'archived';
}
