import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Client } from './Clients';
import { Bag } from './Bag';
import { Category } from './Categories';

@Entity()
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, (category) => category.records, { nullable: false })
  category: Category; // Relación con la categoría

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column('timestamp')
  date: Date;

  @ManyToOne(() => Client, (client) => client.records)
  client: Client;

  @OneToMany(() => Bag, (bag) => bag.record, {
    cascade: true, // Esto permite crear automáticamente las bolsas al guardar el registro
  })
  bags: Bag[]; // Relación con `Bag`

  @Column({
    type: 'enum',
    enum: ['income', 'output', 'sale'],
    default: 'sale',
  })
  type: 'income' | 'output' | 'sale';

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  totalPrice?: number;

  @Column('boolean', { default: true })
  isActive: boolean; // Indica si el registro está activo
}