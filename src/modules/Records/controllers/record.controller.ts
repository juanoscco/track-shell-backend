import { Request, Response } from 'express';
import AppDataSource from "../../../ormconfig";
import { Record as TransactionRecord } from '../../../models/Records';
import { Bag } from '../../../models/Bag';
import { User } from '../../../models/User';
import { Client } from '../../../models/Clients';
import { Category } from '../../../models/Categories';
import { Like, Between } from 'typeorm';
import { SPH } from '../../../models/Sph';
import { CYL } from '../../../models/Cyl';


// Crear registro para tipo 'income'
export const createIncomeRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'income');
};

// Crear registro para tipo 'output'
export const createOutputRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'output');
};

// Crear registro para tipo 'sale'
export const createSaleRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'sale');
};

const createRecordByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    const { date, quantity, userId, clientId, categoryId, bag } = req.body;

    if (!date || !quantity || !userId || !clientId || !categoryId || !bag) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const recordRepo = AppDataSource.getRepository(TransactionRecord);
        const userRepo = AppDataSource.getRepository(User);
        const clientRepo = AppDataSource.getRepository(Client);
        const categoryRepo = AppDataSource.getRepository(Category);
        const bagRepo = AppDataSource.getRepository(Bag);
        const sphRepo = AppDataSource.getRepository(SPH);
        const cylRepo = AppDataSource.getRepository(CYL);

        const [user, client, category] = await Promise.all([
            userRepo.findOne({ where: { id: userId } }),
            clientRepo.findOne({ where: { id: clientId } }),
            categoryRepo.findOne({ where: { id: categoryId } }),
        ]);

        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (!client) return res.status(404).json({ message: 'Client not found.' });
        if (!category) return res.status(404).json({ message: 'Category not found.' });

        // Si el tipo no es "income", debemos verificar las bolsas disponibles
        if (recordType !== 'income') {
            const bags = await bagRepo.createQueryBuilder('bag')
                .leftJoinAndSelect('bag.record', 'record')
                .leftJoinAndSelect('record.category', 'category')
                .leftJoinAndSelect('bag.sph', 'sph')
                .leftJoinAndSelect('bag.cyl', 'cyl')
                .where('record.categoryId = :categoryId', { categoryId })
                .andWhere('record.type = :type', { type: 'income' })
                .getMany();

            const bagQuantities: Record<string, { sph: any; cyl: any; income: number; consumed: number }> = {};

            // Consolidamos las cantidades de bolsas
            bags.forEach(bag => {
                const sph = bag.sph;
                const cyl = bag.cyl;
                const key = `${sph.id}-${cyl.id}`;

                if (!bagQuantities[key]) {
                    bagQuantities[key] = {
                        sph,
                        cyl,
                        income: 0,
                        consumed: 0,
                    };
                }

                if (bag.record.type === 'income') {
                    bagQuantities[key].income += bag.quantity;
                } else if (['sale', 'output'].includes(bag.record.type)) {
                    bagQuantities[key].consumed += bag.quantity;
                }
            });

            // Verificamos si hay suficientes elementos disponibles
            for (const bagItem of bag) {
                const { sphId, cylId, quantity: requestedQuantity } = bagItem;
                const key = `${sphId}-${cylId}`;
                const availableQuantity = (bagQuantities[key]?.income || 0) - (bagQuantities[key]?.consumed || 0);

                if (requestedQuantity > availableQuantity) {
                    return res.status(400).json({
                        message: `Insufficient quantity for item with sphId: ${sphId} and cylId: ${cylId}.`
                    });
                }

                // Actualizamos la cantidad disponible después de la venta
                bagQuantities[key].consumed += requestedQuantity;
            }
        }

        // Creamos el nuevo registro
        const record = recordRepo.create({
            date: new Date(date),
            type: recordType,
            quantity,
            user,
            client,
            category,
        });

        const savedRecord = await recordRepo.save(record);

        const bags = [];
        for (const bagItem of bag) {
            const { quantity, sphId, cylId } = bagItem;

            const sph = await sphRepo.findOne({ where: { id: sphId } });
            const cyl = await cylRepo.findOne({ where: { id: cylId } });

            if (!sph || !cyl) {
                return res.status(400).json({
                    message: `Invalid SPH or CYL reference: sphId=${sphId}, cylId=${cylId}`
                });
            }

            const bagEntity = bagRepo.create({
                quantity,
                sph,
                cyl,
                record: savedRecord
            });

            const savedBag = await bagRepo.save(bagEntity);
            bags.push(savedBag);
        }

        return res.status(201).json({
            ...savedRecord,
            bags
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            message: error.message || 'Error creating record.',
            stack: error.stack || '',
        });
    }
};

const getRecordsByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    try {
        const { page = 1, limit = 10, date = '' } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);

        const recordRepo = AppDataSource.getRepository(TransactionRecord);

        // Usando QueryBuilder para hacer INNER JOIN con user y client por fullname
        const queryBuilder = recordRepo.createQueryBuilder('record')
            .leftJoinAndSelect('record.user', 'user')  // INNER JOIN con la entidad user
            .leftJoinAndSelect('record.client', 'client')  // INNER JOIN con la entidad client
            .leftJoinAndSelect('record.category', 'category')  // Asegurarse de incluir la relación con category
            .where('record.type = :type', { type: recordType })
            .andWhere(
                `TO_CHAR(record.date, 'YYYY-MM-DD') LIKE :search`,  // Convierte la fecha a cadena y compara
                { search: `%${date}%` }
            )  // Filtrar por fecha usando LIKE
            .skip((pageNumber - 1) * pageSize)  // Saltar registros para la paginación
            .take(pageSize);  // Límite de registros por página

        // Contar los registros
        const [records, total] = await queryBuilder.getManyAndCount();

        return res.status(200).json({
            total,  // Total de registros encontrados
            currentPage: pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            records,  // Registros encontrados
        });
    } catch (error) {
        console.error(`Error fetching ${recordType} records:`, error);
        return res.status(500).json({
            message: `Error fetching ${recordType} records.`,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Obtener registros de tipo 'income'
export const getIncomeRecords = async (req: Request, res: Response): Promise<any> => {
    return getRecordsByType(req, res, 'income');
};

// Obtener registros de tipo 'output'
export const getOutputRecords = async (req: Request, res: Response): Promise<any> => {
    return getRecordsByType(req, res, 'output');
};

// Obtener registros de tipo 'sale'
export const getSaleRecords = async (req: Request, res: Response): Promise<any> => {
    return getRecordsByType(req, res, 'sale');
};

// Buscar registro por ID con detalles de la tabla Bag
export const getRecordById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // Obtener el ID de la URL

    try {
        const recordRepo = AppDataSource.getRepository(TransactionRecord);

        // Usar QueryBuilder para obtener el registro por ID, con JOIN a la tabla Bag
        const record = await recordRepo.createQueryBuilder('record')
            .leftJoinAndSelect('record.user', 'user')  // INNER JOIN con la entidad user
            .leftJoinAndSelect('record.client', 'client')  // INNER JOIN con la entidad client
            .leftJoinAndSelect('record.category', 'category')  // INNER JOIN con la entidad category
            .leftJoinAndSelect('record.bags', 'bag')  // LEFT JOIN con la entidad Bag
            .where('record.id = :id', { id })
            .getOne();

        if (!record) {
            return res.status(404).json({ message: 'Record not found.' });
        }

        return res.status(200).json(record);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error fetching record details.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};