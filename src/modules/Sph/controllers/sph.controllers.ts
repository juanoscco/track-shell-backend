import { SPH } from './../../../models/Sph';
import { Request, Response } from 'express';
import { Like } from 'typeorm';
import AppDataSource from '../../../ormconfig';

import { MoreThan, LessThan } from 'typeorm';

const ensureDefaultSPH = async () => {
  const sphRepository = AppDataSource.getRepository(SPH);

  // Verificar si ya existen valores en la tabla
  const existingSPH = await sphRepository.count();
  if (existingSPH === 0) {
    // Crear los valores predeterminados de -0.25 a -6.00 (paso -0.25)
    const sphValues: SPH[] = [];
    for (let value = -0.25; value >= -6.00; value -= 0.25) {
      const sph = sphRepository.create({ value: parseFloat(value.toFixed(2)) });
      sphValues.push(sph);
    }

    // Crear valores positivos de 0.25 a 6.00 (paso 0.25)
    for (let value = 0.25; value <= 6.00; value += 0.25) {
      const sph = sphRepository.create({ value: parseFloat(value.toFixed(2)) });
      sphValues.push(sph);
    }

    await sphRepository.save(sphValues);
  }
};
export const getSPH = async (req: Request, res: Response) => {
  const sphRepository = AppDataSource.getRepository(SPH);

  try {
    // Asegurar la existencia de valores predeterminados antes de obtener todos los registros
    await ensureDefaultSPH();

    // Obtener los parámetros de filtro de la solicitud
    const { type } = req.query; // Puede ser 'positive' o 'negative'

    // Crear la condición de filtro según el tipo
    let where = {};
    let order: { [key in keyof SPH]?: "ASC" | "DESC" } = { value: "ASC" }; // Orden por defecto para valores positivos

    if (type === "positive") {
      where = { value: MoreThan(0) }; // Filtrar valores positivos
    } else if (type === "negative") {
      where = { value: LessThan(0) }; // Filtrar valores negativos
      order = { id: "ASC" }; // Ordenar por id para valores negativos
    }

    // Obtener los registros con el filtro adecuado
    const sphs = await sphRepository.find({
      where,
      order, // Aplicar el orden específico
    });

    res.status(200).json(sphs); // Devolver solo el arreglo
  } catch (error) {
    res.status(500).json({ message: "Error retrieving SPH values", error });
  }
};