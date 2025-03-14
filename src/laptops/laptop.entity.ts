import { IsOptional } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Laptop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  gpuBrand: string;

  @Column()
  gpuModel: string;

  @Column()
  vram: string;

  @Column()
  backlightType: 'none' | 'rgb' | 'white';

  @Column()
  processorBrand: 'Intel' | 'AMD';

  @Column()
  processorModel: string;

  @Column()
  cores: number;

  @Column()
  threads: number;

  @Column()
  ram: string;

  @Column()
  ramType: 'DDR3' | 'DDR4' | 'DDR5';

  @Column()
  storageType: 'HDD' | 'SSD' | 'Hybrid';

  @Column()
  storageCapacity: string;

  @Column()
  screenSize: string;

  @Column()
  screenResolution: string;

  @Column()
  refreshRate: number;

  @IsOptional()
  @Column()
  weight?: string;

  @Column()
  year: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column()
  stockStatus: 'reserved' | 'sold' | 'in stock';

  @Column()
  postStatus: 'approved ' | 'pending' | 'rejected' | 'archived';
}
