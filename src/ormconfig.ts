import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './models/User';
import { Store } from './models/Store';
import { Category } from './models/Categories';
import { Client } from './models/Clients';
import { Record } from './models/Records';
import { Bag } from './models/Bag';
import { SPH } from './models/Sph';
import { CYL } from './models/Cyl';

// Cargar variables de entorno
config();

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres', // TypeORM espera un tipo literal
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, Store, Category, Client, Record, Bag, SPH, CYL],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;