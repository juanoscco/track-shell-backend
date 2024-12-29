import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CYL {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 4, scale: 2 })
  value: number; // Valor CYL
}