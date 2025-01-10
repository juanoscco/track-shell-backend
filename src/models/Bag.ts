import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Record } from './Records';
import { SPH } from './Sph';
import { CYL } from './Cyl';

@Entity()
export class Bag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, (record) => record.bags, { nullable: false })
  record: Record; // Relación con el movimiento

  @Column('int')
  quantity: number; // Cantidad del producto en la bolsa

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice?: number; // Precio por unidad del producto (opcional, formato moneda)

  @ManyToOne(() => SPH, { nullable: false })
  sph: SPH; // Relación con la tabla SPH

  @ManyToOne(() => CYL, { nullable: false })
  cyl: CYL; // Relación con la tabla CYL

  @Column('boolean', { default: true })
  isActive: boolean; // Indica si la bolsa está activa
}