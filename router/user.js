const {
  loginWithEmail,
  loginWithMobile,
  forgetPassword,
  register,
  verifyOtp,
  resendOtp,
  getUserById,
  deleteUserById,
  updateUserById
} = require("../controllers/user");

const { registerValidator , verifyValidator, resendValidator} = require("../middleware/validator");

const router = require("express").Router();

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: >
 *       Creates a new user account, hashes the password, generates an OTP,
 *       and sends an email verification link/code to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - number
 *               - password
 *               - confirmPassword
 *           properties:
 *             firstName:
 *               type: string
 *               example: John
 *             lastName:
 *               type: string
 *               example: Doe
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *             number:
 *               type: string
 *               example: "08012345678"
 *             password:
 *               type: string
 *               format: password
 *               example: Password@123
 *             confirmPassword:
 *               type: string
 *               format: password
 *               example: Password@123
 *             rememberMe:
 *               type: boolean
 *               example: false
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful john.doe@example.com
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *       400:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with that email or phone number already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating user
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/register", registerValidator, register);

/**
 * @swagger
 * /login/email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: >
 *       Authenticates a user using email and password.
 *       On success, a JWT token is generated and stored for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *             password:
 *               type: string
 *               format: password
 *               example: Password@123
 *             rememberMe:
 *               type: boolean
 *               example: false
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: John
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     rememberMe:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/login/email", loginWithEmail);

/**
 * @swagger
 * /login/mobile:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with mobile number and password
 *     description: >
 *       Authenticates a user using mobile number and password.
 *       On success, a JWT token is generated and stored for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - password
 *           properties:
 *             number:
 *               type: string
 *               example: "08012345678"
 *             password:
 *               type: string
 *               format: password
 *               example: Password@123
 *             rememberMe:
 *               type: boolean
 *               example: false
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: John
 *                     number:
 *                       type: string
 *                       example: "08012345678"
 *                     rememberMe:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/login/mobile", loginWithMobile);

/**
 * @swagger
 * /forgetpassword:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: >
 *       Sends a password reset OTP or link to the user's registered email address
 *       if the account exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset instructions sent to your email
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/forgetpassword", forgetPassword);

/**
 * @swagger
 * /verifyotp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify user OTP
 *     description: >
 *       Verifies the one-time password (OTP) sent to the user's email address.
 *       If valid and not expired, the user account is marked as verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *             otp:
 *               type: string
 *               example: "123456"
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid otp
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error verifying user
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/verifyotp",verifyValidator, verifyOtp);

/**
 * @swagger
 * /resendotp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend verification OTP
 *     description: >
 *       Generates and sends a new one-time password (OTP) to the user's
 *       registered email address for account verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Otp sent, kindly check your email
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error resending otp
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/resendotp", resendValidator, resendOtp);

/**
 * @swagger
 * /getUser/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user by ID
 *     description: Retrieves a single user by ID. Password field is excluded from the response.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User unique identifier
 *         schema:
 *           type: string
 *           example: 64cfd98f6b7e2a0012abc123
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64cfd98f6b7e2a0012abc123
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.doe@example.com
 *                     number:
 *                       type: string
 *                       example: "08012345678"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/getUser/:id", getUserById);

/**
 * @swagger
 * /deleteUser/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete a user by ID
 *     description: Deletes a user account identified by the user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User unique identifier
 *         schema:
 *           type: string
 *           example: 64cfd98f6b7e2a0012abc123
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.delete("/deleteUser/:id", deleteUserById);

/**
 * @swagger
 * /updateUser/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update a user by ID
 *     description: Updates user profile information for the given user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique user ID
 *         schema:
 *           type: string
 *           example: 64cfd98f6b7e2a0012abc123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               number:
 *                 type: string
 *                 example: "08012345678"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64cfd98f6b7e2a0012abc123
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.doe@example.com
 *                     number:
 *                       type: string
 *                       example: "08012345678"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.put("/updateUser/:id", updateUserById);

module.exports = router;
