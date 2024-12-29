import { Request, Response } from 'express';
import { Like } from 'typeorm';
import AppDataSource from '../../../ormconfig';
import { CYL } from '../../../models/Cyl';

// Función para asegurarse de que los valores predeterminados de CYL existan
const ensureDefaultCYL = async () => {
    const cylRepository = AppDataSource.getRepository(CYL);

    // Verificar si ya existen valores en la tabla
    const existingCYL = await cylRepository.find();
    if (existingCYL.length === 0) {
        // Crear los valores predeterminados de 0.25 a 6.00 (paso 0.25)
        const cylValues: CYL[] = [];
        for (let value = 0.25; value <= 6.00; value += 0.25) {
            const cyl = cylRepository.create({ value: parseFloat(value.toFixed(2)) });
            cylValues.push(cyl);
        }

        await cylRepository.save(cylValues);
    }
};

// Obtener todos los valores de CYL
export const getCYL = async (req: Request, res: Response) => {
    const cylRepository = AppDataSource.getRepository(CYL);

    try {
        // Asegurar la existencia de valores predeterminados antes de obtener todos los registros
        await ensureDefaultCYL();

        // Obtener todos los registros sin filtros ni paginación
        const cyls = await cylRepository.find({
            order: { value: 'ASC' }, // Ordenar por valor de menor a mayor
        });

        res.status(200).json(cyls);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving CYL values', error });
    }
};