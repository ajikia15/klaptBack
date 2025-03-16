import { IsString } from 'class-validator';

export class ApproveLaptopDto {
  @IsString()
  status: 'approved' | 'pending' | 'rejected' | 'archived';
}
