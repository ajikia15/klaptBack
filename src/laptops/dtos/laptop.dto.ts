import { Expose, Transform } from 'class-transformer';

export class LaptopDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  shortDesc: string;

  @Expose()
  price: number;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  graphicsType: 'Integrated' | 'Dedicated';

  @Expose()
  gpuBrand: string;

  @Expose()
  gpuModel: string;

  @Expose()
  vram: number;

  @Expose()
  backlightType: string;

  @Expose()
  processorBrand: 'Intel' | 'AMD';

  @Expose()
  processorModel: string;

  @Expose()
  cores: number;

  @Expose()
  threads: number;

  @Expose()
  ram: number;

  @Expose()
  ramType: 'DDR3' | 'DDR4' | 'DDR5';

  @Expose()
  storageType: 'HDD' | 'SSD' | 'HDD + SSD';

  @Expose()
  storageCapacity: string;

  @Expose()
  screenSize: string;

  @Expose()
  screenResolution: string;

  @Expose()
  refreshRate: number;

  @Expose()
  weight?: string;

  @Expose()
  year: number;

  @Expose()
  description: string;

  @Expose()
  images: string[];

  @Expose()
  tag?: string[];

  @Expose()
  condition: 'new' | 'like-new' | 'used' | 'damaged';

  @Expose()
  stockStatus: 'reserved' | 'sold' | 'in stock';

  @Expose()
  status: 'approved' | 'pending' | 'rejected' | 'archived';

  @Transform(({ obj }) => obj.user?.id)
  @Expose()
  userId: number;
}
