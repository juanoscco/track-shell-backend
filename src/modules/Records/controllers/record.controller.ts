import { Request, Response } from 'express';
import AppDataSource from "../../../ormconfig";
import { Record as TransactionRecord } from '../../../models/Records';
import { Bag } from '../../../models/Bag';
import { User } from '../../../models/User';
import { Client } from '../../../models/Clients';
import { Category } from '../../../models/Categories';
import { SPH } from '../../../models/Sph';
import { CYL } from '../../../models/Cyl';
import { In } from 'typeorm';


// Crear registro para tipo 'income'
export const createIncomeRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'income');
};

// Crear registro para tipo 'output'
export const createOutputRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'output');
};

export const createSaleRecord = async (req: Request, res: Response): Promise<any> => {
    return createRecordByType(req, res, 'sale');
};

const createRecordByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    const { date, quantity, userId, clientId, categoryId, bag, totalPrice = 0 } = req.body;

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

        // Verificación de bolsas solo si el tipo no es "income"
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

            for (const bagItem of bag) {
                const { sphId, cylId, quantity: requestedQuantity } = bagItem;
                const key = `${sphId}-${cylId}`;
                const availableQuantity = (bagQuantities[key]?.income || 0) - (bagQuantities[key]?.consumed || 0);

                if (requestedQuantity > availableQuantity) {
                    return res.status(400).json({
                        message: `Insufficient quantity for item with sphId: ${sphId} and cylId: ${cylId}.`
                    });
                }

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
            totalPrice: recordType === 'sale' ? totalPrice : undefined,
        });

        const savedRecord = await recordRepo.save(record);

        const bags = [];
        for (const bagItem of bag) {
            const { quantity, sphId, cylId, unitPrice = 0 } = bagItem;

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
                record: savedRecord,
                unitPrice: recordType === 'sale' ? unitPrice : undefined,
            });

            const savedBag = await bagRepo.save(bagEntity);
            bags.push(savedBag);
        }

        return res.status(201).json({
            ...savedRecord,
            bags: bags.map(b => ({
                ...b,
                unitPrice: b.unitPrice || 0, // Aseguramos que unitPrice aparezca en el JSON
            })),
            totalPrice: savedRecord.totalPrice || 0, // Aseguramos que totalPrice aparezca en el JSON
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            message: error.message || 'Error creating record.',
            stack: error.stack || '',
        });
    }
};

// 
const getRecordsByType = async (
    req: Request,
    res: Response,
    recordType: 'income' | 'output' | 'sale'
): Promise<any> => {
    try {
        // Extrae los parámetros de la consulta (query params)
        const { page = 1, limit = 10, search = '', user = 1 } = req.query;

        // Convierte los valores de página y límite a números
        const pageNumber = Number(page);
        const pageSize = Number(limit);

        // Convierte el parámetro 'user' a un número, por defecto es 1
        const userId = Number(user);

        // Obtén el repositorio para trabajar con la entidad TransactionRecord
        const recordRepo = AppDataSource.getRepository(TransactionRecord);

        // QueryBuilder con INNER JOIN para filtrar por el usuario
        const queryBuilder = recordRepo.createQueryBuilder('record')
            .innerJoinAndSelect('record.user', 'user') // INNER JOIN con la entidad User
            .innerJoinAndSelect('record.client', 'client') // INNER JOIN con la entidad Client
            .innerJoinAndSelect('record.category', 'category') // INNER JOIN con la entidad Category
            .innerJoinAndSelect('record.bags', 'bag') // INNER JOIN con la entidad Bag
            .innerJoinAndSelect('bag.sph', 'sph') // INNER JOIN con la tabla SPH
            .innerJoinAndSelect('bag.cyl', 'cyl') // INNER JOIN con la tabla CYL
            .where('record.type = :type', { type: recordType }) // Filtro principal por tipo
            .andWhere('record.userId = :userId', { userId }) // Filtro por ID del usuario
            .andWhere(
                search
                    ? `(
                        TO_CHAR(record.date, 'YYYY-MM-DD') LIKE :search 
                        OR client.fullName LIKE :search 
                        OR category.name LIKE :search
                        OR CAST(record.type AS TEXT) LIKE :search
                    )`
                    : '1=1',
                { search: `%${search}%` }
            ) // Filtro por búsqueda general
            .skip((pageNumber - 1) * pageSize) // Paginación: registros a saltar
            .take(pageSize) // Paginación: límite de registros por página
            .orderBy('record.date', 'DESC'); // Ordenar por fecha (más reciente primero)

        // Obtener los registros y el conteo total
        const [records, total] = await queryBuilder.getManyAndCount();

        return res.status(200).json({
            total, // Total de registros encontrados
            currentPage: pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            records, // Registros encontrados
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

        // Usar QueryBuilder para obtener el registro por ID, con INNER JOIN a la tabla Bag
        const record = await recordRepo.createQueryBuilder('record')
            .innerJoinAndSelect('record.user', 'user') // INNER JOIN con la entidad User
            .innerJoinAndSelect('record.client', 'client') // INNER JOIN con la entidad Client
            .innerJoinAndSelect('record.category', 'category') // INNER JOIN con la entidad Category
            .innerJoinAndSelect('record.bags', 'bag') // INNER JOIN con la entidad Bag
            .innerJoinAndSelect('bag.sph', 'sph') // INNER JOIN con la tabla SPH
            .innerJoinAndSelect('bag.cyl', 'cyl') // INNER JOIN con la tabla CYL
            .where('record.id = :id', { id }) // Filtrar por ID
            .getOne();

        if (!record) {
            return res.status(404).json({ message: 'Record not found.' });
        }

        return res.status(200).json(record); // Retornar el registro encontrado
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error fetching record details.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

const updateRecordByType = async (req: Request, res: Response, recordType: 'income' | 'output' | 'sale'): Promise<any> => {
    const { id, date, quantity, userId, clientId, categoryId, bag } = req.body;

    // Verificar si se ha proporcionado un ID para actualizar el registro
    if (!id) {
        return res.status(400).json({ message: 'Missing record ID.' });
    }

    try {
        const recordRepo = AppDataSource.getRepository(TransactionRecord);
        const userRepo = AppDataSource.getRepository(User);
        const clientRepo = AppDataSource.getRepository(Client);
        const categoryRepo = AppDataSource.getRepository(Category);
        const bagRepo = AppDataSource.getRepository(Bag);
        const sphRepo = AppDataSource.getRepository(SPH);
        const cylRepo = AppDataSource.getRepository(CYL);

        // Buscar el registro a actualizar usando el id UUID
        const record = await recordRepo.findOne({ where: { id } });
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' });
        }

        // Si se proporcionan nuevos valores, actualizarlos en el registro
        if (date) record.date = new Date(date);
        if (quantity) record.quantity = quantity;
        if (userId) {
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: 'User not found.' });
            record.user = user;
        }
        if (clientId) {
            const client = await clientRepo.findOne({ where: { id: clientId } });
            if (!client) return res.status(404).json({ message: 'Client not found.' });
            record.client = client;
        }
        if (categoryId) {
            const category = await categoryRepo.findOne({ where: { id: categoryId } });
            if (!category) return res.status(404).json({ message: 'Category not found.' });
            record.category = category;
        }

        // Si el tipo no es "income", verificar bolsas disponibles
        if (recordType !== 'income' && bag) {
            const bags = await bagRepo.find({
                relations: ['record', 'record.category', 'sph', 'cyl'],
                where: {
                    record: {
                        category: { id: record.category.id },
                        type: 'income',
                    },
                },
            });

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

        // Guardamos el registro actualizado
        const updatedRecord = await recordRepo.save(record);

        // Actualizamos las bolsas asociadas al registro
        const updatedBags = [];
        if (bag) {
            for (const bagItem of bag) {
                const { quantity, sphId, cylId } = bagItem;

                const sph = await sphRepo.findOne({ where: { id: sphId } });
                const cyl = await cylRepo.findOne({ where: { id: cylId } });

                if (!sph || !cyl) {
                    return res.status(400).json({
                        message: `Invalid SPH or CYL reference: sphId=${sphId}, cylId=${cylId}`
                    });
                }

                let bagEntity = await bagRepo.findOne({
                    where: {
                        record: updatedRecord,
                        sph: { id: sphId },
                        cyl: { id: cylId },
                    },
                });

                if (bagEntity) {
                    bagEntity.quantity = quantity;
                } else {
                    bagEntity = bagRepo.create({
                        quantity,
                        sph,
                        cyl,
                        record: updatedRecord
                    });
                }

                const savedBag = await bagRepo.save(bagEntity);
                updatedBags.push(savedBag);
            }
        }

        return res.status(200).json({
            ...updatedRecord,
            bags: updatedBags
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            message: error.message || 'Error updating record.',
            stack: error.stack || '',
        });
    }
};

// Actualizar registro para tipo 'income'
export const updateIncomeRecord = async (req: Request, res: Response): Promise<any> => {
    return updateRecordByType(req, res, 'income');
};

// Actualizar registro para tipo 'output'
export const updateOutputRecord = async (req: Request, res: Response): Promise<any> => {
    return updateRecordByType(req, res, 'output');
};

// Actualizar registro para tipo 'sale'
export const updateSaleRecord = async (req: Request, res: Response): Promise<any> => {
    return updateRecordByType(req, res, 'sale');
};


// Delete
export const deleteRecordById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // Obtenemos el id del parámetro

    if (!id) {
        return res.status(400).json({ message: 'Missing record ID.' });
    }

    try {
        const recordRepo = AppDataSource.getRepository(TransactionRecord);
        const bagRepo = AppDataSource.getRepository(Bag);

        // Buscamos el registro
        const record = await recordRepo.findOne({
            where: { id },
            relations: ['bags'], // Traemos las bolsas relacionadas
        });

        if (!record) {
            return res.status(404).json({ message: 'Record not found.' });
        }

        if (record.type === 'income') {
            // Si es un ingreso, restauramos las cantidades en las bolsas asociadas a las ventas o salidas
            const bagIds = record.bags.map(bag => bag.id);
            for (const bag of record.bags) {
                // Ajustamos las cantidades de las bolsas
                const relatedSalesOrOutputs = await recordRepo.find({
                    where: {
                        bags: { id: bag.id },
                        type: In(['sale', 'output']),
                    },
                    relations: ['bags'],
                });

                relatedSalesOrOutputs.forEach(async (relatedRecord) => {
                    const relatedBag = relatedRecord.bags.find(b => b.id === bag.id);
                    if (relatedBag) {
                        // Restituir cantidad al ingreso
                        relatedBag.quantity += bag.quantity;
                        await bagRepo.save(relatedBag);
                    }
                });
            }
        } else if (['sale', 'output'].includes(record.type)) {
            // Si es una venta o salida, actualizamos las cantidades en el ingreso relacionado
            const bags = record.bags;
            for (const bag of bags) {
                // Encontramos el ingreso relacionado y restauramos las cantidades
                const incomeRecord = await recordRepo.findOne({
                    where: {
                        bags: { id: bag.id },
                        type: 'income',
                    },
                    relations: ['bags'],
                });

                if (incomeRecord) {
                    const incomeBag = incomeRecord.bags.find(b => b.id === bag.id);
                    if (incomeBag) {
                        // Ajustamos la cantidad en el registro de ingreso
                        incomeBag.quantity -= bag.quantity;
                        await bagRepo.save(incomeBag);
                    }
                }
            }
        }

        // Cambiamos el estado a false para el Record
        record.isActive = false;
        await recordRepo.save(record);

        // Cambiamos el estado a false para las bolsas relacionadas
        if (record.bags.length > 0) {
            const bagIds = record.bags.map(bag => bag.id);
            await bagRepo.update(bagIds, { isActive: false });
        }

        return res.status(200).json({
            message: 'Record and related bags have been deactivated and quantities restored.',
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            message: error.message || 'Error deactivating record and bags.',
            stack: error.stack || '',
        });
    }
};