import { Request, Response } from 'express';
import { Client } from "../../../models/Clients";
import AppDataSource from "../../../ormconfig";


// Obtener todos los clientes

export const getClients = async (req: Request, res: Response): Promise<any> => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        const clientRepo = AppDataSource.getRepository(Client);

        // Convertir los valores de query a enteros y asegurarse de que sean válidos
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        // Asegurarse de que los valores sean mayores a 0
        if (pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Page and limit must be greater than 0.' });
        }

        // Búsqueda si existe el parámetro search
        const whereCondition = search
            ? [
                { fullName: `LIKE '%${search}%'` },
                { address: `LIKE '%${search}%'` },
            ]
            : [];

        // Obtener el total de clientes
        const [clients, total] = await clientRepo.findAndCount({
            where: whereCondition,
            take: limitNumber,
            skip: (pageNumber - 1) * limitNumber, // Calcular el offset para la paginación
        });

        // Enviar la respuesta con la paginación y el total de registros
        return res.status(200).json({
            clients,
            total, // Total de registros
            page: pageNumber, // Página actual
            limit: limitNumber, // Registros por página
            totalPages: Math.ceil(total / limitNumber), // Número total de páginas
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching clients.' });
    }
};

// Crear un nuevo cliente
export const createClient = async (req: Request, res: Response): Promise<any> => {
    const { fullName, address } = req.body;

    if (!fullName || !address) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const clientRepo = AppDataSource.getRepository(Client);
        const newClient = clientRepo.create({ fullName, address });
        const savedClient = await clientRepo.save(newClient);
        return res.status(201).json(savedClient);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating client.' });
    }
};

// Actualizar un cliente por ID

export const updateClient = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { fullName, address } = req.body;

    try {
        const clientRepo = AppDataSource.getRepository(Client);

        // Convertir id a número
        const clientId = parseInt(id, 10); // O usar +id

        const client = await clientRepo.findOneBy({ id: clientId });

        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        client.fullName = fullName || client.fullName;
        client.address = address || client.address;

        const updatedClient = await clientRepo.save(client);
        return res.status(200).json(updatedClient);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating client.' });
    }
};

// Eliminar un cliente por ID
export const deleteClient = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
        const clientRepo = AppDataSource.getRepository(Client);

        // Convertir id a número
        const clientId = parseInt(id, 10); // O usar +id

        const client = await clientRepo.findOneBy({ id: clientId });

        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        await clientRepo.remove(client);
        return res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting client.' });
    }
};