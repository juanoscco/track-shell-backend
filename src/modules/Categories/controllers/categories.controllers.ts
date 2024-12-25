import { Request, Response } from 'express';
import { Category } from "../../../models/Categories";
import AppDataSource from "../../../ormconfig";
import { Like } from 'typeorm';


const ensureDefaultCategory = async () => {
    const categoryRepository = AppDataSource.getRepository(Category);

    // Verificar si la categoría con ID 1 ya existe (o cualquier otro identificador único)
    const existingCategory = await categoryRepository.findOneBy({ id: 1 });

    if (!existingCategory) {
        // Crear las categorías predeterminadas
        const categoriesData = [
            { id: 1, name: 'Hi Blue' },
            { id: 2, name: 'Blue Verde' },
            { id: 3, name: 'Blue Azul' },
            { id: 4, name: 'Fotoblue Verde' },
            { id: 5, name: 'Fotogrey' },
            { id: 6, name: 'AR' },
            { id: 7, name: 'PC Bluecut' },
        ];

        for (const categoryData of categoriesData) {
            const category = categoryRepository.create(categoryData);
            await categoryRepository.save(category);
        }
    }
};


export const getCategories = async (req: Request, res: Response) => {
    const categoryRepository = AppDataSource.getRepository(Category);

    try {
        // Asegurarse de que las categorías predeterminadas existan
        await ensureDefaultCategory();

        // Parámetros para paginación y filtro
        const { page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);

        // Construcción de las condiciones de búsqueda
        const where = search ? { name: Like(`%${search}%`) } : {};

        // Consultar categorías con paginación y búsqueda
        const [categories, total] = await categoryRepository.findAndCount({
            where,
            select: ["id", "name"], // Solo recuperar id y name
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            order: {
                name: "ASC", // Ordenar alfabéticamente
            },
        });

        res.status(200).json({
            total,
            currentPage: pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            categories,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving categories", error });
    }
};

// Crear una nueva categoría
export const createCategory = async (req: Request, res: Response): Promise<any> => {
    const categoryRepository = AppDataSource.getRepository(Category);

    try {
        const { name } = req.body;

        // Verificar si el nombre de la categoría ya existe
        const existingCategory = await categoryRepository.findOneBy({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = categoryRepository.create({ name });
        await categoryRepository.save(category);

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
};

// Actualizar una categoría
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await categoryRepository.findOneBy({ id: parseInt(id) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.name = name || category.name;
        await categoryRepository.save(category);

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
};

// Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const { id } = req.params;

    try {
        const category = await categoryRepository.findOneBy({ id: parseInt(id) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await categoryRepository.remove(category);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
};