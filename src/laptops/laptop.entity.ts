import { IsOptional } from 'class-validator';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { DescriptionDto } from './dtos/description.dto';

@Entity()
export class Laptop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' })
  status: 'approved' | 'pending' | 'rejected' | 'archived';

  @Column({ default: false })
  isCertified: boolean;

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
  vram: string;

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
  ram: string;

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
  refreshRate: string;

  @IsOptional()
  @Column()
  weight?: string;

  @Column()
  year: number;

  @Column()
  condition: 'new' | 'like-new' | 'used' | 'damaged';

  @Column({ type: 'simple-array' })
  tag?: string[];

  @Column({ type: 'simple-json', nullable: true })
  description: DescriptionDto;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ default: 'in stock' })
  stockStatus: 'reserved' | 'sold' | 'in stock';
}
