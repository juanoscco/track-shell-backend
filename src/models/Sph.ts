import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SPH {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 4, scale: 2 })
  value: number; // Valor SPH
}