import { Request, Response } from 'express';
import AppDataSource from "../../../ormconfig";
import { Record } from '../../../models/Records';
import { Bag } from '../../../models/Bag';
import { User } from '../../../models/User';
import { Client } from '../../../models/Clients';
import { Category } from '../../../models/Categories';
import { Like, Between } from 'typeorm';


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
    const { date, quantity, userId, clientId, categoryId, bag } = req.body;  // Asegúrate de incluir categoryId en el cuerpo de la solicitud

    // Validación de campos requeridos
    if (!date || !quantity || !userId || !clientId || !categoryId || !bag) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const recordRepo = AppDataSource.getRepository(Record);
        const userRepo = AppDataSource.getRepository(User);
        const clientRepo = AppDataSource.getRepository(Client);
        const categoryRepo = AppDataSource.getRepository(Category);
        const bagRepo = AppDataSource.getRepository(Bag);

        // Verificar usuario y cliente en paralelo para optimizar consultas
        const [user, client, category] = await Promise.all([
            userRepo.findOne({ where: { id: userId } }),
            clientRepo.findOne({ where: { id: clientId } }),
            categoryRepo.findOne({ where: { id: categoryId } }),  // Verificar que la categoría exista
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });  // Manejo de error si no se encuentra la categoría
        }

        // Crear registro
        const record = recordRepo.create({
            date: new Date(date),
            type: recordType,
            quantity,
            user,
            client,
            category,  // Asegúrate de pasar la categoría al crear el registro
        });

        const savedRecord = await recordRepo.save(record);

        // Procesar la bolsa en paralelo
        const bags = await Promise.all(bag.map(async (bagItem: any) => {
            const { quantity, sph, cyl } = bagItem;

            // Crear y guardar la bolsa asociada a este registro
            const bagEntity = bagRepo.create({
                quantity,
                sph,
                cyl,
                record: savedRecord
            });

            return await bagRepo.save(bagEntity);
        }));

        // Devolver el registro creado con las bolsas
        return res.status(201).json({
            ...savedRecord,
            bags
        });
    } catch (error: any) {
        console.error(error);

        // Mejor manejo de error, mostrando el error completo y detalles de la causa
        const errorMessage = error?.message || 'Error creating record.';
        const errorStack = error?.stack || '';

        return res.status(500).json({
            message: errorMessage,
            stack: errorStack // Opcional, solo para facilitar la depuración
        });
    }
};

const getRecordsByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    try {
        const { page = 1, limit = 10, date = '' } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);

        const recordRepo = AppDataSource.getRepository(Record);

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
        const recordRepo = AppDataSource.getRepository(Record);

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