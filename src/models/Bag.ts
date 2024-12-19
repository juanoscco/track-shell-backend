import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Record } from './Records';
import { Category } from './Categories';

@Entity()
export class Bag {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, (record) => record.bags, { nullable: false })
  record: Record; // Relación con el movimiento

  @ManyToOne(() => Category, { nullable: false })
  category: Category; // Relación con la categoría

  @Column('int')
  quantity: number; // Cantidad del producto en la bolsa

  @Column('decimal', { precision: 4, scale: 2 })
  sph: number; // Campo SPH, ejemplo: 1.25

  @Column('decimal', { precision: 4, scale: 2 })
  cyl: number; // Campo CYL, ejemplo: 1.25
}