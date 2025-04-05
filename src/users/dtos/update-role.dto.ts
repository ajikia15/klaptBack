import { IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @IsBoolean()
  admin: boolean;
}
