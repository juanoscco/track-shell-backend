import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Client } from "./Clients"
import { Bag } from './Bag';

@Entity()
export class Record {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @Column('timestamp')
    date: Date;

    @ManyToOne(() => Client, (client) => client.records)
    client: Client;

    @OneToMany(() => Bag, (bag) => bag.record, {
        cascade: true, // Esto permite crear automáticamente las bolsas al guardar el registro
    })
    bags: Bag[]; // Aquí está la relación con `Bag`

    @Column({
        type: 'enum',
        enum: ['income', 'output', 'sale'],
        default: 'sale',
    })
    type: 'income' | 'output' | 'sale';

    @Column('int')
    quantity: number;
}