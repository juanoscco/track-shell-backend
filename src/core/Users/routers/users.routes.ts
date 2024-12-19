// src/user/user.routes.ts
import { Router } from 'express';
import { createSuperAdmin, createAdmin, createSeller, login, getAdmins, getSellers, getSuperAdmins } from '../controllers';
import { authenticateToken } from '../../../middlewares';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *         - isActive
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password for the user account
 *         role:
 *           type: string
 *           enum: [superadmin, admin, seller]
 *           description: The role assigned to the user
 *         isActive:
 *           type: boolean
 *           description: Defines if the user is active or not
 *         fullName:
 *           type: string
 *           description: The full name of the user (first and last names)
 *         dni:
 *           type: string
 *           description: Unique national identity document number
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         address:
 *           type: string
 *           description: The user's address
 *         email:
 *           type: string
 *           description: Unique email address of the user
 *         storeId:
 *           type: integer
 *           description: The ID of the store where the user belongs
 *           example: 1
 */

/**
 * @swagger
 * /api/users/superadmin:
 *   post:
 *     summary: Create a new Super Admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Super Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error creating user
 */
router.post('/superadmin', createSuperAdmin as any);

/**
 * @swagger
 * /api/users/admin:
 *   post:
 *     summary: Create a new Admin
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       500:
 *         description: Error creating user
 */
router.post('/admin', authenticateToken, createAdmin);

/**
 * @swagger
 * /api/users/seller:
 *   post:
 *     summary: Create a new Seller
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Seller created successfully
 *       500:
 *         description: Error creating user
 */
router.post('/seller', authenticateToken, createSeller);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login and return JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               password:
 *                 type: string
 *                 description: The password for the user account
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *       401:
 *         description: Unauthorized, invalid username or password
 *       500:
 *         description: Error during login process
 */
router.post('/login', login as any);


/**
 * @swagger
 * /api/users/get-admins:
 *   get:
 *     summary: Obtener todos los administradores con paginación y búsqueda
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Palabra clave para buscar por username.
 *     responses:
 *       200:
 *         description: Lista de administradores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de administradores encontrados.
 *                 currentPage:
 *                   type: integer
 *                   description: Página actual.
 *                 pageSize:
 *                   type: integer
 *                   description: Tamaño de la página.
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas disponibles.
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/get-admins', authenticateToken, getAdmins);

/**
 * @swagger
 * /api/users/get-sellers:
 *   get:
 *     summary: Obtener todos los vendedores con paginación y búsqueda
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Palabra clave para buscar por username.
 *     responses:
 *       200:
 *         description: Lista de vendedores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de vendedores encontrados.
 *                 currentPage:
 *                   type: integer
 *                   description: Página actual.
 *                 pageSize:
 *                   type: integer
 *                   description: Tamaño de la página.
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas disponibles.
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/get-sellers', authenticateToken, getSellers);

/**
 * @swagger
 * /api/users/get-superadmins:
 *   get:
 *     summary: Obtener todos los super administradores con paginación y búsqueda
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Palabra clave para buscar por username.
 *     responses:
 *       200:
 *         description: Lista de super administradores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de super administradores encontrados.
 *                 currentPage:
 *                   type: integer
 *                   description: Página actual.
 *                 pageSize:
 *                   type: integer
 *                   description: Tamaño de la página.
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas disponibles.
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/get-superadmins', authenticateToken, getSuperAdmins);

export default router;