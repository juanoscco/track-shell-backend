import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bag } from './Bag';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // El nombre de la categoría

  @OneToMany(() => Bag, (bag) => bag.category)
  bags: Bag[]; // Relación de una categoría con muchas bolsas
}