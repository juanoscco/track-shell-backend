import { Request, Response } from 'express';
import AppDataSource from '../../../ormconfig';
import { Bag } from '../../../models/Bag';
import { Record as TransactionRecord } from '../../../models/Records';


export const getAllBags = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.query; // Parámetro opcional de categoría

        const bagRepository = AppDataSource.getRepository(Bag);
        const recordRepository = AppDataSource.getRepository(TransactionRecord); // Para consultar los registros

        // Construir la consulta con QueryBuilder
        const queryBuilder = bagRepository.createQueryBuilder('bag')
            .leftJoinAndSelect('bag.record', 'record') // Relación con record
            .leftJoinAndSelect('record.category', 'category') // Relación con category
            .leftJoinAndSelect('bag.sph', 'sph') // Relación con SPH
            .leftJoinAndSelect('bag.cyl', 'cyl'); // Relación con CYL

        // Filtrar por categoryId si se proporciona
        if (categoryId) {
            queryBuilder.andWhere('record.categoryId = :categoryId', { categoryId });
        }

        // Ejecutar la consulta y obtener los resultados
        const bags = await queryBuilder.getMany();

        // Crear un mapa para consolidar ingresos y consumos
        const bagQuantities: Record<string, { sph: any; cyl: any; income: number; consumed: number; quantity: number }> = {};

        bags.forEach((bag) => {
            const sph = bag.sph; // Objeto completo de SPH
            const cyl = bag.cyl; // Objeto completo de CYL
            const key = `${sph.id}-${cyl.id}`; // Clave única basada en los IDs de SPH y CYL

            // Inicializar la entrada en el mapa si no existe
            if (!bagQuantities[key]) {
                bagQuantities[key] = {
                    sph,
                    cyl,
                    income: 0, // Cantidad ingresada
                    consumed: 0, // Cantidad consumida
                    quantity: 0, // Cantidad total de la bolsa
                };
            }

            // Registrar las cantidades según el tipo de registro
            if (bag.record.type === 'income') {
                bagQuantities[key].income += bag.quantity;
                bagQuantities[key].quantity += bag.quantity; // Actualizar cantidad de la bolsa
            } else if (['sale', 'output'].includes(bag.record.type)) {
                bagQuantities[key].consumed += bag.quantity;
            }
        });

        // Revisar los registros de tipo 'income' que se han eliminado
        const deletedRecords = await recordRepository.find({
            where: { type: 'income', isActive: false },
        });

        deletedRecords.forEach((record) => {
            record.bags.forEach((bag) => {
                const sph = bag.sph;
                const cyl = bag.cyl;
                const key = `${sph.id}-${cyl.id}`;

                // Si la bolsa tiene una relación con un registro 'income' eliminado, revertir la cantidad
                if (bagQuantities[key]) {
                    bagQuantities[key].income -= bag.quantity;
                    bagQuantities[key].quantity -= bag.quantity; // Actualizar la cantidad de la bolsa
                }
            });
        });

        // Consolidar bolsas disponibles y calcular el total
        const consolidatedBags = [];
        let totalQuantity = 0;

        for (const key in bagQuantities) {
            const { sph, cyl, income, consumed, quantity } = bagQuantities[key];
            const availableQuantity = income - consumed; // Calcular cantidad disponible

            if (availableQuantity > 0) {
                consolidatedBags.push({
                    sph, // Incluye el objeto completo de SPH
                    cyl, // Incluye el objeto completo de CYL
                    quantity: availableQuantity, // Cantidad disponible
                });
                totalQuantity += availableQuantity; // Sumar al total general
            }
        }

        // Responder con los datos consolidados
        res.json({
            categoryId: categoryId || null, // Categoría filtrada, si aplica
            totalQuantity, // Cantidad total disponible
            consolidatedBags, // Detalles consolidados
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