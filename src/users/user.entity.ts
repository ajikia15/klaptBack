import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  ManyToMany,
} from 'typeorm';
import { Laptop } from 'src/laptops/laptop.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ default: false })
  admin: boolean;

  @Column()
  password: string;

  @OneToMany(() => Laptop, (laptop) => laptop.user)
  laptops: Laptop[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id', this.id);
  }
}
