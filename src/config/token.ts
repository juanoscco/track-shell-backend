import { config } from 'dotenv';

config();

export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'; // Agrega un valor por defecto si es necesario