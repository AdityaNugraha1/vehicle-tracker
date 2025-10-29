/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance records
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of maintenance records
 */

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - type
 *               - description
 *             properties:
 *               vehicleId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [OIL_CHANGE, TIRE_REPLACEMENT, BRAKE_SERVICE, ENGINE_REPAIR, GENERAL_INSPECTION, OTHER]
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 */

/**
 * @swagger
 * /api/maintenance/{id}/complete:
 *   patch:
 *     summary: Complete maintenance
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance completed successfully
 */
