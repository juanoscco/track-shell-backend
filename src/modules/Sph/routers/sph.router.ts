import { authenticateToken } from '../../../middlewares';
import { getSPH } from '../controllers/sph.controllers';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/sph:
 *   get:
 *     summary: Get all SPH values with filter for positive or negative values
 *     tags: [SPH]
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Type of values to filter ('positive' or 'negative'). Default is 'negative'.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [positive, negative]
 *     responses:
 *       200:
 *         description: List of SPH values
 *       500:
 *         description: Error retrieving SPH values
 */
router.get('/', authenticateToken,getSPH);

export default router;