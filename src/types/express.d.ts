// src/types/express.d.ts
import { User } from "../models/User"; // Importa el tipo de User (ajusta la ruta a tu proyecto)

declare global {
  namespace Express {
    interface Request {
      user?: User; // Agrega la propiedad 'user' al tipo 'Request'
    }
  }
}