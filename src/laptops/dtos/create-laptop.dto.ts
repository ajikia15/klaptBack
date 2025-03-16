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
  brand: string;

  @IsString()
  model: string;

  @IsString()
  gpuBrand: string;

  @IsString()
  gpuModel: string;

  @IsString()
  vram: string;

  @IsEnum(['none', 'rgb', 'white'])
  backlightType: 'none' | 'rgb' | 'white';

  @IsEnum(['Intel', 'AMD'])
  processorBrand: 'Intel' | 'AMD';

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

  @IsEnum(['HDD', 'SSD', 'Hybrid'])
  storageType: 'HDD' | 'SSD' | 'Hybrid';

  @IsString()
  storageCapacity: string;

  @IsString()
  screenSize: string;

  @IsString()
  screenResolution: string;

  @IsNumber()
  refreshRate: number;

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

  @IsEnum(['reserved', 'sold', 'in stock'])
  stockStatus: 'reserved' | 'sold' | 'in stock' = 'in stock';

  @IsEnum(['approved', 'pending', 'rejected', 'archived'])
  postStatus: 'approved' | 'pending' | 'rejected' | 'archived' = 'pending';
}
