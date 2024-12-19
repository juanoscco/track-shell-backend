import { Request, Response } from 'express';
import { User } from '../../../models/User';
import AppDataSource from '../../../ormconfig';
import bcrypt from 'bcryptjs';  // Para encriptar las contraseñas
import jwt from 'jsonwebtoken';  // Para generar el token JWT
import { Store } from '../../../models/Store';
import { JWT_SECRET } from '../../../config/token';
import { Brackets, Like } from 'typeorm';


export const createUser = async (
  req: Request,
  res: Response,
  role: 'superadmin' | 'admin' | 'seller'
): Promise<void> => {
  const {
    username,
    password,
    isActive,
    storeId,
    fullName,
    dni,
    phone,
    address,
    email,
  } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  const storeRepository = AppDataSource.getRepository(Store);

  try {
    if (role === 'superadmin') {
      const existingSuperAdmin = await userRepository.findOneBy({ role: 'superadmin' });
      if (existingSuperAdmin) {
        res.status(400).json({ message: 'Super Admin already exists' });
        return;
      }

      const store = await storeRepository.findOneBy({ id: storeId });
      if (!store) {
        res.status(404).json({ message: 'Store not found' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newSuperAdmin = userRepository.create({
        username,
        password: hashedPassword,
        role: 'superadmin',
        isActive: isActive ?? true,
        store,
        fullName,
        dni,
        phone,
        address,
        email,
      });

      await userRepository.save(newSuperAdmin);
      res.status(201).json({ message: 'Super Admin created successfully', user: newSuperAdmin });
      return;
    }

    // Verificar el token para roles 'admin' y 'seller'
    const userFromToken = (req as any).user;
    if (!userFromToken) {
      res.status(401).json({ message: 'Unauthorized. Token is required to create this user.' });
      return;
    }

    const store = await storeRepository.findOneBy({ id: storeId });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      role,
      isActive: isActive ?? true,
      store,
      fullName,
      dni,
      phone,
      address,
      email,
    });

    await userRepository.save(newUser);
    res.status(201).json({ message: `${role} created successfully`, user: newUser });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};


export const getUsersByRole = async (req: Request, res: Response, role: "admin" | "seller" | "superadmin"): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

  try {
    // Parámetros para paginación y búsqueda
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    // Usar QueryBuilder para manejar búsquedas complejas
    const queryBuilder = userRepository.createQueryBuilder("user");

    queryBuilder
      .where("user.role = :role", { role }) // Filtrar por rol
      .andWhere(
        new Brackets((qb) => {
          qb.where("user.username LIKE :search", { search: `%${search}%` })
            .orWhere("user.email LIKE :search", { search: `%${search}%` })
            .orWhere("user.fullName LIKE :search", { search: `%${search}%` })
            .orWhere("user.phone LIKE :search", { search: `%${search}%` })
            .orWhere("user.dni LIKE :search", { search: `%${search}%` });
        })
      )
      .select(["user.id", "user.username", "user.email", "user.role", "user.fullName", "user.phone", "user.dni"]) // Solo los campos necesarios
      .skip((pageNumber - 1) * pageSize) // Paginación
      .take(pageSize) // Paginación
      .orderBy("user.username", "ASC"); // Ordenar por nombre de usuario

    // Ejecutar la consulta y contar los resultados totales
    const [users, total] = await queryBuilder.getManyAndCount();

    res.status(200).json({
      total,
      currentPage: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Verificación de parámetros básicos
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscar al usuario y cargar la relación con la tienda
    const user = await userRepository.findOne({
      where: { username },
      relations: ['store'], // Asegúrate de que la entidad User tenga la relación definida correctamente
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Extraer detalles de la tienda si están disponibles
    const storeId = user.store?.id ?? null;
    const storeName = user.store?.name ?? null;

    // Generar el token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        storeId,
        storeName,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respuesta exitosa con el token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error); // Registrar el error en la consola del servidor
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create
export const createSuperAdmin = (req: Request, res: Response): Promise<void> => createUser(req, res, 'superadmin');
export const createAdmin = (req: Request, res: Response): Promise<void> => createUser(req, res, 'admin');
export const createSeller = (req: Request, res: Response): Promise<void> => createUser(req, res, 'seller');


// Get
export const getAdmins = (req: Request, res: Response): Promise<void> => getUsersByRole(req, res, 'admin');
export const getSellers = (req: Request, res: Response): Promise<void> => getUsersByRole(req, res, 'seller');
export const getSuperAdmins = (req: Request, res: Response): Promise<void> => getUsersByRole(req, res, 'superadmin');