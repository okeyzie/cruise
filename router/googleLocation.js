const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  searchLocation,
  getCarsNearLocation,
  exploreCars,
  createCar,
  getAllCars,
  getCarById,
  updateCarImages,
  deleteCar
} = require("../controllers/googleLocation");


/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         public_id:
 *           type: string
 *         url:
 *           type: string
 *
 *     Car:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         year:
 *           type: number
 *         pricePerDay:
 *           type: number
 *         category:
 *           type: string
 *         featured:
 *           type: boolean
 *         locationName:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 */

/**
 * @swagger
 * /api/v1/cars/search:
 *   get:
 *     summary: Search location using autocomplete
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Location search text
 *     responses:
 *       200:
 *         description: Location predictions returned
 *       400:
 *         description: Query is required
 *       500:
 *         description: Server error
 */
router.get("/search", searchLocation);

/**
 * @swagger
 * /api/v1/cars/nearby:
 *   get:
 *     summary: Get cars near a given address
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address or location name
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           example: 5000
 *         description: Search radius in meters
 *     responses:
 *       200:
 *         description: Cars found near location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *       400:
 *         description: Address is required
 *       500:
 *         description: Server error
 */
router.get("/nearby", getCarsNearLocation);

/**
 * @swagger
 * /api/v1/cars/explore:
 *   get:
 *     summary: Explore featured and recent cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *       500:
 *         description: Server error
 */
router.get("/explore", exploreCars);

/**
 * @swagger
 * /api/v1/cars/create-car:
 *   post:
 *     summary: Create a new car listing
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *               - model
 *               - pricePerDay
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               pricePerDay:
 *                 type: number
 *               category:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               locationName:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Car created successfully
 *       500:
 *         description: Failed to create car
 */
router.post("/create-car", upload.array("images", 6), createCar);

/**
 * @swagger
 * /api/v1/update-car{id}/images:
 *   put:
 *     summary: Update images of an existing car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Car images updated
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */
router.put("/update-car:id/images", upload.array("images", 6), updateCarImages);

/**
 * @swagger
 * /api/v1/allcars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Cars retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/allcars", getAllCars);

/**
 * @swagger
 * /api/v1/getcar/{id}:
 *   get:
 *     summary: Get a single car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */
router.get("/getcar/:id", getCarById);

/**
 * @swagger
 * /api/v1/delete-car/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */
router.delete("/delete-car/:id", deleteCar);

module.exports = router;
