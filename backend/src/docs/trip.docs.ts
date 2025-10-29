/**
 * @swagger
 * /api/vehicles/{vehicleId}/trips/start:
 *   post:
 *     summary: Start a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startLat
 *               - startLng
 *             properties:
 *               startLat:
 *                 type: number
 *               startLng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trip started successfully
 */

/**
 * @swagger
 * /api/vehicles/trips/{id}/end:
 *   patch:
 *     summary: End a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endLat
 *               - endLng
 *               - distance
 *               - fuelUsed
 *             properties:
 *               endLat:
 *                 type: number
 *               endLng:
 *                 type: number
 *               distance:
 *                 type: number
 *               fuelUsed:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trip ended successfully
 */