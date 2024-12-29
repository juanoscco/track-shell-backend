import { authenticateToken } from '../../../middlewares';
import { getCYL } from '../controllers/cyl.controller';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/cyl:
 *   get:
 *     summary: Get all CYL values with pagination and search
 *     tags: [CYL]
 *     responses:
 *       200:
 *         description: List of CYL values
 *       500:
 *         description: Error retrieving CYL values
 */
router.get('/', authenticateToken,getCYL);


export default router;