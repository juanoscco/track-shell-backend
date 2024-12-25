import { authenticateToken } from '../../../middlewares';
import { getBagById, getAllBags } from './../controller/bag.controller';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Bag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID of the bag
 *         record:
 *           type: object
 *           description: Associated record
 *         quantity:
 *           type: integer
 *           description: Quantity of the product in the bag
 *         sph:
 *           type: number
 *           format: float
 *           description: Sphere (SPH) value
 *         cyl:
 *           type: number
 *           format: float
 *           description: Cylinder (CYL) value
 */

/**
 * @swagger
 * /api/bags:
 *   get:
 *     summary: Get all bags with optional filters for date and categoryId
 *     tags: [Bags]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: The date to filter bags by (in YYYY-MM-DD format).
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: integer
 *         description: The category ID to filter bags by.
 *     responses:
 *       200:
 *         description: A list of bags filtered by date and/or category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bag'
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, getAllBags);

/**
 * @swagger
 * /api/bags/{id}:
 *   get:
 *     summary: Get a bag by ID
 *     tags: [Bags]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the bag to retrieve
 *     responses:
 *       200:
 *         description: Bag found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bag'
 *       404:
 *         description: Bag not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, getBagById);

export default router;