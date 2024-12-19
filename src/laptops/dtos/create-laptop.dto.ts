import { IsString } from 'class-validator';
import { IsNumber } from 'class-validator';
export class createLaptopDto {
  @IsString()
  title: string;
  @IsNumber()
  price: number;
}
