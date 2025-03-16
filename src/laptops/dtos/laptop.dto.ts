import { Expose, Transform } from 'class-transformer';

export class LaptopDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  gpuBrand: string;

  @Expose()
  gpuModel: string;

  @Expose()
  vram: string;

  @Expose()
  backlightType: 'none' | 'rgb' | 'white';

  @Expose()
  processorBrand: 'Intel' | 'AMD';

  @Expose()
  processorModel: string;

  @Expose()
  cores: number;

  @Expose()
  threads: number;

  @Expose()
  ram: string;

  @Expose()
  ramType: 'DDR3' | 'DDR4' | 'DDR5';

  @Expose()
  storageType: 'HDD' | 'SSD' | 'Hybrid';

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
  stockStatus: 'reserved' | 'sold' | 'in stock';

  @Expose()
  status: 'approved' | 'pending' | 'rejected' | 'archived';

  @Transform(({ obj }) => obj.id)
  @Expose()
  userId: number;
}
