import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Record } from './Records';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string; // Full name of the client

  @Column()
  address: string; //Address of the client

  @OneToMany(() => Record, (record) => record.client)
  records: Record[]; // Relation with the Record table
}