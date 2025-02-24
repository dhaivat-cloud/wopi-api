const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Cloudoffis API",
            version: "0.0.1",
            description: "API for managing the cloudoffis products and their groups for placeholders",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: ["./server.js", "./routes/*.js"],  // This is important: Ensure this path points to the correct file(s)
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://dhaivatd:dhaivat123@cluster0.xopyf.mongodb.net/productsDB?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const db = mongoose.connection;
db.once("open", () => console.log("Connected to MongoDB"));
db.on("error", (err) => console.error("MongoDB connection error:", err));

// Define Schema
const LabelSchema = new mongoose.Schema({
    label: String,
    description: String,
});

const GroupSchema = new mongoose.Schema({
    groupid: Number,
    groupname: String,
    labels: [LabelSchema],
});

const ProductSchema = new mongoose.Schema({
    productid: Number,
    productname: String,
    groups: [GroupSchema],
});


const Product = mongoose.model("Product", ProductSchema);

/**
 * @swagger
 * /initialize-products:
 *   post:
 *     summary: Add all 3 products to the MongoDB
 *     description: When the database is refreshed, we fill the database with these initial set of values. Dummy values for now.
 *     responses:
 *       201:
 *         description: Products added successfully
 *       400:
 *         description: Products already exist in DB
 *       500:
 *         description: Server error
 */
app.post("/initialize-products", async (req, res) => {
    try {
        const existingProducts = await Product.find();
        if (existingProducts.length > 0) {
            return res.status(400).json({ message: "Products already exist in DB" });
        }

        const initialProducts = [
            {
                productid: 1,
                productname: "sorted",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                        ],
                    },
                ],
            },
            {
                productid: 2,
                productname: "tax-sorted",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                            { label: "${END_DATE}", description: "End Date" },
                            { label: "${FY}", description: "FY" },
                            { label: "${YEAR_END_DATE_IN_WORDS}", description: "Year End Date in Words" },
                        ],
                    },
                ],
            },
            {
                productid: 3,
                productname: "auditomation",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                        ],
                    },
                ],
            },
        ];

        await Product.insertMany(initialProducts);
        res.status(201).json({ message: "Products added successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Display all 3 products.
 *     description: Retrieves all product information and the groups that are existing as part of those products in the database.
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Server error
 */
app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}:
 *   get:
 *     summary: Get all the placeholders as a part of a specific product
 *     description: Fetch all the placeholders for a product based on its name.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
app.get("/products/:productname", async (req, res) => {
    try {
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups:
 *   post:
 *     summary: Add a new group to a product
 *     description: Adds a new group with labels to an existing product.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupname:
 *                 type: string
 *                 example: "New Group"
 *               labels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Label_SAMPLE"
 *                     description:
 *                       type: string
 *                       example: "LABEL_DESCRIPTION"
 *     responses:
 *       201:
 *         description: Group added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
app.post("/products/:productname/groups", async (req, res) => {
    try {
        const { groupname, labels } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const newGroup = {
            groupid: product.groups.length + 1,
            groupname,
            labels,
        };

        product.groups.push(newGroup);
        await product.save();
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/labels:
 *   post:
 *     summary: Add a new label to an existing group
 *     description: Adds a new label to an existing group in a product.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "LABEL_NAME_SAMPLE"
 *               description:
 *                 type: string
 *                 example: "LABEL_DESCRIPTION_SAMPLEl"
 *     responses:
 *       201:
 *         description: Label added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
app.post("/products/:productname/groups/:groupname/labels", async (req, res) => {
    try {
        const { label, description } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find((g) => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const newLabel = { label, description };
        group.labels.push(newLabel);
        await product.save();
        res.status(201).json(newLabel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));