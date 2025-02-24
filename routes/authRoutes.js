const express = require("express");


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication routes
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

module.exports = router;
