// everything we want to be public-ish
import { Expose } from 'class-transformer';
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  admin: boolean;

  @Expose()
  username: string;
}
