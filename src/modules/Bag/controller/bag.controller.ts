import { Request, Response } from 'express';
import AppDataSource from '../../../ormconfig';
import { Bag } from '../../../models/Bag';

export const getAllBags = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.query; // Obtener el parámetro opcional de categoría

        const bagRepository = AppDataSource.getRepository(Bag);

        // Usar QueryBuilder para incluir las relaciones necesarias
        const queryBuilder = bagRepository.createQueryBuilder('bag')
            .leftJoinAndSelect('bag.record', 'record') // Relación con record
            .leftJoinAndSelect('record.category', 'category'); // Relación con category dentro de record

        // Filtrar por categoryId si se proporciona
        if (categoryId) {
            queryBuilder.andWhere('record.categoryId = :categoryId', { categoryId });
        }

        // Obtener los resultados
        const bags = await queryBuilder.getMany();

        // Crear un mapa para consolidar ingresos y consumos
        const bagQuantities: Record<string, { sph: string; cyl: string; income: number; consumed: number }> = {};

        bags.forEach(bag => {
            const sph = String(bag.sph) || 'null'; // Usar 'null' si sph está vacío para evitar claves inválidas
            const cyl = String(bag.cyl) || 'null'; // Usar 'null' si cyl está vacío
            const key = `${sph}-${cyl}`; // Identificador único basado en sph y cyl

            if (!bagQuantities[key]) {
                bagQuantities[key] = {
                    sph,
                    cyl,
                    income: 0, // Cantidad ingresada
                    consumed: 0, // Cantidad consumida
                };
            }

            // Registrar cantidades según el tipo de registro
            if (bag.record.type === 'income') {
                bagQuantities[key].income += bag.quantity;
            } else if (bag.record.type === 'sale' || bag.record.type === 'output') {
                bagQuantities[key].consumed += bag.quantity;
            }
        });

        // Consolidar bolsas disponibles y calcular total
        const consolidatedBags = [];
        let totalQuantity = 0;

        for (const key in bagQuantities) {
            const { sph, cyl, income, consumed } = bagQuantities[key];
            const availableQuantity = income - consumed;

            if (availableQuantity > 0) {
                consolidatedBags.push({
                    sph: sph === 'null' ? '' : sph, // Restaurar sph vacío como string vacío
                    cyl: cyl === 'null' ? '' : cyl, // Restaurar cyl vacío como string vacío
                    quantity: availableQuantity,
                });
                totalQuantity += availableQuantity; // Acumular al total general
            }
        }

        res.json({
            categoryId: categoryId || null,
            totalQuantity, // Total disponible de todos los ingresos
            consolidatedBags, // Bags consolidados disponibles
        });
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