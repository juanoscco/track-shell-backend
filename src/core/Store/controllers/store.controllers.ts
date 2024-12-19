import { Request, Response } from 'express';
import AppDataSource from '../../../ormconfig';
import { Store } from '../../../models/Store';
import { Like } from 'typeorm';

// Función para asegurarse de que la tienda predeterminada existe
const ensureDefaultStore = async () => {
  const storeRepository = AppDataSource.getRepository(Store);

  // Verificar si la tienda con ID 99 ya existe
  const existingStore = await storeRepository.findOneBy({ id: 1 });

  if (!existingStore) {
    // Crear la tienda predeterminada
    const defaultStore = storeRepository.create({
      id: 1,
      name: 'Acme Inc',
      location: 'Looney Tunes World',
    });

    await storeRepository.save(defaultStore);
  }
};

export const getStores = async (req: Request, res: Response) => {
  const storeRepository = AppDataSource.getRepository(Store);

  try {
    // Asegurar la existencia de la tienda predeterminada antes de obtener todas las tiendas
    await ensureDefaultStore();

    // Parámetros para paginación y filtro
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    // Construcción de las condiciones de búsqueda
    const where = search
      ? [
        { name: Like(`%${search}%`) },
        { location: Like(`%${search}%`) },
      ]
      : {};

    const [stores, total] = await storeRepository.findAndCount({
      where,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        name: 'ASC', // Ordenar alfabéticamente
      },
    });

    // Filtrar la tienda con id: 1
    const filteredStores = stores.filter(store => store.id !== 1);

    res.status(200).json({
      total: total - (stores.length - filteredStores.length), // Ajustar el total si se ocultan tiendas
      currentPage: pageNumber,
      pageSize,
      totalPages: Math.ceil((total - (stores.length - filteredStores.length)) / pageSize),
      stores: filteredStores,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stores', error });
  }
};

// Crear una nueva tienda
export const createStore = async (req: Request, res: Response) => {
  const { name, location } = req.body;

  const storeRepository = AppDataSource.getRepository(Store);

  try {
    // Crear y guardar la nueva tienda
    const newStore = storeRepository.create({ name, location });
    await storeRepository.save(newStore);

    res.status(201).json({ message: 'Store created successfully', store: newStore });
  } catch (error) {
    res.status(500).json({ message: 'Error creating store', error });
  }
};