import { Router } from 'express';
import { createStore, getStores } from '../controllers';
import { authenticateToken } from '../../../middlewares';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the store
 *         location:
 *           type: string
 *           description: The location of the store
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores with pagination and search
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (pagination).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of stores per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: A keyword to filter stores by their name.
 *     responses:
 *       200:
 *         description: A list of stores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of stores matching the filter.
 *                 currentPage:
 *                   type: integer
 *                   description: The current page number.
 *                 pageSize:
 *                   type: integer
 *                   description: The number of stores per page.
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages.
 *                 stores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, getStores);

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Create a new store
 *     tags: [Stores]   
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       201:
 *         description: Store created successfully
 *       500:
 *         description: Error creating store
 */
router.post('/', authenticateToken, createStore);

export default router;