import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string; // Puedes agregar más campos según sea necesario

  @OneToMany(() => User, (user) => user.store)
  users: User[]; // Relación de una tienda con muchos usuarios
}