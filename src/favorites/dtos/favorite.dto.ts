// everything we want to be public-ish
import { Expose } from 'class-transformer';
export class FavoriteDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  laptopId: number;
}
