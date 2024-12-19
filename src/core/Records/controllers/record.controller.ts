import { Request, Response } from 'express';
import AppDataSource from "../../../ormconfig";
import { Record } from '../../../models/Records';
import { Bag } from '../../../models/Bag';
import { User } from '../../../models/User';
import { Client } from '../../../models/Clients';
import { Category } from '../../../models/Categories';
import { Like } from 'typeorm';


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

// Función común para crear registros según el tipo
const createRecordByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    const { date, quantity, userId, clientId, bag } = req.body;

    if (!date || !quantity || !userId || !clientId || !bag) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const recordRepo = AppDataSource.getRepository(Record);
        const userRepo = AppDataSource.getRepository(User);
        const clientRepo = AppDataSource.getRepository(Client);
        const categoryRepo = AppDataSource.getRepository(Category);
        const bagRepo = AppDataSource.getRepository(Bag);

        // Verificar usuario
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verificar cliente
        const client = await clientRepo.findOneBy({ id: clientId });
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // Crear registro
        const record = new Record();
        record.date = new Date(date);
        record.type = recordType; // Usamos el tipo recibido
        record.quantity = quantity;
        record.user = user;
        record.client = client;

        const savedRecord = await recordRepo.save(record);

        // Procesar la bolsa
        const bags: Bag[] = [];
        for (const bagItem of bag) {
            const { categoryId, quantity, sph, cyl } = bagItem;

            // Verificar categoría
            const category = await categoryRepo.findOneBy({ id: categoryId });
            if (!category) {
                return res.status(404).json({ message: `Category with ID ${categoryId} not found.` });
            }

            const bagEntity = new Bag();
            bagEntity.category = category;
            bagEntity.quantity = quantity;
            bagEntity.sph = sph;
            bagEntity.cyl = cyl;
            bagEntity.record = savedRecord;

            const savedBag = await bagRepo.save(bagEntity);
            bags.push(savedBag);
        }

        // Devolver el registro creado con las bolsas
        return res.status(201).json({
            ...savedRecord,
            bags,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating record.', error });
    }
};


const getRecordsByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);

        const recordRepo = AppDataSource.getRepository(Record);

        // Filtrar registros por tipo y búsqueda
        const [records, total] = await recordRepo.findAndCount({
            where: {
                type: recordType,
                bags: {
                    category: {
                        name: Like(`%${search}%`), // Buscar en el campo `name` de la categoría
                    },
                },
            },
            relations: ['user', 'client', 'bags', 'bags.category'], // Relación con `category`
            skip: (pageNumber - 1) * pageSize, // Saltar registros para la paginación
            take: pageSize, // Límite de registros por página
        });

        // Formatear los registros para incluir campos específicos de `Bag`
        const formattedRecords = records.map((record) => ({
            ...record,
            bags: record.bags.map((bag) => ({
                id: bag.id,
                category: bag.category, // Mostrar la categoría
                quantity: bag.quantity,
                sph: bag.sph, // Incluir el campo SPH
                cyl: bag.cyl, // Incluir el campo CYL
            })),
        }));

        return res.status(200).json({
            total, // Total de registros encontrados
            currentPage: pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            records: formattedRecords,
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