import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  IsArray,
  IsBoolean, // Import IsBoolean
} from 'class-validator';
import {
  TransformToArray,
  TransformToNumberArray,
} from '../decorators/transformTo.decorator';

export class SearchLaptopDto {
  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  userId?: number;

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  brand?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  shortDesc?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  model?: string[];

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
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  gpuBrand?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  gpuModel?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['Intel', 'AMD'], { each: true })
  processorBrand?: ('Intel' | 'AMD' | 'Apple')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['Dedicated', 'Integrated'], { each: true })
  graphicsType?: ('Dedicated' | 'Integrated')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  backlightType?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  refreshRate?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  processorModel?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['DDR3', 'DDR4', 'DDR5'], { each: true })
  ramType?: ('DDR3' | 'DDR4' | 'DDR5')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  ram?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  vram?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['HDD', 'SSD', 'HDD + SSD'], { each: true })
  storageType?: ('HDD' | 'SSD' | 'HDD + SSD')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['reserved', 'sold', 'in stock'], { each: true })
  stockStatus?: ('reserved' | 'sold' | 'in stock')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(['new', 'like-new', 'used', 'damaged'], { each: true })
  condition?: ('new' | 'like-new' | 'used' | 'damaged')[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  tag?: string[];

  @IsOptional()
  @TransformToNumberArray()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(2000, { each: true })
  @Max(2030, { each: true })
  year?: number[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  storageCapacity?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  screenSize?: string[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  screenResolution?: string[];

  @IsOptional()
  @TransformToArray() // Assumes this converts query param "true,false" to ["true", "false"]
  @Transform(({ value: stringArray }) => {
    if (!Array.isArray(stringArray)) return stringArray; // Let validator catch if not array
    return stringArray.map((str) => {
      if (str === 'true') return true;
      if (str === 'false') return false;
      return str; // Pass through other strings for IsBoolean to invalidate
    });
  })
  @IsArray()
  @IsBoolean({
    each: true,
    message: 'isCertified must be an array of booleans (true or false values)',
  })
  isCertified?: boolean[];
}
