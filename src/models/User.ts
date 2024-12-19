import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Store } from './Store';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: 'superadmin' | 'admin' | 'seller';

  @Column({ default: true })
  isActive: boolean; // Representa si el usuario está activo o deshabilitado

  @Column()
  fullName: string; // Nombres y apellidos juntos

  @Column({ unique: true })
  dni: string; // Documento Nacional de Identidad (único)

  @Column()
  phone: string; // Número de celular

  @Column()
  address: string; // Dirección

  @Column({ unique: true })
  email: string; // Correo electrónico

  @ManyToOne(() => Store, (store) => store.users)
  store: Store; // Relación con la tienda
}