import { Router } from 'express';
import {
    createIncomeRecord,
    createOutputRecord,
    createSaleRecord,
    getIncomeRecords,
    getOutputRecords,
    getRecordById,
    getSaleRecords,
    updateIncomeRecord,
    updateOutputRecord,
    updateSaleRecord
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
 *               userId:
 *                 type: integer
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: integer
 *                       description: ID of the SPH record
 *                     cyl:
 *                       type: integer
 *                       description: ID of the CYL record
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields or insufficient quantity
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
 *               userId:
 *                 type: integer
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: integer
 *                       description: ID of the SPH record
 *                     cyl:
 *                       type: integer
 *                       description: ID of the CYL record
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields or insufficient quantity
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
 *               userId:
 *                 type: integer
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                     sph:
 *                       type: integer
 *                       description: ID of the SPH record
 *                     cyl:
 *                       type: integer
 *                       description: ID of the CYL record
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Missing required fields or insufficient quantity
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
 *     summary: Get all income records for the authenticated user
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
 *         name: date
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *         description: Filter records by date (YYYY-MM-DD format)
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID to filter records for a specific user (default is 1)
 *     responses:
 *       200:
 *         description: A list of income records for the authenticated user with pagination
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
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Server error
 */
router.get('/income', getIncomeRecords);

/**
 * @swagger
 * /api/records/output:
 *   get:
 *     summary: Get all output records for the authenticated user
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
 *         name: date
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *         description: Filter records by date (YYYY-MM-DD format)
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID to filter records for a specific user (default is 1)
 *     responses:
 *       200:
 *         description: A list of output records for the authenticated user with pagination
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
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Server error
 */
router.get('/output', getOutputRecords);

/**
 * @swagger
 * /api/records/sale:
 *   get:
 *     summary: Get all sale records for the authenticated user
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
 *         name: date
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *         description: Filter records by date (YYYY-MM-DD format)
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID to filter records for a specific user (default is 1)
 *     responses:
 *       200:
 *         description: A list of sale records for the authenticated user with pagination
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
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Server error
 */
router.get('/sale', getSaleRecords);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get record details by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the record to retrieve
 *     responses:
 *       200:
 *         description: A record with detailed information, including associated bags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123"
 *                 date:
 *                   type: string
 *                   example: "2024-12-23T00:00:00.000Z"
 *                 type:
 *                   type: string
 *                   example: "income"
 *                 quantity:
 *                   type: number
 *                   example: 10
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *                 bags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bag'
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRecordById);


/**
 * @swagger
 * /api/records/income/{id}:
 *   patch:
 *     summary: Update an income record
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the income record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bag:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sphId:
 *                       type: integer
 *                     cylId:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Successfully updated the income record
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.patch('/income/:id', updateIncomeRecord);

/**
 * @swagger
 * /api/records/output/{id}:
 *   patch:
 *     summary: Update an output record
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the output record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bag:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sphId:
 *                       type: integer
 *                     cylId:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Successfully updated the output record
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.patch('/output/:id', updateOutputRecord);

/**
 * @swagger
 * /api/records/sale/{id}:
 *   patch:
 *     summary: Update a sale record
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sale record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               clientId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               bag:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sphId:
 *                       type: integer
 *                     cylId:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Successfully updated the sale record
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.patch('/sale/:id', updateSaleRecord);

export default router;