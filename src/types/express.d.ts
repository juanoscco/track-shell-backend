// src/types/express.d.ts
import type { User } from "../models/User"; // Asegúrate que la ruta sea correcta

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};