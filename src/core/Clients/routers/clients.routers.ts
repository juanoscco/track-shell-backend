import { Router } from 'express';
import {
    getClients,
    createClient,
    updateClient,
    deleteClient,
} from "../controller/clients.controller"
import { authenticateToken } from '../../../middlewares';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of the client
 *         address:
 *           type: string
 *           description: Address of the client
 *       required:
 *         - fullName
 *         - address
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to fetch. Default is 1.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of clients per page. Default is 10.
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: A search term to filter clients by fullName or address.
 *     responses:
 *       200:
 *         description: A paginated list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 total:
 *                   type: integer
 *                   description: Total number of clients matching the search.
 *                 page:
 *                   type: integer
 *                   description: The current page number.
 *                 limit:
 *                   type: integer
 *                   description: The number of clients per page.
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages.
 */
router.get('/', authenticateToken, getClients);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.post('/', authenticateToken, createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Update a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.patch('/:id', authenticateToken, updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Error deleting client
 */
router.delete('/:id', authenticateToken, deleteClient);

export default router;