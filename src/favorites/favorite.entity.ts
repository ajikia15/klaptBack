import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  laptopId: number;
}
