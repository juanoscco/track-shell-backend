import { Request, Response } from 'express';
import AppDataSource from '../../../ormconfig';
import { Bag } from '../../../models/Bag';



export const getAllBags = async (req: Request, res: Response) => {
    try {
        const { date, categoryId } = req.query; // Obtener parámetros de la query (fecha y categoria)

        const bagRepository = AppDataSource.getRepository(Bag);

        // Usar QueryBuilder para incluir las relaciones necesarias
        const queryBuilder = bagRepository.createQueryBuilder('bag')
            .leftJoinAndSelect('bag.record', 'record') // Relación con record
            .leftJoinAndSelect('record.category', 'category'); // Relación con category dentro de record

        // Filtrar por fecha si se proporciona
        if (date) {
            queryBuilder.andWhere('TO_CHAR(record.date, \'YYYY-MM-DD\') LIKE :date', { date: `%${date}%` });
        }

        // Filtrar por categoryId si se proporciona
        if (categoryId) {
            queryBuilder.andWhere('record.categoryId = :categoryId', { categoryId });
        }

        // Obtener los resultados
        const bags = await queryBuilder.getMany();

        // Filtrar solo las bolsas cuyo record.type sea 'income'
        const incomeBags = bags.filter(bag => bag.record?.type === 'income');

        res.json(incomeBags);
    } catch (error) {
        console.error('Error retrieving bags:', error);
        res.status(500).json({ message: 'Error retrieving bags', error });
    }
};

// Obtener una bolsa por su ID
export const getBagById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const bagRepository = AppDataSource.getRepository(Bag);
        const bag = await bagRepository.findOne({
            where: { id: parseInt(id) },
            relations: ['record'],
        });
        if (!bag) {
            res.status(404).json({ message: 'Bag not found' });
            return;
        }
        res.json(bag);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bag', error });
    }
};