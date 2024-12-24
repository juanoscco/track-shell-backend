import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Record } from './Records';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // El nombre de la categoría

  @OneToMany(() => Record, (record) => record.category)
  records: Record[]; // Relación de una categoría con muchas registros
}