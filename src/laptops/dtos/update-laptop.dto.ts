import { IsOptional, IsString } from 'class-validator';
import { IsNumber } from 'class-validator';

export class updateLaptopDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @IsNumber()
  price: number;
}
