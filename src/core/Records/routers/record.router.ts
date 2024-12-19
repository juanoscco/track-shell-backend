import { Router } from 'express';
import {
    createIncomeRecord,
    createOutputRecord,
    createSaleRecord,
    getIncomeRecords,
    getOutputRecords,
    getSaleRecords
} from "../controllers/record.controller";

const router = Router();

/**
 * @swagger
 * /api/records/income:
 *   post:
 *     summary: Create a new income record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum:
 *                   - income
 *                   - output
 *                   - sale
 *               userId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: number
 *                       format: float
 *                     cyl:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating record
 */
router.post('/income', createIncomeRecord);

/**
 * @swagger
 * /api/records/output:
 *   post:
 *     summary: Create a new output record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum:
 *                   - income
 *                   - output
 *                   - sale
 *               userId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: number
 *                       format: float
 *                     cyl:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating record
 */
router.post('/output', createOutputRecord);

/**
 * @swagger
 * /api/records/sale:
 *   post:
 *     summary: Create a new sale record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum:
 *                   - income
 *                   - output
 *                   - sale
 *               userId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: number
 *                       format: float
 *                     cyl:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating record
 */
router.post('/sale', createSaleRecord);

/**
 * @swagger
 * components:
 *   schemas:
 *     Bag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         quantity:
 *           type: integer
 *           example: 10
 *         sph:
 *           type: number
 *           format: float
 *           example: 1.25
 *         cyl:
 *           type: number
 *           format: float
 *           example: -0.75
 *         record:
 *           $ref: '#/components/schemas/Record'
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Sunglasses"
 *     Record:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-12-10T12:00:00Z"
 *         type:
 *           type: string
 *           enum:
 *             - income
 *             - output
 *             - sale
 *           example: "sale"
 *         quantity:
 *           type: integer
 *           example: 100
 *         user:
 *           $ref: '#/components/schemas/User'
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         bags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Bag'
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "johndoe@example.com"
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Client Name"
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Record'
 */

/**
 * @swagger
 * /api/records/income:
 *   get:
 *     summary: Get all income records
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "lens"
 *         description: Search term for filtering by category name
 *     responses:
 *       200:
 *         description: A list of income records with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       500:
 *         description: Server error
 */
router.get('/income', getIncomeRecords);

/**
 * @swagger
 * /api/records/output:
 *   get:
 *     summary: Get all output records
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "lens"
 *         description: Search term for filtering by category name
 *     responses:
 *       200:
 *         description: A list of output records with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       500:
 *         description: Server error
 */
router.get('/output', getOutputRecords);

/**
 * @swagger
 * /api/records/sale:
 *   get:
 *     summary: Get all sale records
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "lens"
 *         description: Search term for filtering by category name
 *     responses:
 *       200:
 *         description: A list of sale records with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       500:
 *         description: Server error
 */
router.get('/sale', getSaleRecords);

export default router;