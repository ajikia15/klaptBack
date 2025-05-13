import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Laptop } from 'src/laptops/laptop.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // TODO isVerified.
  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ default: false })
  admin: boolean;

  @Column()
  password: string;

  @Column({ nullable: true })
  googleId?: string;

  @OneToMany(() => Laptop, (laptop) => laptop.user)
  laptops: Laptop[];
}
