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
  shortDesc?: string;

  @IsOptional()
  @IsString()
  graphicsType?: string;

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
  @IsString()
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
  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus?: 'reserved' | 'sold' | 'in stock' = 'in stock';

  @IsOptional()
  @IsEnum(['approved', 'pending', 'rejected', 'archived'])
  status?: 'approved' | 'pending' | 'rejected' | 'archived' = 'pending';
}
