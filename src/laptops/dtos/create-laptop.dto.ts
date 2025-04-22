import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateLaptopDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsString()
  shortDesc: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsEnum(['Integrated', 'Dedicated'])
  graphicsType: 'Integrated' | 'Dedicated';

  @IsString()
  @IsOptional()
  gpuBrand: string;

  @IsString()
  @IsOptional()
  gpuModel: string;

  @IsString()
  @IsOptional()
  vram: string;

  @IsString()
  backlightType: string;

  @IsEnum(['Intel', 'AMD', 'Apple'])
  processorBrand: 'Intel' | 'AMD' | 'Apple';

  @IsString()
  processorModel: string;

  @IsNumber()
  cores: number;

  @IsNumber()
  threads: number;

  @IsString()
  ram: string;

  @IsEnum(['DDR3', 'DDR4', 'DDR5'])
  ramType: 'DDR3' | 'DDR4' | 'DDR5';

  @IsEnum(['HDD', 'SSD', 'HDD + SSD'])
  storageType: 'HDD' | 'SSD' | 'HDD + SSD';

  @IsString()
  storageCapacity: string;

  @IsString()
  screenSize: string;

  @IsString()
  screenResolution: string;

  @IsString()
  refreshRate: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tag?: string[];

  @IsEnum(['new', 'like-new', 'used', 'damaged'])
  condition: 'new' | 'like-new' | 'used' | 'damaged';

  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus: 'reserved' | 'sold' | 'in stock' = 'in stock';

  @IsEnum(['approved', 'pending', 'rejected', 'archived'])
  status: 'approved' | 'pending' | 'rejected' | 'archived' = 'pending';
}
