import { IsOptional } from 'class-validator';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Laptop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' })
  status: 'approved' | 'pending' | 'rejected' | 'archived';

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.laptops)
  user: User;

  @Column()
  price: number;

  @Column()
  shortDesc: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  graphicsType: 'Integrated' | 'Dedicated';

  @Column()
  @IsOptional()
  gpuBrand: string;

  @Column()
  @IsOptional()
  gpuModel: string;

  @Column()
  @IsOptional()
  vram: number;

  @Column()
  backlightType: string;

  @Column()
  processorBrand: 'Intel' | 'AMD' | 'Apple';

  @Column()
  processorModel: string;

  @Column()
  cores: number;

  @Column()
  threads: number;

  @Column()
  ram: number;

  @Column()
  ramType: 'DDR3' | 'DDR4' | 'DDR5';

  @Column()
  storageType: 'HDD' | 'SSD' | 'HDD + SSD';

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

  @Column()
  condition: 'new' | 'like-new' | 'used' | 'damaged';

  @Column({ type: 'simple-array' })
  tag?: string[];

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ default: 'in stock' })
  stockStatus: 'reserved' | 'sold' | 'in stock';
}
